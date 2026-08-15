/**
 * Transactional email for booking requests, via Resend.
 *
 * Two messages go out per request:
 *   1. To Craig — everything he needs to accept or decline from his phone.
 *   2. To the customer — proof the request landed, and what happens next.
 *
 * Unconfigured (no RESEND_API_KEY) is a soft failure: the caller still records
 * the request and tells the customer to expect a call.
 */

import { Resend } from "resend";
import { business } from "./business";
import { formatUSD, type Quote } from "./quote";
import type { BookingRequest } from "./validation";

let cached: Resend | null | undefined;

function resend(): Resend | null {
  if (cached !== undefined) return cached;
  const key = process.env.RESEND_API_KEY?.trim();
  cached = key ? new Resend(key) : null;
  return cached;
}

export function isEmailConfigured(): boolean {
  return resend() !== null;
}

/** Must be a domain verified in Resend. See LAUNCH.md step 5. */
function fromAddress(): string {
  return (
    process.env.BOOKING_FROM_EMAIL?.trim() ||
    `${business.name} <bookings@${business.domain}>`
  );
}

/** Where new requests land. Defaults to the published business address. */
function operatorAddress(): string {
  return process.env.BOOKING_TO_EMAIL?.trim() || business.email;
}

const esc = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function formatPickupAt(value: string | undefined): string {
  if (!value) return "Not specified";
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return value;
  const [, y, mo, d, h, mi] = match;
  // Built from the string's own parts so the server timezone can't shift it.
  const date = new Date(Date.UTC(+y, +mo - 1, +d));
  const weekday = date.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
  const month = date.toLocaleDateString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
  const hour24 = +h;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const suffix = hour24 < 12 ? "AM" : "PM";
  return `${weekday}, ${month} ${+d}, ${y} at ${hour12}:${mi} ${suffix} ET`;
}

interface Row {
  label: string;
  value: string;
}

function tripRows(booking: BookingRequest, quote: Quote | null): Row[] {
  const { trip } = booking;
  const rows: Row[] = [
    {
      label: "Service",
      value: trip.tripType === "hourly" ? "Hourly charter" : "Point-to-point",
    },
    { label: "Pickup", value: trip.pickup.address },
  ];

  if (trip.tripType === "hourly") {
    rows.push({ label: "Duration", value: `${trip.hours} hours` });
    if (trip.dropoff?.address) {
      rows.push({ label: "Ending near", value: trip.dropoff.address });
    }
  } else if (trip.dropoff?.address) {
    rows.push({ label: "Dropoff", value: trip.dropoff.address });
  }

  rows.push({ label: "Date & time", value: formatPickupAt(trip.pickupAt) });
  rows.push({ label: "Vehicle", value: quote?.vehicleName ?? trip.vehicleId });
  rows.push({
    label: "Passengers",
    value: `${booking.passengers} passenger${booking.passengers === 1 ? "" : "s"}, ${booking.luggage} bag${booking.luggage === 1 ? "" : "s"}`,
  });

  if (quote?.miles !== undefined) {
    rows.push({ label: "Distance", value: `${quote.miles.toFixed(1)} miles` });
  }
  if (trip.extraStops > 0) {
    rows.push({ label: "Extra stops", value: String(trip.extraStops) });
  }
  if (trip.meetAndGreet) {
    rows.push({ label: "Meet & greet", value: "Yes — inside terminal" });
  }
  if (booking.flightNumber) {
    rows.push({ label: "Flight", value: booking.flightNumber });
  }
  if (booking.notes) {
    rows.push({ label: "Notes", value: booking.notes });
  }

  return rows;
}

function rowsToHtml(rows: Row[]): string {
  return rows
    .map(
      (row) => `
      <tr>
        <td style="padding:10px 16px 10px 0;color:#6b6660;font:500 13px/1.4 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;white-space:nowrap;vertical-align:top;">${esc(row.label)}</td>
        <td style="padding:10px 0;color:#14181c;font:400 15px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;vertical-align:top;">${esc(row.value)}</td>
      </tr>`,
    )
    .join("");
}

function rowsToText(rows: Row[]): string {
  return rows.map((row) => `${row.label}: ${row.value}`).join("\n");
}

function quoteHtml(quote: Quote | null): string {
  if (!quote) {
    return `<p style="margin:0;color:#6b6660;font:400 15px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;">No automatic quote was generated — price to be confirmed.</p>`;
  }
  const lines = quote.lines
    .map(
      (line) => `
      <tr>
        <td style="padding:6px 16px 6px 0;color:#14181c;font:400 14px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;">${esc(line.label)}</td>
        <td style="padding:6px 0;text-align:right;color:#14181c;font:400 14px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;white-space:nowrap;">${esc(formatUSD(line.amount))}</td>
      </tr>`,
    )
    .join("");

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      ${lines}
      <tr>
        <td style="padding:6px 16px 6px 0;color:#6b6660;font:400 14px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;">Gratuity (included)</td>
        <td style="padding:6px 0;text-align:right;color:#6b6660;font:400 14px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;white-space:nowrap;">${esc(formatUSD(quote.gratuity))}</td>
      </tr>
      <tr>
        <td style="padding:14px 16px 0 0;border-top:1px solid #e5e1d9;color:#14181c;font:600 16px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;">Total quoted</td>
        <td style="padding:14px 0 0;border-top:1px solid #e5e1d9;text-align:right;color:#14181c;font:600 16px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;white-space:nowrap;">${esc(formatUSD(quote.total))}</td>
      </tr>
    </table>`;
}

function shell(title: string, body: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:24px 12px;background:#f4f1ea;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;">
    <tr><td style="padding:22px 28px;background:#0a0c0e;">
      <div style="color:#c2a15c;font:600 11px/1 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;">${esc(business.fullName)}</div>
    </td></tr>
    <tr><td style="padding:28px;">${body}</td></tr>
    <tr><td style="padding:18px 28px;background:#faf8f4;border-top:1px solid #e5e1d9;color:#6b6660;font:400 12px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
      ${esc(business.fullName)} · ${esc(business.serviceAreaLabel)}<br>
      <a href="tel:${esc(business.phoneHref)}" style="color:#8a6d2f;text-decoration:none;">${esc(business.phone)}</a> ·
      <a href="${esc(business.url)}" style="color:#8a6d2f;text-decoration:none;">${esc(business.domain)}</a>
    </td></tr>
  </table>
</body></html>`;
}

export interface NotifyResult {
  operatorNotified: boolean;
  customerNotified: boolean;
}

export async function sendBookingEmails(
  booking: BookingRequest,
  quote: Quote | null,
  reference: string,
): Promise<NotifyResult> {
  const mailer = resend();
  if (!mailer) {
    console.warn("RESEND_API_KEY not set — booking emails skipped", {
      reference,
    });
    return { operatorNotified: false, customerNotified: false };
  }

  const rows = tripRows(booking, quote);
  const when = formatPickupAt(booking.trip.pickupAt);
  const total = quote ? formatUSD(quote.total) : "quote pending";

  const operatorHtml = shell(
    `New booking request ${reference}`,
    `
    <p style="margin:0 0 4px;color:#6b6660;font:600 11px/1 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;">New request · ${esc(reference)}</p>
    <h1 style="margin:0 0 18px;color:#0a0c0e;font:600 24px/1.25 Georgia,'Times New Roman',serif;">${esc(booking.name)} — ${esc(total)}</h1>
    <p style="margin:0 0 22px;color:#14181c;font:400 15px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;">${esc(when)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 22px;">
      <tr>
        <td style="padding-right:8px;"><a href="tel:${esc(booking.phone)}" style="display:block;padding:13px 18px;background:#0a0c0e;color:#f4f1ea;font:600 15px/1 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;text-align:center;text-decoration:none;border-radius:8px;">Call ${esc(booking.phone)}</a></td>
        <td style="padding-left:8px;"><a href="mailto:${esc(booking.email)}?subject=${encodeURIComponent(`Your ${business.fullName} reservation ${reference}`)}" style="display:block;padding:13px 18px;background:#f4f1ea;color:#0a0c0e;font:600 15px/1 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;text-align:center;text-decoration:none;border-radius:8px;border:1px solid #ddd8ce;">Reply by email</a></td>
      </tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">${rowsToHtml(rows)}</table>
    <div style="margin:22px 0 0;padding:18px;background:#faf8f4;border-radius:10px;">${quoteHtml(quote)}</div>
    `,
  );

  const customerHtml = shell(
    `We received your request — ${reference}`,
    `
    <h1 style="margin:0 0 14px;color:#0a0c0e;font:600 26px/1.25 Georgia,'Times New Roman',serif;">Thank you, ${esc(booking.name.split(" ")[0])}.</h1>
    <p style="margin:0 0 20px;color:#14181c;font:400 16px/1.65 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
      Your request is with Craig now. He confirms every reservation personally, usually within a couple of hours — sooner during business hours.
      Your reference is <strong>${esc(reference)}</strong>.
    </p>
    <p style="margin:0 0 24px;color:#14181c;font:400 16px/1.65 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
      Traveling sooner than that, or need to change something? Call or text
      <a href="tel:${esc(business.phoneHref)}" style="color:#8a6d2f;font-weight:600;text-decoration:none;">${esc(business.phone)}</a>.
    </p>
    <div style="padding:20px;background:#faf8f4;border-radius:10px;">
      <p style="margin:0 0 14px;color:#6b6660;font:600 11px/1 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;">Your trip</p>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">${rowsToHtml(rows)}</table>
      <div style="margin-top:18px;padding-top:4px;">${quoteHtml(quote)}</div>
      ${quote ? `<p style="margin:14px 0 0;color:#6b6660;font:400 12px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;">${esc(quote.disclaimer)}</p>` : ""}
    </div>
    <p style="margin:22px 0 0;color:#6b6660;font:400 13px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;">
      This is a request, not a confirmed reservation. Your trip is booked once Craig confirms.
    </p>
    `,
  );

  const operatorText = [
    `NEW BOOKING REQUEST — ${reference}`,
    "",
    `${booking.name} · ${booking.phone} · ${booking.email}`,
    `Quoted total: ${total}`,
    "",
    rowsToText(rows),
  ].join("\n");

  const customerText = [
    `Thank you, ${booking.name.split(" ")[0]}.`,
    "",
    `Your request is with Craig. He confirms every reservation personally, usually within a couple of hours.`,
    `Reference: ${reference}`,
    "",
    rowsToText(rows),
    "",
    quote ? `Total quoted: ${formatUSD(quote.total)}` : "",
    quote ? quote.disclaimer : "",
    "",
    `Questions or changes: ${business.phone}`,
    "",
    "This is a request, not a confirmed reservation.",
  ]
    .filter(Boolean)
    .join("\n");

  const [operatorResult, customerResult] = await Promise.allSettled([
    mailer.emails.send({
      from: fromAddress(),
      to: operatorAddress(),
      replyTo: booking.email,
      subject: `${reference} · ${booking.name} · ${when}`,
      html: operatorHtml,
      text: operatorText,
    }),
    mailer.emails.send({
      from: fromAddress(),
      to: booking.email,
      replyTo: operatorAddress(),
      subject: `We received your request — ${business.fullName}`,
      html: customerHtml,
      text: customerText,
    }),
  ]);

  const ok = (
    result: PromiseSettledResult<{ error?: unknown }>,
    who: string,
  ): boolean => {
    if (result.status === "rejected") {
      console.error(`Failed to send ${who} email`, result.reason);
      return false;
    }
    if (result.value?.error) {
      console.error(`Resend rejected ${who} email`, result.value.error);
      return false;
    }
    return true;
  };

  return {
    operatorNotified: ok(operatorResult, "operator"),
    customerNotified: ok(customerResult, "customer"),
  };
}
