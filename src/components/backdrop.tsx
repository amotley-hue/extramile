/**
 * Layered backdrop for the hero.
 *
 * Built from gradients and SVG rather than a photograph, so the site looks
 * finished before Craig has a photo shoot. To use a real image later, drop it
 * at /public/images/hero.jpg and set `image` — see public/images/README.md.
 */
export function Backdrop({ image }: { image?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {image ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{ backgroundImage: `url(${image})` }}
        />
      ) : null}

      {/* Warm brass glow, low and off-center, like a headlight through fog. */}
      <div
        className="absolute -left-[15%] top-[10%] h-[45rem] w-[45rem] rounded-full opacity-[0.16] blur-[110px]"
        style={{
          background:
            "radial-gradient(circle, var(--brass) 0%, transparent 68%)",
        }}
      />
      <div
        className="absolute -right-[10%] bottom-[-20%] h-[38rem] w-[38rem] rounded-full opacity-[0.10] blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, #4a6fa5 0%, transparent 70%)",
        }}
      />

      {/* Fine grid, fading out toward the bottom. */}
      <div
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            "linear-gradient(var(--cream) 1px, transparent 1px), linear-gradient(90deg, var(--cream) 1px, transparent 1px)",
          backgroundSize: "84px 84px",
          maskImage:
            "radial-gradient(ellipse 90% 65% at 50% 32%, #000 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 65% at 50% 32%, #000 30%, transparent 100%)",
        }}
      />

      {/* Grain, to keep the large flat areas from banding. */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.035] mix-blend-overlay"
        aria-hidden
      >
        <filter id="hero-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-grain)" />
      </svg>

      {/* Settle everything back into the page ground. */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-ink" />
    </div>
  );
}
