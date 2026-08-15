/**
 * Address lookup and driving-distance calculation via Mapbox.
 *
 * Three endpoints are in play:
 *   1. Search Box /suggest  — autocomplete as the customer types.
 *   2. Search Box /retrieve — turns the chosen suggestion into coordinates.
 *   3. Directions           — driving distance between two coordinate pairs.
 *
 * The token is read server-side only; the browser talks to our own /api/places
 * and /api/quote routes, which proxy to Mapbox. That keeps the token off the
 * network tab and out of scrapers' hands.
 *
 * Billing note: Search Box is billed per *session*, not per request. A session
 * is every /suggest call plus the /retrieve that ends it, grouped by a shared
 * session_token. The token is minted in the browser and threaded through both
 * calls so a customer typing two addresses costs one session, not thirty.
 * Directions is billed per request and has a far larger free tier.
 *
 * When MAPBOX_ACCESS_TOKEN is absent the module reports itself unconfigured and
 * callers fall back to a manual quote request rather than inventing a distance.
 * A wrong price is worse than no price.
 */

import { findAirport } from "./business";

const SUGGEST_URL = "https://api.mapbox.com/search/searchbox/v1/suggest";
const RETRIEVE_URL = "https://api.mapbox.com/search/searchbox/v1/retrieve";
const FORWARD_URL = "https://api.mapbox.com/search/geocode/v6/forward";
const DIRECTIONS_URL =
  "https://api.mapbox.com/directions/v5/mapbox/driving-traffic";

/** Bias suggestions toward metro Atlanta. */
const ATLANTA_PROXIMITY = "-84.388,33.749";
/** minLon,minLat,maxLon,maxLat — roughly the metro plus a wide margin. */
const METRO_BBOX = "-85.6,32.9,-83.2,34.6";

const METERS_PER_MILE = 1609.344;

export function mapboxToken(): string | undefined {
  const token = process.env.MAPBOX_ACCESS_TOKEN?.trim();
  return token ? token : undefined;
}

export function isMapsConfigured(): boolean {
  return mapboxToken() !== undefined;
}

export interface Coordinates {
  lon: number;
  lat: number;
}

export interface PlaceSuggestion {
  /** Mapbox feature id, passed back to /retrieve to get coordinates. */
  placeId: string;
  /** "Hartsfield-Jackson Atlanta International Airport" */
  primary: string;
  /** "6000 N Terminal Pkwy, Atlanta, GA 30320" */
  secondary: string;
  /** Full single-line label for display and for storing on the booking. */
  description: string;
  isAirport: boolean;
}

/**
 * Last-resort airport detection for free-typed text.
 *
 * Deliberately narrow. An earlier version matched a bare "airport", which
 * charged the airport surcharge to anyone picked up on Airport Blvd — of which
 * Atlanta has several. Structured data from Mapbox is preferred wherever it is
 * available; this only runs when the customer typed an address without picking
 * a suggestion.
 */
const AIRPORT_PATTERN =
  /\b(?:hartsfield|jackson atlanta international|international airport|regional airport|executive airport|municipal airport|airport terminal|\d\s*airport)\b|\bairport\s*(?:north|south|domestic|international)\b|\b(?:ATL|PDK|FTY|RYY)\b/i;

export function looksLikeAirport(...parts: (string | undefined)[]): boolean {
  return AIRPORT_PATTERN.test(parts.filter(Boolean).join(" "));
}

/** Mapbox marks airports with a `poi_category` entry; trust that over text. */
function isAirportFeature(
  featureType: string | undefined,
  categories: string[] | undefined,
  ...text: (string | undefined)[]
): boolean {
  if (categories?.some((c) => /airport/i.test(c))) return true;
  if (featureType && /airport/i.test(featureType)) return true;
  return looksLikeAirport(...text);
}

interface MapboxSuggestion {
  mapbox_id?: string;
  name?: string;
  name_preferred?: string;
  place_formatted?: string;
  full_address?: string;
  feature_type?: string;
  poi_category?: string[];
}

/**
 * Autocompletes a partial address. Returns [] when unconfigured or on any
 * upstream failure — the caller degrades to free-text entry.
 */
export async function autocompleteAddress(
  input: string,
  sessionToken: string,
): Promise<PlaceSuggestion[]> {
  const token = mapboxToken();
  if (!token || input.trim().length < 3 || !sessionToken) return [];

  const url = new URL(SUGGEST_URL);
  url.searchParams.set("q", input.slice(0, 256));
  url.searchParams.set("access_token", token);
  url.searchParams.set("session_token", sessionToken);
  url.searchParams.set("country", "us");
  url.searchParams.set("language", "en");
  url.searchParams.set("limit", "6");
  url.searchParams.set("proximity", ATLANTA_PROXIMITY);
  url.searchParams.set("bbox", METRO_BBOX);
  // Hotels, venues and airports matter as much as street addresses here —
  // customers type "Ritz Carlton Buckhead" far more often than its address.
  url.searchParams.set("types", "address,street,place,poi");

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    console.error(
      "Mapbox suggest failed",
      response.status,
      await response.text().catch(() => ""),
    );
    return [];
  }

  const data = (await response.json()) as { suggestions?: MapboxSuggestion[] };

  return (data.suggestions ?? []).flatMap((suggestion) => {
    const placeId = suggestion.mapbox_id;
    if (!placeId) return [];

    const primary = suggestion.name_preferred || suggestion.name || "";
    const secondary =
      suggestion.place_formatted || suggestion.full_address || "";

    return [
      {
        placeId,
        primary,
        secondary,
        description: [primary, secondary].filter(Boolean).join(", "),
        isAirport: isAirportFeature(
          suggestion.feature_type,
          suggestion.poi_category,
          primary,
          secondary,
        ),
      },
    ];
  });
}

export interface ResolvedPlace {
  coordinates: Coordinates;
  description: string;
  isAirport: boolean;
}

/** Turns a suggestion id into coordinates. Ends the billing session. */
export async function retrievePlace(
  placeId: string,
  sessionToken: string,
): Promise<ResolvedPlace | null> {
  const token = mapboxToken();
  if (!token || !placeId || !sessionToken) return null;

  const url = new URL(`${RETRIEVE_URL}/${encodeURIComponent(placeId)}`);
  url.searchParams.set("access_token", token);
  url.searchParams.set("session_token", sessionToken);

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    console.error(
      "Mapbox retrieve failed",
      response.status,
      await response.text().catch(() => ""),
    );
    return null;
  }

  const data = (await response.json()) as {
    features?: {
      geometry?: { coordinates?: [number, number] };
      properties?: {
        name?: string;
        place_formatted?: string;
        full_address?: string;
        feature_type?: string;
        poi_category?: string[];
      };
    }[];
  };

  const feature = data.features?.[0];
  const coords = feature?.geometry?.coordinates;
  if (!feature || !coords || coords.length < 2) return null;

  const properties = feature.properties ?? {};
  const description =
    properties.full_address ||
    [properties.name, properties.place_formatted].filter(Boolean).join(", ");

  return {
    coordinates: { lon: coords[0], lat: coords[1] },
    description,
    isAirport: isAirportFeature(
      properties.feature_type,
      properties.poi_category,
      properties.name,
      properties.place_formatted,
    ),
  };
}

/**
 * Geocodes free text the customer typed without picking a suggestion.
 * Uses the plain forward geocoder, which is billed per request rather than
 * per session, so it never opens a Search Box session by accident.
 */
export async function geocodeText(
  query: string,
): Promise<ResolvedPlace | null> {
  const token = mapboxToken();
  if (!token || query.trim().length < 3) return null;

  const url = new URL(FORWARD_URL);
  url.searchParams.set("q", query.slice(0, 256));
  url.searchParams.set("access_token", token);
  url.searchParams.set("country", "us");
  url.searchParams.set("limit", "1");
  url.searchParams.set("proximity", ATLANTA_PROXIMITY);

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    console.error(
      "Mapbox forward geocode failed",
      response.status,
      await response.text().catch(() => ""),
    );
    return null;
  }

  const data = (await response.json()) as {
    features?: {
      geometry?: { coordinates?: [number, number] };
      properties?: { full_address?: string; name?: string };
    }[];
  };

  const feature = data.features?.[0];
  const coords = feature?.geometry?.coordinates;
  if (!coords || coords.length < 2) return null;

  return {
    coordinates: { lon: coords[0], lat: coords[1] },
    description:
      feature?.properties?.full_address || feature?.properties?.name || query,
    isAirport: looksLikeAirport(query),
  };
}

/** A place as the browser reports it, before the server resolves it. */
export interface PlaceRef {
  address: string;
  /** Mapbox id from a picked suggestion. */
  placeId?: string;
  /** Set when the customer used a one-tap airport chip. */
  airportCode?: string;
}

/**
 * Resolves a place to coordinates, cheapest path first.
 *
 * Airport chips resolve from our own constant table — no API call, no chance
 * of mis-resolution, and the coordinates cannot be spoofed by the client
 * because only the code crosses the wire.
 */
export async function resolvePlace(
  place: PlaceRef,
  sessionToken: string | undefined,
): Promise<ResolvedPlace | null> {
  const airport = findAirport(place.airportCode);
  if (airport) {
    return {
      coordinates: { lon: airport.lon, lat: airport.lat },
      description: `${airport.name} (${airport.code})`,
      isAirport: true,
    };
  }

  if (place.placeId && sessionToken) {
    const retrieved = await retrievePlace(place.placeId, sessionToken);
    if (retrieved) return retrieved;
  }

  return geocodeText(place.address);
}

export interface RouteResult {
  miles: number;
  durationMinutes: number;
}

/**
 * Driving distance and time between two coordinate pairs.
 *
 * `departAt` is a local `YYYY-MM-DDTHH:mm` string, interpreted by Mapbox as
 * local time at the route origin — which is what we have and what we want.
 * Because drive time is billed, quoting traffic for the actual pickup time
 * rather than for right now is the difference between charging correctly for a
 * rush-hour airport run and under-charging it.
 */
export async function computeDrivingRoute(
  origin: Coordinates,
  destination: Coordinates,
  departAt?: string,
): Promise<RouteResult | null> {
  const token = mapboxToken();
  if (!token) return null;

  const pair = `${origin.lon},${origin.lat};${destination.lon},${destination.lat}`;

  const build = (withDepartAt: boolean) => {
    const url = new URL(`${DIRECTIONS_URL}/${pair}`);
    url.searchParams.set("access_token", token);
    // We only need the numbers, so skip the geometry entirely.
    url.searchParams.set("overview", "false");
    url.searchParams.set("alternatives", "false");
    if (withDepartAt && departAt) url.searchParams.set("depart_at", departAt);
    return url;
  };

  let response = await fetch(build(true), { cache: "no-store" });

  // Mapbox rejects depart_at that is in the past or too far ahead. A pickup
  // three months out should still get a quote, just without traffic for that
  // exact moment, so retry once without it rather than failing the quote.
  if (!response.ok && departAt) {
    console.warn(
      "Directions rejected depart_at; retrying without it",
      response.status,
    );
    response = await fetch(build(false), { cache: "no-store" });
  }

  if (!response.ok) {
    console.error(
      "Mapbox directions failed",
      response.status,
      await response.text().catch(() => ""),
    );
    return null;
  }

  const data = (await response.json()) as {
    code?: string;
    routes?: { distance?: number; duration?: number }[];
  };

  if (data.code && data.code !== "Ok") {
    console.error("Mapbox directions returned", data.code);
    return null;
  }

  const route = data.routes?.[0];
  if (!route?.distance) return null;

  return {
    miles: Math.round((route.distance / METERS_PER_MILE) * 10) / 10,
    durationMinutes: Math.round((route.duration ?? 0) / 60),
  };
}
