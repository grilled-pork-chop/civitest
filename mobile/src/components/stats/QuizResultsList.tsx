/**
 * Quiz results list + individual result card.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Eye, Calendar, Clock } from 'lucide-react-native';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { QuizResult } from '@/types';
import { formatDate, formatTimeVerbose } from '@/utils/questions';
import { hasReviewData } from '@/utils/typeGuards';
import { useThemeColors } from '@/theme/useTheme';
import { cn } from '@/lib/utils';

/**
 * Individual result card.
 */
export const ResultCard = React.memo(function ResultCard({
  result,
  onReview,
}: {
  result: QuizResult;
  onReview: () => void;
}) {
  const canReview = hasReviewData(result);
  const c = useThemeColors();

  return (
    <Card>
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Text
              className={cn(
                'text-4xl font-bold',
                result.passed ? 'text-green-600' : 'text-red-600'
              )}
            >
              {result.percentage}%
            </Text>
            <Badge
              label={result.passed ? 'Réussi' : 'Échoué'}
              variant={result.passed ? 'success' : 'destructive'}
            />
          </View>

          {canReview ? (
            <Button
              title="Revoir"
              variant="ghost"
              size="sm"
              onPress={onReview}
              icon={<Eye size={16} color={c.foreground} />}
            />
          ) : null}
        </View>

        <Text className="text-sm text-muted-foreground">
          {result.score}/{result.totalQuestions} questions
        </Text>

        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <Calendar size={12} color={c.mutedForeground} />
            <Text className="text-xs text-muted-foreground">{formatDate(result.date)}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Clock size={12} color={c.mutedForeground} />
            <Text className="text-xs text-muted-foreground">
              {formatTimeVerbose(result.timeTaken)}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
});

/**
 * List of quiz results. Rendered inside a parent ScrollView, so it maps rather
 * than nesting a virtualized list.
 */
export const QuizResultsList = React.memo(function QuizResultsList({
  results,
  totalCount,
  onReview,
}: {
  results: QuizResult[];
  totalCount: number;
  onReview: (quizId: string) => void;
}) {
  if (results.length === 0) return null;

  const truncated = totalCount > results.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des examens ({totalCount})</CardTitle>
      </CardHeader>
      <View className="gap-3">
        {results.map((result) => (
          <ResultCard key={result.id} result={result} onReview={() => onReview(result.id)} />
        ))}
      </View>
      {truncated ? (
        <Text className="text-xs text-muted-foreground text-center mt-2">
          Les {results.length} examens les plus récents sont affichés.
        </Text>
      ) : null}
    </Card>
  );
});
