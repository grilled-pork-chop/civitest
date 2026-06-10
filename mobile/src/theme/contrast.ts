/**
 * WCAG contrast helpers.
 *
 * The topic/type colors (amber, purple, red, blue, …) are vibrant but several
 * fail the 4.5:1 contrast ratio under white text. `getBadgeColors` guarantees an
 * AA-compliant pairing for any background by choosing black/white foreground and
 * nudging the background luminance until the ratio clears 4.5:1.
 */

const AA_NORMAL = 4.5;

function clamp(n: number, min = 0, max = 255): number {
  return Math.max(min, Math.min(max, n));
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(h, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => clamp(Math.round(n)).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function channelLuminance(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance (0–1) per WCAG. */
function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

/** Contrast ratio (1–21) between two hex colors. */
function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

function mix(hex: string, target: number, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    r + (target - r) * amount,
    g + (target - g) * amount,
    b + (target - b) * amount
  );
}

const WHITE = '#ffffff';

/**
 * Returns an AA-compliant `{ bg, fg }` pairing for a given background color.
 * Brand badges read best with white text, so we keep the foreground white and
 * darken the background in small steps until the ratio clears 4.5:1 (rather
 * than flipping to black text on mid-tone colors like the green topic).
 */
export function getBadgeColors(bg: string): { bg: string; fg: string } {
  let adjusted = bg;
  for (let i = 0; i < 16 && contrastRatio(adjusted, WHITE) < AA_NORMAL; i++) {
    adjusted = mix(adjusted, 0, 0.08); // darken toward black
  }
  return { bg: adjusted, fg: WHITE };
}
