/**
 * Topic performance chart — per-topic success rate as a colored bar chart.
 */

import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { TOPICS } from '@/types';
import type { TopicId } from '@/types';
import { colors } from '@/theme/tokens';

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
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(220, width - 32 - 32 - 24);

  const chartData = TOPICS.map((topic) => ({
    value: topicStats[topic.id]?.percentage || 0,
    label: topic.nameShort,
    frontColor: topic.color,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance par thème</CardTitle>
      </CardHeader>
      <View className="pt-2">
        <BarChart
          data={chartData}
          width={chartWidth}
          height={200}
          maxValue={100}
          noOfSections={4}
          barWidth={22}
          spacing={18}
          initialSpacing={12}
          barBorderRadius={6}
          yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: colors.mutedForeground, fontSize: 9 }}
          rotateLabel
          rulesColor={colors.border}
          yAxisColor={colors.border}
          xAxisColor={colors.border}
        />
      </View>
    </Card>
  );
});
