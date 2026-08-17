# Photography

## The vehicle

The Vehicle page carries a full-bleed 21:9 frame with the model name and
figures beneath it. The home page reuses the same file at 4:3.

### Chosen image

> [Black GMC Yukon 2025, side, white background](https://www.shutterstock.com/image-generated/black-gmc-yukon-2025-side-white-2622502777)
> — Shutterstock `2622502777`
> (near-duplicate: `2749880289`)

Black, side profile, current body shape, and — the part that matters —
**commercially licensed**.

### Why not a real photograph

**Almost every genuine photograph of a badged GMC Yukon is licensed "Editorial
Use Only."** That permits news and commentary and explicitly forbids using the
image to promote a business, which is precisely what this site does. The
restriction exists because those shots contain GMC's trademarks with no property
release, so it is not agency caution you can shop around.

Checked, so nobody has to check again:

| Library | Result |
| --- | --- |
| Unsplash | Every Yukon white or tan. The one black "GMC" is a pickup |
| Pexels | Same — the Charlotte set is all white |
| Shutterstock | ~1,070 Yukon images, essentially all editorial |
| Adobe Stock | 76 results, the same editorial photographs |

On a Shutterstock "isolated white background" search, 14 of 20 results were
commercially licensed — and every one of those 14 was a different subject
entirely (vintage cars, toy planes). The pattern is consistent.

**AI-generated imagery is the exception.** No real vehicle was photographed, so
there is no trademark to release. Shutterstock lists these under
`/image-generated/`, and that is what the chosen image is.

### Preparing the file

1. Buy and download at the **largest size offered**.
2. **Remove the white background** — [remove.bg](https://remove.bg) or
   Photoshop's *Remove Background*.
3. Save as **PNG with transparency**.

The transparency is not optional. `vehiclePhotoMode` is set to `"cutout"`, which
stands the car on the lit brass stage with a contact shadow beneath it rather
than cropping it to fill the frame. A white-background JPEG renders as a white
slab on a near-black page.

### Installing it

```bash
npm run photo -- "C:/Users/you/Downloads/yukon.png"
```

That copies it into place, sets `vehiclePhoto`, and reports anything wrong with
the resolution or aspect ratio. Then `npm run dev` and open `/vehicle`.

By hand, if you prefer: save to `public/images/vehicle.jpg` and set

```ts
export const vehiclePhoto: string | null = "/images/vehicle.jpg";
```

Either way the layout does not move — placeholder, cutout, and photograph all
occupy identical frames.

### If you ever get a real photograph

Set `vehiclePhotoMode` back to `"photo"` and it fills the frame edge to edge
with a darkening pass and a fade into the page ground. Shoot it at **blue
hour**, twenty to forty minutes after sunset — black paint at noon reads as a
rental, the same car at dusk reads as money. Stand well back, shoot level with
the beltline, and frame much wider than you need; cropping in is free.

That would also make the Vehicle page's claim that *the vehicle on this page is
the one that pulls up* literally true, which no stock or generated image can.

---

## Later, if wanted

| File | Subject | Aspect |
| --- | --- | --- |
| `craig.jpg` | Craig, waist-up, beside the vehicle | 4:5 |
| `og.jpg` | Social share card — vehicle plus wordmark | 1200×630 |

The About page has a headshot slot wired the same way. `og.jpg` goes in
`src/app/opengraph-image.jpg` instead, where Next.js picks it up automatically
with no code change.
