/**
 * Performance trend chart — score progression over recent quizzes.
 */

import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useThemeColors } from '@/theme/useTheme';

interface TrendChartProps {
  /** Percentage scores for recent quizzes (oldest → newest). */
  data: number[];
}

export const TrendChart = React.memo(function TrendChart({ data }: TrendChartProps) {
  const { width } = useWindowDimensions();
  const c = useThemeColors();
  // Card sits inside screen padding (16) + card padding (16) on each side.
  const chartWidth = Math.max(220, width - 32 - 32 - 24);

  const chartData = data.map((score, index) => ({
    value: score,
    label: `Q${index + 1}`,
    dataPointText: `${score}`,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution des performances</CardTitle>
      </CardHeader>
      {chartData.length > 0 ? (
        <View className="pt-2">
          <LineChart
            data={chartData}
            width={chartWidth}
            height={200}
            maxValue={100}
            noOfSections={4}
            initialSpacing={12}
            color={c.primary}
            thickness={2}
            dataPointsColor={c.primary}
            startFillColor={c.primary}
            startOpacity={0.15}
            endOpacity={0.0}
            areaChart
            curved
            yAxisTextStyle={{ color: c.mutedForeground, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: c.mutedForeground, fontSize: 10 }}
            rulesColor={c.border}
            yAxisColor={c.border}
            xAxisColor={c.border}
            showReferenceLine1
            referenceLine1Position={80}
            referenceLine1Config={{
              color: 'rgba(22,163,74,0.5)',
              dashWidth: 5,
              dashGap: 4,
              thickness: 1,
              labelText: '80% requis',
              labelTextStyle: { color: c.green600, fontSize: 9 },
            }}
          />
        </View>
      ) : (
        <Text className="text-sm text-muted-foreground py-8 text-center">
          Pas encore assez de données.
        </Text>
      )}
    </Card>
  );
});
