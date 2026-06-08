import { getBadgeColors } from '@/theme/contrast';
import { TOPICS, QUESTION_TYPES } from '@/types';

// Local re-implementation of the WCAG contrast ratio so the test verifies the
// guarantee independently of the module under test.
function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const num = parseInt(h, 16);
  const chan = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = chan((num >> 16) & 255);
  const g = chan((num >> 8) & 255);
  const b = chan(num & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

describe('getBadgeColors', () => {
  const brandColors = [
    ...TOPICS.map((t) => t.color),
    ...QUESTION_TYPES.map((t) => t.color),
  ];

  it('returns an AA-compliant (>= 4.5:1) pairing for every brand color', () => {
    for (const color of brandColors) {
      const { bg, fg } = getBadgeColors(color);
      expect(fg).toBe('#ffffff');
      expect(ratio(bg, fg)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('leaves an already-dark color untouched', () => {
    const dark = '#002654';
    const { bg } = getBadgeColors(dark);
    expect(bg).toBe(dark);
  });

  it('darkens a light color until it clears the threshold', () => {
    const light = '#f59e0b'; // amber, fails 4.5:1 on white as-is
    const { bg } = getBadgeColors(light);
    expect(bg).not.toBe(light);
    expect(ratio(bg, '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });
});
