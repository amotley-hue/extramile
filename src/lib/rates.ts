/**
 * ============================================================================
 *  RATE CARD  —  CRAIG: THIS IS THE ONLY FILE YOU NEED TO EDIT TO CHANGE PRICES
 * ============================================================================
 *
 *  >>> EVERY NUMBER BELOW IS A PLACEHOLDER. <<<
 *
 *  These are benchmarked against typical metro-Atlanta black-car pricing so the
 *  site is demonstrable end to end, but they are NOT your rates. Replace them
 *  before the site goes live, or the quote tool will quote prices you cannot
 *  honor. Nothing else in the codebase needs to change when you edit this file.
 *
 *  The quote formula, per vehicle:
 *
 *      fare      = max(minimumFare, baseFare + perMileRate x miles)
 *      subtotal  = fare + airportFee? + afterHoursFee? + stops + meetAndGreet?
 *      total     = subtotal + gratuity
 *
 *  Hourly charters price as: hourlyRate x hours (>= minimumHours), then the
 *  same surcharges and gratuity.
 */

export type VehicleId = "sedan" | "suv" | "sprinter";

export interface Vehicle {
  id: VehicleId;
  name: string;
  /** Example models. Update to match the actual fleet. */
  examples: string;
  /** Seated passengers, excluding the chauffeur. */
  passengers: number;
  /** Large checked bags that fit comfortably. */
  luggage: number;
  blurb: string;
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

export const vehicles: Vehicle[] = [
  {
    id: "sedan",
    name: "Luxury Sedan",
    examples: "Cadillac XTS · Lincoln Continental · Mercedes E-Class",
    passengers: 3,
    luggage: 3,
    blurb:
      "The everyday standard. Ideal for airport runs, client meetings, and a quiet hour to yourself between stops.",
    features: [
      "Leather interior",
      "Rear climate control",
      "Phone chargers",
      "Bottled water",
    ],
    baseFare: 45,
    perMileRate: 2.75,
    minimumFare: 75,
    hourlyRate: 85,
    minimumHours: 2,
  },
  {
    id: "suv",
    name: "Premium SUV",
    examples: "Cadillac Escalade · Chevrolet Suburban · Lincoln Navigator",
    passengers: 6,
    luggage: 6,
    blurb:
      "Room for the family, the golf clubs, or the whole deal team. The most requested vehicle for ATL arrivals.",
    features: [
      "Captain's chairs",
      "Rear climate control",
      "Phone chargers",
      "Bottled water",
      "Extended luggage space",
    ],
    baseFare: 65,
    perMileRate: 3.5,
    minimumFare: 105,
    hourlyRate: 110,
    minimumHours: 2,
  },
  {
    id: "sprinter",
    name: "Executive Sprinter",
    examples: "Mercedes-Benz Sprinter Executive",
    passengers: 12,
    luggage: 12,
    blurb:
      "Move a group without splitting it up. Corporate roadshows, wedding parties, and airport groups travel together.",
    features: [
      "Executive seating",
      "Standing headroom",
      "Onboard power",
      "Bottled water",
      "Rear luggage bay",
    ],
    baseFare: 110,
    perMileRate: 4.5,
    minimumFare: 195,
    hourlyRate: 155,
    minimumHours: 3,
  },
];

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

export function getVehicle(id: VehicleId): Vehicle {
  const vehicle = vehicles.find((v) => v.id === id);
  if (!vehicle) throw new Error(`Unknown vehicle: ${id}`);
  return vehicle;
}
