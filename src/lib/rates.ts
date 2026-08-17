/**
 * ============================================================================
 *  RATE CARD  —  CRAIG: THIS IS THE ONLY FILE YOU NEED TO EDIT TO CHANGE PRICES
 * ============================================================================
 *
 *  Craig's confirmed rates: $4.00 per mile and $1.15 per minute.
 *
 *  Point-to-point trips bill on time AND distance, added together — the same
 *  model the ride-hailing apps use, which is what customers expect to see:
 *
 *      fare      = baseFare + (perMileRate x miles) + (perMinuteRate x minutes)
 *      fare      = max(fare, minimumFare)
 *      subtotal  = fare + airportFee? + afterHoursFee? + stops + meetAndGreet?
 *      total     = subtotal + gratuity
 *
 *  Because time is priced, the drive duration is quoted with traffic for the
 *  actual pickup time — a 7am airport run prices higher than the same route at
 *  11pm, which is the honest answer.
 *
 *  THE QUOTE IS FIRM. The drive time is a prediction, so a trip that hits an
 *  accident on 285 costs Craig the overrun, and one that runs clean earns him
 *  the difference. That is deliberate: certainty is the thing this business
 *  sells, and over many trips the overruns and underruns broadly cancel.
 *
 *  Do not "fix" this by billing actual elapsed time — the site promises in
 *  several places that the quoted price is the price paid, and breaking that
 *  quietly is worse than any traffic loss. If overruns ever stop cancelling
 *  out, the right lever is a padding factor on predicted drive time, which
 *  stays invisible to the customer and keeps the price firm.
 *
 *  Hourly charters price as: hourlyRate x hours (>= minimumHours), then the
 *  same surcharges and gratuity.
 *
 *  >>> STILL UNCONFIRMED — see the notes on each field below: <<<
 *      baseFare, minimumFare, hourlyRate, minimumHours, and every surcharge.
 */

export interface Vehicle {
  /** What the site calls it. */
  name: string;
  /** The actual make and model shown alongside the generic name. */
  model: string;
  /** Seated passengers, excluding the chauffeur. */
  passengers: number;
  /** Large checked bags that fit comfortably. */
  luggage: number;
  features: string[];

  // ---- Pricing ----
  /**
   * Flat amount every point-to-point trip starts at, before time and distance.
   * 0 means no booking fee — the meter is the whole fare.
   */
  baseFare: number;
  /** Dollars per mile of driving distance. */
  perMileRate: number;
  /** Dollars per minute of drive time. */
  perMinuteRate: number;
  /** No point-to-point trip prices below this — the least worth sending the car. */
  minimumFare: number;
  /** Dollars per hour for hourly charters. */
  hourlyRate: number;
  /** Hourly charters must book at least this many hours. */
  minimumHours: number;
}

/**
 * The vehicle. Craig runs one, so the site presents it as a spec sheet rather
 * than a choice — and without drawing attention to the fact that there is only
 * one, which just makes the reader think about fleet size.
 *
 * If a second vehicle is ever added, this becomes an array and the booking flow
 * gains a selection step back.
 */
export const vehicle: Vehicle = {
  name: "Luxury SUV",
  /**
   * Craig's vehicle. "Yukon XL" is GMC's name for the extended-wheelbase
   * Yukon — correct this if he uses a different badge.
   */
  model: "GMC Yukon XL",
  /**
   * TODO(craig): confirm. A Yukon XL seats 7 with the third row up, and 8 on
   * a bench second row. 6 is the comfortable chauffeured figure with captain's
   * chairs, but if the car is a 7-seater it is worth saying so — a 7-passenger
   * enquiry currently gets warned the vehicle is too small.
   */
  passengers: 6,
  luggage: 6,
  features: [
    "Full-grain leather seating",
    "Rear climate control",
    "Wireless and wired charging",
    "Chilled bottled water",
    "Extended luggage space",
    "Privacy glass",
  ],

  perMileRate: 4.0,
  perMinuteRate: 1.15,

  /** No booking fee — the meter is the whole fare. */
  baseFare: 0,
  /**
   * Short cross-town hops meter well under this. Without the floor,
   * Buckhead to Midtown quotes about $36 all in, which is not worth taking
   * the SUV out for.
   */
  minimumFare: 95,

  /**
   * Priced above the $69/hour the per-minute rate implies, because hourly
   * buys exclusivity — the car is held and turns down other work.
   */
  hourlyRate: 95,
  minimumHours: 3,
};

/**
 * Weekend and last-minute work is priced differently, and those rates are not
 * confirmed yet.
 *
 * Rather than quote a weekday number and let the customer discover the
 * difference on the invoice — which would break the promise the site makes in
 * several places — a quote falling into either window carries a visible notice
 * and the phone number.
 *
 * When Craig gives the actual figures, set the rate fields below and these
 * become priced line items instead of notices. Nothing else has to change.
 */
export const rateAdjustments = {
  /** Day numbers treated as weekend. 0 = Sunday, 6 = Saturday. */
  weekendDays: [0, 6] as number[],
  /** A pickup sooner than this many hours away counts as last-minute. */
  lastMinuteHours: 24,

  /**
   * Multipliers applied to the fare. null means "not priced yet — show the
   * notice instead". TODO(craig): supply these and the quote prices them.
   */
  weekendSurchargeRate: null as number | null,
  lastMinuteSurchargeRate: null as number | null,

  weekendNotice:
    "Weekend rates differ from the price shown. Call to confirm your rate before booking.",
  lastMinuteNotice:
    "Same-day and short-notice trips are priced separately. Call to confirm availability and your rate.",
} as const;

/** "Luxury SUV" when no model is set, "Cadillac Escalade" when it is. */
export function vehicleLabel(): string {
  return vehicle.model.trim() || vehicle.name;
}

/** "Luxury SUV" / "Luxury SUV · Cadillac Escalade" for places that show both. */
export function vehicleFullLabel(): string {
  const model = vehicle.model.trim();
  return model ? `${vehicle.name} · ${model}` : vehicle.name;
}

export const surcharges = {
  /** Added to any trip that starts or ends at a commercial airport. */
  airportFee: 15,

  /** Added for pickups between afterHoursStart and afterHoursEnd (local time). */
  afterHoursFee: 25,
  /** Hour (0-23) at/after which the after-hours fee applies. */
  afterHoursStart: 22,
  /** Hour (0-23) before which the after-hours fee applies. */
  afterHoursEnd: 5,

  /**
   * Per additional stop between pickup and dropoff.
   *
   * 0 — Craig doesn't charge for stops. The form still asks, because he needs
   * to know they're coming, but no line appears on the quote.
   */
  perExtraStop: 0,

  /**
   * Chauffeur parks, meets the passenger inside baggage claim with a name sign,
   * and helps with bags. Optional add-on on airport arrivals.
   */
  meetAndGreet: 25,

  /**
   * Gratuity, shown as its own line so the customer sees exactly what they pay.
   * Set to 0 to leave gratuity to the customer's discretion — but the site copy
   * promises an all-in price, so that would need rewriting too.
   */
  gratuityRate: 0.18,
} as const;

/**
 * Shown beneath every quote. Keep this honest — it is the difference between a
 * quote and a surprise.
 */
export const quoteDisclaimer =
  "Quotes include gratuity and all standard fees. Tolls, parking, airport permits, wait time beyond the included grace period, and any stops added on the day of service are billed at cost.";

/** Free wait time included before wait-time billing begins. */
export const waitTimePolicy = {
  airportDomesticMinutes: 45,
  airportInternationalMinutes: 60,
  standardMinutes: 15,
} as const;

export const cancellationPolicy =
  "Cancel at no charge up to 24 hours before pickup. Inside 24 hours, 50% of the fare is charged. No-shows are charged in full.";
