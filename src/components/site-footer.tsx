import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { business, serviceAreas } from "@/lib/business";

const columns = [
  {
    heading: "Service",
    links: [
      { href: "/services#airport", label: "Airport transfers" },
      { href: "/services#corporate", label: "Corporate travel" },
      { href: "/services#hourly", label: "Hourly charter" },
      { href: "/services#events", label: "Events & occasions" },
      { href: "/vehicle", label: "Vehicle details" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/faq", label: "Questions" },
      { href: "/contact", label: "Contact" },
      { href: "/book", label: "Get a quote" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="seam relative bg-ink-sink">
      <div className="container-page py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <p className="font-display text-2xl text-cream">The Extra Mile</p>
            <p className="mt-1 text-[0.5625rem] font-semibold uppercase tracking-[0.28em] text-brass">
              Limousine Service
            </p>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted">
              Private chauffeur service for metro Atlanta and North Georgia.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.heading}>
              <p className="eyebrow mb-5">{column.heading}</p>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-cream"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="eyebrow mb-5">Reservations</p>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${business.phoneHref}`}
                  className="flex items-center gap-2.5 text-sm text-cream transition-colors hover:text-brass"
                >
                  <Phone className="size-4 shrink-0 text-brass" aria-hidden />
                  {business.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-2.5 text-sm break-all text-muted transition-colors hover:text-cream"
                >
                  <Mail className="size-4 shrink-0 text-brass" aria-hidden />
                  {business.email}
                </a>
              </li>
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-faint">
              {business.hours}
            </p>
          </div>
        </div>

        <div className="mt-14 border-t border-line pt-8">
          <p className="eyebrow mb-4">Serving</p>
          <p className="max-w-4xl text-sm leading-relaxed text-faint">
            {serviceAreas.join(" · ")} — and everywhere else across metro
            Atlanta and North Georgia.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-8 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {business.legalName}. All rights reserved.
          </p>
          <p>{business.serviceAreaLabel}</p>
        </div>
      </div>
    </footer>
  );
}
