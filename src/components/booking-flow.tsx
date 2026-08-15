"use client";

import { useId, useMemo, useState } from "react";
import { ArrowLeft, Check, CircleAlert, Loader2, Phone } from "lucide-react";
import { AddressInput, type PlaceValue } from "@/components/address-input";
import { Button, cn } from "@/components/ui";
import { business } from "@/lib/business";
import { formatUSD, type Quote } from "@/lib/quote";
import { surcharges, vehicle, vehicleFullLabel } from "@/lib/rates";

type TripType = "transfer" | "hourly";

interface QuoteResponse {
  quote: Quote | null;
  miles?: number;
  durationMinutes?: number;
  isAirport: boolean;
  priced: boolean;
  message?: string;
}

const STEPS = ["Your trip", "Your details"] as const;

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
        className="mb-2.5 block text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-faint"
      >
        {label}
      </label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        className: cn(
          "w-full border-0 border-b bg-transparent px-0 py-3.5 text-[15px] text-cream placeholder:text-faint/70 transition-colors focus:ring-0",
          error
            ? "border-red-400/70"
            : "border-line-strong hover:border-brass/50 focus:border-brass",
        ),
      })}
      {hint ? (
        <p id={hintId} className="mt-2.5 text-xs text-faint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-2.5 text-sm text-red-300">
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

  const quote = result?.quote ?? null;

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
      setStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
          quotedTotal: quote?.total,
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
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setFormError(
        `We couldn't send your request. Please call or text Craig at ${business.phone}.`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ---------- Confirmation ----------
  if (step === 2 && confirmation) {
    return (
      <div className="mx-auto max-w-2xl px-2 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-brass/30 bg-brass-dim">
          <Check className="size-7 text-brass" strokeWidth={1.5} aria-hidden />
        </div>
        <h2 className="display-xl mt-9 text-4xl md:text-5xl">
          Request received
        </h2>
        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted">
          Craig confirms every reservation personally — usually within a couple
          of hours. Your reference is{" "}
          <span className="text-brass">{confirmation.reference}</span>.
        </p>

        {confirmation.total !== null ? (
          <p className="mt-9 text-xs uppercase tracking-[0.24em] text-faint">
            Quoted total
            <span className="mt-3 block font-display text-4xl tracking-normal text-brass">
              {formatUSD(confirmation.total)}
            </span>
          </p>
        ) : null}

        <p className="mx-auto mt-9 max-w-md text-sm leading-relaxed text-faint">
          {confirmation.emailed
            ? "A copy is on its way to your inbox."
            : "Keep your reference handy — email confirmation is not switched on yet."}{" "}
          This is a request, not a confirmed reservation. Your trip is booked
          once Craig confirms.
        </p>

        <a
          href={`tel:${business.phoneHref}`}
          className="mt-10 inline-flex items-center justify-center gap-2.5 border-b border-brass/40 pb-1 text-sm text-cream transition-colors hover:border-brass hover:text-brass"
        >
          <Phone className="size-4" aria-hidden />
          Traveling sooner? Call {business.phone}
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress */}
      <ol className="mb-14 flex items-center gap-10" aria-label="Progress">
        {STEPS.map((label, index) => (
          <li key={label} className="flex items-baseline gap-3">
            <span
              className={cn(
                "font-display text-sm transition-colors",
                index <= step ? "text-brass" : "text-faint",
              )}
              aria-hidden
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className={cn(
                "text-[0.6875rem] uppercase tracking-[0.2em] transition-colors",
                index === step
                  ? "text-cream"
                  : index < step
                    ? "text-muted"
                    : "text-faint",
              )}
              aria-current={index === step ? "step" : undefined}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>

      {formError ? (
        <div
          role="alert"
          className="mb-9 flex items-start gap-3 border-l-2 border-red-400/60 bg-red-500/[0.06] px-5 py-4 text-sm text-red-200"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>{formError}</p>
        </div>
      ) : null}

      {/* ---------- Step 1: trip ---------- */}
      {step === 0 ? (
        <div>
          <div
            role="radiogroup"
            aria-label="Type of service"
            className="mb-12 flex gap-8 border-b border-line"
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
                  "relative -mb-px pb-4 text-sm transition-colors",
                  tripType === id
                    ? "text-cream"
                    : "text-faint hover:text-muted",
                )}
              >
                {label}
                <span
                  className={cn(
                    "absolute inset-x-0 bottom-0 h-px transition-colors",
                    tripType === id ? "bg-brass" : "bg-transparent",
                  )}
                  aria-hidden
                />
              </button>
            ))}
          </div>

          <div className="space-y-10">
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
                label="How many hours"
                hint={`${vehicle.minimumHours}-hour minimum.`}
              >
                {(props) => (
                  <select
                    {...props}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 2).map((h) => (
                      <option key={h} value={h} className="bg-ink-raise">
                        {h} hours
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            )}

            <div className="grid gap-10 sm:grid-cols-2">
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
                      <option key={n} value={n} className="bg-ink-raise">
                        {n === 0 ? "None" : `${n} stop${n > 1 ? "s" : ""}`}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            </div>

            {isAirportTrip ? (
              <label className="flex cursor-pointer items-start gap-4 border-t border-line pt-8">
                <input
                  type="checkbox"
                  checked={meetAndGreet}
                  onChange={(e) => setMeetAndGreet(e.target.checked)}
                  className="mt-1 size-4 shrink-0 accent-[var(--brass)]"
                />
                <span>
                  <span className="block text-[15px] text-cream">
                    Meet me inside the terminal
                  </span>
                  <span className="mt-1.5 block text-xs leading-relaxed text-faint">
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
            className="mt-14 w-full py-4"
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

          <p className="mt-5 text-center text-xs text-faint">
            No account needed. No payment now.
          </p>
        </div>
      ) : null}

      {/* ---------- Step 2: price + details ---------- */}
      {step === 1 ? (
        <form onSubmit={submitBooking}>
          <button
            type="button"
            onClick={() => setStep(0)}
            className="mb-10 inline-flex items-center gap-2 text-sm text-faint transition-colors hover:text-cream"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Edit trip
          </button>

          {/* The price, stated. Nothing to choose. */}
          {quote ? (
            <div className="wash mb-14 px-6 py-10 text-center sm:px-10">
              <p className="eyebrow">Your all-in price</p>
              <p className="mt-5 font-display text-6xl font-light text-brass md:text-7xl">
                {formatUSD(quote.total)}
              </p>
              <p className="mt-5 text-sm text-muted">
                {vehicleFullLabel()} · chauffeured by {business.owner}
                {result?.miles !== undefined ? (
                  <>
                    <br />
                    {result.miles.toFixed(1)} miles
                    {result.durationMinutes
                      ? ` · about ${result.durationMinutes} minutes in normal traffic`
                      : ""}
                  </>
                ) : null}
              </p>

              <dl className="mx-auto mt-10 max-w-sm space-y-3 border-t border-line pt-8 text-left">
                {quote.lines.map((line) => (
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
                    {formatUSD(quote.gratuity)}
                  </dd>
                </div>
              </dl>

              <p className="mx-auto mt-8 max-w-sm text-left text-xs leading-relaxed text-faint">
                {quote.disclaimer}
              </p>
            </div>
          ) : (
            <div className="wash mb-14 px-6 py-10 text-center sm:px-10">
              <p className="eyebrow">Your trip</p>
              <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-cream">
                {result?.message}
              </p>
              <p className="mt-5 text-sm text-muted">
                {vehicleFullLabel()} · chauffeured by {business.owner}
              </p>
            </div>
          )}

          <div className="space-y-10">
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

            <div className="grid gap-10 sm:grid-cols-2">
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

            <div className="grid gap-10 sm:grid-cols-2">
              <Field
                label="Passengers"
                hint={
                  passengers > vehicle.passengers
                    ? `The ${vehicle.name} seats ${vehicle.passengers} — Craig will confirm arrangements.`
                    : undefined
                }
              >
                {(props) => (
                  <select
                    {...props}
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                  >
                    {Array.from({ length: 14 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n} className="bg-ink-raise">
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
                      <option key={n} value={n} className="bg-ink-raise">
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
              label="Anything Craig should know"
              hint="Car seats, a stop on the way, a preferred route, the occasion."
            >
              {(props) => (
                <textarea
                  {...props}
                  rows={3}
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

          <Button type="submit" disabled={submitting} className="mt-14 w-full py-4">
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Sending your request…
              </>
            ) : (
              "Send my request"
            )}
          </Button>

          <p className="mt-5 text-center text-xs leading-relaxed text-faint">
            No payment now. Craig confirms every reservation personally, then
            you&rsquo;re booked.
          </p>
        </form>
      ) : null}
    </div>
  );
}
