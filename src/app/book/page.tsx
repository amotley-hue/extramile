import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { BookingFlow } from "@/components/booking-flow";
import { business } from "@/lib/business";
import { cancellationPolicy, waitTimePolicy } from "@/lib/rates";

export const metadata: Metadata = {
  title: "Get an instant quote",
  description:
    "Price your Atlanta chauffeur trip in about a minute — airport transfers, point-to-point, and hourly charter. All-in pricing, gratuity included, no account required.",
  alternates: { canonical: "/book" },
};

const assurances = [
  {
    title: "You see the real price",
    body: "Every quote is all-in: fare, fees, and gratuity. No surge pricing, and no number that changes between the quote and the invoice.",
  },
  {
    title: "Craig confirms personally",
    body: "Requests come straight to Craig, not a dispatch queue. He confirms — usually within a couple of hours — and you deal with the same person who drives you.",
  },
  {
    title: "Nothing is charged today",
    body: "Send the request without entering a card. You are booked once Craig confirms.",
  },
];

export default function BookPage() {
  return (
    <>
      <section className="border-b border-line bg-ink-2/40 py-16 md:py-20">
        <div className="container-page">
          <div className="reveal mx-auto max-w-3xl text-center">
            <p className="eyebrow mb-5">Instant quote</p>
            <h1 className="text-[2.5rem] leading-[1.1] md:text-[3.5rem]">
              Price your trip in about a minute.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              Tell us where you&rsquo;re going and you&rsquo;ll see the real
              number — every vehicle, gratuity included, before you give up a
              phone number.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container-page">
          <BookingFlow />
        </div>
      </section>

      <section className="border-t border-line bg-ink-2 py-16 md:py-20">
        <div className="container-page">
          <div className="grid gap-10 md:grid-cols-3">
            {assurances.map((item) => (
              <div key={item.title} className="reveal">
                <h2 className="font-display text-xl text-cream">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <div className="reveal mt-14 grid gap-8 border-t border-line pt-10 md:grid-cols-2">
            <div>
              <p className="eyebrow mb-3">Wait time</p>
              <p className="text-sm leading-relaxed text-muted">
                Airport arrivals include{" "}
                {waitTimePolicy.airportDomesticMinutes} minutes of free wait
                time on domestic flights and{" "}
                {waitTimePolicy.airportInternationalMinutes} minutes on
                international, measured from touchdown — not from your scheduled
                time. All other pickups include{" "}
                {waitTimePolicy.standardMinutes} minutes.
              </p>
            </div>
            <div>
              <p className="eyebrow mb-3">Changes & cancellations</p>
              <p className="text-sm leading-relaxed text-muted">
                {cancellationPolicy}
              </p>
            </div>
          </div>

          <div className="reveal mt-12 flex flex-col items-center gap-4 rounded-2xl border border-line bg-ink px-6 py-10 text-center">
            <p className="font-display text-2xl text-cream">
              Traveling in the next few hours?
            </p>
            <p className="max-w-md text-sm leading-relaxed text-muted">
              Skip the form. Call Craig directly and he&rsquo;ll tell you right
              away whether he can cover it.
            </p>
            <a
              href={`tel:${business.phoneHref}`}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-brass px-7 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
            >
              <Phone className="size-4" aria-hidden />
              {business.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
