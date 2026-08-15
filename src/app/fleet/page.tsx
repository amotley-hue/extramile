import type { Metadata } from "next";
import { ArrowRight, Luggage, Users } from "lucide-react";
import { ButtonLink, Section, SectionHeading } from "@/components/ui";
import { vehicles } from "@/lib/rates";

export const metadata: Metadata = {
  title: "The fleet",
  description:
    "Luxury sedan, premium SUV, and executive Sprinter. Late-model vehicles detailed before every trip, seating 3 to 12 passengers across metro Atlanta.",
  alternates: { canonical: "/fleet" },
};

const standards = [
  {
    title: "Detailed before every trip",
    body: "Not every morning — every trip. You are never the second person in that back seat today.",
  },
  {
    title: "Late-model, always",
    body: "Vehicles are cycled out well before they start looking their age. Nothing in the fleet feels like a rental.",
  },
  {
    title: "Stocked without being asked",
    body: "Cold water, phone charging for every common cable, climate you control from the back, and a temperature already set to what you asked for last time.",
  },
  {
    title: "Fully licensed and insured",
    body: "Commercially licensed and insured for livery service in Georgia. Paperwork available on request — ask, and you will actually get it.",
  },
];

export default function FleetPage() {
  return (
    <>
      <Section className="border-b border-line bg-ink-2/40 !py-16 md:!py-24">
        <div className="container-page">
          <div className="reveal max-w-3xl">
            <p className="eyebrow mb-5">The fleet</p>
            <h1 className="text-[2.5rem] leading-[1.08] md:text-[3.5rem]">
              Three vehicles, chosen carefully.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              Enough range to cover a solo airport run or a twelve-person
              wedding party, without keeping cars around that nobody asks for.
            </p>
          </div>
        </div>
      </Section>

      {vehicles.map((vehicle, index) => (
        <Section
          key={vehicle.id}
          id={vehicle.id}
          className={
            index % 2 === 1
              ? "border-t border-line bg-ink-2"
              : "border-t border-line"
          }
        >
          <div className="container-page">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
              <div className="reveal">
                {/*
                  Photography slot. Drop a real photo of this vehicle at
                  /public/images/<id>.jpg and swap this block for next/image.
                  See public/images/README.md.
                */}
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-line bg-ink-3">
                  <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                      backgroundImage:
                        "linear-gradient(var(--cream) 1px, transparent 1px), linear-gradient(90deg, var(--cream) 1px, transparent 1px)",
                      backgroundSize: "56px 56px",
                    }}
                    aria-hidden
                  />
                  <div
                    className="absolute inset-0 opacity-[0.14] blur-3xl"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 65%, var(--brass) 0%, transparent 62%)",
                    }}
                    aria-hidden
                  />
                  <p className="relative font-display text-3xl text-cream/25">
                    {vehicle.name}
                  </p>
                </div>
              </div>

              <div>
                <SectionHeading
                  eyebrow={`Seats up to ${vehicle.passengers}`}
                  title={vehicle.name}
                  lede={vehicle.blurb}
                />

                <p className="reveal mt-5 text-sm text-faint">
                  {vehicle.examples}
                </p>

                <div className="reveal mt-8 flex gap-8 border-y border-line py-5">
                  <span className="inline-flex items-center gap-2.5 text-sm text-cream">
                    <Users className="size-4 text-brass" aria-hidden />
                    {vehicle.passengers} passengers
                  </span>
                  <span className="inline-flex items-center gap-2.5 text-sm text-cream">
                    <Luggage className="size-4 text-brass" aria-hidden />
                    {vehicle.luggage} bags
                  </span>
                </div>

                <ul className="reveal mt-7 grid gap-3 sm:grid-cols-2">
                  {vehicle.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-muted"
                    >
                      <span
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brass"
                        aria-hidden
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <ButtonLink href="/book" variant="outline" className="mt-9">
                  Price this vehicle
                  <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
              </div>
            </div>
          </div>
        </Section>
      ))}

      <Section className="border-t border-line bg-ink-2">
        <div className="container-page">
          <SectionHeading
            eyebrow="Standards"
            title="What's true of all of them."
            align="center"
          />
          <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {standards.map((item) => (
              <div key={item.title} className="reveal">
                <div className="rule mb-5" />
                <h3 className="font-display text-xl text-cream">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <div className="reveal mt-16 text-center">
            <ButtonLink href="/book" className="px-9 py-4 text-base">
              Get an instant quote
              <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
