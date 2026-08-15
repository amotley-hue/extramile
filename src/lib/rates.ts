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
 *  Hourly charters price as: hourlyRate x hours (>= minimumHours), then the
 *  same surcharges and gratuity.
 *
 *  >>> STILL UNCONFIRMED — see the notes on each field below: <<<
 *      baseFare, minimumFare, hourlyRate, minimumHours, and every surcharge.
 */

export interface Vehicle {
  /** What the site calls it. */
  name: string;
  /**
   * The actual make and model, e.g. "Cadillac Escalade".
   *
   * TODO(craig): fill this in. Left empty on purpose — every place the site
   * shows the vehicle falls back to the generic name when this is blank, so an
   * empty string is honest and a guess would not be. Naming the specific
   * vehicle is worth doing: it is what makes the price feel earned rather than
   * asserted.
   */
  model: string;
  /** Seated passengers, excluding the chauffeur. */
  passengers: number;
  /** Large checked bags that fit comfortably. */
  luggage: number;
  features: string[];

  // ---- Pricing ----
  /**
   * Flat amount every point-to-point trip starts at, before time and distance.
   * TODO(craig): 0 means no booking fee. Set it if you want every trip to
   * start at a fixed amount on top of the meter.
   */
  baseFare: number;
  /** Dollars per mile of driving distance. Confirmed: $4.00. */
  perMileRate: number;
  /** Dollars per minute of drive time. Confirmed: $1.15. */
  perMinuteRate: number;
  /**
   * No point-to-point trip prices below this, in dollars.
   * TODO(craig): 0 means no floor, which lets a short hop quote very low —
   * a 3-mile, 10-minute trip is $12 + $11.50 = $23.50 before gratuity. Set
   * this to the least you would send the SUV out for.
   */
  minimumFare: number;
  /**
   * Dollars per hour for hourly charters.
   * TODO(craig): unconfirmed. Note $1.15/min works out to $69/hour, which is
   * almost certainly below what you would charge to hold the car for an
   * evening — hourly is usually priced above the metered rate, not below.
   */
  hourlyRate: number;
  /** Hourly charters must book at least this many hours. TODO(craig): confirm. */
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
  model: "",
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

  // Confirmed by Craig.
  perMileRate: 4.0,
  perMinuteRate: 1.15,

  // Not yet confirmed. Zero means "not charged" rather than a made-up number.
  baseFare: 0,
  minimumFare: 0,

  // Not yet confirmed. See the note on hourlyRate above.
  hourlyRate: 110,
  minimumHours: 2,
};

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

  /** Per additional stop between pickup and dropoff. */
  perExtraStop: 20,

  /**
   * Chauffeur parks, meets the passenger inside baggage claim with a name sign,
   * and helps with bags. Optional add-on on airport arrivals.
   */
  meetAndGreet: 25,

  /**
   * Gratuity, shown as its own line so the customer sees exactly what they pay.
   * Set to 0 to leave gratuity to the customer's discretion.
   */
  gratuityRate: 0.2,
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
