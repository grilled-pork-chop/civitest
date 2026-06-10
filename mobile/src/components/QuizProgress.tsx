/**
 * Quiz progress tracker component
 * Displays progress bar and a tappable question navigation grid.
 */

import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { QuizAnswer } from '@/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useThemeColors } from '@/theme/useTheme';

interface QuizProgressProps {
  answers: QuizAnswer[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  disabled?: boolean;
  isReviewMode?: boolean;
}

const COLUMNS = 8;
const GAP = 6;

export function QuizProgress({
  answers,
  currentIndex,
  onNavigate,
  disabled = false,
  isReviewMode = false,
}: QuizProgressProps) {
  const [gridWidth, setGridWidth] = useState(0);
  const c = useThemeColors();
  const answeredCount = answers.filter((a) => a.selectedChoiceIndex !== null).length;
  const percentage = answers.length ? (answeredCount / answers.length) * 100 : 0;

  const cellSize =
    gridWidth > 0 ? Math.floor((gridWidth - GAP * (COLUMNS - 1)) / COLUMNS) : 0;

  return (
    <View className="gap-3">
      {/* Summary */}
      <View className="flex-row justify-between items-center">
        <Text className="text-sm text-muted-foreground">
          {answeredCount} / {answers.length} répondue{answeredCount !== 1 ? 's' : ''}
        </Text>
        <Text className="text-sm font-medium text-foreground">
          {Math.round(percentage)}%
        </Text>
      </View>

      {/* Progress bar */}
      <ProgressBar percentage={percentage} height={8} />

      {/* Question grid */}
      <View
        onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}
        className="flex-row flex-wrap"
        style={{ gap: GAP, marginTop: 4 }}
        accessibilityRole="tablist"
        accessibilityLabel="Navigation des questions"
      >
        {cellSize > 0 &&
          answers.map((answer, index) => {
            const isAnswered = answer.selectedChoiceIndex !== null;
            const isCurrent = index === currentIndex;

            let bgColor: string = c.secondary;
            let textColor: string = c.secondaryForeground;
            if (isReviewMode) {
              if (answer.isCorrect) {
                bgColor = c.green500;
                textColor = '#ffffff';
              } else if (isAnswered) {
                bgColor = c.red500;
                textColor = '#ffffff';
              }
            } else if (isAnswered) {
              bgColor = c.primary;
              textColor = c.primaryForeground;
            }

            return (
              <Pressable
                key={index}
                onPress={() => !disabled && onNavigate(index)}
                disabled={disabled}
                accessibilityRole="tab"
                accessibilityState={{ selected: isCurrent }}
                accessibilityLabel={`Question ${index + 1}${isAnswered ? ', répondue' : ''}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: bgColor,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: isCurrent ? 2 : 0,
                  borderColor: c.primary,
                  opacity: disabled ? 0.5 : 1,
                }}
              >
                <Text style={{ color: textColor, fontSize: 12, fontWeight: '600' }}>
                  {index + 1}
                </Text>
              </Pressable>
            );
          })}
      </View>

      {/* Legend */}
      <View className="flex-row flex-wrap justify-center gap-4 mt-1">
        <LegendItem color={c.secondary} label="Non répondue" />
        {isReviewMode ? (
          <>
            <LegendItem color={c.green500} label="Correcte" />
            <LegendItem color={c.red500} label="Incorrecte" />
          </>
        ) : (
          <LegendItem color={c.primary} label="Répondue" />
        )}
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: color }} />
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </View>
  );
}
