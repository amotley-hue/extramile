import type { Metadata } from "next";
import { ArrowRight, Phone } from "lucide-react";
import { ButtonLink, Section, SectionHeading } from "@/components/ui";
import { business } from "@/lib/business";
import { cancellationPolicy, vehicles, waitTimePolicy } from "@/lib/rates";

export const metadata: Metadata = {
  title: "Questions",
  description:
    "How booking, pricing, wait time, cancellations, and airport pickups work with The Extra Mile Limousine Service in Atlanta.",
  alternates: { canonical: "/faq" },
};

const faqs = [
  {
    q: "How do I book?",
    a: `Use the instant quote — two addresses and a time gets you a real price for every vehicle, and you can send the request without entering a card. Or just call ${business.phone}. Both reach Craig directly.`,
  },
  {
    q: "Is the quote the final price?",
    a: "Yes. The number includes the fare, all standard fees, and gratuity. The only things that can be added are tolls, parking, wait time past the included grace period, and stops you add on the day — all billed at cost, and all things you would have had to pay anyway.",
  },
  {
    q: "Do I have to pay when I book?",
    a: "No. Nothing is charged when you send a request. Craig confirms the reservation first, and payment is settled around the trip itself.",
  },
  {
    q: "How quickly will I hear back?",
    a: "Usually within a couple of hours, and faster during business hours. If you're traveling in the next few hours, call instead — Craig will tell you immediately whether he can cover it.",
  },
  {
    q: "What happens if my flight is delayed?",
    a: `Craig monitors the actual flight, not your scheduled time. Domestic arrivals include ${waitTimePolicy.airportDomesticMinutes} minutes of free wait time from touchdown, international ${waitTimePolicy.airportInternationalMinutes} minutes. A delay does not change your price.`,
  },
  {
    q: "Where do you meet me at the airport?",
    a: "Curbside at arrivals by default — Craig texts you the vehicle and where to walk. If you'd rather be met inside at baggage claim with a name sign and help with the bags, add meet-and-greet when you book.",
  },
  {
    q: "Which airports do you serve?",
    a: "Hartsfield–Jackson (ATL) for commercial flights, plus DeKalb–Peachtree (PDK), Fulton County Executive (FTY), and Cobb County International (RYY) for private aviation and FBO pickups.",
  },
  {
    q: "How many people can you take?",
    a: `Up to ${Math.max(...vehicles.map((v) => v.passengers))} in the executive Sprinter. The sedan seats ${vehicles[0]!.passengers} and the SUV seats ${vehicles[1]!.passengers}. Tell us your headcount and bag count in the quote and the right vehicle is priced for you.`,
  },
  {
    q: "Can I book by the hour instead?",
    a: `Yes. Hourly charter reserves the vehicle and chauffeur for a block of time and lets you change the itinerary as the day goes. Minimums start at ${vehicles[0]!.minimumHours} hours for the sedan and are shown before you commit.`,
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
    a: "Yes. Recurring executive travel, client pickups, and roadshows get the same chauffeur throughout, plus itemized invoicing that clears expense reporting without a follow-up call.",
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

      <Section className="border-b border-line bg-ink-2/40 !py-16 md:!py-24">
        <div className="container-page">
          <div className="reveal max-w-3xl">
            <p className="eyebrow mb-5">Questions</p>
            <h1 className="text-[2.5rem] leading-[1.08] md:text-[3.5rem]">
              Answered plainly.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              If something isn&rsquo;t here, call {business.phone} and ask.
            </p>
          </div>
        </div>
      </Section>

      <Section className="border-t border-line">
        <div className="container-page">
          <div className="mx-auto max-w-3xl divide-y divide-[var(--line)] border-y border-line">
            {faqs.map((faq) => (
              <details key={faq.q} className="group reveal">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden">
                  <span className="font-display text-xl text-cream transition-colors group-open:text-brass md:text-2xl">
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
                <p className="pb-7 pr-10 text-[15px] leading-relaxed text-muted">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>

          <div className="reveal mx-auto mt-16 max-w-3xl text-center">
            <h2 className="font-display text-3xl text-cream">
              Still deciding?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
              Run a quote. It takes about a minute, costs nothing, and there is
              no account to create.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/book">
                Get an instant quote
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href={`tel:${business.phoneHref}`} variant="outline">
                <Phone className="size-4" aria-hidden />
                {business.phone}
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
