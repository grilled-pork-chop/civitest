/**
 * Quiz results list component
 * Displays all quiz results in a scrollable list
 */

import React from 'react';
import { Eye, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { QuizResult } from '@/types';
import { formatDate, formatTimeVerbose } from '@/utils/questions';
import { cn } from '@/lib/utils';

/**
 * Props for QuizResultsList component
 */
interface QuizResultsListProps {
  /** Array of quiz results to display */
  results: QuizResult[];
  /** Navigation function */
  onNavigate: (path: { to: string; params?: Record<string, string> }) => void;
}

/**
 * Individual result card component
 * Memoized to prevent re-rendering unchanged items
 */
export const ResultCard = React.memo(function ResultCard({
  result,
  onReview,
}: {
  result: QuizResult;
  onReview: () => void;
}) {
  const canReview = result.questions && result.answers;

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-3">
          {/* Top: score + status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'text-4xl font-bold tracking-tight',
                  result.passed ? 'text-green-600' : 'text-red-600'
                )}
              >
                {result.percentage}%
              </span>

              <Badge
                variant={result.passed ? 'default' : 'destructive'}
                className="h-6"
              >
                {result.passed ? 'Réussi' : 'Échoué'}
              </Badge>
            </div>

            {canReview && (
              <Button variant="ghost" size="sm" onClick={onReview}>
                <Eye className="h-4 w-4 mr-1" />
                Revoir
              </Button>
            )}
          </div>

          {/* Middle: details */}
          <div className="text-sm text-muted-foreground">
            {result.score}/{result.totalQuestions} questions
          </div>

          {/* Bottom: meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(result.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeVerbose(result.timeTaken)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});




/**
 * List of quiz results
 * Memoized to prevent unnecessary re-renders of the entire list
 *
 * @param props - Component props
 * @returns Quiz results list card
 *
 * @example
 * ```tsx
 * <QuizResultsList results={results} onNavigate={navigate} />
 * ```
 */
export const QuizResultsList = React.memo(function QuizResultsList({
  results,
  onNavigate,
}: QuizResultsListProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des examens ({results.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
        {results.map((result) => (
          <ResultCard
            key={result.id}
            result={result}
            onReview={() =>
              onNavigate({ to: '/review/$quizId', params: { quizId: result.id } })
            }
          />
        ))}
      </CardContent>
    </Card>
  );
});
