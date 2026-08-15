import { z } from "zod";

/** `YYYY-MM-DDTHH:mm` as produced by <input type="datetime-local">. */
const localDateTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Choose a pickup date and time.");

const place = z.object({
  address: z.string().trim().min(3, "Enter an address.").max(300),
  placeId: z.string().trim().max(300).optional(),
  isAirport: z.boolean().optional(),
});

/**
 * A trip. There is one vehicle, so there is nothing to choose — the quote
 * endpoint prices this directly.
 */
export const tripSchema = z
  .object({
    tripType: z.enum(["transfer", "hourly"]),
    pickup: place,
    dropoff: place.optional(),
    pickupAt: localDateTime.optional(),
    hours: z.number().int().min(1).max(24).optional(),
    extraStops: z.number().int().min(0).max(10).default(0),
    meetAndGreet: z.boolean().default(false),
  })
  .refine((data) => data.tripType !== "transfer" || data.dropoff !== undefined, {
    message: "Enter a dropoff address.",
    path: ["dropoff"],
  })
  .refine((data) => data.tripType !== "hourly" || data.hours !== undefined, {
    message: "Choose how many hours you need.",
    path: ["hours"],
  });

export type Trip = z.infer<typeof tripSchema>;

/** The quote endpoint takes a bare trip. */
export const quoteRequestSchema = tripSchema;

export const bookingRequestSchema = z.object({
  trip: tripSchema,

  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.email("Enter a valid email address.").max(200),
  phone: z
    .string()
    .trim()
    .min(10, "Enter a phone number we can reach you at.")
    .max(30),

  passengers: z.number().int().min(1).max(20),
  luggage: z.number().int().min(0).max(30).default(0),
  /** Free-text; Craig checks the flight himself rather than paying for an API. */
  flightNumber: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(2000).optional(),

  /** Quote shown to the customer, echoed back for the confirmation email. */
  quotedTotal: z.number().nonnegative().optional(),
  quotedMiles: z.number().nonnegative().optional(),

  /** Honeypot: real users never fill this. */
  company: z.string().max(0).optional(),
});

export type BookingRequest = z.infer<typeof bookingRequestSchema>;

/** Flattens a ZodError into `{ fieldPath: message }` for the client. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    out[key] ??= issue.message;
  }
  return out;
}
