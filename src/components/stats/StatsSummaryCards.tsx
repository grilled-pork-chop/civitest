/**
 * Summary statistics cards for the stats page
 * Displays key metrics in a grid layout
 */

import React from 'react';
import { TrendingUp, Award, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Props for StatsSummaryCards component
 */
interface StatsSummaryCardsProps {
  /** Total number of quizzes taken */
  totalQuizzes: number;
  /** Average score percentage */
  averageScore: number;
  /** Pass rate percentage */
  passRate: number;
  /** Average time per quiz in seconds */
  averageTimePerQuiz: number;
}

/**
 * Format seconds into a readable time string
 *
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}min ${secs}s`;
}

/**
 * Summary cards component displaying key quiz statistics
 * Memoized to prevent unnecessary re-renders
 *
 * @param props - Component props
 * @returns Grid of statistics cards
 *
 * @example
 * ```tsx
 * <StatsSummaryCards
 *   totalQuizzes={10}
 *   averageScore={85}
 *   passRate={90}
 *   averageTimePerQuiz={1800}
 * />
 * ```
 */
export const StatsSummaryCards = React.memo(function StatsSummaryCards({
  totalQuizzes,
  averageScore,
  passRate,
  averageTimePerQuiz,
}: StatsSummaryCardsProps) {
  const stats = [
    {
      title: 'Examens passés',
      value: totalQuizzes,
      icon: TrendingUp,
      description: 'Total d\'examens',
    },
    {
      title: 'Score moyen',
      value: `${averageScore}%`,
      icon: Award,
      description: 'Performance moyenne',
    },
    {
      title: 'Taux de réussite',
      value: `${passRate}%`,
      icon: Target,
      description: 'Examens réussis',
    },
    {
      title: 'Temps moyen',
      value: formatTime(averageTimePerQuiz),
      icon: Clock,
      description: 'Par examen',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
