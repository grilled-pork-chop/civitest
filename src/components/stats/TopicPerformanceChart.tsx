/**
 * Topic performance chart component
 * Displays performance breakdown by topic in a bar chart
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TOPICS } from '@/types';
import type { TopicId } from '@/types';
import { CHART_CONFIG } from '@/constants/app';

/**
 * Topic statistics structure
 */
interface TopicStats {
  correct: number;
  total: number;
  percentage: number;
}

/**
 * Props for TopicPerformanceChart component
 */
interface TopicPerformanceChartProps {
  /** Statistics data grouped by topic */
  topicStats: Record<TopicId, TopicStats>;
}

/**
 * Bar chart showing performance by topic
 * Memoized to prevent unnecessary re-renders
 *
 * @param props - Component props
 * @returns Topic performance chart card
 *
 * @example
 * ```tsx
 * <TopicPerformanceChart topicStats={stats} />
 * ```
 */
export const TopicPerformanceChart = React.memo(function TopicPerformanceChart({
  topicStats,
}: TopicPerformanceChartProps) {
  const chartData = TOPICS.map((topic) => ({
    name: topic.nameShort,
    percentage: topicStats[topic.id]?.percentage || 0,
    color: topic.color,
  })).filter((item) => item.percentage > 0);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance par thème</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={CHART_CONFIG.DEFAULT_HEIGHT}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis domain={[0, 100]} />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Score']}
              labelStyle={{ color: '#000' }}
            />
            <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});
