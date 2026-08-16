import type { Metadata } from "next";
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { ButtonLink, Section, SectionHeading } from "@/components/ui";
import { business, serviceAreas } from "@/lib/business";

export const metadata: Metadata = {
  title: "Contact",
  description: `Call or text ${business.phone} to reach our reservations line, or request an instant quote online. Serving metro Atlanta 24 hours a day by reservation.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Section className="!pb-16 !pt-24 md:!pt-32">
        <div className="container-page">
          <div className="reveal max-w-3xl">
            <p className="eyebrow mb-7">Contact</p>
            <h1 className="display-xl text-[3rem] md:text-[4.5rem]">
              A direct line,
              <span className="block italic text-brass">not a queue.</span>
            </h1>
            <p className="mt-10 max-w-xl text-base leading-[1.75] text-muted md:text-lg">
              No hold music, no dispatcher, no ticket number.
            </p>
          </div>
        </div>
      </Section>

      <Section className="!pt-8">
        <div className="container-page">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionHeading
                eyebrow="Reach him"
                title="The fastest way is the phone."
                lede="Call or text — either reaches us directly. For anything within the next few hours, always call."
              />

              <div className="reveal mt-12">
                <a
                  href={`tel:${business.phoneHref}`}
                  className="group flex items-center gap-6 border-t border-line py-7 transition-colors last:border-b hover:border-brass/40"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center border border-brass/25">
                    <Phone className="size-5 text-brass" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[0.6875rem] uppercase tracking-[0.2em] text-faint">
                      Call or text
                    </span>
                    <span className="mt-1.5 block font-display text-3xl font-light text-cream transition-colors group-hover:text-brass">
                      {business.phone}
                    </span>
                  </span>
                </a>

                <a
                  href={`mailto:${business.email}`}
                  className="group flex items-center gap-6 border-t border-line py-7 transition-colors last:border-b hover:border-brass/40"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center border border-brass/25">
                    <Mail className="size-5 text-brass" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.6875rem] uppercase tracking-[0.2em] text-faint">
                      Email
                    </span>
                    <span className="mt-1.5 block break-all text-lg text-cream transition-colors group-hover:text-brass">
                      {business.email}
                    </span>
                  </span>
                </a>
              </div>

              <div className="reveal mt-8 space-y-5 border-t border-line pt-8">
                <div className="flex gap-4">
                  <Clock className="mt-0.5 size-4 shrink-0 text-brass" aria-hidden />
                  <div>
                    <p className="text-sm text-cream">Hours</p>
                    <p className="mt-1 text-sm text-muted">{business.hours}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brass" aria-hidden />
                  <div>
                    <p className="text-sm text-cream">Service area</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {business.serviceAreaLabel}. We come to you — there is no
                      office to visit.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal">
              <div className="wash px-8 py-12 md:px-10 md:py-14">
                <p className="eyebrow mb-6">Booking a trip?</p>
                <h2 className="display-xl text-3xl md:text-4xl">
                  Skip the back and forth.
                </h2>
                <p className="mt-7 text-[15px] leading-[1.75] text-muted">
                  The instant quote gives you a real, all-in price in about a
                  minute — before you hand over a phone number, and without
                  creating an account. The request reaches us the moment you
                  send it.
                </p>
                <div className="mt-10">
                  <ButtonLink href="/book" className="w-full">
                    Get an instant quote
                    <ArrowRight
                      className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden
                    />
                  </ButtonLink>
                </div>
                <p className="mt-5 text-center text-xs text-faint">
                  No payment required to request a reservation.
                </p>
              </div>

              <div className="mt-14 border-t border-line pt-10">
                <p className="eyebrow mb-5">Areas served</p>
                <p className="text-sm leading-[1.9] text-muted">
                  {serviceAreas.join(" · ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
