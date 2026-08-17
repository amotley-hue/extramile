/**
 * Mapbox integration probe — run `npm run mapbox`.
 *
 * Exercises each Mapbox endpoint the quote depends on, in the order a real
 * customer triggers them, and prints the raw result of each. None of this code
 * had ever run against a live endpoint, so the point is to find a field-name
 * mismatch here — where the failure is visible and labelled — rather than in
 * the UI, where every failure looks identically like "pricing isn't switched
 * on yet".
 *
 * Reads MAPBOX_ACCESS_TOKEN from .env.local. Next.js loads that file for the
 * app; a standalone script has to do it itself.
 */

import { readFileSync } from "node:fs";
import { it } from "vitest";
import {
  autocompleteAddress,
  computeDrivingRoute,
  departAtParam,
  geocodeText,
  isMapsConfigured,
  resolvePlace,
  retrievePlace,
} from "./distance";
import { calculateQuote, formatUSD } from "./quote";

function loadEnvLocal() {
  if (process.env.MAPBOX_ACCESS_TOKEN) return;
  try {
    const text = readFileSync(new URL("../../.env.local", import.meta.url), "utf8");
    for (const line of text.split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (!m) continue;
      const value = m[2]!.replace(/^["']|["']$/g, "").trim();
      if (value && !process.env[m[1]!]) process.env[m[1]!] = value;
    }
  } catch {
    /* No .env.local — reported below. */
  }
}

const log = (...parts: unknown[]) => console.log(...parts);

it("probes the Mapbox endpoints the quote depends on", async () => {
  loadEnvLocal();

  if (!isMapsConfigured()) {
    log(
      "\n  MAPBOX_ACCESS_TOKEN is not set.\n" +
        "  Add it to .env.local, then run `npm run mapbox` again.\n",
    );
    return;
  }

  const token = process.env.MAPBOX_ACCESS_TOKEN!;
  log(`\n  Token ${token.slice(0, 3)}… (${token.length} chars)\n`);

  const session = "probe-session-0000";
  let ok = 0;
  let failed = 0;
  const step = (name: string, good: boolean) => {
    if (good) ok++;
    else failed++;
    log(`  ${good ? "PASS" : "FAIL"}  ${name}`);
  };

  // 1. Autocomplete — what fires on every keystroke.
  log("  1. Search Box /suggest  q=\"Hartsfield\"");
  const suggestions = await autocompleteAddress("Hartsfield", session);
  step("suggest returned results", suggestions.length > 0);
  suggestions.slice(0, 3).forEach((s, i) => {
    log(`        ${i + 1}. ${s.primary}`);
    log(`           ${s.secondary || "(no secondary text)"}`);
    log(`           airport=${s.isAirport}  id=${s.placeId.slice(0, 24)}…`);
  });

  // 2. Retrieve — turns a chosen suggestion into coordinates.
  if (suggestions[0]) {
    log("\n  2. Search Box /retrieve  (first suggestion)");
    const place = await retrievePlace(suggestions[0].placeId, session);
    step("retrieve returned coordinates", Boolean(place));
    if (place) {
      log(`        ${place.description}`);
      log(`        lon=${place.coordinates.lon}  lat=${place.coordinates.lat}  airport=${place.isAirport}`);
    }
  }

  // 3. Forward geocode — the path used when re-pricing at booking.
  log("\n  3. Geocoding v6 /forward  \"3344 Peachtree Rd NE, Atlanta, GA\"");
  const geocoded = await geocodeText("3344 Peachtree Rd NE, Atlanta, GA");
  step("forward geocode resolved", Boolean(geocoded));
  if (geocoded) {
    log(`        ${geocoded.description}`);
    log(`        lon=${geocoded.coordinates.lon}  lat=${geocoded.coordinates.lat}`);
  }

  // 4. Airport chip — must resolve from constants with no network call.
  log("\n  4. Airport chip  ATL");
  const chip = await resolvePlace({ address: "", airportCode: "ATL" }, undefined);
  step("ATL chip resolved from constants", Boolean(chip?.isAirport));
  if (chip) log(`        ${chip.description}  lon=${chip.coordinates.lon} lat=${chip.coordinates.lat}`);

  // 5. Directions — distance and, critically, drive time.
  if (chip && geocoded) {
    const pickupAt = "2026-09-15T14:00";
    log(`\n  5. Directions  ATL -> Buckhead, depart_at=${departAtParam(pickupAt)}`);
    const route = await computeDrivingRoute(
      chip.coordinates,
      geocoded.coordinates,
      pickupAt,
    );
    step("directions returned a route", Boolean(route));

    if (route) {
      log(`        ${route.miles} miles, ${route.durationMinutes} minutes`);

      // Same route at 3am. Drive time is billed, so this must come back lower —
      // if the two are identical, depart_at is being ignored and every
      // rush-hour trip is under-charged.
      const quiet = await computeDrivingRoute(
        chip.coordinates,
        geocoded.coordinates,
        "2026-09-15T03:00",
      );
      if (quiet) {
        log(`        same route at 03:00 — ${quiet.miles} miles, ${quiet.durationMinutes} minutes`);
        step(
          "depart_at changes drive time (traffic is being applied)",
          quiet.durationMinutes !== route.durationMinutes,
        );
      }

      const quote = calculateQuote({
        tripType: "transfer",
        miles: route.miles,
        durationMinutes: route.durationMinutes,
        pickupAt,
        isAirport: true,
      });

      log("\n  Quote at Craig's rates:");
      quote.lines.forEach((l) =>
        log(`        ${l.label.padEnd(34)} ${formatUSD(l.amount).padStart(9)}`),
      );
      log(`        ${"Gratuity (included)".padEnd(34)} ${formatUSD(quote.gratuity).padStart(9)}`);
      log(`        ${"TOTAL".padEnd(34)} ${formatUSD(quote.total).padStart(9)}`);
    }
  }

  log(`\n  ${ok} passed, ${failed} failed\n`);
});
