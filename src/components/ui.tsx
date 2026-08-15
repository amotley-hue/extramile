import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/*
  Squared, not pill-shaped. A capsule button is the single most recognisable
  tell of a generic template; a sharp edge with wide letter-spacing reads as
  print, which is where this brand lives.
*/
const buttonBase =
  "group inline-flex items-center justify-center gap-2.5 text-[0.8125rem] uppercase tracking-[0.16em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-55";

const buttonVariants = {
  primary:
    "bg-brass text-ink hover:bg-brass-bright px-9 py-4 font-medium",
  outline:
    "border border-line-strong text-cream hover:border-brass hover:text-brass px-9 py-4",
  /* A rule that grows under the label on hover — an underline, not a chip. */
  ghost:
    "border-b border-brass/35 pb-1.5 text-cream hover:border-brass hover:text-brass",
} as const;

type Variant = keyof typeof buttonVariants;

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  const isExternal = /^(?:https?:|tel:|mailto:)/.test(href);
  const classes = cn(buttonBase, buttonVariants[variant], className);

  if (isExternal) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: { variant?: Variant } & ComponentProps<"button">) {
  return (
    <button
      className={cn(buttonBase, buttonVariants[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Section({
  className,
  children,
  ...rest
}: ComponentProps<"section">) {
  // Generous and consistent. The vertical rhythm is what separates sections
  // now that they no longer carry backgrounds or borders.
  return (
    <section className={cn("py-28 md:py-40", className)} {...rest}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "reveal max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? <p className="eyebrow mb-6">{eyebrow}</p> : null}
      <h2 className="display-xl text-[2.4rem] md:text-[3.25rem]">{title}</h2>
      {lede ? (
        <p className="mt-7 text-base leading-[1.75] text-muted md:text-lg">
          {lede}
        </p>
      ) : null}
    </div>
  );
}
