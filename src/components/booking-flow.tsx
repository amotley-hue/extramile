"use client";

import { useId, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  Loader2,
  Luggage,
  Phone,
  Users,
} from "lucide-react";
import { AddressInput, type PlaceValue } from "@/components/address-input";
import { Button, cn } from "@/components/ui";
import { business } from "@/lib/business";
import { formatUSD, type Quote } from "@/lib/quote";
import { surcharges, vehicles, type VehicleId } from "@/lib/rates";

type TripType = "transfer" | "hourly";

interface QuoteResponse {
  quotes: Quote[];
  miles?: number;
  durationMinutes?: number;
  isAirport: boolean;
  priced: boolean;
  message?: string;
}

const STEPS = ["Your trip", "Choose a vehicle", "Your details"] as const;

/** `datetime-local` min value: now, rounded up to the next hour. */
function nextHourLocal(): string {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: (props: {
    id: string;
    "aria-invalid": true | undefined;
    "aria-describedby": string | undefined;
    className: string;
  }) => React.ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted"
      >
        {label}
      </label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        className: cn(
          "w-full rounded-xl border bg-ink-3 px-4 py-4 text-[15px] text-cream placeholder:text-faint transition-colors",
          error
            ? "border-red-500/60"
            : "border-line hover:border-line-strong focus:border-brass",
        ),
      })}
      {hint ? (
        <p id={hintId} className="mt-2 text-xs text-faint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function BookingFlow() {
  const [step, setStep] = useState(0);

  // --- Trip ---
  const [tripType, setTripType] = useState<TripType>("transfer");
  const [pickup, setPickup] = useState<PlaceValue>({ address: "" });
  const [dropoff, setDropoff] = useState<PlaceValue>({ address: "" });
  const [pickupAt, setPickupAt] = useState("");
  const [hours, setHours] = useState(3);
  const [extraStops, setExtraStops] = useState(0);
  const [meetAndGreet, setMeetAndGreet] = useState(false);

  // --- Quote ---
  const [result, setResult] = useState<QuoteResponse | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [vehicleId, setVehicleId] = useState<VehicleId>("sedan");

  // --- Customer ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [passengers, setPassengers] = useState(2);
  const [luggage, setLuggage] = useState(2);
  const [flightNumber, setFlightNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [company, setCompany] = useState(""); // honeypot

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    reference: string;
    total: number | null;
    emailed: boolean;
  } | null>(null);

  const minDateTime = useMemo(() => nextHourLocal(), []);

  const isAirportTrip =
    Boolean(pickup.isAirport) ||
    Boolean(dropoff.isAirport) ||
    /airport|hartsfield|\bATL\b|\bPDK\b/i.test(
      `${pickup.address} ${dropoff.address}`,
    );

  // Meet & greet only exists on airport trips. Derived rather than reset in an
  // effect, so a customer who ticks it and then edits the trip into a
  // non-airport one simply stops being charged for it.
  const wantsMeetAndGreet = isAirportTrip && meetAndGreet;

  const selectedQuote =
    result?.quotes.find((q) => q.vehicleId === vehicleId) ?? null;

  function validateTrip(): boolean {
    const next: Record<string, string> = {};
    if (pickup.address.trim().length < 3)
      next.pickup = "Where should Craig pick you up?";
    if (tripType === "transfer" && dropoff.address.trim().length < 3)
      next.dropoff = "Where are you headed?";
    if (!pickupAt) next.pickupAt = "Choose a date and time.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function fetchQuote() {
    if (!validateTrip()) return;

    setQuoting(true);
    setFormError(null);

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripType,
          pickup,
          dropoff: tripType === "transfer" ? dropoff : undefined,
          pickupAt,
          hours: tripType === "hourly" ? hours : undefined,
          extraStops,
          meetAndGreet: wantsMeetAndGreet,
        }),
      });

      const data = (await response.json()) as QuoteResponse & {
        error?: string;
      };

      if (!response.ok) {
        setFormError(data.error ?? "We couldn't price that trip.");
        return;
      }

      setResult(data);
      // Default to the smallest vehicle that seats the party.
      const fit = vehicles.find((v) => v.passengers >= passengers) ?? vehicles[0]!;
      setVehicleId(fit.id);
      setStep(1);
    } catch {
      setFormError(
        "We couldn't reach the pricing service. Please try again, or call Craig directly.",
      );
    } finally {
      setQuoting(false);
    }
  }

  async function submitBooking(event: React.FormEvent) {
    event.preventDefault();

    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Enter your name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()))
      next.email = "Enter a valid email address.";
    if (phone.replace(/\D/g, "").length < 10)
      next.phone = "Enter a phone number we can reach you at.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip: {
            tripType,
            vehicleId,
            pickup,
            dropoff: tripType === "transfer" ? dropoff : undefined,
            pickupAt,
            hours: tripType === "hourly" ? hours : undefined,
            extraStops,
            meetAndGreet: wantsMeetAndGreet,
          },
          name,
          email,
          phone,
          passengers,
          luggage,
          flightNumber: flightNumber || undefined,
          notes: notes || undefined,
          quotedTotal: selectedQuote?.total,
          quotedMiles: result?.miles,
          company,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        reference?: string;
        total?: number | null;
        confirmationEmailed?: boolean;
        error?: string;
        fields?: Record<string, string>;
      };

      if (!response.ok || !data.ok) {
        if (data.fields) setErrors(data.fields);
        setFormError(
          data.error ??
            "Something went wrong sending your request. Please call Craig.",
        );
        return;
      }

      setConfirmation({
        reference: data.reference!,
        total: data.total ?? null,
        emailed: Boolean(data.confirmationEmailed),
      });
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setFormError(
        "We couldn't send your request. Please call or text Craig at " +
          business.phone +
          ".",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ---------- Confirmation ----------
  if (step === 3 && confirmation) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-ink-2 p-8 text-center md:p-14">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brass-dim">
          <Check className="size-7 text-brass" aria-hidden />
        </div>
        <h2 className="mt-7 text-3xl md:text-4xl">Request received</h2>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Craig confirms every reservation personally — usually within a couple
          of hours. Your reference is{" "}
          <span className="font-medium text-brass">
            {confirmation.reference}
          </span>
          .
        </p>

        {confirmation.total !== null ? (
          <p className="mt-6 text-sm text-muted">
            Quoted total{" "}
            <span className="text-lg text-cream">
              {formatUSD(confirmation.total)}
            </span>
          </p>
        ) : null}

        <p className="mt-6 text-sm leading-relaxed text-faint">
          {confirmation.emailed
            ? "A copy is on its way to your inbox."
            : "Keep your reference handy — email confirmation is not switched on yet."}{" "}
          This is a request, not a confirmed reservation. Your trip is booked
          once Craig confirms.
        </p>

        <a
          href={`tel:${business.phoneHref}`}
          className="mt-9 inline-flex items-center justify-center gap-2 rounded-full border border-line-strong px-7 py-3.5 text-sm font-medium text-cream transition-colors hover:border-brass hover:text-brass"
        >
          <Phone className="size-4" aria-hidden />
          Traveling sooner? Call {business.phone}
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress */}
      <ol className="mb-10 flex items-center gap-2" aria-label="Progress">
        {STEPS.map((label, index) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div className="flex-1">
              <div
                className={cn(
                  "h-0.5 rounded-full transition-colors duration-300",
                  index <= step ? "bg-brass" : "bg-line",
                )}
              />
              <p
                className={cn(
                  "mt-3 text-xs transition-colors",
                  index === step
                    ? "text-brass"
                    : index < step
                      ? "text-muted"
                      : "text-faint",
                )}
                aria-current={index === step ? "step" : undefined}
              >
                {label}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {formError ? (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-4 text-sm text-red-200"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>{formError}</p>
        </div>
      ) : null}

      {/* ---------- Step 1: trip ---------- */}
      {step === 0 ? (
        <div className="rounded-2xl border border-line bg-ink-2 p-6 md:p-9">
          <div
            role="radiogroup"
            aria-label="Type of service"
            className="mb-8 grid grid-cols-2 gap-2 rounded-xl bg-ink-3 p-1.5"
          >
            {(
              [
                ["transfer", "Point to point"],
                ["hourly", "By the hour"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={tripType === id}
                onClick={() => setTripType(id)}
                className={cn(
                  "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  tripType === id
                    ? "bg-brass text-ink"
                    : "text-muted hover:text-cream",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <AddressInput
              label="Pickup"
              value={pickup}
              onChange={setPickup}
              placeholder="Address, hotel, or airport terminal"
              error={errors.pickup}
              required
            />

            {tripType === "transfer" ? (
              <AddressInput
                label="Dropoff"
                value={dropoff}
                onChange={setDropoff}
                placeholder="Where are you headed?"
                error={errors.dropoff}
                required
              />
            ) : (
              <Field
                label="How many hours?"
                hint={`Minimums vary by vehicle — ${vehicles[0]!.minimumHours} hours for a sedan.`}
              >
                {(props) => (
                  <select
                    {...props}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 2).map((h) => (
                      <option key={h} value={h} className="bg-ink-3">
                        {h} hours
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Pickup date & time" error={errors.pickupAt}>
                {(props) => (
                  <input
                    {...props}
                    type="datetime-local"
                    min={minDateTime}
                    value={pickupAt}
                    onChange={(e) => setPickupAt(e.target.value)}
                    required
                  />
                )}
              </Field>

              <Field
                label="Extra stops"
                hint={
                  extraStops > 0
                    ? `+${formatUSD(surcharges.perExtraStop * extraStops)}`
                    : undefined
                }
              >
                {(props) => (
                  <select
                    {...props}
                    value={extraStops}
                    onChange={(e) => setExtraStops(Number(e.target.value))}
                  >
                    {[0, 1, 2, 3].map((n) => (
                      <option key={n} value={n} className="bg-ink-3">
                        {n === 0 ? "None" : `${n} stop${n > 1 ? "s" : ""}`}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            </div>

            {isAirportTrip ? (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-ink-3 p-4 transition-colors hover:border-line-strong">
                <input
                  type="checkbox"
                  checked={meetAndGreet}
                  onChange={(e) => setMeetAndGreet(e.target.checked)}
                  className="mt-1 size-4 accent-[var(--brass)]"
                />
                <span>
                  <span className="block text-sm text-cream">
                    Meet me inside the terminal
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-faint">
                    Craig parks, meets you at baggage claim with a name sign,
                    and helps with your bags. +
                    {formatUSD(surcharges.meetAndGreet)}
                  </span>
                </span>
              </label>
            ) : null}
          </div>

          <Button
            type="button"
            onClick={fetchQuote}
            disabled={quoting}
            className="mt-8 w-full py-4"
          >
            {quoting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Pricing your trip…
              </>
            ) : (
              "See my price"
            )}
          </Button>

          <p className="mt-4 text-center text-xs text-faint">
            No account needed. No payment now.
          </p>
        </div>
      ) : null}

      {/* ---------- Step 2: vehicle ---------- */}
      {step === 1 && result ? (
        <div>
          <button
            type="button"
            onClick={() => setStep(0)}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-cream"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Edit trip
          </button>

          {result.priced ? (
            <p className="mb-6 text-sm text-muted">
              {result.miles !== undefined ? (
                <>
                  {result.miles.toFixed(1)} miles
                  {result.durationMinutes
                    ? ` · about ${result.durationMinutes} minutes in normal traffic`
                    : ""}
                  . All-in prices, gratuity included.
                </>
              ) : (
                <>
                  {hours} hours. All-in prices, gratuity included.
                </>
              )}
            </p>
          ) : (
            <div className="mb-6 rounded-xl border border-brass/30 bg-brass-dim px-5 py-4 text-sm leading-relaxed text-cream">
              {result.message}
            </div>
          )}

          <div className="space-y-3">
            {vehicles.map((vehicle) => {
              const quote = result.quotes.find(
                (q) => q.vehicleId === vehicle.id,
              );
              const selected = vehicleId === vehicle.id;
              const tooSmall = vehicle.passengers < passengers;

              return (
                <button
                  key={vehicle.id}
                  type="button"
                  onClick={() => setVehicleId(vehicle.id)}
                  aria-pressed={selected}
                  className={cn(
                    "flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-colors md:p-6",
                    selected
                      ? "border-brass bg-ink-2"
                      : "border-line bg-ink-2/60 hover:border-line-strong",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                      selected ? "border-brass bg-brass" : "border-line-strong",
                    )}
                    aria-hidden
                  >
                    {selected ? (
                      <Check className="size-3 text-ink" strokeWidth={3} />
                    ) : null}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <span className="font-display text-xl text-cream">
                        {vehicle.name}
                      </span>
                      {quote ? (
                        <span className="text-lg text-brass">
                          {formatUSD(quote.total)}
                        </span>
                      ) : (
                        <span className="text-sm text-faint">
                          Quoted by Craig
                        </span>
                      )}
                    </span>

                    <span className="mt-1 block text-xs text-faint">
                      {vehicle.examples}
                    </span>

                    <span className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="size-3.5" aria-hidden />
                        Up to {vehicle.passengers}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Luggage className="size-3.5" aria-hidden />
                        {vehicle.luggage} bags
                      </span>
                      {tooSmall ? (
                        <span className="text-amber-400/90">
                          Seats fewer than your {passengers} passengers
                        </span>
                      ) : null}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {selectedQuote ? (
            <div className="mt-6 rounded-2xl border border-line bg-ink-2 p-6">
              <p className="eyebrow mb-4">Price breakdown</p>
              <dl className="space-y-2.5">
                {selectedQuote.lines.map((line) => (
                  <div
                    key={line.label}
                    className="flex items-baseline justify-between gap-4 text-sm"
                  >
                    <dt className="text-muted">
                      {line.label}
                      {line.note ? (
                        <span className="mt-0.5 block text-xs text-faint">
                          {line.note}
                        </span>
                      ) : null}
                    </dt>
                    <dd className="shrink-0 text-cream">
                      {formatUSD(line.amount)}
                    </dd>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <dt className="text-muted">Gratuity (included)</dt>
                  <dd className="shrink-0 text-cream">
                    {formatUSD(selectedQuote.gratuity)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3.5">
                  <dt className="text-cream">Total</dt>
                  <dd className="font-display text-2xl text-brass">
                    {formatUSD(selectedQuote.total)}
                  </dd>
                </div>
              </dl>
              <p className="mt-5 text-xs leading-relaxed text-faint">
                {selectedQuote.disclaimer}
              </p>
            </div>
          ) : null}

          <Button
            type="button"
            onClick={() => setStep(2)}
            className="mt-8 w-full py-4"
          >
            Continue
          </Button>
        </div>
      ) : null}

      {/* ---------- Step 3: details ---------- */}
      {step === 2 ? (
        <form
          onSubmit={submitBooking}
          className="rounded-2xl border border-line bg-ink-2 p-6 md:p-9"
        >
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mb-7 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-cream"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to vehicles
          </button>

          <div className="space-y-6">
            <Field label="Full name" error={errors.name}>
              {(props) => (
                <input
                  {...props}
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}
            </Field>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Mobile number" error={errors.phone}>
                {(props) => (
                  <input
                    {...props}
                    type="tel"
                    autoComplete="tel"
                    placeholder="(404) 555-0142"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                )}
              </Field>

              <Field label="Email" error={errors.email}>
                {(props) => (
                  <input
                    {...props}
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                )}
              </Field>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Passengers">
                {(props) => (
                  <select
                    {...props}
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                  >
                    {Array.from({ length: 14 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n} className="bg-ink-3">
                        {n}
                      </option>
                    ))}
                  </select>
                )}
              </Field>

              <Field label="Bags">
                {(props) => (
                  <select
                    {...props}
                    value={luggage}
                    onChange={(e) => setLuggage(Number(e.target.value))}
                  >
                    {Array.from({ length: 15 }, (_, i) => i).map((n) => (
                      <option key={n} value={n} className="bg-ink-3">
                        {n}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            </div>

            {isAirportTrip ? (
              <Field
                label="Flight number"
                hint="Optional. Craig watches your flight and adjusts for delays."
              >
                {(props) => (
                  <input
                    {...props}
                    type="text"
                    placeholder="DL 1422"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                  />
                )}
              </Field>
            ) : null}

            <Field
              label="Anything Craig should know?"
              hint="Car seats, a stop on the way, a preferred route, the occasion."
            >
              {(props) => (
                <textarea
                  {...props}
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={cn(props.className, "resize-y")}
                />
              )}
            </Field>

            {/* Honeypot — visually and programmatically hidden from people. */}
            <div aria-hidden className="hidden">
              <label htmlFor="company-website">Company website</label>
              <input
                id="company-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>

          {selectedQuote ? (
            <div className="mt-8 flex items-baseline justify-between gap-4 rounded-xl bg-ink-3 px-5 py-4">
              <span className="text-sm text-muted">
                {selectedQuote.vehicleName} · all in
              </span>
              <span className="font-display text-2xl text-brass">
                {formatUSD(selectedQuote.total)}
              </span>
            </div>
          ) : null}

          <Button type="submit" disabled={submitting} className="mt-6 w-full py-4">
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Sending your request…
              </>
            ) : (
              "Send my request"
            )}
          </Button>

          <p className="mt-4 text-center text-xs leading-relaxed text-faint">
            No payment now. Craig confirms every reservation personally, then
            you&rsquo;re booked.
          </p>
        </form>
      ) : null}
    </div>
  );
}
