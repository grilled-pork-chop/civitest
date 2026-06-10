import React from 'react';
import type { ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { useReducedMotion } from 'react-native-reanimated';

/**
 * Fade + slide-up entrance. Use small staggered `delay`s to orchestrate a page
 * load. Respects the OS reduce-motion setting (renders instantly).
 */
export function Reveal({
  delay = 0,
  className,
  style,
  children,
}: {
  delay?: number;
  className?: string;
  style?: ViewStyle;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <MotiView
      from={{ opacity: reduce ? 1 : 0, translateY: reduce ? 0 : 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: reduce ? 0 : 350, delay: reduce ? 0 : delay }}
      className={className}
      style={style}
    >
      {children}
    </MotiView>
  );
}
