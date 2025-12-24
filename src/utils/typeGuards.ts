/**
 * Type guard utilities
 * Provides runtime type checking to replace unsafe type assertions
 */

import type { QuizResult, Question, QuizAnswer, TopicId, QuestionType } from '@/types';

/**
 * Type guard to check if a QuizResult has full review data
 *
 * @param result - Quiz result to check
 * @returns True if result has questions and answers arrays
 *
 * @example
 * ```typescript
 * if (hasReviewData(result)) {
 *   // TypeScript knows result.questions and result.answers exist
 *   result.questions.forEach(q => console.log(q.question));
 * }
 * ```
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
 *
 * @param value - Value to check
 * @returns True if value is a valid TopicId
 *
 * @example
 * ```typescript
 * if (isTopicId(filterValue)) {
 *   // Safe to use as TopicId
 *   const topicName = getTopicName(filterValue);
 * }
 * ```
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
 *
 * @param value - Value to check
 * @returns True if value is a valid QuestionType
 *
 * @example
 * ```typescript
 * if (isQuestionType(typeValue)) {
 *   const questions = allQuestions.filter(q => q.type === typeValue);
 * }
 * ```
 */
export function isQuestionType(value: unknown): value is QuestionType {
  return value === 'knowledge' || value === 'situational';
}

/**
 * Type guard to check if FileReader result is a string
 *
 * @param result - FileReader result to check
 * @returns True if result is a string
 *
 * @example
 * ```typescript
 * reader.onload = (e) => {
 *   if (e.target?.result && isString(e.target.result)) {
 *     const content = e.target.result;
 *     // Safely use content as string
 *   }
 * };
 * ```
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if an error is a DOMException with QuotaExceededError
 *
 * @param error - Error to check
 * @returns True if error is a QuotaExceededError
 *
 * @example
 * ```typescript
 * try {
 *   localStorage.setItem(key, value);
 * } catch (error) {
 *   if (isQuotaExceededError(error)) {
 *     // Handle quota exceeded
 *   }
 * }
 * ```
 */
export function isQuotaExceededError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === 'QuotaExceededError';
}

/**
 * Type guard to check if a value is a valid JSON string
 *
 * @param value - Value to check
 * @returns True if value is parseable JSON
 *
 * @example
 * ```typescript
 * if (isValidJSON(inputString)) {
 *   const data = JSON.parse(inputString);
 * }
 * ```
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
 *
 * @param params - Route params object
 * @returns True if params has a valid quizId
 *
 * @example
 * ```typescript
 * const params = useParams();
 * if (hasQuizId(params)) {
 *   const result = findQuizById(params.quizId);
 * }
 * ```
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
