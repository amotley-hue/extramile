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

describe("calculateQuote — transfers bill time and distance", () => {
  /** Big enough that any configured minimum fare cannot be what is binding. */
  const long = { miles: 40, durationMinutes: 60 };

  it("charges base plus mileage plus drive time", () => {
    const quote = calculateQuote({
      tripType: "transfer",
      ...long,
      pickupAt: "2026-08-20T12:00",
    });

    const expected =
      vehicle.baseFare +
      vehicle.perMileRate * long.miles +
      vehicle.perMinuteRate * long.durationMinutes;

    expect(sumLines(quote.lines)).toBeCloseTo(expected, 2);
  });

  it("shows distance and drive time as separate lines", () => {
    const quote = calculateQuote({
      tripType: "transfer",
      ...long,
      pickupAt: "2026-08-20T12:00",
    });

    const distance = quote.lines.find((l) => /^Distance/.test(l.label));
    const time = quote.lines.find((l) => /^Drive time/.test(l.label));

    expect(distance?.amount).toBeCloseTo(
      vehicle.perMileRate * long.miles,
      2,
    );
    expect(time?.amount).toBeCloseTo(
      vehicle.perMinuteRate * long.durationMinutes,
      2,
    );
  });

  it("grows with distance when time is held constant", () => {
    const near = calculateQuote({
      tripType: "transfer",
      miles: 10,
      durationMinutes: 30,
      pickupAt: "2026-08-20T12:00",
    });
    const far = calculateQuote({
      tripType: "transfer",
      miles: 40,
      durationMinutes: 30,
      pickupAt: "2026-08-20T12:00",
    });

    expect(far.total).toBeGreaterThan(near.total);
  });

  it("grows with drive time when distance is held constant", () => {
    // Same route, rush hour versus empty roads. Time-based pricing means these
    // must differ, or the surcharge for hard traffic silently vanishes.
    //
    // Both legs are deliberately long enough to clear the minimum fare. When
    // the floor binds it absorbs part of the time difference, which is correct
    // behaviour but would make this assertion measure the floor, not the rate.
    const quiet = calculateQuote({
      tripType: "transfer",
      ...long,
      pickupAt: "2026-08-20T12:00",
    });
    const rushHour = calculateQuote({
      tripType: "transfer",
      ...long,
      durationMinutes: long.durationMinutes + 30,
      pickupAt: "2026-08-20T12:00",
    });

    expect(rushHour.total).toBeGreaterThan(quiet.total);
    expect(rushHour.total - quiet.total).toBeCloseTo(
      vehicle.perMinuteRate * 30 * (1 + surcharges.gratuityRate),
      1,
    );
  });

  it("lets the minimum fare absorb a small time difference", () => {
    // Two short trips that both meter below the floor must price identically.
    // This is the flip side of the test above and the reason it uses long legs.
    const a = calculateQuote({
      tripType: "transfer",
      miles: 2,
      durationMinutes: 8,
      pickupAt: "2026-08-20T12:00",
    });
    const b = calculateQuote({
      tripType: "transfer",
      miles: 2,
      durationMinutes: 14,
      pickupAt: "2026-08-20T12:00",
    });

    if (vehicle.minimumFare > 0) {
      expect(a.total).toBeCloseTo(b.total, 2);
    }
  });

  it("respects a minimum fare when one is configured", () => {
    const quote = calculateQuote({
      tripType: "transfer",
      miles: 0.2,
      durationMinutes: 1,
      pickupAt: "2026-08-20T12:00",
    });

    expect(quote.lines[0]!.amount).toBeGreaterThanOrEqual(
      vehicle.minimumFare,
    );
    if (vehicle.minimumFare > 0) {
      expect(quote.lines[0]!.note).toMatch(/minimum/i);
      // A binding minimum must collapse to one line, or the component lines
      // would not add up to the amount actually charged.
      expect(quote.lines.filter((l) => /Distance|Drive time/.test(l.label)))
        .toHaveLength(0);
    }
  });

  it("treats missing distance and time as zero rather than NaN", () => {
    const quote = calculateQuote({ tripType: "transfer" });

    expect(Number.isFinite(quote.total)).toBe(true);
    expect(quote.total).toBeGreaterThanOrEqual(0);
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
    durationMinutes: 35,
    pickupAt: "2026-08-20T12:00",
  };

  it("adds the airport fee only for airport trips", () => {
    const plain = calculateQuote(base);
    const airport = calculateQuote({ ...base, isAirport: true });

    expect(airport.total).toBeGreaterThan(plain.total);
    expect(airport.lines.some((l) => /airport/i.test(l.label))).toBe(true);
    expect(plain.lines.some((l) => /airport/i.test(l.label))).toBe(false);
  });

  it("charges per extra stop, and shows no line when stops are free", () => {
    const none = calculateQuote({ ...base, extraStops: 0 });
    const one = calculateQuote({ ...base, extraStops: 1 });
    const two = calculateQuote({ ...base, extraStops: 2 });

    expect(two.subtotal - one.subtotal).toBeCloseTo(surcharges.perExtraStop, 2);

    const stopLine = (q: typeof one) =>
      q.lines.find((l) => /additional stop/i.test(l.label));

    if (surcharges.perExtraStop > 0) {
      expect(stopLine(one)?.amount).toBeCloseTo(surcharges.perExtraStop, 2);
    } else {
      // A $0 line reads as a bug to a customer, so it must not render at all.
      expect(stopLine(one)).toBeUndefined();
      expect(one.total).toBeCloseTo(none.total, 2);
    }
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
    // Compared against the *rounded* product, not the raw one. Gratuity is
    // billed in whole cents, so at an 18% rate the exact product can sit half
    // a cent away — which is correct, and which a naive toBeCloseTo(…, 2)
    // flags as a failure.
    expect(quote.gratuity).toBe(
      Math.round(quote.subtotal * surcharges.gratuityRate * 100) / 100,
    );
    expect(quote.total).toBeCloseTo(quote.subtotal + quote.gratuity, 2);
  });

  it("returns amounts rounded to whole cents", () => {
    const quote = calculateQuote({
      ...base,
      miles: 17.3,
      durationMinutes: 27,
      extraStops: 1,
    });

    for (const value of [quote.subtotal, quote.gratuity, quote.total]) {
      expect(Math.round(value * 100)).toBeCloseTo(value * 100, 6);
    }
  });
});
