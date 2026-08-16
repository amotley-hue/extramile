"use client";

import { business } from "@/lib/business";

/**
 * Last-resort error boundary, for failures in the root layout itself.
 *
 * This file replaces the root layout when it renders, so it must supply its own
 * <html> and <body>, and it does NOT receive globals.css. Every style here is
 * inline for that reason — do not refactor them into a class, they will not
 * apply.
 *
 * The one thing that matters on this page is the phone number. If the site is
 * broken badly enough to land here, a customer trying to book still needs a way
 * to reach Craig.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem 1.5rem",
          background: "#08090b",
          color: "#f4f1ea",
          font: '400 16px/1.65 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          textAlign: "center",
        }}
      >
        <title>Something went wrong — {business.fullName}</title>

        <main style={{ maxWidth: "32rem" }}>
          <p
            style={{
              margin: 0,
              color: "#c2a15c",
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
            }}
          >
            {business.name}
          </p>

          <h1
            style={{
              fontFamily: 'ui-serif, Georgia, "Times New Roman", serif',
              fontWeight: 300,
              fontSize: "clamp(2rem, 7vw, 2.75rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: "1.5rem 0 0",
            }}
          >
            Something went wrong.
          </h1>

          <p style={{ color: "#a09a90", margin: "1.25rem 0 0" }}>
            The site hit an unexpected error. Craig is still reachable — call or
            text and he&rsquo;ll take your booking directly.
          </p>

          <a
            href={`tel:${business.phoneHref}`}
            style={{
              display: "inline-block",
              margin: "2rem 0 0",
              padding: "1rem 2rem",
              background: "#c2a15c",
              color: "#08090b",
              textDecoration: "none",
              fontSize: "0.8125rem",
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Call {business.phone}
          </a>

          <p style={{ margin: "2rem 0 0" }}>
            <button
              type="button"
              onClick={() => retry()}
              style={{
                background: "none",
                border: 0,
                borderBottom: "1px solid rgba(244,241,234,0.25)",
                color: "#a09a90",
                font: "inherit",
                fontSize: "0.875rem",
                padding: "0 0 3px",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </p>

          {error.digest ? (
            <p
              style={{
                margin: "2.5rem 0 0",
                color: "#6f6a61",
                fontSize: "0.75rem",
                fontFamily:
                  'ui-monospace, "SF Mono", "Cascadia Code", Consolas, monospace',
              }}
            >
              Reference {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
