import type { Metadata } from "next";
import { ArrowRight, Phone } from "lucide-react";
import { ButtonLink, Section, SectionHeading } from "@/components/ui";
import { business } from "@/lib/business";

export const metadata: Metadata = {
  title: "About Craig Mason",
  description:
    "The Extra Mile Limousine Service is owned and driven by Craig Mason — an Atlanta chauffeur service built on one person being accountable for every trip.",
  alternates: { canonical: "/about" },
};

/*
 * TODO(craig): the two paragraphs marked below are written to be true of the
 * business as described, but they are deliberately non-specific because we
 * don't yet have your details. Send over:
 *   - how long you've been driving professionally, and what you did before
 *   - why you started The Extra Mile
 *   - anything notable: certifications, defensive driving, executive protection
 *   - a headshot for this page (see public/images/README.md)
 * Nothing here claims a credential you haven't given us. Keep it that way.
 */

const principles = [
  {
    title: "Answer the phone.",
    body: "Not a call center, not a form that disappears. When you call The Extra Mile, Craig answers — or calls you back quickly enough that it doesn't matter.",
  },
  {
    title: "Be early.",
    body: "On time is a coin flip. Craig plans the route, checks the traffic, and is in position before he needs to be. You should never be the one waiting.",
  },
  {
    title: "Quote it honestly.",
    body: "The number you're given is the number you pay. If something legitimately changes on the day, you hear about it then — not on the invoice.",
  },
  {
    title: "Keep it to yourself.",
    body: "What's said in the car stays in the car. Executives, public figures, and anyone having a hard day all get the same discretion.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Section className="!pb-16 !pt-24 md:!pt-32">
        <div className="container-page">
          <div className="reveal max-w-3xl">
            <p className="eyebrow mb-7">About</p>
            <h1 className="display-xl text-[3rem] md:text-[4.5rem]">
              One name
              <span className="block italic text-brass">on the door.</span>
            </h1>
          </div>
        </div>
      </Section>

      <Section className="!pt-8">
        <div className="container-page">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="reveal">
              {/* Headshot slot — see public/images/README.md. */}
              <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse 65% 55% at 50% 42%, rgb(194 161 92 / 0.26) 0%, transparent 66%)",
                  }}
                  aria-hidden
                />
                <p className="relative text-center font-display text-2xl font-light italic text-cream/20">
                  {business.owner}
                </p>
              </div>
              <p className="mt-6 text-[0.6875rem] uppercase tracking-[0.2em] text-faint">
                {business.owner} — {business.ownerRole}
              </p>
            </div>

            <div>
              <SectionHeading
                eyebrow="The owner"
                title="Craig Mason drives every trip he books."
              />

              <div className="reveal mt-8 space-y-5 text-[15px] leading-relaxed text-muted">
                {/* TODO(craig): replace with your actual story — see note above. */}
                <p>
                  The Extra Mile is not a fleet with a call center attached. It
                  is one chauffeur, one set of vehicles, and one person whose
                  name is on every reservation. When you book, Craig is the one
                  who confirms it. When you land, Craig is the one at the curb.
                </p>
                <p>
                  That constraint is deliberate. A larger operation can send
                  whoever is nearest and hope it goes well. Craig can&rsquo;t
                  hide behind a dispatcher, so the standard has to hold on every
                  single trip — the car detailed, the route planned, the arrival
                  early. It is a harder way to run a business and a much better
                  way to be a passenger.
                </p>
                <p>
                  Most of his work is regulars: executives who fly the same
                  route every month, families who have stopped calling anyone
                  else for the airport, and the occasional wedding where
                  everything has to run to the minute. They stay because they
                  never have to explain themselves twice.
                </p>
              </div>

              <blockquote className="reveal mt-14 border-l border-brass/40 pl-8">
                <p className="font-display text-[1.75rem] font-light italic leading-snug text-cream">
                  &ldquo;Anybody can get you there. I&rsquo;d rather you never
                  had to think about how.&rdquo;
                </p>
                <footer className="mt-5 text-[0.6875rem] uppercase tracking-[0.2em] text-brass">
                  {business.owner}
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </Section>

      <Section className="seam">
        <div className="container-page">
          <SectionHeading
            eyebrow="How it's run"
            title="Four rules, held to."
            align="center"
          />
          <div className="mt-20 grid gap-x-16 gap-y-14 sm:grid-cols-2">
            {principles.map((principle) => (
              <div key={principle.title} className="reveal">
                <div className="rule mb-7" />
                <h3 className="font-display text-[1.75rem] font-light text-cream">
                  {principle.title}
                </h3>
                <p className="mt-4 text-sm leading-[1.75] text-muted">
                  {principle.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="seam !pb-44">
        <div className="container-page text-center">
          <h2 className="reveal display-xl mx-auto max-w-2xl text-[2.5rem] md:text-[3.5rem]">
            Try it once. You&rsquo;ll
            <span className="block italic text-brass">
              understand the name.
            </span>
          </h2>
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
        </div>
      </Section>
    </>
  );
}
