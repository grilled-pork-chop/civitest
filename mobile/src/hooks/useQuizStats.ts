/**
 * Custom hook for quiz statistics
 * Centralizes all statistics calculations and data transformations
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQuizStatistics, getQuizResults } from '@/utils/storage';
import type { QuizResult, TopicId } from '@/types';
import { TOPICS } from '@/types';
import { DISPLAY_LIMITS } from '@/constants/app';

interface TopicStats {
  correct: number;
  total: number;
  percentage: number;
}

interface QuizStats {
  summary: ReturnType<typeof getQuizStatistics>;
  recentResults: QuizResult[];
  allResults: QuizResult[];
  displayResults: QuizResult[];
  topicStats: Record<TopicId, TopicStats>;
  hasResults: boolean;
}

/**
 * Custom hook to get and compute quiz statistics.
 * Reads from local storage (synchronous) through React Query for cache invalidation.
 */
export function useQuizStats(): QuizStats {
  const { data: allResults = [] } = useQuery({
    queryKey: ['quizHistory'],
    queryFn: getQuizResults,
    staleTime: 0,
  });

  const { data: summary = getQuizStatistics() } = useQuery({
    queryKey: ['quizStatistics'],
    queryFn: getQuizStatistics,
    staleTime: 0,
  });

  const recentResults = useMemo(
    () => allResults.slice(0, DISPLAY_LIMITS.RECENT_QUIZZES_COUNT),
    [allResults]
  );

  const displayResults = useMemo(
    () => allResults.slice(0, DISPLAY_LIMITS.HISTORY_LIST_LIMIT),
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
      stat.percentage =
        stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
    });

    return stats;
  }, [allResults]);

  return {
    summary,
    recentResults,
    allResults,
    displayResults,
    topicStats,
    hasResults,
  };
}
