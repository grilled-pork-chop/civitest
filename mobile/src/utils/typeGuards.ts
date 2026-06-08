/**
 * Type guard utilities
 * Provides runtime type checking to replace unsafe type assertions
 */

import type { QuizResult, Question, QuizAnswer, TopicId, QuestionType } from '@/types';

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

/**
 * Type guard to check if a value is a valid QuestionType
 */
export function isQuestionType(value: unknown): value is QuestionType {
  return value === 'knowledge' || value === 'situational';
}

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if a value is a valid JSON string
 */
export function isValidJSON(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard to validate route params have required quiz ID
 */
export function hasQuizId(params: unknown): params is { quizId: string } {
  return (
    typeof params === 'object' &&
    params !== null &&
    'quizId' in params &&
    typeof (params as { quizId: unknown }).quizId === 'string' &&
    (params as { quizId: string }).quizId.length > 0
  );
}
