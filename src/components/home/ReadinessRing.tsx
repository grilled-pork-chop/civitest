/**
 * Readiness ring — circular progress dial for the Home hero. Shows how close
 * the user's average score is to the 80% exam threshold. The centre is left to
 * the caller (`children`) so it can render the Playfair number on-brand.
 */

import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ReadinessRingProps {
  /** Progress value, 0–100. */
  value: number;
  /** Outer diameter in px. */
  size?: number;
  strokeWidth?: number;
  /** Track (unfilled) colour. Defaults to a translucent white for the blue hero. */
  trackColor?: string;
  /** Progress arc colour. */
  progressColor?: string;
  /** Centred content (e.g. the score number). */
  children?: React.ReactNode;
}

export function ReadinessRing({
  value,
  size = 156,
  strokeWidth = 10,
  trackColor = 'rgba(255,255,255,0.18)',
  progressColor = '#ffffff',
  children,
}: ReadinessRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          // Start at 12 o'clock and sweep clockwise.
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View className="absolute inset-0 items-center justify-center">{children}</View>
    </View>
  );
}
