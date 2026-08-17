/**
 * Installs the vehicle photograph.
 *
 *   npm run photo -- "C:/Users/you/Downloads/yukon.jpg"
 *
 * Copies the file into public/images/, flips the `vehiclePhoto` constant, and
 * checks the two things that actually go wrong with stock imagery: too little
 * resolution, and an aspect ratio that cannot survive the 21:9 crop the vehicle
 * page uses.
 */

import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEST = resolve(root, "public/images/vehicle.jpg");
const RATES = resolve(root, "src/lib/rates.ts");

/** Target crop on the vehicle page. */
const TARGET_ASPECT = 21 / 9;
const MIN_WIDTH = 2000;
const IDEAL_WIDTH = 2400;

const say = (...a) => console.log(...a);
const fail = (msg) => {
  console.error(`\n  ✗ ${msg}\n`);
  process.exit(1);
};

// ---------------------------------------------------------------- dimensions

function pngSize(buf) {
  if (buf.length < 24) return null;
  if (buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpegSize(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = buf[i + 1];
    // SOF0-SOF15 carry the frame header; C4/C8/CC are tables, not frames.
    const isFrame =
      marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isFrame) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

// ---------------------------------------------------------------------- main

const source = process.argv[2];
if (!source) {
  fail(
    'No file given.\n    Usage: npm run photo -- "C:/path/to/yukon.jpg"',
  );
}

const src = resolve(source.replace(/^["']|["']$/g, ""));
if (!existsSync(src)) fail(`Can't find that file:\n    ${src}`);

const ext = extname(src).toLowerCase();
if (![".jpg", ".jpeg", ".png"].includes(ext)) {
  fail(
    `${ext || "That file"} isn't supported. Save it as .jpg or .png first.\n` +
      "    (WebP and AVIF are fine on the web but this script can't measure them.)",
  );
}

const buf = readFileSync(src);
const size = ext === ".png" ? pngSize(buf) : jpegSize(buf);

say(`\n  Source  ${src}`);
say(`  Size    ${(buf.length / 1024 / 1024).toFixed(2)} MB`);

const warnings = [];

if (!size) {
  warnings.push("Couldn't read the dimensions — check them by eye.");
} else {
  const aspect = size.width / size.height;
  say(`  Pixels  ${size.width} x ${size.height}  (${aspect.toFixed(2)}:1)`);

  if (size.width < MIN_WIDTH) {
    warnings.push(
      `Only ${size.width}px wide. It spans the full page, so under ${MIN_WIDTH}px will look soft on a laptop; ${IDEAL_WIDTH}px+ is better.`,
    );
  } else if (size.width < IDEAL_WIDTH) {
    warnings.push(
      `${size.width}px is usable but not generous — ${IDEAL_WIDTH}px+ holds up better on large screens.`,
    );
  }

  if (aspect < 1.6) {
    const keptShare = ((1 / TARGET_ASPECT) * aspect * 100).toFixed(0);
    warnings.push(
      `At ${aspect.toFixed(2)}:1 this is fairly tall. Cropping to 21:9 keeps about ${keptShare}% of the height — check the roof and wheels survive.`,
    );
  }
}

if (buf.length > 4 * 1024 * 1024) {
  warnings.push(
    `${(buf.length / 1024 / 1024).toFixed(1)} MB is large. Next.js will re-encode it, but consider compressing before committing.`,
  );
}

copyFileSync(src, DEST);
say(`\n  → public/images/vehicle.jpg`);

const rates = readFileSync(RATES, "utf8");
const pattern = /export const vehiclePhoto: string \| null = [^;]+;/;

if (!pattern.test(rates)) {
  fail(
    "Couldn't find the vehiclePhoto line in src/lib/rates.ts — set it by hand:\n" +
      '    export const vehiclePhoto: string | null = "/images/vehicle.jpg";',
  );
}

const updated = rates.replace(
  pattern,
  'export const vehiclePhoto: string | null = "/images/vehicle.jpg";',
);

if (updated !== rates) {
  writeFileSync(RATES, updated);
  say(`  → vehiclePhoto set in src/lib/rates.ts`);
} else {
  say(`  → vehiclePhoto was already set`);
}

if (warnings.length) {
  say("\n  Worth a look:");
  warnings.forEach((w) => say(`    · ${w}`));
}

say("\n  Done. Run `npm run dev` and open /vehicle to check the crop.\n");
