import { ArrowRight, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { business } from "@/lib/business";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow mb-6">404</p>
      <h1 className="max-w-lg text-[2.25rem] leading-[1.12] md:text-5xl">
        That turn doesn&rsquo;t exist.
      </h1>
      <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
        The page you were looking for isn&rsquo;t here. Let&rsquo;s get you back
        on route.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/">
          Back to home
          <ArrowRight className="size-4" aria-hidden />
        </ButtonLink>
        <ButtonLink href={`tel:${business.phoneHref}`} variant="outline">
          <Phone className="size-4" aria-hidden />
          {business.phone}
        </ButtonLink>
      </div>
    </section>
  );
}
