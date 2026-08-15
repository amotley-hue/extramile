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
      `Craig monitors your actual flight, not the time printed on your itinerary. If you land early he's already there; if you sit on the tarmac for an hour, the clock doesn't restart and the price doesn't move.`,
      `Domestic arrivals include ${waitTimePolicy.airportDomesticMinutes} minutes of free wait time from touchdown, international ${waitTimePolicy.airportInternationalMinutes}. Curbside pickup is standard. If you'd rather be met at baggage claim with a name sign and a hand with the bags, add meet-and-greet when you book.`,
      `For departures, Craig builds your pickup time backward from the checkpoint — factoring the hour, the day, and which side of the terminal your airline actually uses.`,
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
      `When an executive or a client flies into Atlanta, the ride from the airport is the first impression your company makes. Craig treats it that way — vehicle detailed, chauffeur in a suit, and a phone number your assistant can actually reach.`,
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
      `Weddings, anniversaries, birthdays, proms, concerts, and the dinner where everyone should be able to have a glass of wine. Craig coordinates timing with the venue directly so the car is where it needs to be without anyone in the party checking a watch.`,
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
      <Section className="border-b border-line bg-ink-2/40 !py-16 md:!py-24">
        <div className="container-page">
          <div className="reveal max-w-3xl">
            <p className="eyebrow mb-5">Services</p>
            <h1 className="text-[2.5rem] leading-[1.08] md:text-[3.5rem]">
              However you travel, it&rsquo;s the same standard.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              {business.serviceAreaLabel}, 24 hours a day, by reservation.
            </p>
          </div>
        </div>
      </Section>

      {services.map((service, index) => (
        <Section
          key={service.id}
          id={service.id}
          className={
            index % 2 === 1 ? "border-t border-line bg-ink-2" : "border-t border-line"
          }
        >
          <div className="container-page">
            <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
              <div>
                <SectionHeading
                  eyebrow={service.eyebrow}
                  title={service.title}
                  lede={service.lede}
                />
                <div className="reveal mt-8 space-y-5">
                  {service.body.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 40)}
                      className="text-[15px] leading-relaxed text-muted"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <div className="reveal lg:pt-20">
                <ul className="divide-y divide-[var(--line)] border-y border-line">
                  {service.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-4 py-4 text-sm text-cream"
                    >
                      <span
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-brass"
                        aria-hidden
                      />
                      {point}
                    </li>
                  ))}
                </ul>
                <ButtonLink
                  href="/book"
                  variant="outline"
                  className="mt-8 w-full"
                >
                  Quote this trip
                  <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
              </div>
            </div>
          </div>
        </Section>
      ))}

      <Section className="border-t border-line">
        <div className="container-page">
          <SectionHeading
            eyebrow="Coverage"
            title="Where Craig runs."
            lede="Metro Atlanta and North Georgia, plus every airport worth naming."
            align="center"
          />
          <ul className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
            {airports.map((airport) => (
              <li
                key={airport.code}
                className="reveal rounded-xl border border-line bg-ink-2 p-6"
              >
                <p className="font-display text-xl text-brass">
                  {airport.code}
                </p>
                <p className="mt-2 text-sm text-cream">{airport.name}</p>
                <p className="mt-1 text-xs text-faint">{airport.note}</p>
              </li>
            ))}
          </ul>

          <div className="reveal mt-14 text-center">
            <p className="text-sm text-muted">
              Going further than that? Long-distance and out-of-state trips are
              quoted case by case.
            </p>
            <ButtonLink
              href={`tel:${business.phoneHref}`}
              variant="outline"
              className="mt-6"
            >
              <Phone className="size-4" aria-hidden />
              Ask Craig — {business.phone}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
