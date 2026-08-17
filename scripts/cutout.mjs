/**
 * Turns a light-background product shot into a transparent PNG, trimmed to the
 * subject.
 *
 *   node scripts/cutout.mjs <source> [output]
 *
 * The background is removed by flood-filling inward from the border rather than
 * thresholding every light pixel. That distinction matters on this vehicle: the
 * roof rails, window trim and body highlights are near-white, and a global
 * threshold punches holes straight through them. Only light pixels *connected
 * to the edge* are background.
 *
 * The result is then cropped to the subject's bounding box, because the source
 * is a square with the car occupying roughly its middle third — dropped into a
 * 21:9 frame untrimmed, the car would render tiny with vast empty margins.
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

/**
 * Pixels at least this bright are background candidates (0-255).
 *
 * Override with a third argument. 85 is deliberately aggressive, and arrived at
 * by testing rather than reasoning.
 *
 * The instinct is to set this just under the paper white, around 200. That
 * leaves the drop shadow behind: it is a gradient, so the fill eats its bright
 * outer edge, halts as the value falls, and the darker core survives as a grey
 * pool — on a near-black page, the exact tell that gives a cutout away.
 *
 * The fear with going lower is the fill escaping into the bright roof rails and
 * window trim, which touch the background. It does not, because those meet the
 * paper through a darker outline that blocks it at every threshold tested down
 * to 85. Paint sits under 40, so the car itself is never at risk. Below 85 the
 * outline starts to give.
 */
const LIGHT = Number(process.argv[4] ?? 85);
/** Padding kept around the subject, as a share of its size. */
const PAD = 0.02;
/**
 * Cap on output width.
 *
 * The frame never renders wider than the 78rem page container, so 2600px covers
 * a 2x display with room to spare. Shipping the full 4096px source costs
 * megabytes for pixels no screen will ever resolve.
 */
const MAX_WIDTH = 2600;

const say = (...a) => console.log(...a);
const fail = (m) => {
  console.error(`\n  ✗ ${m}\n`);
  process.exit(1);
};

const srcArg = process.argv[2];
const outArg = process.argv[3] ?? "public/images/vehicle.png";
if (!srcArg) fail("Usage: node scripts/cutout.mjs <source> [output]");

const src = resolve(srcArg.replace(/^["']|["']$/g, ""));
const out = resolve(outArg);
if (!existsSync(src)) fail(`No such file:\n    ${src}`);

const image = sharp(src).ensureAlpha();
const { width, height } = await image.metadata();
if (!width || !height) fail("Couldn't read the image dimensions.");

const data = await image.raw().toBuffer(); // RGBA
const px = width * height;
say(`\n  Source  ${src}`);
say(`  Pixels  ${width} x ${height}`);

// ---- flood fill the background inward from every border pixel -------------

const isBackground = new Uint8Array(px);
const queue = new Int32Array(px);
let head = 0;
let tail = 0;

const luminance = (i) => {
  const o = i * 4;
  // Rec. 601 luma — close enough, and cheap.
  return 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
};

const push = (i) => {
  if (isBackground[i]) return;
  if (luminance(i) < LIGHT) return;
  isBackground[i] = 1;
  queue[tail++] = i;
};

for (let x = 0; x < width; x++) {
  push(x);
  push((height - 1) * width + x);
}
for (let y = 0; y < height; y++) {
  push(y * width);
  push(y * width + width - 1);
}

while (head < tail) {
  const i = queue[head++];
  const x = i % width;
  const y = (i / width) | 0;
  if (x > 0) push(i - 1);
  if (x < width - 1) push(i + 1);
  if (y > 0) push(i - width);
  if (y < height - 1) push(i + width);
}

// ---- second pass: enclosed light pockets ----------------------------------
//
// The border fill cannot reach background that the subject encloses — on a
// vehicle that means the ground visible between the wheels, capped by the
// rocker panel. Lowering the threshold to force a way in is not the answer:
// the roof rails and window trim are brighter than the paint and touch the
// background, so a permissive fill eats straight through them.
//
// Instead, sweep what the fill missed for bright connected regions and clear
// the large ones. Chrome detailing is bright but small; a pocket of studio
// floor is bright and large, and the gap between them is wide enough to split
// on area alone.

/** Only pixels this bright are pocket candidates. */
const POCKET_LIGHT = 205;
/** Components larger than this share of the image are floor, not trim. */
const POCKET_MIN_SHARE = 0.004;

const minPocket = Math.round(px * POCKET_MIN_SHARE);
const seen = new Uint8Array(px);
const pockets = [];

for (let start = 0; start < px; start++) {
  if (seen[start] || isBackground[start]) continue;
  if (luminance(start) < POCKET_LIGHT) continue;

  const component = [];
  let h = 0;
  seen[start] = 1;
  component.push(start);

  while (h < component.length) {
    const i = component[h++];
    const x = i % width;
    const y = (i / width) | 0;
    const neighbours = [
      x > 0 ? i - 1 : -1,
      x < width - 1 ? i + 1 : -1,
      y > 0 ? i - width : -1,
      y < height - 1 ? i + width : -1,
    ];
    for (const n of neighbours) {
      if (n < 0 || seen[n] || isBackground[n]) continue;
      if (luminance(n) < POCKET_LIGHT) continue;
      seen[n] = 1;
      component.push(n);
    }
  }

  if (component.length >= minPocket) pockets.push(component);
}

pockets.sort((a, b) => b.length - a.length);
if (pockets.length) {
  say(
    `  Enclosed pockets cleared: ${pockets
      .map((p) => `${((p.length / px) * 100).toFixed(2)}%`)
      .join(", ")}`,
  );
  for (const p of pockets) for (const i of p) isBackground[i] = 1;
} else {
  say("  No enclosed pockets found");
}

// ---- third pass: the ground shadow ----------------------------------------
//
// A product shot's drop shadow is a soft gradient, and a gradient defeats both
// passes above: its outer edge is bright enough for the border fill to eat, but
// the fill halts partway in as the value drops, and the darker core left behind
// is too dim for the pocket sweep to claim. The remnant reads as a grey pool
// under the car on a dark page.
//
// It is separable by position rather than by brightness. The shadow lies on the
// ground; the lowest solid part of the vehicle is the tyres, which are nearly
// black. Find the bottom of the tyres and discard everything beneath.

/** Only this dark counts as vehicle rather than shadow. */
const SOLID = 70;
/** A row needs this many dark pixels to count as vehicle, not stray noise. */
const MIN_RUN = Math.max(8, Math.round(width * 0.002));

let groundY = -1;
for (let y = height - 1; y >= 0 && groundY < 0; y--) {
  let dark = 0;
  for (let x = 0; x < width; x++) {
    const i = y * width + x;
    if (!isBackground[i] && luminance(i) < SOLID) dark++;
  }
  if (dark >= MIN_RUN) groundY = y;
}

if (groundY > 0 && groundY < height - 1) {
  let removed = 0;
  for (let y = groundY + 1; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (!isBackground[i]) {
        isBackground[i] = 1;
        removed++;
      }
    }
  }
  say(
    `  Ground shadow: cleared ${((removed / px) * 100).toFixed(2)}% below the tyre line (row ${groundY})`,
  );
}

// ---- apply alpha, and find what's left ------------------------------------

let minX = width;
let minY = height;
let maxX = -1;
let maxY = -1;
let cleared = 0;

for (let i = 0; i < px; i++) {
  if (isBackground[i]) {
    data[i * 4 + 3] = 0;
    cleared++;
    continue;
  }
  const x = i % width;
  const y = (i / width) | 0;
  if (x < minX) minX = x;
  if (x > maxX) maxX = x;
  if (y < minY) minY = y;
  if (y > maxY) maxY = y;
}

say(`  Removed ${((cleared / px) * 100).toFixed(1)}% of pixels as background`);

if (maxX < 0) fail("Everything was treated as background — lower LIGHT.");

const subjW = maxX - minX + 1;
const subjH = maxY - minY + 1;
const padX = Math.round(subjW * PAD);
const padY = Math.round(subjH * PAD);

const left = Math.max(0, minX - padX);
const top = Math.max(0, minY - padY);
const cropW = Math.min(width - left, subjW + padX * 2);
const cropH = Math.min(height - top, subjH + padY * 2);

say(
  `  Subject ${subjW} x ${subjH}  (${(subjW / subjH).toFixed(2)}:1) — cropping to it`,
);

const pipeline = sharp(data, { raw: { width, height, channels: 4 } }).extract({
  left,
  top,
  width: cropW,
  height: cropH,
});

if (cropW > MAX_WIDTH) {
  pipeline.resize({ width: MAX_WIDTH });
  say(`  Scaling ${cropW} down to ${MAX_WIDTH} for delivery`);
}

await pipeline.png({ compressionLevel: 9, palette: false }).toFile(out);

const after = await sharp(out).metadata();
say(`\n  → ${out}`);
say(`    ${after.width} x ${after.height}, alpha: ${after.hasAlpha}\n`);
