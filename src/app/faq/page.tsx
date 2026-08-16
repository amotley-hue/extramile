import type { Metadata } from "next";
import { ArrowRight, Phone } from "lucide-react";
import { ButtonLink, Section } from "@/components/ui";
import { business } from "@/lib/business";
import {
  cancellationPolicy,
  vehicle,
  vehicleFullLabel,
  waitTimePolicy,
} from "@/lib/rates";

export const metadata: Metadata = {
  title: "Questions",
  description:
    "How booking, pricing, wait time, cancellations, and airport pickups work with The Extra Mile Limousine Service in Atlanta.",
  alternates: { canonical: "/faq" },
};

const faqs = [
  {
    q: "How do I book?",
    a: `Use the instant quote — two addresses and a time gets you a real price, and you can send the request without entering a card. Or call ${business.phone}. Both reach our reservations line directly.`,
  },
  {
    q: "Is the quote the final price?",
    a: "Yes. The number includes the fare, all standard fees, and gratuity. The only things that can be added are tolls, parking, wait time past the included grace period, and stops you add on the day — all billed at cost, and all things you would have had to pay anyway.",
  },
  {
    q: "What vehicle will I be in?",
    a: `A late-model ${vehicleFullLabel()}, seating up to ${vehicle.passengers} with room for ${vehicle.luggage} bags — leather, rear climate control, charging, and chilled water. It is detailed before every trip, and it is the same vehicle every time you book.`,
  },
  {
    q: "Do I have to pay when I book?",
    a: "No. Nothing is charged when you send a request. The reservation is confirmed first, and payment is settled around the trip itself.",
  },
  {
    q: "How quickly will I hear back?",
    a: "Usually within a couple of hours, and faster during business hours. If you're traveling in the next few hours, call instead and we'll confirm availability immediately.",
  },
  {
    q: "What happens if my flight is delayed?",
    a: `We monitor the actual flight, not your scheduled time. Domestic arrivals include ${waitTimePolicy.airportDomesticMinutes} minutes of free wait time from touchdown, international ${waitTimePolicy.airportInternationalMinutes} minutes. A delay does not change your price.`,
  },
  {
    q: "Where do you meet me at the airport?",
    a: "Curbside at arrivals by default — you'll receive a text with the vehicle and where to walk. If you'd rather be met inside at baggage claim with a name sign and help with the bags, add meet-and-greet when you book.",
  },
  {
    q: "Which airports do you serve?",
    a: "Hartsfield–Jackson (ATL) for commercial flights, plus DeKalb–Peachtree (PDK), Fulton County Executive (FTY), and Cobb County International (RYY) for private aviation and FBO pickups.",
  },
  {
    q: "How many people can you take?",
    a: `Up to ${vehicle.passengers} passengers with ${vehicle.luggage} bags. For a larger group, call ${business.phone} — we'll tell you honestly whether we can cover it, and point you to someone reputable if we can't.`,
  },
  {
    q: "Can I book by the hour instead?",
    a: `Yes. Hourly charter reserves the car and the chauffeur for a block of time and lets you change the itinerary as the day goes. The minimum is ${vehicle.minimumHours} hours, and it's shown before you commit.`,
  },
  {
    q: "What's your cancellation policy?",
    a: cancellationPolicy,
  },
  {
    q: "Do you have child seats?",
    a: "Yes, with notice. Mention the ages in the notes when you book so the right seat is installed before pickup rather than wrestled with at the curb.",
  },
  {
    q: "Are you licensed and insured?",
    a: "Commercially licensed and insured for livery service in Georgia. Certificates are available on request for corporate accounts and venues that require them.",
  },
  {
    q: "Do you handle corporate accounts?",
    a: "Yes. Recurring executive travel, client pickups, and roadshows get the same chauffeur throughout, plus itemized invoicing that clears expense reporting without a follow-up call. Certificates of insurance are available for vendor onboarding.",
  },
  {
    q: "How far will you go?",
    a: "Metro Atlanta and North Georgia are standard. Long-distance and out-of-state trips are quoted case by case — call and ask.",
  },
];

export default function FaqPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <Section className="!pb-16 !pt-24 md:!pt-32">
        <div className="container-page">
          <div className="reveal max-w-3xl">
            <p className="eyebrow mb-7">Questions</p>
            <h1 className="display-xl text-[3rem] md:text-[4.5rem]">
              Answered
              <span className="block italic text-brass">plainly.</span>
            </h1>
            <p className="mt-10 max-w-xl text-base leading-[1.75] text-muted md:text-lg">
              If something isn&rsquo;t here, call {business.phone} and ask.
            </p>
          </div>
        </div>
      </Section>

      <Section className="!pt-8">
        <div className="container-page">
          <div className="mx-auto max-w-3xl divide-y divide-[var(--line)] border-y border-line">
            {faqs.map((faq) => (
              <details key={faq.q} className="group reveal">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-7 text-left [&::-webkit-details-marker]:hidden">
                  <span className="font-display text-xl font-light text-cream transition-colors group-hover:text-brass-bright group-open:text-brass md:text-2xl">
                    {faq.q}
                  </span>
                  <span
                    className="relative mt-2 size-4 shrink-0 text-brass"
                    aria-hidden
                  >
                    <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-current" />
                    <span className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-current transition-transform duration-300 group-open:scale-y-0" />
                  </span>
                </summary>
                <p className="pb-8 pr-10 text-[15px] leading-[1.75] text-muted">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>

          <div className="reveal mx-auto mt-24 max-w-3xl text-center">
            <h2 className="display-xl text-3xl md:text-4xl">Still deciding?</h2>
            <p className="mx-auto mt-6 max-w-md text-sm leading-[1.75] text-muted">
              Run a quote. It takes about a minute, costs nothing, and there is
              no account to create.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-10">
              <ButtonLink href="/book">
                Get an instant quote
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </ButtonLink>
              <a
                href={`tel:${business.phoneHref}`}
                className="inline-flex items-center gap-2.5 text-sm text-muted transition-colors hover:text-cream"
              >
                <Phone className="size-4 text-brass" strokeWidth={1.5} aria-hidden />
                {business.phone}
              </a>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
