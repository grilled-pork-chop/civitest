import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { cn } from '@/lib/utils';

/**
 * Typography primitives — the single source of truth for text styling.
 *
 * Fonts are applied via explicit `fontFamily` (true weighted Inter/Playfair
 * files) rather than relying on `Text.defaultProps`, which React 19 may ignore
 * and which can't render true weights. `AppText` = Inter body; `Heading` =
 * Playfair Display.
 */

type Weight = 'regular' | 'medium' | 'semibold' | 'bold';
type Color =
  | 'default'
  | 'muted'
  | 'white'
  | 'primary'
  | 'success'
  | 'destructive'
  | 'warning';

const interFamily: Record<Weight, string> = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

const colorClass: Record<Color, string> = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  white: 'text-white',
  primary: 'text-primary',
  success: 'text-green-600',
  destructive: 'text-red-600',
  warning: 'text-yellow-700',
};

type BodySize = 'caption' | 'body' | 'title';
const bodySizeClass: Record<BodySize, string> = {
  caption: 'text-xs',
  body: 'text-sm',
  title: 'text-base',
};

const NAMED_TEXT_COLORS = new Set([
  'white', 'black', 'transparent', 'current', 'foreground', 'background',
  'primary', 'secondary', 'muted', 'accent', 'card', 'border', 'ring', 'input',
  'destructive', 'success', 'warning',
  'primary-foreground', 'secondary-foreground', 'muted-foreground',
  'card-foreground', 'destructive-foreground', 'success-foreground', 'warning-foreground',
]);

/**
 * Does `className` already set a text color? If so, the component's default
 * `colorClass` must NOT be emitted — otherwise the two compete and NativeWind
 * may keep `text-foreground` (which turns near-white in dark mode and becomes
 * unreadable on light-tinted surfaces).
 */
function classNameHasTextColor(className?: string): boolean {
  if (!className) return false;
  return className.split(/\s+/).some((token) => {
    const t = token.replace(/^dark:/, '');
    if (!t.startsWith('text-')) return false;
    const rest = t.slice(5).split('/')[0]; // drop any /opacity
    return NAMED_TEXT_COLORS.has(rest) || /^[a-z]+-\d{2,3}$/.test(rest);
  });
}

export interface AppTextProps extends RNTextProps {
  size?: BodySize;
  weight?: Weight;
  color?: Color;
  className?: string;
}

export function AppText({
  size = 'body',
  weight = 'regular',
  color = 'default',
  className,
  style,
  maxFontSizeMultiplier = 1.6,
  ...rest
}: AppTextProps) {
  // Explicit `color` prop wins; otherwise defer to a color in `className`; else
  // fall back to the theme foreground.
  const colorToken =
    color !== 'default' ? colorClass[color] : classNameHasTextColor(className) ? undefined : colorClass.default;
  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[{ fontFamily: interFamily[weight] }, style]}
      className={cn(bodySizeClass[size], colorToken, className)}
      {...rest}
    />
  );
}

type HeadingSize = 'display' | 'h1' | 'h2' | 'h3';
const headingSizeClass: Record<HeadingSize, string> = {
  display: 'text-4xl',
  h1: 'text-2xl',
  h2: 'text-xl',
  h3: 'text-lg',
};

export interface HeadingProps extends RNTextProps {
  size?: HeadingSize;
  color?: Color;
  className?: string;
}

export function Heading({
  size = 'h2',
  color = 'default',
  className,
  style,
  maxFontSizeMultiplier = 1.4,
  ...rest
}: HeadingProps) {
  const colorToken =
    color !== 'default' ? colorClass[color] : classNameHasTextColor(className) ? undefined : colorClass.default;
  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[{ fontFamily: 'PlayfairDisplay_700Bold' }, style]}
      className={cn(headingSizeClass[size], colorToken, className)}
      {...rest}
    />
  );
}
