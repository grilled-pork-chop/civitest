/**
 * Type guard utilities
 * Provides runtime type checking to replace unsafe type assertions
 */

import type { QuizResult, Question, QuizAnswer, TopicId } from '@/types';

/**
 * Type guard to check if a QuizResult has full review data
 */
export function hasReviewData(
  result: QuizResult
): result is QuizResult & { questions: Question[]; answers: QuizAnswer[] } {
  return (
    Array.isArray(result.questions) &&
    result.questions.length > 0 &&
    Array.isArray(result.answers) &&
    result.answers.length > 0
  );
}

/**
 * Type guard to check if a value is a valid TopicId
 */
export function isTopicId(value: unknown): value is TopicId {
  const validTopics: TopicId[] = [
    'principes_valeurs',
    'institutions',
    'droits_devoirs',
    'histoire_geographie_culture',
    'vivre_france',
  ];
  return typeof value === 'string' && validTopics.includes(value as TopicId);
}
