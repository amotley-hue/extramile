# Photography

The site is designed to look finished without photographs — the hero and
vehicle panels use layered gradients rather than stock images, because generic
stock photography of a black car reads as cheaper than no photograph at all.

Real photos will still beat it. When Craig has them, here is exactly where they
go.

## What to shoot

| File               | Subject                                        | Aspect | Notes |
| ------------------ | ---------------------------------------------- | ------ | ----- |
| `hero.jpg`         | A vehicle at night, city or airport behind it   | 16:9   | Shot dark. It sits under a near-black overlay. |
| `sedan.jpg`        | The sedan, three-quarter front, clean backdrop  | 4:3    | |
| `suv.jpg`          | The SUV, same angle as the sedan                | 4:3    | Consistency across the three matters more than any single shot. |
| `sprinter.jpg`     | The Sprinter, same angle                        | 4:3    | |
| `craig.jpg`        | Craig, waist-up, beside or in front of a vehicle| 4:5    | Suit, natural light, looking at camera. This is the most valuable photo on the list. |
| `og.jpg`           | Social share card                               | 1200x630 | Vehicle plus the wordmark. |

## How to shoot them

- **Blue hour**, just after sunset. Chrome and paint look expensive; midday sun
  makes a black car look like a rental.
- Wash and detail first. The camera finds every water spot.
- Shoot wider than you think. Cropping in is free; cropping out is not.
- A recent phone is fine. A dirty car in good light beats a clean car in bad
  light, but both is better.

## Wiring them in

1. Drop the file in this folder.
2. Hero: in `src/app/page.tsx`, change `<Backdrop />` to
   `<Backdrop image="/images/hero.jpg" />`.
3. Vehicles: in `src/app/fleet/page.tsx`, replace the placeholder panel with
   `next/image` pointing at `/images/<vehicle.id>.jpg`.
4. Craig: same swap in `src/app/about/page.tsx`.
5. Social card: save as `src/app/opengraph-image.jpg` — Next.js picks it up
   automatically, no code change.

Use `next/image` rather than a bare `<img>`; it handles sizing and lazy loading,
and keeps the page fast on a phone at the airport curb.
