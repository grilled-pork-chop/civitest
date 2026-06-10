/**
 * Quiz timer component
 * Displays remaining time with visual warnings as time runs low.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { useReducedMotion } from 'react-native-reanimated';
import { Clock, AlertTriangle } from 'lucide-react-native';
import { formatTime } from '@/utils/questions';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useThemeColors } from '@/theme/useTheme';
import { cn } from '@/lib/utils';

interface TimerProps {
  timeRemaining: number;
  totalTime: number;
}

/**
 * Countdown timer with warning states.
 * - Normal: navy clock icon
 * - Warning (≤5min): amber styling
 * - Critical (≤1min): red styling with pulsing border
 */
export function Timer({ timeRemaining, totalTime }: TimerProps) {
  const reduceMotion = useReducedMotion();
  const c = useThemeColors();
  const percentage = (timeRemaining / totalTime) * 100;
  const isWarning = timeRemaining <= 300;
  const isCritical = timeRemaining <= 60;
  const pulse = isCritical && !reduceMotion;

  const barColor = isCritical
    ? c.red500
    : isWarning
      ? c.amber500
      : c.primary;

  return (
    <MotiView
      from={{ opacity: 1 }}
      animate={{ opacity: pulse ? 0.6 : 1 }}
      transition={
        pulse
          ? { type: 'timing', duration: 700, loop: true, repeatReverse: true }
          : { type: 'timing', duration: 200 }
      }
      accessibilityRole="timer"
      accessibilityLabel={`Temps restant: ${formatTime(timeRemaining)}`}
      className={cn(
        'flex-row items-center gap-3 px-3 py-2 rounded-xl border',
        !isWarning && 'bg-card border-border',
        isWarning && !isCritical && 'bg-yellow-50 border-yellow-200',
        isCritical && 'bg-red-50 border-red-200'
      )}
    >
      {isCritical ? (
        <AlertTriangle size={20} color={c.red600} />
      ) : (
        <Clock size={20} color={isWarning ? c.yellow600 : c.mutedForeground} />
      )}

      <View>
        <Text
          maxFontSizeMultiplier={1.3}
          className={cn(
            'text-lg font-bold',
            !isWarning && 'text-foreground',
            isWarning && !isCritical && 'text-yellow-700',
            isCritical && 'text-red-700'
          )}
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {formatTime(timeRemaining)}
        </Text>
      </View>

      <View className="w-16">
        <ProgressBar percentage={percentage} color={barColor} height={6} />
      </View>
    </MotiView>
  );
}
