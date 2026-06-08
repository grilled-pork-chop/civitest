/**
 * Generates the CiviTest brand assets (Android icon, adaptive layers, splash)
 * from inline SVG. Run once with: node scripts/gen-icon.mjs
 * (sharp is a dev-only, unsaved dependency used solely for rasterization.)
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, '..', 'assets', 'images');

const NAVY = '#002654';
const RED = '#ce1126';

// The mark: a white rounded badge with a navy validation check + a bleu-blanc-rouge dot row.
function badge({ scale = 1 } = {}) {
  const cx = 512;
  // base badge box at scale 1
  const w = 424 * scale;
  const h = 452 * scale;
  const x = cx - w / 2;
  const y = 512 - h / 2;
  const r = 96 * scale;
  const sw = 60 * scale;
  // check points relative to centre
  const p1 = `${cx - 114 * scale},${512 + 6 * scale}`;
  const p2 = `${cx - 36 * scale},${512 + 84 * scale}`;
  const p3 = `${cx + 116 * scale},${512 - 92 * scale}`;
  const dotY = y + h - 64 * scale;
  const dr = 26 * scale;
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#ffffff"/>
    <path d="M ${p1} L ${p2} L ${p3}" fill="none" stroke="${NAVY}" stroke-width="${sw}"
      stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${cx - 70 * scale}" cy="${dotY}" r="${dr}" fill="${NAVY}"/>
    <circle cx="${cx}" cy="${dotY}" r="${dr}" fill="#ffffff" stroke="${NAVY}" stroke-width="${6 * scale}"/>
    <circle cx="${cx + 70 * scale}" cy="${dotY}" r="${dr}" fill="${RED}"/>
  `;
}

const svg = (inner, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${
    bg ? `<rect width="1024" height="1024" fill="${bg}"/>` : ''
  }${inner}</svg>`;

// Monochrome (white silhouette on transparent) for Android themed icons.
function mono() {
  const cx = 512;
  const w = 424;
  const h = 452;
  const x = cx - w / 2;
  const y = 512 - h / 2;
  const sw = 60;
  const p1 = `${cx - 114},${518}`;
  const p2 = `${cx - 36},${596}`;
  const p3 = `${cx + 116},${420}`;
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="96" fill="none" stroke="#ffffff" stroke-width="40"/>
    <path d="M ${p1} L ${p2} L ${p3}" fill="none" stroke="#ffffff" stroke-width="${sw}"
      stroke-linecap="round" stroke-linejoin="round"/>
  `;
}

const png = (svgStr, file) =>
  sharp(Buffer.from(svgStr)).resize(1024, 1024).png().toFile(path.join(out, file));

await Promise.all([
  // Full launcher icon (navy field + mark)
  png(svg(badge({ scale: 1 }), NAVY), 'icon.png'),
  // Adaptive foreground (mark only, slightly larger, transparent)
  png(svg(badge({ scale: 1.18 }), null), 'android-icon-foreground.png'),
  // Adaptive background (solid navy)
  png(svg('', NAVY), 'android-icon-background.png'),
  // Adaptive monochrome (white silhouette)
  png(svg(mono(), null), 'android-icon-monochrome.png'),
  // Splash mark (transparent; shown over the navy splash background)
  png(svg(badge({ scale: 1 }), null), 'splash-icon.png'),
]);

console.log('Brand assets generated in assets/images/');
