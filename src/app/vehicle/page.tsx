import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { ButtonLink, Section, SectionHeading } from "@/components/ui";
import { business } from "@/lib/business";
import { vehicle, vehicleLabel } from "@/lib/rates";

export const metadata: Metadata = {
  title: "Vehicle details",
  description: `A late-model luxury SUV seating ${vehicle.passengers}, detailed before every trip. Private chauffeur service across metro Atlanta.`,
  alternates: { canonical: "/vehicle" },
};

const standards = [
  {
    title: "Detailed before every trip",
    body: "Not every morning — every trip. You are never the second person in that back seat today.",
  },
  {
    title: "The same car, every time",
    body: "You are not assigned whatever happens to be free that morning. The vehicle on this page is the one that pulls up, on every trip you book.",
  },
  {
    title: "Stocked without being asked",
    body: "Cold water, charging for every common cable, climate you control from the back, and a temperature already set to what you asked for last time.",
  },
  {
    title: "Fully licensed and insured",
    body: "Commercially licensed and insured for livery service in Georgia. Certificates available on request — ask, and you will actually get them.",
  },
];

export default function VehiclePage() {
  return (
    <>
      <Section className="!pb-16 !pt-24 md:!pt-32">
        <div className="container-page">
          <div className="reveal max-w-3xl">
            <p className="eyebrow mb-7">Vehicle</p>
            <h1 className="display-xl text-[3rem] md:text-[4.5rem]">
              Every detail,
              <span className="block italic text-brass">already handled.</span>
            </h1>
            <p className="mt-10 max-w-xl text-base leading-[1.75] text-muted md:text-lg">
              A late-model {vehicleLabel()} seating {vehicle.passengers}, with
              room for {vehicle.luggage} bags. Detailed before every trip,
              stocked before you ask, and driven by {business.owner} himself.
            </p>
          </div>
        </div>
      </Section>

      <Section className="!pt-8">
        <div className="container-page">
          {/*
            Photography slot — /public/images/vehicle.jpg, shot at blue hour.
            See public/images/README.md. Until then this reads as a lit stage
            rather than a broken image.
          */}
          <div className="reveal relative aspect-[16/9] w-full overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 60% 55% at 50% 92%, rgb(194 161 92 / 0.34) 0%, transparent 62%)",
              }}
              aria-hidden
            />
            <div
              className="absolute inset-0 opacity-[0.045]"
              style={{
                backgroundImage:
                  "linear-gradient(var(--cream) 1px, transparent 1px), linear-gradient(90deg, var(--cream) 1px, transparent 1px)",
                backgroundSize: "88px 88px",
                maskImage:
                  "radial-gradient(ellipse 65% 70% at 50% 55%, #000, transparent 80%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 65% 70% at 50% 55%, #000, transparent 80%)",
              }}
              aria-hidden
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-[3rem] font-light italic text-cream/15 md:text-[5rem]">
                {vehicle.name}
              </span>
            </div>
          </div>

          <div className="mt-16 grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
            <div>
              <dl className="reveal grid grid-cols-2 gap-x-10 gap-y-9">
                <div>
                  <dt className="text-[0.6875rem] uppercase tracking-[0.2em] text-faint">
                    Seats
                  </dt>
                  <dd className="mt-2.5 font-display text-3xl font-light text-cream">
                    {vehicle.passengers}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.6875rem] uppercase tracking-[0.2em] text-faint">
                    Luggage
                  </dt>
                  <dd className="mt-2.5 font-display text-3xl font-light text-cream">
                    {vehicle.luggage} bags
                  </dd>
                </div>
                {/* Only worth a row once Craig gives us the actual model —
                    otherwise it just repeats the heading above. */}
                {vehicle.model.trim() ? (
                  <div className="col-span-2">
                    <dt className="text-[0.6875rem] uppercase tracking-[0.2em] text-faint">
                      Vehicle
                    </dt>
                    <dd className="mt-2.5 font-display text-2xl font-light text-cream">
                      {vehicle.model}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>

            <div className="reveal">
              <p className="eyebrow mb-7">Inside</p>
              <ul className="grid gap-4 sm:grid-cols-2">
                {vehicle.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-[15px] text-muted"
                  >
                    <span
                      className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-brass"
                      aria-hidden
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <p className="mt-10 text-sm leading-relaxed text-faint">
                Traveling with a larger group? Call {business.phone} and
                we&rsquo;ll tell you honestly whether we can cover it, or point
                you to someone reputable who can.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="container-page">
          <SectionHeading
            eyebrow="Standards"
            title="What's true every trip."
            align="center"
          />
          <div className="mt-20 grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {standards.map((item) => (
              <div key={item.title} className="reveal">
                <div className="rule mb-7" />
                <h3 className="font-display text-xl font-light leading-snug text-cream">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-24 text-center">
            <ButtonLink href="/book">
              Get an instant quote
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden
              />
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
