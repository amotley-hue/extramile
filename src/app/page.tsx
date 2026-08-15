import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Clock,
  PartyPopper,
  Phone,
  Plane,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Backdrop } from "@/components/backdrop";
import { ButtonLink, Section, SectionHeading } from "@/components/ui";
import { airports, business } from "@/lib/business";
import { vehicles } from "@/lib/rates";

const services = [
  {
    icon: Plane,
    title: "Airport transfers",
    href: "/services#airport",
    body: "ATL, PDK, and the private FBOs. Craig tracks your flight, adjusts for delays, and is waiting when you land — not circling the cell lot.",
  },
  {
    icon: Briefcase,
    title: "Corporate travel",
    href: "/services#corporate",
    body: "Client pickups, roadshows, and quarterly visits. One chauffeur who learns your preferences and your calendar, with billing you can hand to accounting.",
  },
  {
    icon: Clock,
    title: "Hourly charter",
    href: "/services#hourly",
    body: "Keep the car and the chauffeur for the evening. Show up, run your day, and let someone else deal with the parking deck.",
  },
  {
    icon: PartyPopper,
    title: "Events & occasions",
    href: "/services#events",
    body: "Weddings, anniversaries, birthdays, a night out that shouldn't end with anyone driving. Coordinated to the minute.",
  },
];

const differences = [
  {
    title: "One owner. One standard.",
    body: "Most Atlanta services route you to whichever contractor is closest. Here, the person who answers the phone is the person who confirms your trip and holds the door. Craig Mason owns The Extra Mile and drives it.",
  },
  {
    title: "The price you're quoted is the price you pay.",
    body: "Fare, fees, and gratuity are shown together before you enter a phone number. No surge, no vague 'starting at,' no invoice that grew overnight. Tolls and genuine extras are the only additions, and they're billed at cost.",
  },
  {
    title: "Early is the only version of on time.",
    body: "Craig arrives ahead of schedule, every time. For airport arrivals that means watching the actual flight, not the printed one — and waiting through the delay without restarting the clock.",
  },
];

const steps = [
  {
    number: "01",
    title: "Tell us the trip",
    body: "Two addresses and a time. About a minute.",
  },
  {
    number: "02",
    title: "See every price",
    body: "All three vehicles, all-in, side by side. Choose what fits.",
  },
  {
    number: "03",
    title: "Craig confirms",
    body: "Personally, usually within a couple of hours. Then you're set.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative isolate overflow-hidden">
        <Backdrop />

        <div className="container-page relative flex min-h-[calc(100svh-76px)] flex-col justify-center py-24 md:py-32">
          <div className="max-w-3xl">
            <p className="eyebrow mb-7 flex items-center gap-3">
              <span className="inline-block h-px w-9 bg-brass" aria-hidden />
              Atlanta · Since day one
            </p>

            <h1 className="text-[2.75rem] leading-[1.06] sm:text-6xl lg:text-[4.5rem] lg:leading-[1.03]">
              You booked a chauffeur.
              <br />
              <span className="text-brass">You get the owner.</span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
              The Extra Mile is {business.owner} — airport transfers, corporate
              travel, and hourly charters across metro Atlanta, driven
              personally and priced without surprises.
            </p>

            <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/book" className="px-9 py-4 text-base">
                Get an instant quote
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <ButtonLink
                href={`tel:${business.phoneHref}`}
                variant="outline"
                className="px-9 py-4 text-base"
              >
                <Phone className="size-4" aria-hidden />
                {business.phone}
              </ButtonLink>
            </div>

            <dl className="mt-16 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-8">
              {[
                ["24/7", "By reservation"],
                ["All-in", "Gratuity included"],
                ["ATL", "& every FBO"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-2xl text-cream">{value}</dt>
                  <dd className="mt-1 text-xs leading-relaxed text-faint">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ---------------- Services ---------------- */}
      <Section className="border-t border-line">
        <div className="container-page">
          <SectionHeading
            eyebrow="What we do"
            title="Four ways to ride."
            lede="Every one of them is the same car, the same chauffeur, and the same standard. Only the occasion changes."
          />

          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="reveal group bg-ink p-8 transition-colors hover:bg-ink-2 md:p-10"
              >
                <service.icon
                  className="size-6 text-brass transition-transform duration-300 group-hover:-translate-y-0.5"
                  aria-hidden
                />
                <h3 className="mt-6 font-display text-2xl text-cream">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {service.body}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-brass">
                  Read more
                  <ArrowRight
                    className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      {/* ---------------- The difference ---------------- */}
      <Section className="border-t border-line bg-ink-2">
        <div className="container-page">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <SectionHeading
              eyebrow="The difference"
              title="Why people stop shopping around."
              lede="Atlanta has no shortage of black cars. It has a shortage of knowing who's actually going to show up."
            />

            <div className="space-y-10">
              {differences.map((item, index) => (
                <div key={item.title} className="reveal flex gap-6">
                  <span
                    className="mt-1 font-display text-2xl text-brass/50"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl text-cream">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ---------------- Fleet ---------------- */}
      <Section className="border-t border-line">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="The fleet"
              title="Three vehicles. No wrong answer."
              lede="Late-model, immaculate, and detailed before every trip."
            />
            <Link
              href="/fleet"
              className="reveal inline-flex items-center gap-2 text-sm text-brass transition-colors hover:text-brass-bright"
            >
              See the full fleet
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="reveal flex flex-col rounded-2xl border border-line bg-ink-2 p-8"
              >
                <h3 className="font-display text-2xl text-cream">
                  {vehicle.name}
                </h3>
                <p className="mt-1.5 text-xs text-faint">{vehicle.examples}</p>
                <p className="mt-5 flex-1 text-sm leading-relaxed text-muted">
                  {vehicle.blurb}
                </p>
                <div className="mt-7 flex items-center gap-6 border-t border-line pt-5 text-xs text-muted">
                  <span className="inline-flex items-center gap-2">
                    <Users className="size-3.5 text-brass" aria-hidden />
                    Up to {vehicle.passengers}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="size-3.5 text-brass" aria-hidden />
                    {vehicle.luggage} bags
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ---------------- How it works ---------------- */}
      <Section className="border-t border-line bg-ink-2">
        <div className="container-page">
          <SectionHeading
            eyebrow="How it works"
            title="Booked before your coffee's cold."
            align="center"
          />

          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="reveal text-center">
                <p className="font-display text-5xl text-brass/30">
                  {step.number}
                </p>
                <h3 className="mt-5 font-display text-2xl text-cream">
                  {step.title}
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <ButtonLink href="/book" className="px-9 py-4 text-base">
              Start my quote
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </div>
        </div>
      </Section>

      {/* ---------------- Airports ---------------- */}
      <Section className="border-t border-line">
        <div className="container-page">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            <SectionHeading
              eyebrow="Airports"
              title="Every runway in the metro."
              lede="Commercial or private, Craig knows the terminal, the ramp, and which door actually gets you out fastest."
            />

            <ul className="divide-y divide-[var(--line)] border-y border-line">
              {airports.map((airport) => (
                <li
                  key={airport.code}
                  className="reveal flex items-baseline gap-6 py-5"
                >
                  <span className="font-display text-xl text-brass">
                    {airport.code}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] text-cream">
                      {airport.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-faint">
                      {airport.note}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ---------------- Closing CTA ---------------- */}
      <section className="relative isolate overflow-hidden border-t border-line">
        <Backdrop />
        <div className="container-page relative py-24 text-center md:py-32">
          <h2 className="reveal mx-auto max-w-2xl text-[2.25rem] leading-[1.12] md:text-5xl">
            Tell Craig where you&rsquo;re going.
          </h2>
          <p className="reveal mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted md:text-lg">
            You&rsquo;ll have a real price in about a minute, and a confirmed
            chauffeur the same day.
          </p>
          <div className="reveal mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/book" className="px-9 py-4 text-base">
              Get an instant quote
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
            <ButtonLink
              href={`tel:${business.phoneHref}`}
              variant="outline"
              className="px-9 py-4 text-base"
            >
              <Phone className="size-4" aria-hidden />
              {business.phone}
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
