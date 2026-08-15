import {
  computeDrivingRoute,
  isMapsConfigured,
  looksLikeAirport,
} from "@/lib/distance";
import { calculateQuote, type Quote } from "@/lib/quote";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/ratelimit";
import { fieldErrors, quoteRequestSchema } from "@/lib/validation";

export interface QuoteResponse {
  quote: Quote | null;
  miles?: number;
  durationMinutes?: number;
  isAirport: boolean;
  /** False when no Maps key is configured, or the route could not be resolved. */
  priced: boolean;
  message?: string;
}

export async function POST(request: Request) {
  const limit = rateLimit(`quote:${clientIp(request)}`, 30, 60_000);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = quoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: "Please check the trip details.",
        fields: fieldErrors(parsed.error),
      },
      { status: 400 },
    );
  }

  const trip = parsed.data;

  const isAirport =
    trip.pickup.isAirport ||
    trip.dropoff?.isAirport ||
    looksLikeAirport(trip.pickup.address, trip.dropoff?.address);

  // Hourly charters bill on time, so no route lookup is needed.
  if (trip.tripType === "hourly") {
    return Response.json({
      quote: calculateQuote({
        tripType: "hourly",
        hours: trip.hours,
        pickupAt: trip.pickupAt,
        isAirport,
        extraStops: trip.extraStops,
        meetAndGreet: trip.meetAndGreet,
      }),
      isAirport,
      priced: true,
    } satisfies QuoteResponse);
  }

  if (!isMapsConfigured()) {
    return Response.json({
      quote: null,
      isAirport,
      priced: false,
      message:
        "Instant pricing is not switched on yet. Send the trip through and Craig will confirm your rate personally.",
    } satisfies QuoteResponse);
  }

  let route: Awaited<ReturnType<typeof computeDrivingRoute>> = null;
  try {
    route = await computeDrivingRoute(
      { placeId: trip.pickup.placeId, address: trip.pickup.address },
      { placeId: trip.dropoff?.placeId, address: trip.dropoff?.address },
    );
  } catch (error) {
    console.error("Route lookup failed", error);
  }

  if (!route) {
    return Response.json({
      quote: null,
      isAirport,
      priced: false,
      message:
        "We couldn't measure that route automatically. Send the trip through and Craig will confirm your rate personally.",
    } satisfies QuoteResponse);
  }

  return Response.json({
    quote: calculateQuote({
      tripType: "transfer",
      miles: route.miles,
      pickupAt: trip.pickupAt,
      isAirport,
      extraStops: trip.extraStops,
      meetAndGreet: trip.meetAndGreet,
    }),
    miles: route.miles,
    durationMinutes: route.durationMinutes,
    isAirport,
    priced: true,
  } satisfies QuoteResponse);
}
