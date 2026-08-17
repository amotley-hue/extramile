import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { ButtonLink, Section, SectionHeading } from "@/components/ui";
import { VehiclePhoto } from "@/components/vehicle-photo";
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
              room for {vehicle.luggage} bags. Detailed before every trip and
              stocked before you ask.
            </p>
          </div>
        </div>
      </Section>

      <Section className="!pt-8">
        <div className="container-page">
          {/*
            Full bleed, 21:9. The car is roughly three times as long as it is
            tall, so a wide frame is the one crop that holds it without dead
            space above the roof. Drop the file in and set `vehiclePhoto` —
            see public/images/README.md.
          */}
          <div className="reveal">
            <VehiclePhoto aspect="21 / 9" priority />
          </div>

          {/* Name and figures sit beneath the image, not over it — type on top
              of a photograph you haven't seen yet is a bet you lose. */}
          <div className="reveal mt-10 flex flex-wrap items-end justify-between gap-x-12 gap-y-8 border-b border-line pb-10">
            <h2 className="font-display text-[2.25rem] font-light leading-none md:text-[3rem]">
              {vehicle.model.trim() || vehicle.name}
            </h2>
            <dl className="flex gap-12">
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
            </dl>
          </div>

          <div className="mt-16 grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
            <div className="reveal">
              <p className="eyebrow mb-7">The car</p>
              <p className="text-[15px] leading-[1.8] text-muted">
                Full-size, extended wheelbase. Seven seats with a third row
                adults can genuinely use, luggage space behind it rather than on
                someone&rsquo;s lap, and quiet enough at speed to take a call
                from the back.
              </p>
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
