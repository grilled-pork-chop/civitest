/**
 * Custom hook for quiz statistics
 * Centralizes all statistics calculations and data transformations
 */

import { useMemo } from 'react';
import { getQuizStatistics, getQuizResults } from '@/utils/localStorage';
import type { QuizResult, TopicId, QuestionType } from '@/types';
import { TOPICS } from '@/types';
import { DISPLAY_LIMITS } from '@/constants/app';
import { useQuery } from '@tanstack/react-query';

/**
 * Topic statistics aggregation
 */
interface TopicStats {
  correct: number;
  total: number;
  percentage: number;
}

/**
 * Question type statistics
 */
interface TypeStats {
  correct: number;
  total: number;
  percentage: number;
}

/**
 * Return type for useQuizStats hook
 */
interface QuizStats {
  /** Overall statistics summary */
  summary: ReturnType<typeof getQuizStatistics>;
  /** Recent quiz results */
  recentResults: QuizResult[];
  /** All quiz results sorted by date */
  allResults: QuizResult[];
  /** Statistics grouped by topic */
  topicStats: Record<TopicId, TopicStats>;
  /** Statistics grouped by question type */
  typeStats: Record<QuestionType, TypeStats>;
  /** Has any quiz results */
  hasResults: boolean;
}

/**
 * Custom hook to get and compute quiz statistics
 * Memoizes expensive calculations to prevent unnecessary recomputation
 *
 * @returns Computed quiz statistics
 *
 * @example
 * ```typescript
 * const { summary, recentResults, topicStats } = useQuizStats();
 * ```
 */
export function useQuizStats(): QuizStats {
  const { data: allResults = [] } = useQuery({
    queryKey: ['quizHistory'],
    queryFn: getQuizResults,
  });

  const summary = getQuizStatistics();

  const recentResults = useMemo(
    () => allResults.slice(0, DISPLAY_LIMITS.RECENT_QUIZZES_COUNT),
    [allResults]
  );

  const hasResults = allResults.length > 0;

  const topicStats = useMemo(() => {
    const stats: Record<TopicId, TopicStats> = {} as Record<TopicId, TopicStats>;

    TOPICS.forEach((topic) => {
      stats[topic.id] = { correct: 0, total: 0, percentage: 0 };
    });

    allResults.forEach((result) => {
      result.topicPerformance?.forEach((perf) => {
        if (stats[perf.topicId]) {
          stats[perf.topicId].correct += perf.correct;
          stats[perf.topicId].total += perf.total;
        }
      });
    });

    Object.keys(stats).forEach((topicId) => {
      const stat = stats[topicId as TopicId];
      stat.percentage = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
    });

    return stats;
  }, [allResults]);

  const typeStats = useMemo(() => {
    const stats: Record<QuestionType, TypeStats> = {
      knowledge: { correct: 0, total: 0, percentage: 0 },
      situational: { correct: 0, total: 0, percentage: 0 },
    };

    allResults.forEach((result) => {
      if (!result.questions || !result.answers) return;

      result.questions.forEach((question, index) => {
        const answer = result.answers![index];
        const type = question.type;

        stats[type].total++;
        if (answer.isCorrect) {
          stats[type].correct++;
        }
      });
    });

    (['knowledge', 'situational'] as QuestionType[]).forEach((type) => {
      const stat = stats[type];
      stat.percentage = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
    });

    return stats;
  }, [allResults]);

  return {
    summary,
    recentResults,
    allResults,
    topicStats,
    typeStats,
    hasResults,
  };
}
