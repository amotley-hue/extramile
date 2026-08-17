import Image from "next/image";
import { cn } from "@/components/ui";
import { vehicle, vehicleLabel, vehiclePhoto } from "@/lib/rates";

/**
 * The vehicle image, or a lit stage standing in for it.
 *
 * Both states are deliberately the same shape, so swapping a real photograph in
 * cannot shift the layout around it. The placeholder is a pool of brass light
 * rather than a grey box with a camera icon — an unfinished page should still
 * look intentional.
 *
 * The photograph gets two treatments on top: a slight darkening, so bright
 * stock imagery doesn't punch a hole in a near-black page, and a gradient along
 * the bottom edge that dissolves it into the page ground instead of ending on a
 * hard line.
 */
export function VehiclePhoto({
  aspect = "21 / 9",
  priority = false,
  sizes = "(min-width: 78rem) 72rem, 100vw",
  className,
}: {
  /** CSS aspect-ratio for the frame. */
  aspect?: string;
  /** Set on the first image in the viewport so it isn't lazy-loaded. */
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      style={{ aspectRatio: aspect }}
    >
      {vehiclePhoto ? (
        <>
          <Image
            src={vehiclePhoto}
            alt={`${vehicleLabel()} — the vehicle used for every reservation`}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-ink/25"
            aria-hidden
          />
          <div
            className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-b from-transparent to-ink"
            aria-hidden
          />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 55% at 50% 92%, rgb(194 161 92 / 0.32) 0%, transparent 62%)",
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0 opacity-[0.045]"
            style={{
              backgroundImage:
                "linear-gradient(var(--cream) 1px, transparent 1px), linear-gradient(90deg, var(--cream) 1px, transparent 1px)",
              backgroundSize: "88px 88px",
              maskImage:
                "radial-gradient(ellipse 65% 70% at 50% 55%, #000, transparent 80%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 65% 70% at 50% 55%, #000, transparent 80%)",
            }}
            aria-hidden
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-[2rem] font-light italic text-cream/15 md:text-[3.5rem]">
              {vehicle.name}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
