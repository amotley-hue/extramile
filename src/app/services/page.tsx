import type { Metadata } from "next";
import { ArrowRight, Phone } from "lucide-react";
import { ButtonLink, Section, SectionHeading } from "@/components/ui";
import { airports, business } from "@/lib/business";
import { waitTimePolicy } from "@/lib/rates";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Atlanta airport transfers, corporate transportation, hourly charter, and event travel. Owner-operated chauffeur service covering ATL, PDK, FTY, and RYY.",
  alternates: { canonical: "/services" },
};

const services = [
  {
    id: "airport",
    eyebrow: "Airport",
    title: "Airport transfers",
    lede: "The trip you notice least is the one that went right.",
    body: [
      `We monitor your actual flight, not the time printed on your itinerary. Land early and your car is already there; sit on the tarmac for an hour and the clock doesn't restart, nor does the price move.`,
      `Domestic arrivals include ${waitTimePolicy.airportDomesticMinutes} minutes of free wait time from touchdown, international ${waitTimePolicy.airportInternationalMinutes}. Curbside pickup is standard. If you'd rather be met at baggage claim with a name sign and a hand with the bags, add meet-and-greet when you book.`,
      `For departures, your pickup time is built backward from the checkpoint — factoring the hour, the day, and which side of the terminal your airline actually uses.`,
    ],
    points: [
      "Live flight monitoring and delay adjustment",
      "Curbside or inside meet-and-greet",
      "All ATL concourses, domestic and international",
      "Private aviation at PDK, FTY, and RYY",
    ],
  },
  {
    id: "corporate",
    eyebrow: "Business",
    title: "Corporate travel",
    lede: "For the client you cannot afford to keep waiting.",
    body: [
      `When an executive or a client flies into Atlanta, the ride from the airport is the first impression your company makes. We treat it that way — vehicle detailed, chauffeur in a suit, and a phone number your assistant can actually reach.`,
      `For recurring travel, roadshows, and multi-stop days, you get one chauffeur across the whole itinerary. He learns the preferences — the temperature, the route, the fact that the 3pm always runs long — and stops needing to be told.`,
      `Invoicing is itemized and consistent, so expense reports go through without a conversation.`,
    ],
    points: [
      "Executive and client airport pickups",
      "Multi-stop roadshows and full-day itineraries",
      "Consistent chauffeur across recurring travel",
      "Itemized invoicing for expense reporting",
    ],
  },
  {
    id: "hourly",
    eyebrow: "As directed",
    title: "Hourly charter",
    lede: "Keep the car. Change your mind as often as you like.",
    body: [
      `Some days don't fit into two addresses. Hourly service puts the vehicle and the chauffeur at your disposal for a block of time — the itinerary can change on the fly, and nobody re-quotes you at every stop.`,
      `It's the right call for a night out, a day of showings or site visits, a wedding party that needs shuttling, or anyone who'd rather not hand their keys to a valet three times in one evening.`,
      `Minimums vary by vehicle and are shown before you commit.`,
    ],
    points: [
      "Vehicle and chauffeur reserved for your block",
      "Change the itinerary as the day goes",
      "Ideal for events, showings, and nights out",
      "Minimums shown up front, never discovered later",
    ],
  },
  {
    id: "events",
    eyebrow: "Occasions",
    title: "Events & special occasions",
    lede: "The part of the night nobody should have to organize.",
    body: [
      `Weddings, anniversaries, birthdays, proms, concerts, and the dinner where everyone should be able to have a glass of wine. We coordinate timing with the venue directly, so the car is where it needs to be without anyone in the party checking a watch.`,
      `Tell him the occasion when you book. Small things — where to stage the vehicle for photos, which door to use, keeping the surprise a surprise — are the difference between transportation and an evening that ran itself.`,
    ],
    points: [
      "Timing coordinated directly with your venue",
      "Wedding party and guest shuttling",
      "Discreet staging for photographs",
      "Everyone gets home safely",
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <Section className="!pb-16 !pt-24 md:!pt-32">
        <div className="container-page">
          <div className="reveal max-w-3xl">
            <p className="eyebrow mb-7">Services</p>
            <h1 className="display-xl text-[3rem] md:text-[4.5rem]">
              However you travel,
              <span className="block italic text-brass">
                the same standard.
              </span>
            </h1>
            <p className="mt-10 max-w-xl text-base leading-[1.75] text-muted md:text-lg">
              {business.serviceAreaLabel}, 24 hours a day, by reservation.
            </p>
          </div>
        </div>
      </Section>

      {services.map((service) => (
        <Section key={service.id} id={service.id} className="seam">
          <div className="container-page">
            <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
              <div>
                <SectionHeading
                  eyebrow={service.eyebrow}
                  title={service.title}
                  lede={service.lede}
                />
                <div className="reveal mt-10 space-y-6">
                  {service.body.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 40)}
                      className="text-[15px] leading-[1.8] text-muted"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <div className="reveal lg:pt-24">
                <ul className="divide-y divide-[var(--line)] border-y border-line">
                  {service.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-4 py-5 text-sm text-cream"
                    >
                      <span
                        className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-brass"
                        aria-hidden
                      />
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <ButtonLink href="/book" variant="ghost">
                    Quote this trip
                    <ArrowRight
                      className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden
                    />
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </Section>
      ))}

      <Section className="seam">
        <div className="container-page">
          <SectionHeading
            eyebrow="Coverage"
            title="Where we run."
            lede="Metro Atlanta and North Georgia, plus every airport worth naming."
            align="center"
          />
          <ul className="mx-auto mt-16 max-w-3xl">
            {airports.map((airport) => (
              <li
                key={airport.code}
                className="reveal flex items-baseline gap-8 border-t border-line py-6 last:border-b"
              >
                <span className="font-display text-xl font-light text-brass">
                  {airport.code}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] text-cream">
                    {airport.name}
                  </span>
                  <span className="mt-1 block text-xs text-faint">
                    {airport.note}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div className="reveal mt-16 text-center">
            <p className="text-sm text-muted">
              Going further than that? Long-distance and out-of-state trips are
              quoted case by case.
            </p>
            <a
              href={`tel:${business.phoneHref}`}
              className="mt-8 inline-flex items-center gap-2.5 border-b border-brass/40 pb-1.5 text-sm text-cream transition-colors hover:border-brass hover:text-brass"
            >
              <Phone className="size-4 text-brass" strokeWidth={1.5} aria-hidden />
              Speak with us — {business.phone}
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
