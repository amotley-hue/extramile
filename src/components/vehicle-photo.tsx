import Image from "next/image";
import { cn } from "@/components/ui";
import {
  vehicle,
  vehicleLabel,
  vehiclePhoto,
  vehiclePhotoMode,
} from "@/lib/rates";

/**
 * The vehicle image, or a lit stage standing in for it.
 *
 * All three states — placeholder, photograph, cutout — occupy an identical
 * frame, so swapping between them cannot shift the layout around them.
 *
 * The brass pool of light is the constant. In the placeholder it is the whole
 * effect; behind a cutout it becomes the stage the car stands on. That is why
 * the unfinished page still looks intentional rather than broken.
 */

/**
 * The lit stage: a low pool of brass with a fading grid over it.
 *
 * The glow is dimmer and wider behind a cutout than it is on its own. At the
 * intensity that works for an empty frame, a car standing on it reads as a grey
 * smudge under the wheels rather than as light — the pool has a visible edge,
 * and the eye reads any defined shape as dirt.
 */
function Stage({ dim = false }: { dim?: boolean }) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background: dim
            ? "radial-gradient(ellipse 85% 70% at 50% 92%, rgb(194 161 92 / 0.16) 0%, transparent 72%)"
            : "radial-gradient(ellipse 60% 55% at 50% 88%, rgb(194 161 92 / 0.30) 0%, transparent 62%)",
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
    </>
  );
}

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
  const alt = `${vehicleLabel()} — the vehicle used for every reservation`;
  const isCutout = vehiclePhotoMode === "cutout";

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      style={{ aspectRatio: aspect }}
    >
      {/* The stage sits behind a cutout, and is the whole effect when there is
          no image at all. A full-bleed photograph covers it. */}
      {(!vehiclePhoto || isCutout) && <Stage dim={Boolean(vehiclePhoto)} />}

      {vehiclePhoto ? (
        isCutout ? (
          <>
            {/* Contact shadow. Without it the car appears to hover, which is
                the tell that gives away a pasted-on cutout. */}
            <div
              className="absolute bottom-[10%] left-1/2 h-[5%] w-[70%] -translate-x-1/2 rounded-[50%] blur-2xl"
              style={{ background: "rgb(0 0 0 / 0.7)" }}
              aria-hidden
            />
            <Image
              src={vehiclePhoto}
              alt={alt}
              fill
              sizes={sizes}
              priority={priority}
              // Contain, never cover — cropping the nose off a cutout defeats
              // the point of buying a side profile.
              className="object-contain p-[4%]"
            />
          </>
        ) : (
          <>
            <Image
              src={vehiclePhoto}
              alt={alt}
              fill
              sizes={sizes}
              priority={priority}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-ink/25" aria-hidden />
            <div
              className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-b from-transparent to-ink"
              aria-hidden
            />
          </>
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-[2rem] font-light italic text-cream/15 md:text-[3.5rem]">
            {vehicle.name}
          </span>
        </div>
      )}
    </div>
  );
}
