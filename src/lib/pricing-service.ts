/**
 * Turns a submitted trip into a priced quote.
 *
 * Shared by /api/quote and /api/booking so the price a customer is shown and
 * the price recorded on the booking come from exactly the same code path. When
 * these were two copies, they could drift — and a quote that disagrees with the
 * booking is the one bug this business cannot afford.
 */

import {
  computeDrivingRoute,
  isMapsConfigured,
  looksLikeAirport,
  resolvePlace,
  type ResolvedPlace,
} from "./distance";
import { calculateQuote, type Quote } from "./quote";
import type { Trip } from "./validation";

export interface PricedTrip {
  quote: Quote | null;
  miles?: number;
  durationMinutes?: number;
  isAirport: boolean;
  /** False when Mapbox is unconfigured or the route could not be resolved. */
  priced: boolean;
  message?: string;
}

const UNCONFIGURED =
  "Instant pricing is not switched on yet. Send the trip through and Craig will confirm your rate personally.";

const UNRESOLVED =
  "We couldn't measure that route automatically. Send the trip through and Craig will confirm your rate personally.";

/** Airport status the customer's own input implies, before any lookup. */
function impliedAirport(trip: Trip): boolean {
  return Boolean(
    trip.pickup.airportCode ||
      trip.dropoff?.airportCode ||
      trip.pickup.isAirport ||
      trip.dropoff?.isAirport ||
      looksLikeAirport(trip.pickup.address, trip.dropoff?.address),
  );
}

export async function priceTrip(trip: Trip): Promise<PricedTrip> {
  // Hourly charters bill on time, so no geocoding or routing is needed at all.
  if (trip.tripType === "hourly") {
    const isAirport = impliedAirport(trip);
    return {
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
    };
  }

  if (!isMapsConfigured()) {
    return {
      quote: null,
      isAirport: impliedAirport(trip),
      priced: false,
      message: UNCONFIGURED,
    };
  }

  let pickup: ResolvedPlace | null = null;
  let dropoff: ResolvedPlace | null = null;

  try {
    // Resolved together — one address is useless without the other.
    [pickup, dropoff] = await Promise.all([
      resolvePlace(trip.pickup, trip.sessionToken),
      trip.dropoff
        ? resolvePlace(trip.dropoff, trip.sessionToken)
        : Promise.resolve(null),
    ]);
  } catch (error) {
    console.error("Place resolution failed", error);
  }

  if (!pickup || !dropoff) {
    return {
      quote: null,
      isAirport: impliedAirport(trip),
      priced: false,
      message: UNRESOLVED,
    };
  }

  // Prefer what the geocoder says over what the text looks like.
  const isAirport =
    pickup.isAirport || dropoff.isAirport || impliedAirport(trip);

  let route: Awaited<ReturnType<typeof computeDrivingRoute>> = null;
  try {
    route = await computeDrivingRoute(pickup.coordinates, dropoff.coordinates);
  } catch (error) {
    console.error("Route lookup failed", error);
  }

  if (!route) {
    return { quote: null, isAirport, priced: false, message: UNRESOLVED };
  }

  return {
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
  };
}
