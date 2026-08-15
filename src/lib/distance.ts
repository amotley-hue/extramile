/**
 * Address lookup and driving-distance calculation via Google Maps Platform.
 *
 * The API key is read server-side only and never reaches the browser — the
 * client talks to our own /api/places and /api/quote routes, which proxy to
 * Google. That keeps the key off the network tab and out of scrapers' hands.
 *
 * When GOOGLE_MAPS_API_KEY is absent the module reports itself unconfigured
 * and callers fall back to a manual quote request rather than inventing a
 * distance. A wrong price is worse than no price.
 */

const PLACES_AUTOCOMPLETE_URL =
  "https://places.googleapis.com/v1/places:autocomplete";
const ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

/** Bias address suggestions toward metro Atlanta. */
const ATLANTA_CENTER = { latitude: 33.749, longitude: -84.388 };
const BIAS_RADIUS_METERS = 80_000; // ~50 miles

const METERS_PER_MILE = 1609.344;

export function mapsApiKey(): string | undefined {
  const key = process.env.GOOGLE_MAPS_API_KEY?.trim();
  return key ? key : undefined;
}

export function isMapsConfigured(): boolean {
  return mapsApiKey() !== undefined;
}

export interface PlaceSuggestion {
  placeId: string;
  /** "Hartsfield-Jackson Atlanta International Airport" */
  primary: string;
  /** "6000 N Terminal Pkwy, Atlanta, GA, USA" */
  secondary: string;
  /** Full single-line label for display and for storing on the booking. */
  description: string;
  isAirport: boolean;
}

const AIRPORT_PATTERN =
  /\bairport\b|\bhartsfield\b|\bterminal\b|\b(?:atl|pdk|fty|ryy)\b/i;

export function looksLikeAirport(...parts: (string | undefined)[]): boolean {
  return AIRPORT_PATTERN.test(parts.filter(Boolean).join(" "));
}

interface GooglePrediction {
  placePrediction?: {
    placeId?: string;
    text?: { text?: string };
    structuredFormat?: {
      mainText?: { text?: string };
      secondaryText?: { text?: string };
    };
  };
}

/**
 * Autocompletes a partial address. Returns [] when unconfigured or on any
 * upstream failure — the caller degrades to free-text entry.
 */
export async function autocompleteAddress(
  input: string,
  sessionToken?: string,
): Promise<PlaceSuggestion[]> {
  const key = mapsApiKey();
  if (!key || input.trim().length < 3) return [];

  const response = await fetch(PLACES_AUTOCOMPLETE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
    },
    body: JSON.stringify({
      input,
      includedRegionCodes: ["us"],
      locationBias: {
        circle: { center: ATLANTA_CENTER, radius: BIAS_RADIUS_METERS },
      },
      ...(sessionToken ? { sessionToken } : {}),
    }),
    // Suggestions are per-keystroke and user-specific; never cache them.
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(
      "Places autocomplete failed",
      response.status,
      await response.text().catch(() => ""),
    );
    return [];
  }

  const data = (await response.json()) as { suggestions?: GooglePrediction[] };

  return (data.suggestions ?? []).flatMap((suggestion) => {
    const prediction = suggestion.placePrediction;
    const placeId = prediction?.placeId;
    if (!prediction || !placeId) return [];

    const primary =
      prediction.structuredFormat?.mainText?.text ??
      prediction.text?.text ??
      "";
    const secondary = prediction.structuredFormat?.secondaryText?.text ?? "";

    return [
      {
        placeId,
        primary,
        secondary,
        description: [primary, secondary].filter(Boolean).join(", "),
        isAirport: looksLikeAirport(primary, secondary),
      },
    ];
  });
}

export interface RouteResult {
  miles: number;
  durationMinutes: number;
}

/**
 * Driving distance between two places. Prefers place IDs (exact) and falls
 * back to the typed address string.
 */
export async function computeDrivingRoute(
  origin: { placeId?: string; address?: string },
  destination: { placeId?: string; address?: string },
): Promise<RouteResult | null> {
  const key = mapsApiKey();
  if (!key) return null;

  const waypoint = (p: { placeId?: string; address?: string }) =>
    p.placeId ? { placeId: p.placeId } : { address: p.address ?? "" };

  const response = await fetch(ROUTES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
    },
    body: JSON.stringify({
      origin: waypoint(origin),
      destination: waypoint(destination),
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      units: "IMPERIAL",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(
      "Routes API failed",
      response.status,
      await response.text().catch(() => ""),
    );
    return null;
  }

  const data = (await response.json()) as {
    routes?: { distanceMeters?: number; duration?: string }[];
  };

  const route = data.routes?.[0];
  if (!route?.distanceMeters) return null;

  // duration arrives as a protobuf duration string, e.g. "1832s".
  const seconds = Number.parseInt(route.duration ?? "0", 10) || 0;

  return {
    miles: Math.round((route.distanceMeters / METERS_PER_MILE) * 10) / 10,
    durationMinutes: Math.round(seconds / 60),
  };
}
