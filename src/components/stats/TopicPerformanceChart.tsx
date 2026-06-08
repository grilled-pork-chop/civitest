/**
 * Topic performance — per-topic success rate as labeled horizontal bars.
 *
 * On a phone this reads far better than a cramped vertical bar chart with
 * rotated labels: each row shows the topic name, the correct/total count, the
 * percentage, and a colored bar. A subtle marker shows the 80% passing line.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TOPICS } from '@/types';
import type { TopicId } from '@/types';
import { useThemeColors } from '@/theme/useTheme';

interface TopicStats {
  correct: number;
  total: number;
  percentage: number;
}

interface TopicPerformanceChartProps {
  topicStats: Record<TopicId, TopicStats>;
}

export const TopicPerformanceChart = React.memo(function TopicPerformanceChart({
  topicStats,
}: TopicPerformanceChartProps) {
  const c = useThemeColors();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance par thème</CardTitle>
      </CardHeader>
      <View className="gap-4">
        {TOPICS.map((topic) => {
          const st = topicStats[topic.id];
          const percentage = st?.percentage ?? 0;
          const total = st?.total ?? 0;
          const correct = st?.correct ?? 0;
          const isPassing = percentage >= 80;

          return (
            <View key={topic.id}>
              <View className="flex-row items-center justify-between mb-1.5">
                <View className="flex-row items-center gap-2 flex-1 pr-2">
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: topic.color }} />
                  <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
                    {topic.nameShort}
                  </Text>
                </View>
                <Text className="text-xs text-muted-foreground mr-2">
                  {total > 0 ? `${correct}/${total}` : '—'}
                </Text>
                <Text
                  className="text-sm font-semibold w-11 text-right"
                  style={{ color: total === 0 ? c.mutedForeground : isPassing ? c.success : c.destructive }}
                >
                  {percentage}%
                </Text>
              </View>
              {/* Bar with an 80% passing marker */}
              <View>
                <ProgressBar percentage={percentage} color={topic.color} height={10} />
                <View
                  pointerEvents="none"
                  style={{ position: 'absolute', left: '80%', top: -2, bottom: -2, width: 2, backgroundColor: c.foreground, opacity: 0.3 }}
                />
              </View>
            </View>
          );
        })}
      </View>
      <Text className="text-[11px] text-muted-foreground mt-4">
        La ligne marque le seuil de réussite (80%).
      </Text>
    </Card>
  );
});
