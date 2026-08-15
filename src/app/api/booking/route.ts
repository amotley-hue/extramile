import { computeDrivingRoute, isMapsConfigured, looksLikeAirport } from "@/lib/distance";
import { sendBookingEmails } from "@/lib/notify";
import { calculateQuote, type Quote } from "@/lib/quote";
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

  const { trip } = booking;
  const isAirport =
    trip.pickup.isAirport ||
    trip.dropoff?.isAirport ||
    looksLikeAirport(trip.pickup.address, trip.dropoff?.address);

  // Re-price server-side. The client's number is display only; a posted price
  // is an offer from the customer, not a price Craig agreed to.
  let quote: Quote | null = null;

  if (trip.tripType === "hourly") {
    quote = calculateQuote({
      tripType: "hourly",
      hours: trip.hours,
      pickupAt: trip.pickupAt,
      isAirport,
      extraStops: trip.extraStops,
      meetAndGreet: trip.meetAndGreet,
    });
  } else if (isMapsConfigured()) {
    try {
      const route = await computeDrivingRoute(
        { placeId: trip.pickup.placeId, address: trip.pickup.address },
        { placeId: trip.dropoff?.placeId, address: trip.dropoff?.address },
      );
      if (route) {
        quote = calculateQuote({
          tripType: "transfer",
          miles: route.miles,
          pickupAt: trip.pickupAt,
          isAirport,
          extraStops: trip.extraStops,
          meetAndGreet: trip.meetAndGreet,
        });
      }
    } catch (error) {
      // A pricing failure must not cost Craig the booking.
      console.error("Re-pricing failed; forwarding request unpriced", error);
    }
  }

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
      pickupAt: trip.pickupAt,
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
