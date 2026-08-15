import { describe, expect, it } from "vitest";
import { calculateQuote, isAfterHours, localHourOf } from "./quote";
import { surcharges, vehicle } from "./rates";

/**
 * These assert the *shape* of the pricing rules, not specific dollar amounts,
 * so they keep passing when Craig edits rates.ts — which he is expected to do.
 * A test that hard-codes $105 would fail the moment the rate card becomes real
 * and would teach everyone to ignore the suite.
 */

const sumLines = (lines: { amount: number }[]) =>
  lines.reduce((total, line) => total + line.amount, 0);

describe("localHourOf", () => {
  it("reads the hour straight off the string", () => {
    expect(localHourOf("2026-08-20T23:30")).toBe(23);
    expect(localHourOf("2026-08-20T00:05")).toBe(0);
  });

  it("returns null for junk", () => {
    expect(localHourOf(undefined)).toBeNull();
    expect(localHourOf("tomorrow")).toBeNull();
  });
});

describe("isAfterHours", () => {
  it("covers the window that wraps midnight", () => {
    expect(isAfterHours("2026-08-20T23:00")).toBe(true);
    expect(isAfterHours("2026-08-20T02:00")).toBe(true);
  });

  it("excludes daytime", () => {
    expect(isAfterHours("2026-08-20T09:00")).toBe(false);
    expect(isAfterHours("2026-08-20T18:30")).toBe(false);
  });

  it("treats the boundaries as documented: start inclusive, end exclusive", () => {
    const pad = (h: number) => String(h).padStart(2, "0");
    expect(
      isAfterHours(`2026-08-20T${pad(surcharges.afterHoursStart)}:00`),
    ).toBe(true);
    expect(isAfterHours(`2026-08-20T${pad(surcharges.afterHoursEnd)}:00`)).toBe(
      false,
    );
  });

  it("does not apply a surcharge when no time was given", () => {
    expect(isAfterHours(undefined)).toBe(false);
  });
});

describe("calculateQuote — transfers", () => {
  it("charges base plus mileage on a normal trip", () => {
    // Far enough out that the minimum fare cannot be what is binding.
    const miles = (vehicle.minimumFare / vehicle.perMileRate) * 2;

    const quote = calculateQuote({
      tripType: "transfer",
      miles,
      pickupAt: "2026-08-20T12:00",
    });

    expect(quote.lines[0]!.amount).toBeCloseTo(
      vehicle.baseFare + vehicle.perMileRate * miles,
      2,
    );
  });

  it("never prices a short trip below the minimum fare", () => {
    const quote = calculateQuote({
      tripType: "transfer",
      miles: 0.5,
      pickupAt: "2026-08-20T12:00",
    });

    expect(quote.lines[0]!.amount).toBe(vehicle.minimumFare);
    expect(quote.lines[0]!.note).toMatch(/minimum/i);
  });

  it("grows monotonically with distance", () => {
    const cheap = calculateQuote({
      tripType: "transfer",
      miles: 10,
      pickupAt: "2026-08-20T12:00",
    });
    const dear = calculateQuote({
      tripType: "transfer",
      miles: 40,
      pickupAt: "2026-08-20T12:00",
    });

    expect(dear.total).toBeGreaterThan(cheap.total);
  });

  it("treats a missing distance as zero rather than NaN", () => {
    const quote = calculateQuote({ tripType: "transfer" });

    expect(Number.isFinite(quote.total)).toBe(true);
    expect(quote.total).toBeGreaterThan(0);
  });
});

describe("calculateQuote — hourly", () => {
  it("bills the requested hours when above the minimum", () => {
    const hours = vehicle.minimumHours + 3;

    const quote = calculateQuote({
      tripType: "hourly",
      hours,
      pickupAt: "2026-08-20T12:00",
    });

    expect(quote.billedHours).toBe(hours);
    expect(quote.lines[0]!.amount).toBeCloseTo(vehicle.hourlyRate * hours, 2);
  });

  it("raises a short booking to the minimum", () => {
    const quote = calculateQuote({
      tripType: "hourly",
      hours: 1,
      pickupAt: "2026-08-20T12:00",
    });

    expect(quote.billedHours).toBe(vehicle.minimumHours);
    expect(quote.lines[0]!.note).toMatch(/minimum/i);
  });
});

describe("calculateQuote — surcharges and totals", () => {
  const base = {
    tripType: "transfer" as const,
    miles: 20,
    pickupAt: "2026-08-20T12:00",
  };

  it("adds the airport fee only for airport trips", () => {
    const plain = calculateQuote(base);
    const airport = calculateQuote({ ...base, isAirport: true });

    expect(airport.total).toBeGreaterThan(plain.total);
    expect(airport.lines.some((l) => /airport/i.test(l.label))).toBe(true);
    expect(plain.lines.some((l) => /airport/i.test(l.label))).toBe(false);
  });

  it("charges per extra stop", () => {
    const one = calculateQuote({ ...base, extraStops: 1 });
    const two = calculateQuote({ ...base, extraStops: 2 });

    expect(two.subtotal - one.subtotal).toBeCloseTo(surcharges.perExtraStop, 2);
  });

  it("ignores a negative stop count instead of discounting the trip", () => {
    const quote = calculateQuote({ ...base, extraStops: -5 });
    const plain = calculateQuote(base);

    expect(quote.total).toBe(plain.total);
  });

  it("only charges meet & greet when it was asked for", () => {
    const without = calculateQuote({ ...base, isAirport: true });
    const withIt = calculateQuote({
      ...base,
      isAirport: true,
      meetAndGreet: true,
    });

    expect(withIt.subtotal - without.subtotal).toBeCloseTo(
      surcharges.meetAndGreet,
      2,
    );
  });

  it("computes gratuity on the subtotal and totals correctly", () => {
    const quote = calculateQuote({
      ...base,
      isAirport: true,
      extraStops: 1,
      meetAndGreet: true,
      pickupAt: "2026-08-20T23:15",
    });

    expect(quote.subtotal).toBeCloseTo(sumLines(quote.lines), 2);
    expect(quote.gratuity).toBeCloseTo(
      quote.subtotal * surcharges.gratuityRate,
      2,
    );
    expect(quote.total).toBeCloseTo(quote.subtotal + quote.gratuity, 2);
  });

  it("returns amounts rounded to whole cents", () => {
    const quote = calculateQuote({ ...base, miles: 17.3, extraStops: 1 });

    for (const value of [quote.subtotal, quote.gratuity, quote.total]) {
      expect(Math.round(value * 100)).toBeCloseTo(value * 100, 6);
    }
  });
});
