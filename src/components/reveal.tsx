"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Fades sections in as they enter the viewport.
 *
 * Marks the document as JS-capable first, so the CSS only hides `.reveal`
 * elements when something exists to un-hide them. Without that, a JS failure
 * would leave the page blank.
 */
export function Reveal() {
  // Re-scan after each client-side navigation; the new page's `.reveal`
  // elements did not exist when the previous effect ran.
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.js = "on";

    const targets = document.querySelectorAll<HTMLElement>(".reveal");

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced || !("IntersectionObserver" in window)) {
      targets.forEach((el) => (el.dataset.shown = "true"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.shown = "true";
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    targets.forEach((el, index) => {
      // Stagger siblings slightly so a row of cards cascades.
      el.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
