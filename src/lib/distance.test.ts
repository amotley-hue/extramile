import { describe, expect, it } from "vitest";
import { looksLikeAirport } from "./distance";
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
