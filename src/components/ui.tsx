import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium tracking-wide transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-55";

const buttonVariants = {
  primary:
    "bg-brass text-ink hover:bg-brass-bright px-7 py-3.5 shadow-[0_1px_0_rgb(255_255_255/0.25)_inset]",
  outline:
    "border border-line-strong text-cream hover:border-brass hover:text-brass px-7 py-3.5",
  ghost: "text-cream hover:text-brass px-3 py-2",
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
  return (
    <section className={cn("py-20 md:py-28", className)} {...rest}>
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
      {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
      <h2 className="text-[2.1rem] leading-[1.15] md:text-5xl md:leading-[1.1]">
        {title}
      </h2>
      {lede ? (
        <p className="mt-5 text-base leading-relaxed text-muted md:text-lg">
          {lede}
        </p>
      ) : null}
    </div>
  );
}
