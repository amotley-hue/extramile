/**
 * Durable record of every booking request.
 *
 * Email is how Craig actually finds out about a request, but email can bounce,
 * land in spam, or get deleted by accident. A booking request is a paying
 * customer, so it gets written down before anyone relies on a notification.
 *
 * Optional by design: with no Supabase credentials the site still works and
 * this becomes a no-op. Losing the audit trail is survivable; refusing the
 * booking is not.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { BookingRequest } from "./validation";
import type { Quote } from "./quote";
import { vehicleFullLabel } from "./rates";

let cached: SupabaseClient | null | undefined;

function client(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.SUPABASE_URL?.trim();
  // Service-role key: server-side only, never NEXT_PUBLIC_.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  cached =
    url && key
      ? createClient(url, key, { auth: { persistSession: false } })
      : null;

  return cached;
}

export function isStoreConfigured(): boolean {
  return client() !== null;
}

export interface StoredBooking {
  reference: string;
  persisted: boolean;
}

/**
 * Human-readable reference the customer can quote on the phone.
 * Format: EM-<base36 timestamp><2 random chars>, e.g. "EM-M4KP2Q7X".
 */
export function newReference(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const salt = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `EM-${stamp}${salt}`;
}

export async function saveBooking(
  booking: BookingRequest,
  quote: Quote | null,
  reference: string,
): Promise<boolean> {
  const db = client();
  if (!db) return false;

  const { trip } = booking;

  const { error } = await db.from("booking_requests").insert({
    reference,
    status: "new",
    trip_type: trip.tripType,
    // Recorded per booking rather than assumed, so historical requests stay
    // accurate if Craig ever changes vehicles.
    vehicle_name: vehicleFullLabel(),
    pickup_address: trip.pickup.address,
    pickup_place_id: trip.pickup.placeId ?? null,
    dropoff_address: trip.dropoff?.address ?? null,
    dropoff_place_id: trip.dropoff?.placeId ?? null,
    pickup_at: trip.pickupAt ?? null,
    hours: trip.hours ?? null,
    extra_stops: trip.extraStops,
    meet_and_greet: trip.meetAndGreet,
    passengers: booking.passengers,
    luggage: booking.luggage,
    flight_number: booking.flightNumber ?? null,
    notes: booking.notes ?? null,
    customer_name: booking.name,
    customer_email: booking.email,
    customer_phone: booking.phone,
    quoted_total: quote?.total ?? booking.quotedTotal ?? null,
    quoted_miles: quote?.miles ?? booking.quotedMiles ?? null,
    quote_breakdown: quote ? quote.lines : null,
  });

  if (error) {
    console.error("Failed to persist booking request", error);
    return false;
  }

  return true;
}
