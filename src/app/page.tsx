import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { ButtonLink, Section, SectionHeading } from "@/components/ui";
import { airports, business } from "@/lib/business";
import { vehicle, vehicleFullLabel, vehicleLabel } from "@/lib/rates";

const services = [
  {
    title: "Airport transfers",
    href: "/services#airport",
    body: "ATL, PDK, and the private FBOs. Craig tracks your flight, adjusts for delays, and is waiting when you land — not circling the cell lot.",
  },
  {
    title: "Corporate travel",
    href: "/services#corporate",
    body: "Client pickups, roadshows, and quarterly visits. One chauffeur who learns your preferences and your calendar, with billing you can hand to accounting.",
  },
  {
    title: "Hourly charter",
    href: "/services#hourly",
    body: "Keep the car and the chauffeur for the evening. Show up, run your day, and let someone else deal with the parking deck.",
  },
  {
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
    title: "Tell us the trip",
    body: "Two addresses and a time. About a minute.",
  },
  {
    title: "See your price",
    body: "All in, gratuity included, before you give up a phone number.",
  },
  {
    title: "Craig confirms",
    body: "Personally, usually within a couple of hours. Then you're set.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative flex min-h-[calc(100svh-76px)] items-center">
        <div className="container-page py-28 md:py-36">
          <div className="max-w-4xl">
            <p className="eyebrow mb-9 flex items-center gap-4">
              <span className="inline-block h-px w-12 bg-brass" aria-hidden />
              Atlanta
            </p>

            <h1 className="display-xl text-[3rem] sm:text-[4.5rem] lg:text-[6rem]">
              You booked a chauffeur.
              <span className="mt-1 block italic text-brass">
                You get the owner.
              </span>
            </h1>

            <p className="mt-12 max-w-lg text-lg leading-[1.75] text-muted">
              The Extra Mile is {business.owner} — airport transfers, corporate
              travel, and hourly charters across metro Atlanta, driven
              personally and priced without surprises.
            </p>

            <div className="mt-14 flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-10">
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

        {/* Corner detail — quiet proof, not a stat grid. */}
        <div className="absolute bottom-10 right-0 hidden lg:block">
          <div className="container-page">
            <dl className="flex items-baseline gap-12 text-right">
              {[
                ["24/7", "By reservation"],
                ["All in", "Gratuity included"],
                ["ATL", "& every FBO"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-2xl font-light text-cream">
                    {value}
                  </dt>
                  <dd className="mt-1.5 text-[0.6875rem] uppercase tracking-[0.18em] text-faint">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ---------------- Services ---------------- */}
      <Section>
        <div className="container-page">
          <SectionHeading
            eyebrow="What we do"
            title="Four ways to ride."
            lede="Every one of them is the same car, the same chauffeur, and the same standard. Only the occasion changes."
          />

          <div className="mt-20">
            {services.map((service, index) => (
              <Link
                key={service.title}
                href={service.href}
                className="reveal group grid gap-4 border-t border-line py-10 transition-colors last:border-b hover:border-brass/40 md:grid-cols-[5rem_1fr_auto] md:items-baseline md:gap-10"
              >
                <span
                  className="font-display text-xl font-light text-brass/45 transition-colors group-hover:text-brass"
                  aria-hidden
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="md:grid md:grid-cols-[1fr_1.3fr] md:items-baseline md:gap-12">
                  <h3 className="font-display text-[1.75rem] font-light leading-tight text-cream transition-colors group-hover:text-brass-bright md:text-[2rem]">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted md:mt-0">
                    {service.body}
                  </p>
                </div>

                <ArrowRight
                  className="size-4 shrink-0 text-brass opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        </div>
      </Section>

      {/* ---------------- The difference ---------------- */}
      <Section>
        <div className="container-page">
          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <SectionHeading
              eyebrow="The difference"
              title="Why people stop shopping around."
              lede="Atlanta has no shortage of black cars. It has a shortage of knowing who's actually going to show up."
            />

            <div className="space-y-14">
              {differences.map((item) => (
                <div key={item.title} className="reveal">
                  <div className="rule mb-7" />
                  <h3 className="font-display text-[1.75rem] font-light leading-tight text-cream">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-[15px] leading-[1.75] text-muted">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ---------------- The vehicle ---------------- */}
      <Section>
        <div className="container-page">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-24">
            <div className="reveal">
              {/*
                Photography slot — /public/images/vehicle.jpg. Until then this
                is a lit void rather than a grey box with a camera icon in it.
              */}
              <div className="relative aspect-[5/4] overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse 80% 70% at 50% 88%, rgb(194 161 92 / 0.3) 0%, transparent 65%)",
                  }}
                  aria-hidden
                />
                <div
                  className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage:
                      "linear-gradient(var(--cream) 1px, transparent 1px), linear-gradient(90deg, var(--cream) 1px, transparent 1px)",
                    backgroundSize: "64px 64px",
                    maskImage:
                      "radial-gradient(ellipse 70% 70% at 50% 50%, #000, transparent 78%)",
                    WebkitMaskImage:
                      "radial-gradient(ellipse 70% 70% at 50% 50%, #000, transparent 78%)",
                  }}
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-[14%] flex justify-center">
                  <span className="font-display text-[2.5rem] font-light italic text-cream/20">
                    {vehicle.name}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <SectionHeading
                eyebrow="The vehicle"
                title="The car at the curb."
                lede={`A late-model ${vehicleLabel()}, detailed before every trip and stocked before you ask. Leather, rear climate control, charging for whatever you brought, and cold water waiting.`}
              />

              <dl className="reveal mt-12 grid grid-cols-2 gap-x-10 gap-y-8 border-t border-line pt-10">
                <div>
                  <dt className="text-[0.6875rem] uppercase tracking-[0.2em] text-faint">
                    Seats
                  </dt>
                  <dd className="mt-2 font-display text-2xl font-light text-cream">
                    {vehicle.passengers} passengers
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.6875rem] uppercase tracking-[0.2em] text-faint">
                    Luggage
                  </dt>
                  <dd className="mt-2 font-display text-2xl font-light text-cream">
                    {vehicle.luggage} bags
                  </dd>
                </div>
              </dl>

              <ul className="reveal mt-10 grid gap-3.5 sm:grid-cols-2">
                {vehicle.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-muted"
                  >
                    <span
                      className="mt-[0.4rem] size-1 shrink-0 rounded-full bg-brass"
                      aria-hidden
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="reveal mt-12">
                <ButtonLink href="/vehicle" variant="ghost">
                  Vehicle details
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

      {/* ---------------- How it works ---------------- */}
      <Section>
        <div className="container-page">
          <SectionHeading
            eyebrow="How it works"
            title="Booked before your coffee's cold."
            align="center"
          />

          <div className="mt-20 grid gap-14 md:grid-cols-3 md:gap-10">
            {steps.map((step, index) => (
              <div key={step.title} className="reveal text-center">
                <p
                  className="font-display text-sm text-brass"
                  aria-hidden
                >
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div className="mx-auto mt-6 h-px w-12 bg-line-strong" aria-hidden />
                <h3 className="mt-7 font-display text-2xl font-light text-cream">
                  {step.title}
                </h3>
                <p className="mx-auto mt-3.5 max-w-[16rem] text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <ButtonLink href="/book">
              Start my quote
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden
              />
            </ButtonLink>
          </div>
        </div>
      </Section>

      {/* ---------------- Airports ---------------- */}
      <Section>
        <div className="container-page">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <SectionHeading
              eyebrow="Airports"
              title="Every runway in the metro."
              lede="Commercial or private, Craig knows the terminal, the ramp, and which door actually gets you out fastest."
            />

            <ul>
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
          </div>
        </div>
      </Section>

      {/* ---------------- Closing ---------------- */}
      <Section className="!pb-44">
        <div className="container-page text-center">
          <h2 className="reveal display-xl mx-auto max-w-3xl text-[2.75rem] md:text-[4rem]">
            Tell Craig where
            <span className="block italic text-brass">you&rsquo;re going.</span>
          </h2>
          <p className="reveal mx-auto mt-9 max-w-md text-base leading-[1.75] text-muted md:text-lg">
            You&rsquo;ll have a real price in about a minute, and a confirmed
            chauffeur the same day.
          </p>
          <div className="reveal mt-14 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-10">
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
          <p className="reveal mt-16 text-[0.6875rem] uppercase tracking-[0.2em] text-faint">
            {vehicleFullLabel()} · {business.serviceAreaLabel}
          </p>
        </div>
      </Section>
    </>
  );
}
