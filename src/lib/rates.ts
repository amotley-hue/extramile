/**
 * ============================================================================
 *  RATE CARD  —  CRAIG: THIS IS THE ONLY FILE YOU NEED TO EDIT TO CHANGE PRICES
 * ============================================================================
 *
 *  >>> EVERY PRICE BELOW IS A PLACEHOLDER. <<<
 *
 *  Benchmarked against typical metro-Atlanta black-car pricing so the site is
 *  demonstrable end to end, but these are NOT your rates. Replace them before
 *  the site goes live, or the quote tool will quote prices you cannot honor.
 *
 *  The quote formula:
 *
 *      fare      = max(minimumFare, baseFare + perMileRate x miles)
 *      subtotal  = fare + airportFee? + afterHoursFee? + stops + meetAndGreet?
 *      total     = subtotal + gratuity
 *
 *  Hourly charters price as: hourlyRate x hours (>= minimumHours), then the
 *  same surcharges and gratuity.
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
  /** Flat amount every point-to-point trip starts at, in dollars. */
  baseFare: number;
  /** Dollars per mile of driving distance. */
  perMileRate: number;
  /** No point-to-point trip prices below this, in dollars. */
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

  baseFare: 65,
  perMileRate: 3.5,
  minimumFare: 105,
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
