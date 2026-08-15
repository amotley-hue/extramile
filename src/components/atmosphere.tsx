/**
 * The two layers that make the site feel like one continuous surface.
 *
 * `Grain` is fixed to the viewport and sits above everything, including the
 * header — film grain doesn't scroll with the subject. It is what stops the
 * large flat dark areas from reading as flat digital panels.
 *
 * `GlowField` spans the whole document and scrolls with it, placing soft brass
 * and cold-blue pools at intervals down the page. They are deliberately larger
 * than any one section, so light crosses section boundaries instead of stopping
 * at them. That bleed is the whole point — it is what replaces the hard
 * full-width borders the page used to stack.
 */

export function Grain() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-[100] opacity-[0.055] mix-blend-overlay"
        aria-hidden
      >
        <svg className="h-full w-full">
          <filter id="film-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#film-grain)" />
        </svg>
      </div>

      {/* Vignette. Pulls the eye to the centre column and darkens the edges. */}
      <div
        className="pointer-events-none fixed inset-0 z-[99]"
        style={{
          background:
            "radial-gradient(ellipse 100% 75% at 50% 45%, transparent 40%, rgb(3 4 5 / 0.5) 100%)",
        }}
        aria-hidden
      />
    </>
  );
}

/** One pool of ambient light. */
function Pool({
  top,
  side,
  size,
  color,
  opacity,
  slow,
}: {
  top: string;
  side: "left" | "right" | "center";
  size: string;
  color: string;
  opacity: number;
  slow?: boolean;
}) {
  const x =
    side === "left"
      ? { left: "-18%" }
      : side === "right"
        ? { right: "-18%" }
        : { left: "50%", transform: "translateX(-50%)" };

  return (
    <div
      className={`absolute rounded-full blur-[130px] ${slow ? "drift-slow" : "drift"}`}
      style={{
        top,
        width: size,
        height: size,
        opacity,
        background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
        ...x,
      }}
      aria-hidden
    />
  );
}

export function GlowField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Warm at the top — headlight through fog. */}
      <Pool top="-8%" side="left" size="52rem" color="var(--brass)" opacity={0.17} />
      {/* Cold counterpoint, so the page isn't uniformly sepia. */}
      <Pool top="16%" side="right" size="46rem" color="#3d5f8f" opacity={0.1} slow />
      <Pool top="38%" side="left" size="44rem" color="var(--brass)" opacity={0.085} slow />
      <Pool top="58%" side="right" size="50rem" color="var(--brass)" opacity={0.1} />
      <Pool top="78%" side="left" size="42rem" color="#3d5f8f" opacity={0.075} slow />
      <Pool top="93%" side="center" size="56rem" color="var(--brass)" opacity={0.12} />

      {/* Fine grid, dissolving toward the bottom of the page. */}
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(var(--cream) 1px, transparent 1px), linear-gradient(90deg, var(--cream) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          maskImage:
            "linear-gradient(to bottom, #000 0%, transparent 22%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, #000 0%, transparent 22%, transparent 100%)",
        }}
      />
    </div>
  );
}
