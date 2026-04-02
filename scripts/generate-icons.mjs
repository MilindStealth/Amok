/**
 * generate-icons.mjs
 *
 * Converts the SVG source icon into all the PNG sizes a PWA needs.
 * Run once, or re-run whenever you update icon.svg.
 *
 * Usage:
 *   node scripts/generate-icons.mjs
 *
 * Requires: sharp (installed as devDependency)
 */

import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = join(__dir, "..");
const src   = join(root, "public", "icons", "icon.svg");
const dest  = join(root, "public", "icons");

mkdirSync(dest, { recursive: true });

const svg = readFileSync(src);

// ── Sizes required by PWA spec and major platforms ──────────────
const icons = [
  // Favicons (browser tab)
  { file: "favicon-16.png",   size: 16  },
  { file: "favicon-32.png",   size: 32  },

  // Android home screen (required for install prompt)
  { file: "icon-192.png",     size: 192 },
  { file: "icon-512.png",     size: 512 },

  // Maskable icon (Android adaptive icon — safe zone is center 80%)
  // Same size as standard but labelled separately in manifest
  { file: "icon-maskable-192.png", size: 192 },
  { file: "icon-maskable-512.png", size: 512 },

  // Apple Touch Icon (iOS home screen — no manifest support, meta tag only)
  { file: "apple-touch-icon.png",  size: 180 },
];

console.log("Generating PWA icons from icon.svg...\n");

for (const { file, size } of icons) {
  const outPath = join(dest, file);
  await sharp(svg)
    .resize(size, size)
    .png({ quality: 90 })
    .toFile(outPath);
  console.log(`  ✓  ${file}  (${size}×${size})`);
}

// ── favicon.ico — copy the 32px PNG as .ico for legacy browsers ─
await sharp(svg)
  .resize(32, 32)
  .png()
  .toFile(join(root, "public", "favicon.ico.png"));
// Note: true .ico needs a converter — for now a 32px PNG works in all modern browsers

console.log("\nAll icons generated. Reference them in manifest.json and layout.tsx.");
