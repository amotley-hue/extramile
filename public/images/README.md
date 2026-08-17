# Photography

## The one that matters: the vehicle

The Vehicle page uses a **full-bleed 21:9 side profile** of a GMC Yukon XL, with
the name and specifications set beneath it. The home page reuses the same file
at a 4:3 crop.

### What to buy

| | |
| --- | --- |
| Subject | GMC Yukon XL (extended wheelbase), black |
| Angle | **Full side profile**, or a shallow three-quarter front at most |
| Crop | Must survive a **21:9** crop — the car needs to sit low and wide in frame |
| Resolution | 2400px wide minimum. 3000px+ preferred |
| Background | Dark, neutral, or a night/urban setting. Avoid pure white studio cut-outs |
| Lighting | Low, warm, directional. Blue hour or studio-dark |
| File | Save as `vehicle.jpg`, in this folder |

**The crop is the constraint most stock photos fail.** A Yukon XL is roughly
three times as long as it is tall, which is why 21:9 suits it. A three-quarter
front shot — the most common stock framing — cannot be cropped that wide without
cutting off the nose or slicing the roof. Filter for *side profile* before
anything else.

**Avoid white studio backgrounds.** The site is near-black. A cut-out on white
punches a hole through the page. If the only good image is on white, it needs
masking onto a dark ground first, which is more work than finding a better shot.

### Where to look

Adobe Stock, Getty, and Shutterstock all carry Yukon XL press and studio
imagery. GMC's own media site also publishes press photos — check the licence
terms before using those commercially.

### Wiring it in

1. Save the file as `public/images/vehicle.jpg`.
2. In `src/lib/rates.ts`, change:

   ```ts
   export const vehiclePhoto: string | null = "/images/vehicle.jpg";
   ```

That is the whole change. Both pages switch from the placeholder to the
photograph, the darkening and bottom fade are applied automatically, and the
layout does not move — the placeholder and the image occupy identical frames.

### One honest caveat about stock

The site states that the same vehicle arrives on every reservation, and the
About page builds on that. A stock Yukon will differ from Craig's in colour,
trim, and wheels. Competitors use stock too, so this is a normal trade — but a
single evening photographing the actual car at blue hour would beat any stock
image on this list, cost nothing, and make the claim literally true.

---

## Later, if wanted

| File | Subject | Aspect |
| --- | --- | --- |
| `craig.jpg` | Craig, waist-up, beside the vehicle | 4:5 |
| `og.jpg` | Social share card — vehicle plus wordmark | 1200×630 |

The About page has a headshot slot wired the same way. `og.jpg` goes in
`src/app/opengraph-image.jpg` instead, where Next.js picks it up automatically
with no code change.

## Shooting the real car, if you go that way

- **Blue hour**, twenty to forty minutes after sunset. Black paint at noon reads
  as a rental; the same car at dusk reads as money.
- Wash and detail first — the camera finds every water spot.
- Stand well back and shoot level with the beltline, not down at it.
- **Shoot much wider than you need.** Cropping in is free; cropping out is not.
