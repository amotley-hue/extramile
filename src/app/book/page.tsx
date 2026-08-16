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
    title: "Personally confirmed",
    body: "Requests are reviewed individually, not dropped into a dispatch queue. You'll have a confirmation — usually within a couple of hours — from the same people who handle the trip itself.",
  },
  {
    title: "Nothing is charged today",
    body: "Send the request without entering a card. You are booked once the reservation is confirmed.",
  },
];

export default function BookPage() {
  return (
    <>
      <section className="pb-14 pt-24 md:pt-32">
        <div className="container-page">
          <div className="reveal mx-auto max-w-3xl text-center">
            <p className="eyebrow mb-7">Instant quote</p>
            <h1 className="display-xl text-[3rem] md:text-[4rem]">
              Price your trip
              <span className="block italic text-brass">
                in about a minute.
              </span>
            </h1>
            <p className="mx-auto mt-10 max-w-lg text-base leading-[1.75] text-muted md:text-lg">
              Tell us where you&rsquo;re going and you&rsquo;ll see the real
              number — gratuity included, before you give up a phone number.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container-page">
          <BookingFlow />
        </div>
      </section>

      <section className="seam py-24 md:py-32">
        <div className="container-page">
          <div className="grid gap-12 md:grid-cols-3">
            {assurances.map((item) => (
              <div key={item.title} className="reveal">
                <div className="rule mb-6" />
                <h2 className="font-display text-xl font-light text-cream">
                  {item.title}
                </h2>
                <p className="mt-4 text-sm leading-[1.75] text-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <div className="reveal mt-20 grid gap-10 border-t border-line pt-12 md:grid-cols-2">
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

          <div className="reveal mt-20 flex flex-col items-center gap-5 text-center">
            <p className="font-display text-3xl font-light text-cream">
              Traveling in the next few hours?
            </p>
            <p className="max-w-md text-sm leading-[1.75] text-muted">
              Skip the form. Call the reservations line and we&rsquo;ll confirm
              availability right away.
            </p>
            <a
              href={`tel:${business.phoneHref}`}
              className="mt-5 inline-flex items-center gap-2.5 bg-brass px-9 py-4 text-[0.8125rem] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:bg-brass-bright"
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
