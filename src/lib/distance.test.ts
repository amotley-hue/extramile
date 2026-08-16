import { describe, expect, it } from "vitest";
import { departAtParam, looksLikeAirport, timezoneOffsetFor } from "./distance";
import { findAirport, airports } from "./business";

/**
 * `looksLikeAirport` is the last-resort check used only when a customer typed
 * an address instead of picking a suggestion or an airport chip. A false
 * positive silently adds the airport surcharge to someone's bill, so the cases
 * below are the ones that actually cost money if this drifts.
 */
describe("looksLikeAirport", () => {
  it("matches the airports Craig actually serves", () => {
    expect(looksLikeAirport("Hartsfield-Jackson Atlanta International")).toBe(
      true,
    );
    expect(looksLikeAirport("ATL")).toBe(true);
    expect(looksLikeAirport("Flying out of PDK tomorrow")).toBe(true);
    expect(looksLikeAirport("DeKalb-Peachtree Airport Terminal")).toBe(true);
  });

  it("does not bill everything named after the airport's namesake", () => {
    // Live Mapbox results for "Hartsfield" include a dog park, a Waffle House
    // and several businesses that borrow the name. Matching a bare
    // "hartsfield" charged all of them the airport surcharge. The airport's own
    // full name still matches, via "atlanta international".
    expect(looksLikeAirport("Hartsfield-Jackson Dog Park, Atlanta")).toBe(false);
    expect(looksLikeAirport("Hartsfield Bar & Grill")).toBe(false);
    expect(
      looksLikeAirport("Hartsfield–Jackson Atlanta International Airport"),
    ).toBe(true);
    expect(
      looksLikeAirport(
        "International Terminal Arrivals, Hartsfield–Jackson Atlanta International Airport (ATL)",
      ),
    ).toBe(true);
  });

  it("does not bill a street named after an airport", () => {
    // The original pattern matched a bare "airport" and charged the surcharge
    // to anyone on one of Atlanta's several Airport Roads.
    expect(looksLikeAirport("1234 Airport Blvd, Atlanta, GA")).toBe(false);
    expect(looksLikeAirport("500 Airport Road, Marietta, GA")).toBe(false);
    expect(looksLikeAirport("Airport Loop Industrial Park")).toBe(false);
    expect(looksLikeAirport("The Airport Inn Bar & Grill")).toBe(false);
  });

  it("does not fire on ordinary Atlanta addresses", () => {
    expect(looksLikeAirport("3344 Peachtree Rd NE, Atlanta, GA 30326")).toBe(
      false,
    );
    expect(looksLikeAirport("The St. Regis Atlanta, Buckhead")).toBe(false);
    expect(looksLikeAirport("")).toBe(false);
    expect(looksLikeAirport(undefined)).toBe(false);
  });

  it("does not treat a lowercase word fragment as an airport code", () => {
    // "atl" appears inside "Atlanta"; a naive substring check would match.
    expect(looksLikeAirport("Atlantic Station, Atlanta")).toBe(false);
  });
});

/**
 * Drive time is billed at $1.15/minute and quoted against traffic at the pickup
 * time, so the timezone attached to that pickup time is load-bearing. Reading a
 * 2pm Atlanta pickup as 2pm UTC would price it against 9am rush hour on every
 * afternoon trip.
 */
describe("timezoneOffsetFor", () => {
  it("uses standard time in winter and daylight time in summer", () => {
    expect(timezoneOffsetFor("2026-01-15T14:00")).toBe("-05:00");
    expect(timezoneOffsetFor("2026-07-15T14:00")).toBe("-04:00");
  });

  it("gets the daylight-saving boundaries right", () => {
    // US DST in 2026: starts Sunday 8 March, ends Sunday 1 November.
    expect(timezoneOffsetFor("2026-03-07T12:00")).toBe("-05:00");
    expect(timezoneOffsetFor("2026-03-09T12:00")).toBe("-04:00");
    expect(timezoneOffsetFor("2026-10-31T12:00")).toBe("-04:00");
    expect(timezoneOffsetFor("2026-11-02T12:00")).toBe("-05:00");
  });

  it("handles a pickup either side of midnight", () => {
    expect(timezoneOffsetFor("2026-07-15T00:30")).toBe("-04:00");
    expect(timezoneOffsetFor("2026-07-15T23:45")).toBe("-04:00");
  });

  it("returns null rather than guessing on malformed input", () => {
    expect(timezoneOffsetFor("not a date")).toBeNull();
    expect(timezoneOffsetFor("2026-07-15")).toBeNull();
  });
});

describe("departAtParam", () => {
  it("builds an unambiguous ISO 8601 instant", () => {
    expect(departAtParam("2026-07-15T14:00")).toBe("2026-07-15T14:00:00-04:00");
    expect(departAtParam("2026-01-15T06:30")).toBe("2026-01-15T06:30:00-05:00");
  });

  it("returns null when there is no pickup time to send", () => {
    expect(departAtParam(undefined)).toBeNull();
    expect(departAtParam("tomorrow")).toBeNull();
  });
});

describe("airport lookup", () => {
  it("resolves every served airport by code, case-insensitively", () => {
    for (const airport of airports) {
      expect(findAirport(airport.code)?.code).toBe(airport.code);
      expect(findAirport(airport.code.toLowerCase())?.code).toBe(airport.code);
    }
  });

  it("returns undefined for anything else", () => {
    expect(findAirport("JFK")).toBeUndefined();
    expect(findAirport("")).toBeUndefined();
    expect(findAirport(undefined)).toBeUndefined();
  });

  it("carries coordinates that actually sit in metro Atlanta", () => {
    // Guards against a transposed lat/lon, which would send every airport
    // quote to a point in the Indian Ocean and price it accordingly.
    for (const airport of airports) {
      expect(airport.lat).toBeGreaterThan(33);
      expect(airport.lat).toBeLessThan(35);
      expect(airport.lon).toBeGreaterThan(-85);
      expect(airport.lon).toBeLessThan(-84);
    }
  });
});
