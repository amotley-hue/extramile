import {
  computeDrivingRoute,
  isMapsConfigured,
  looksLikeAirport,
} from "@/lib/distance";
import { calculateQuote, type Quote } from "@/lib/quote";
import { vehicles } from "@/lib/rates";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/ratelimit";
import { fieldErrors, quoteRequestSchema } from "@/lib/validation";

export interface QuoteResponse {
  /** Every vehicle priced for this trip, cheapest first. */
  quotes: Quote[];
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
      { error: "Please check the trip details.", fields: fieldErrors(parsed.error) },
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
    const quotes = vehicles.map((vehicle) =>
      calculateQuote({
        tripType: "hourly",
        vehicleId: vehicle.id,
        hours: trip.hours,
        pickupAt: trip.pickupAt,
        isAirport,
        extraStops: trip.extraStops,
        meetAndGreet: trip.meetAndGreet,
      }),
    );

    return Response.json({
      quotes,
      isAirport,
      priced: true,
    } satisfies QuoteResponse);
  }

  if (!isMapsConfigured()) {
    return Response.json({
      quotes: [],
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
      {
        placeId: trip.dropoff?.placeId,
        address: trip.dropoff?.address,
      },
    );
  } catch (error) {
    console.error("Route lookup failed", error);
  }

  if (!route) {
    return Response.json({
      quotes: [],
      isAirport,
      priced: false,
      message:
        "We couldn't measure that route automatically. Send the trip through and Craig will confirm your rate personally.",
    } satisfies QuoteResponse);
  }

  const quotes = vehicles.map((vehicle) =>
    calculateQuote({
      tripType: "transfer",
      vehicleId: vehicle.id,
      miles: route.miles,
      pickupAt: trip.pickupAt,
      isAirport,
      extraStops: trip.extraStops,
      meetAndGreet: trip.meetAndGreet,
    }),
  );

  return Response.json({
    quotes,
    miles: route.miles,
    durationMinutes: route.durationMinutes,
    isAirport,
    priced: true,
  } satisfies QuoteResponse);
}
