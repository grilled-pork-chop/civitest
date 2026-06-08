/**
 * Design tokens — single source of truth for colors, spacing and type scale.
 * Mirrors the Tailwind/NativeWind theme so values used in inline styles
 * (charts, dynamic topic colors, gradients) stay consistent with classes.
 */

export const colors = {
  republicanBlue: '#002654',
  republicanWhite: '#ffffff',
  republicanRed: '#ce1126',

  background: '#ffffff',
  foreground: '#0f172a',
  card: '#ffffff',
  cardForeground: '#0f172a',
  primary: '#002654',
  primaryForeground: '#f8fafc',
  secondary: '#f1f5f9',
  secondaryForeground: '#1e293b',
  muted: '#f1f5f9',
  mutedForeground: '#64748b',
  border: '#e2e8f0',
  destructive: '#ef4444',
  destructiveForeground: '#f8fafc',
  success: '#16a34a',
  warning: '#f59e0b',

  // Status palette (matches web green/red/yellow usage)
  green50: '#f0fdf4',
  green500: '#22c55e',
  green600: '#16a34a',
  green700: '#15803d',
  green900: '#14532d',
  red50: '#fef2f2',
  red500: '#ef4444',
  red600: '#dc2626',
  red700: '#b91c1c',
  red900: '#7f1d1d',
  yellow50: '#fefce8',
  yellow500: '#eab308',
  yellow600: '#ca8a04',
  yellow700: '#a16207',
  blue50: '#eff6ff',
  blue600: '#2563eb',
  amber50: '#fffbeb',
  amber200: '#fde68a',
  amber500: '#f59e0b',
  amber800: '#92400e',
  amber900: '#78350f',
} as const;

/**
 * Font families (loaded in _layout). Inter is the global body default; the
 * Playfair Display serif is the editorial/republican display face for headings.
 */
export const fonts = {
  display: 'PlayfairDisplay_700Bold',
  displaySemi: 'PlayfairDisplay_600SemiBold',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

/** 4-point spacing scale */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
} as const;

/** Type scale */
export const fontSize = {
  caption: 12,
  body: 14,
  title: 16,
  h2: 20,
  h1: 24,
  display: 32,
} as const;

/** Minimum accessible touch target (points) */
export const HIT_TARGET = 44;

/** French tricolor band, used sparingly for republican accent */
export const TRICOLOR = [
  colors.republicanBlue,
  colors.republicanWhite,
  colors.republicanRed,
] as const;
