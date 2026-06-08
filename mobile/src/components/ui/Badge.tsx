import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

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
  outline: 'text-foreground',
};

/** Small status pill. Pass `color` for a dynamic background (e.g. topic color). */
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
  return (
    <View
      className={cn('self-start rounded-full px-2.5 py-1', container[variant], className)}
      style={color ? { backgroundColor: color } : undefined}
    >
      <Text
        maxFontSizeMultiplier={1.3}
        className={cn('text-xs font-semibold', color ? 'text-white' : text[variant])}
      >
        {label}
      </Text>
    </View>
  );
}
