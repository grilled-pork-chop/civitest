/**
 * Summary statistics cards for the stats screen.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { TrendingUp, Award, Clock, Target } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/tokens';

interface StatsSummaryCardsProps {
  totalQuizzes: number;
  averageScore: number;
  passRate: number;
  averageTimePerQuiz: number;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}min ${secs}s`;
}

export const StatsSummaryCards = React.memo(function StatsSummaryCards({
  totalQuizzes,
  averageScore,
  passRate,
  averageTimePerQuiz,
}: StatsSummaryCardsProps) {
  const stats = [
    { title: 'Examens passés', value: `${totalQuizzes}`, Icon: TrendingUp, description: "Total d'examens" },
    { title: 'Score moyen', value: `${averageScore}%`, Icon: Award, description: 'Performance moyenne' },
    { title: 'Taux de réussite', value: `${passRate}%`, Icon: Target, description: 'Examens réussis' },
    { title: 'Temps moyen', value: formatTime(averageTimePerQuiz), Icon: Clock, description: 'Par examen' },
  ];

  return (
    <View className="flex-row flex-wrap gap-3">
      {stats.map(({ title, value, Icon, description }) => (
        <Card key={title} className="flex-1" style={{ minWidth: '45%' }}>
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-sm font-medium text-muted-foreground">{title}</Text>
            <Icon size={16} color={colors.mutedForeground} />
          </View>
          <Text className="text-2xl font-bold text-foreground">{value}</Text>
          <Text className="text-xs text-muted-foreground">{description}</Text>
        </Card>
      ))}
    </View>
  );
});
