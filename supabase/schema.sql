-- Booking request log for The Extra Mile Limousine Service.
--
-- Run this once in the Supabase SQL editor:
--   Supabase dashboard -> SQL Editor -> New query -> paste -> Run
--
-- This table is written only by the server using the service-role key.
-- Row Level Security is ON with no policies, so the anon/public key can read
-- nothing here even if it leaks. Customer phone numbers and emails live in
-- this table; that is the point of locking it down.

create table if not exists public.booking_requests (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  reference     text not null unique,
  status        text not null default 'new'
                check (status in ('new', 'confirmed', 'declined', 'completed', 'cancelled')),

  -- Trip
  trip_type     text not null check (trip_type in ('transfer', 'hourly')),
  vehicle_id    text not null,
  pickup_address   text not null,
  pickup_place_id  text,
  dropoff_address  text,
  dropoff_place_id text,
  pickup_at     text,
  hours         integer,
  extra_stops   integer not null default 0,
  meet_and_greet boolean not null default false,

  -- Party
  passengers    integer not null,
  luggage       integer not null default 0,
  flight_number text,
  notes         text,

  -- Customer
  customer_name  text not null,
  customer_email text not null,
  customer_phone text not null,

  -- Pricing snapshot, as quoted at request time
  quoted_total   numeric(10, 2),
  quoted_miles   numeric(10, 1),
  quote_breakdown jsonb
);

-- Craig's most common lookup: what's coming up, newest requests first.
create index if not exists booking_requests_created_at_idx
  on public.booking_requests (created_at desc);

create index if not exists booking_requests_status_idx
  on public.booking_requests (status)
  where status = 'new';

alter table public.booking_requests enable row level security;

-- Deliberately no policies. The service-role key used by the server bypasses
-- RLS; every other key is denied. If you later add an admin dashboard, add a
-- policy scoped to an authenticated admin role rather than loosening this.
