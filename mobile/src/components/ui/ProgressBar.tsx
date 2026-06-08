import React from 'react';
import { View } from 'react-native';

/**
 * Simple horizontal progress bar. `percentage` is 0–100.
 * `color` overrides the fill (defaults to primary navy).
 */
export function ProgressBar({
  percentage,
  color = '#002654',
  trackClassName,
  height = 8,
}: {
  percentage: number;
  color?: string;
  trackClassName?: string;
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(100, percentage));
  return (
    <View
      className={trackClassName ?? 'bg-secondary rounded-full overflow-hidden'}
      style={{ height }}
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(clamped), min: 0, max: 100 }}
    >
      <View
        style={{ width: `${clamped}%`, backgroundColor: color, height: '100%', borderRadius: 999 }}
      />
    </View>
  );
}
