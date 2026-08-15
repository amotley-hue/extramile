"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { business } from "@/lib/business";
import { cn } from "@/components/ui";

const nav = [
  { href: "/services", label: "Services" },
  // "The car", not "Fleet" — Craig runs one vehicle and the nav shouldn't
  // imply otherwise before the visitor even reaches the page.
  { href: "/vehicle", label: "The Car" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  // Close the drawer whenever the route changes. Adjusting state during render
  // is React's documented pattern for this — an effect would paint the new page
  // with the menu still covering it for a frame.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent the page behind the drawer from scrolling.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-300",
        scrolled || open
          ? "border-b border-line bg-ink/92 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="container-page flex h-[76px] items-center justify-between gap-6">
        <Link
          href="/"
          className="group flex flex-col leading-none"
          aria-label={`${business.fullName} — home`}
        >
          <span className="font-display text-[1.35rem] tracking-tight text-cream transition-colors group-hover:text-brass-bright">
            The Extra Mile
          </span>
          <span className="mt-1 text-[0.5625rem] font-semibold uppercase tracking-[0.28em] text-brass">
            Limousine Service
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-sm transition-colors",
                  active ? "text-brass" : "text-muted hover:text-cream",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${business.phoneHref}`}
            className="hidden items-center gap-2 text-sm text-muted transition-colors hover:text-cream md:flex"
          >
            <Phone className="size-4" aria-hidden />
            {business.phone}
          </a>
          <Link
            href="/book"
            className="rounded-full bg-brass px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-brass-bright"
          >
            Get a quote
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="-mr-2 p-2 text-cream lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? (
              <X className="size-6" aria-hidden />
            ) : (
              <Menu className="size-6" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-line bg-ink lg:hidden"
        >
          <div className="container-page flex flex-col py-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-line py-4 text-lg text-cream last:border-b-0"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={`tel:${business.phoneHref}`}
              className="mt-4 mb-2 flex items-center justify-center gap-2 rounded-full border border-line-strong py-3.5 text-base text-cream"
            >
              <Phone className="size-4" aria-hidden />
              {business.phone}
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
