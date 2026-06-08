/**
 * Performance trend chart — score progression over recent quizzes.
 */

import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useThemeColors } from '@/theme/useTheme';
import { PASS_PERCENTAGE } from '@/types';

interface TrendChartProps {
  /** Percentage scores for recent quizzes (oldest → newest). */
  data: number[];
}

export const TrendChart = React.memo(function TrendChart({ data }: TrendChartProps) {
  const { width } = useWindowDimensions();
  const c = useThemeColors();
  // gifted-charts renders the y-axis labels *outside* the `width` prop, so the
  // total footprint is `yAxisLabelWidth + width`. Budget the axis explicitly and
  // subtract it from the card's inner width (screen padding 16 + card padding 16
  // per side) so axis + plot area never exceed the card.
  const yAxisLabelWidth = 32;
  const chartWidth = Math.max(180, width - 32 - 32 - yAxisLabelWidth);

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
        <View className="pt-2 overflow-hidden">
          <LineChart
            data={chartData}
            width={chartWidth}
            height={200}
            maxValue={100}
            noOfSections={4}
            yAxisLabelWidth={yAxisLabelWidth}
            initialSpacing={12}
            endSpacing={16}
            scrollToEnd
            scrollAnimation={false}
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
            referenceLine1Position={PASS_PERCENTAGE}
            referenceLine1Config={{
              color: 'rgba(22,163,74,0.5)',
              dashWidth: 5,
              dashGap: 4,
              thickness: 1,
              labelText: `${PASS_PERCENTAGE}% requis`,
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
