/**
 * LocalStorage utilities for quiz history management
 * Provides type-safe access to browser localStorage with validation
 */

import type { QuizHistory, QuizResult } from '@/types';
import { validateQuizHistory } from '@/lib/schemas';
import { logger } from '@/services/logger';
import { STORAGE_LIMITS } from '@/constants/app';

const STORAGE_KEYS = {
  QUIZ_HISTORY: 'civitest_quiz_history',
  CURRENT_QUIZ: 'civitest_current_quiz',
} as const;

/**
 * Default quiz history state
 */
const DEFAULT_QUIZ_HISTORY: QuizHistory = {
  results: [],
  usedQuestionSets: [],
  lastQuizDate: null,
};

/**
 * Safely parse and validate JSON with fallback
 */
function safeJSONParse(value: string | null, fallback: QuizHistory): QuizHistory {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return validateQuizHistory(parsed);
  } catch (error) {
    logger.warn('Failed to parse or validate quiz history from localStorage', {}, error as Error);
    return fallback;
  }
}

/**
 * Check if localStorage is available in the current environment
 *
 * @returns True if localStorage can be used
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get quiz history from localStorage
 */
export function getQuizHistory(): QuizHistory {
  if (!isLocalStorageAvailable()) {
    return DEFAULT_QUIZ_HISTORY;
  }

  const stored = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
  return safeJSONParse(stored, DEFAULT_QUIZ_HISTORY);
}

export interface SaveResult {
  success: boolean;
  quotaExceeded?: boolean;
  trimmed?: boolean;
  error?: string;
}

/**
 * Save quiz history to localStorage with quota handling
 */
export function saveQuizHistory(history: QuizHistory): SaveResult {
  if (!isLocalStorageAvailable()) {
    return { success: false, error: 'localStorage not available' };
  }

  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(history));
    return { success: true };
  } catch (error) {
    logger.error('Failed to save quiz history', {
      resultCount: history.results.length,
      questionSetCount: history.usedQuestionSets.length
    }, error as Error);

    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      try {
        // Attempt to save with trimmed history using configured limits
        const trimmedHistory: QuizHistory = {
          ...history,
          results: history.results.slice(-STORAGE_LIMITS.MAX_QUIZ_RESULTS),
          usedQuestionSets: history.usedQuestionSets.slice(-STORAGE_LIMITS.MAX_QUESTION_SETS),
        };
        localStorage.setItem(
          STORAGE_KEYS.QUIZ_HISTORY,
          JSON.stringify(trimmedHistory)
        );
        logger.warn('Storage quota exceeded, trimmed history', {
          originalResults: history.results.length,
          trimmedResults: trimmedHistory.results.length
        });
        return {
          success: true,
          quotaExceeded: true,
          trimmed: true
        };
      } catch (retryError) {
        logger.error('Unable to save even after trimming', {}, retryError as Error);
        return {
          success: false,
          quotaExceeded: true,
          error: 'Unable to save even after trimming history'
        };
      }
    }

    return { success: false, error: 'Unknown error saving data' };
  }
}

/**
 * Add a quiz result to history
 */
export function addQuizResult(result: QuizResult): { history: QuizHistory; saveResult: SaveResult } {
  const history = getQuizHistory();
  const updatedHistory: QuizHistory = {
    ...history,
    results: [...history.results, result],
    lastQuizDate: result.date,
  };
  const saveResult = saveQuizHistory(updatedHistory);
  return { history: updatedHistory, saveResult };
}

/**
 * Add used question set to history
 */
export function addUsedQuestionSet(questionIds: string[]): { history: QuizHistory; saveResult: SaveResult } {
  const history = getQuizHistory();
  const updatedHistory: QuizHistory = {
    ...history,
    usedQuestionSets: [...history.usedQuestionSets, questionIds].slice(-10),
  };
  const saveResult = saveQuizHistory(updatedHistory);
  return { history: updatedHistory, saveResult };
}

/**
 * Get used question sets
 */
export function getUsedQuestionSets(): string[][] {
  return getQuizHistory().usedQuestionSets;
}

/**
 * Clear all quiz history
 */
export function clearQuizHistory(): void {
  if (!isLocalStorageAvailable()) return;
  localStorage.removeItem(STORAGE_KEYS.QUIZ_HISTORY);
}

/**
 * Get quiz results sorted by date (newest first)
 */
export function getQuizResults(): QuizResult[] {
  const history = getQuizHistory();
  return [...history.results].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Get statistics from quiz history
 */
export function getQuizStatistics() {
  const results = getQuizResults();

  if (results.length === 0) {
    return {
      totalQuizzes: 0,
      averageScore: 0,
      passRate: 0,
      bestScore: 0,
      worstScore: 0,
      totalQuestionsAnswered: 0,
      averageTimePerQuiz: 0,
      recentTrend: [] as number[],
    };
  }

  const scores = results.map((r) => r.percentage);
  const passedCount = results.filter((r) => r.passed).length;
  const totalTime = results.reduce((sum, r) => sum + r.timeTaken, 0);

  return {
    totalQuizzes: results.length,
    averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    passRate: Math.round((passedCount / results.length) * 100),
    bestScore: Math.max(...scores),
    worstScore: Math.min(...scores),
    totalQuestionsAnswered: results.reduce(
      (sum, r) => sum + r.totalQuestions,
      0
    ),
    averageTimePerQuiz: Math.round(totalTime / results.length),
    recentTrend: results
      .slice(0, 10)
      .map((r) => r.percentage)
      .reverse(),
  };
}

/**
 * Export quiz history as JSON
 */
export function exportQuizHistory(): string {
  const history = getQuizHistory();
  return JSON.stringify(history, null, 2);
}

/**
 * Import quiz history from JSON with validation
 *
 * @param jsonString - JSON string containing quiz history data
 * @returns Result object with success status and optional error message
 *
 * @example
 * ```typescript
 * const result = importQuizHistory(jsonData);
 * if (result.success) {
 *   toast.success('Import successful');
 * } else {
 *   toast.error(result.error);
 * }
 * ```
 */
export function importQuizHistory(jsonString: string): { success: boolean; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    const validated = validateQuizHistory(parsed);
    saveQuizHistory(validated);
    logger.info('Quiz history imported successfully', {
      resultCount: validated.results.length
    });
    return { success: true };
  } catch (error) {
    logger.error('Failed to import quiz history', {}, error as Error);
    if (error instanceof SyntaxError) {
      return { success: false, error: 'Invalid JSON format' };
    }
    return { success: false, error: 'Invalid quiz history data structure' };
  }
}
