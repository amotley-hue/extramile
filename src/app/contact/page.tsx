import type { Metadata } from "next";
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { ButtonLink, Section, SectionHeading } from "@/components/ui";
import { business, serviceAreas } from "@/lib/business";

export const metadata: Metadata = {
  title: "Contact",
  description: `Call or text ${business.phone} to reach Craig Mason directly, or request an instant quote online. Serving metro Atlanta 24 hours a day by reservation.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Section className="border-b border-line bg-ink-2/40 !py-16 md:!py-24">
        <div className="container-page">
          <div className="reveal max-w-3xl">
            <p className="eyebrow mb-5">Contact</p>
            <h1 className="text-[2.5rem] leading-[1.08] md:text-[3.5rem]">
              You&rsquo;ll be talking to Craig.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              No queue, no dispatcher, no ticket number.
            </p>
          </div>
        </div>
      </Section>

      <Section className="border-t border-line">
        <div className="container-page">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionHeading
                eyebrow="Reach him"
                title="The fastest way is the phone."
                lede="Call or text — either reaches Craig directly. For anything within the next few hours, always call."
              />

              <div className="reveal mt-10 space-y-4">
                <a
                  href={`tel:${business.phoneHref}`}
                  className="flex items-center gap-5 rounded-2xl border border-line bg-ink-2 p-6 transition-colors hover:border-brass"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brass-dim">
                    <Phone className="size-5 text-brass" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-[0.14em] text-faint">
                      Call or text
                    </span>
                    <span className="mt-1 block font-display text-2xl text-cream">
                      {business.phone}
                    </span>
                  </span>
                </a>

                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-5 rounded-2xl border border-line bg-ink-2 p-6 transition-colors hover:border-brass"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brass-dim">
                    <Mail className="size-5 text-brass" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs uppercase tracking-[0.14em] text-faint">
                      Email
                    </span>
                    <span className="mt-1 block break-all text-lg text-cream">
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
                      {business.serviceAreaLabel}. Craig comes to you — there is
                      no office to visit.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal">
              <div className="rounded-2xl border border-line bg-ink-2 p-8 md:p-10">
                <p className="eyebrow mb-5">Booking a trip?</p>
                <h2 className="font-display text-3xl leading-tight text-cream">
                  Skip the back and forth.
                </h2>
                <p className="mt-5 text-[15px] leading-relaxed text-muted">
                  The instant quote gives you a real, all-in price for every
                  vehicle in about a minute — before you hand over a phone
                  number, and without creating an account. Craig gets the
                  request the moment you send it.
                </p>
                <ButtonLink href="/book" className="mt-8 w-full py-4">
                  Get an instant quote
                  <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
                <p className="mt-4 text-center text-xs text-faint">
                  No payment required to request a reservation.
                </p>
              </div>

              <div className="mt-8 rounded-2xl border border-line p-8">
                <p className="eyebrow mb-4">Areas served</p>
                <p className="text-sm leading-relaxed text-muted">
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
