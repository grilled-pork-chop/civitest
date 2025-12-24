/**
 * Performance trend chart component
 * Displays score progression over recent quizzes
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHART_CONFIG } from '@/constants/app';

/**
 * Props for TrendChart component
 */
interface TrendChartProps {
  /** Array of percentage scores for recent quizzes */
  data: number[];
}

/**
 * Performance trend line chart
 * Shows score evolution across the last 10 quizzes
 * Memoized to prevent unnecessary re-renders when data hasn't changed
 *
 * @param props - Component props
 * @returns Trend chart card
 *
 * @example
 * ```tsx
 * <TrendChart data={[75, 80, 85, 90, 88]} />
 * ```
 */
export const TrendChart = React.memo(function TrendChart({ data }: TrendChartProps) {
  const chartData = data.map((score, index) => ({
    name: `Q${index + 1}`,
    score,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution des performances</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={CHART_CONFIG.DEFAULT_HEIGHT}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Score']}
              labelStyle={{ color: '#000' }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});
