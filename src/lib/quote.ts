/**
 * Pricing engine. Pure functions only — no I/O, no environment access — so the
 * same code produces the same number on the server, in tests, and in a preview.
 *
 * Rates come from rates.ts. Distance comes from distance.ts. This module only
 * does arithmetic.
 */

import { quoteDisclaimer, surcharges, vehicle } from "./rates";

export type TripType = "transfer" | "hourly";

export interface QuoteInput {
  tripType: TripType;
  /** Driving distance in miles. Required for `transfer`. */
  miles?: number;
  /** Estimated drive time in minutes, with traffic. Required for `transfer`. */
  durationMinutes?: number;
  /** Charter duration in hours. Required for `hourly`. */
  hours?: number;
  /**
   * Pickup date and time as a local `datetime-local` string
   * (`YYYY-MM-DDTHH:mm`), interpreted as Atlanta local time.
   */
  pickupAt?: string;
  /** True when pickup or dropoff is a commercial airport. */
  isAirport?: boolean;
  /** Additional stops between pickup and dropoff. */
  extraStops?: number;
  /** Chauffeur meets the passenger inside with a name sign. */
  meetAndGreet?: boolean;
}

export interface QuoteLine {
  label: string;
  amount: number;
  note?: string;
}

export interface Quote {
  vehicleName: string;
  tripType: TripType;
  lines: QuoteLine[];
  subtotal: number;
  gratuity: number;
  total: number;
  /** Hours actually billed, after applying the vehicle's minimum. */
  billedHours?: number;
  miles?: number;
  durationMinutes?: number;
  disclaimer: string;
}

/**
 * Extracts the hour from a `datetime-local` string without going through
 * `Date`, which would reinterpret the value in the server's timezone and shift
 * late-night pickups into or out of the after-hours window.
 */
export function localHourOf(pickupAt: string | undefined): number | null {
  if (!pickupAt) return null;
  const match = /^\d{4}-\d{2}-\d{2}T(\d{2}):(\d{2})/.exec(pickupAt.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  return Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : null;
}

export function isAfterHours(pickupAt: string | undefined): boolean {
  const hour = localHourOf(pickupAt);
  if (hour === null) return false;
  const { afterHoursStart, afterHoursEnd } = surcharges;
  // The window wraps midnight (e.g. 22:00 -> 05:00).
  return afterHoursStart > afterHoursEnd
    ? hour >= afterHoursStart || hour < afterHoursEnd
    : hour >= afterHoursStart && hour < afterHoursEnd;
}

const round = (n: number) => Math.round(n * 100) / 100;

export function calculateQuote(input: QuoteInput): Quote {
  const lines: QuoteLine[] = [];

  let billedHours: number | undefined;
  let miles: number | undefined;
  let durationMinutes: number | undefined;

  if (input.tripType === "hourly") {
    const requested = Math.max(0, input.hours ?? 0);
    billedHours = Math.max(requested, vehicle.minimumHours);
    lines.push({
      label: `Chauffeured hourly — ${billedHours} hour${billedHours === 1 ? "" : "s"}`,
      amount: round(vehicle.hourlyRate * billedHours),
      note:
        billedHours > requested
          ? `${vehicle.minimumHours}-hour minimum applied`
          : `$${vehicle.hourlyRate}/hour`,
    });
  } else {
    miles = Math.max(0, input.miles ?? 0);
    durationMinutes = Math.max(0, input.durationMinutes ?? 0);

    const distanceCharge = vehicle.perMileRate * miles;
    const timeCharge = vehicle.perMinuteRate * durationMinutes;
    const metered = vehicle.baseFare + distanceCharge + timeCharge;
    const fare = Math.max(vehicle.minimumFare, metered);

    if (fare > metered) {
      // The minimum is binding, so showing the component lines would be
      // misleading — they would not add up to what is charged.
      lines.push({
        label: `Chauffeured transfer — ${miles.toFixed(1)} mi, ${durationMinutes} min`,
        amount: round(fare),
        note: `${formatUSD(vehicle.minimumFare)} minimum fare applied`,
      });
    } else {
      // Time and distance are shown separately. Craig quotes on both, so the
      // breakdown should say so rather than hiding it in one number.
      if (vehicle.baseFare > 0) {
        lines.push({ label: "Base fare", amount: round(vehicle.baseFare) });
      }
      lines.push({
        label: `Distance — ${miles.toFixed(1)} mi`,
        amount: round(distanceCharge),
        note: `${formatUSD(vehicle.perMileRate)} per mile`,
      });
      lines.push({
        label: `Drive time — ${durationMinutes} min`,
        amount: round(timeCharge),
        note: `${formatUSD(vehicle.perMinuteRate)} per minute, estimated with traffic`,
      });
    }
  }

  if (input.isAirport && surcharges.airportFee > 0) {
    lines.push({
      label: "Airport access & permit",
      amount: surcharges.airportFee,
    });
  }

  if (isAfterHours(input.pickupAt) && surcharges.afterHoursFee > 0) {
    lines.push({
      label: "Late night / early morning",
      amount: surcharges.afterHoursFee,
      note: `Pickups ${surcharges.afterHoursStart}:00–${String(surcharges.afterHoursEnd).padStart(2, "0")}:00`,
    });
  }

  // A $0 line reads as a mistake, so a stop Craig doesn't charge for simply
  // doesn't appear on the quote.
  const stops = Math.max(0, Math.floor(input.extraStops ?? 0));
  if (stops > 0 && surcharges.perExtraStop > 0) {
    lines.push({
      label: `${stops} additional stop${stops === 1 ? "" : "s"}`,
      amount: round(surcharges.perExtraStop * stops),
    });
  }

  if (input.meetAndGreet && surcharges.meetAndGreet > 0) {
    lines.push({
      label: "Meet & greet inside terminal",
      amount: surcharges.meetAndGreet,
    });
  }

  const subtotal = round(lines.reduce((sum, line) => sum + line.amount, 0));
  const gratuity = round(subtotal * surcharges.gratuityRate);
  const total = round(subtotal + gratuity);

  return {
    vehicleName: vehicle.name,
    tripType: input.tripType,
    lines,
    subtotal,
    gratuity,
    total,
    billedHours,
    miles,
    durationMinutes,
    disclaimer: quoteDisclaimer,
  };
}

export function formatUSD(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}
