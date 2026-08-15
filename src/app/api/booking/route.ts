import { sendBookingEmails } from "@/lib/notify";
import { priceTrip } from "@/lib/pricing-service";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/ratelimit";
import { newReference, saveBooking } from "@/lib/store";
import { bookingRequestSchema, fieldErrors } from "@/lib/validation";

export async function POST(request: Request) {
  const limit = rateLimit(`booking:${clientIp(request)}`, 8, 10 * 60_000);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: "Please check the highlighted fields.",
        fields: fieldErrors(parsed.error),
      },
      { status: 400 },
    );
  }

  const booking = parsed.data;

  // Honeypot. Silently accept so bots don't learn they were caught.
  if (booking.company) {
    return Response.json({ reference: newReference(), ok: true });
  }

  // Re-price server-side through the same path the quote used. The client's
  // number is display only; a posted price is an offer from the customer, not
  // a price Craig agreed to.
  //
  // A pricing failure must never cost Craig the booking — priceTrip returns a
  // null quote rather than throwing, and the request goes through unpriced for
  // Craig to quote by hand.
  const priced = await priceTrip(booking.trip).catch((error) => {
    console.error("Re-pricing failed; forwarding request unpriced", error);
    return null;
  });

  const quote = priced?.quote ?? null;

  const reference = newReference();

  // Write it down before trusting email delivery.
  const persisted = await saveBooking(booking, quote, reference).catch(
    (error) => {
      console.error("saveBooking threw", error);
      return false;
    },
  );

  const notified = await sendBookingEmails(booking, quote, reference).catch(
    (error) => {
      console.error("sendBookingEmails threw", error);
      return { operatorNotified: false, customerNotified: false };
    },
  );

  // Nothing was recorded and nothing was sent — the request would vanish.
  // Tell the customer to call instead of pretending it worked.
  if (!persisted && !notified.operatorNotified) {
    console.error("Booking request could not be delivered", {
      reference,
      email: booking.email,
      phone: booking.phone,
      pickupAt: booking.trip.pickupAt,
    });
    return Response.json(
      {
        error:
          "We couldn't submit your request just now. Please call or text 678-457-0698 and Craig will take care of it directly.",
      },
      { status: 503 },
    );
  }

  return Response.json({
    ok: true,
    reference,
    total: quote?.total ?? null,
    confirmationEmailed: notified.customerNotified,
  });
}
