import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';
import { getBadgeColors } from '@/theme/contrast';

type BadgeVariant = 'default' | 'destructive' | 'success' | 'outline';

const container: Record<BadgeVariant, string> = {
  default: 'bg-primary',
  success: 'bg-success',
  destructive: 'bg-destructive',
  outline: 'border border-border bg-transparent',
};

const text: Record<BadgeVariant, string> = {
  default: 'text-primary-foreground',
  success: 'text-success-foreground',
  destructive: 'text-destructive-foreground',
  outline: 'text-foreground dark:text-white',
};

/**
 * Small status pill. Pass `color` for a dynamic background (e.g. topic color);
 * the foreground/background are adjusted to guarantee WCAG AA contrast.
 */
export function Badge({
  label,
  variant = 'default',
  color,
  className,
}: {
  label: string;
  variant?: BadgeVariant;
  color?: string;
  className?: string;
}) {
  const safe = color ? getBadgeColors(color) : null;
  return (
    <View
      accessible
      accessibilityLabel={label}
      className={cn('self-start rounded-full px-2.5 py-1', container[variant], className)}
      style={safe ? { backgroundColor: safe.bg } : undefined}
    >
      <Text
        maxFontSizeMultiplier={1.3}
        style={safe ? { color: safe.fg, fontFamily: 'Inter_600SemiBold' } : undefined}
        className={cn('text-xs font-semibold', safe ? undefined : text[variant])}
      >
        {label}
      </Text>
    </View>
  );
}
