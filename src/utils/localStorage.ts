import type { QuizHistory, QuizResult } from '@/types';

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
 * Safely parse JSON with fallback
 */
function safeJSONParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/**
 * Check if localStorage is available
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

/**
 * Save quiz history to localStorage
 */
export function saveQuizHistory(history: QuizHistory): void {
  if (!isLocalStorageAvailable()) return;

  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save quiz history:', error);
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      const trimmedHistory: QuizHistory = {
        ...history,
        results: history.results.slice(-20),
        usedQuestionSets: history.usedQuestionSets.slice(-5),
      };
      localStorage.setItem(
        STORAGE_KEYS.QUIZ_HISTORY,
        JSON.stringify(trimmedHistory)
      );
    }
  }
}

/**
 * Add a quiz result to history
 */
export function addQuizResult(result: QuizResult): QuizHistory {
  const history = getQuizHistory();
  const updatedHistory: QuizHistory = {
    ...history,
    results: [...history.results, result],
    lastQuizDate: result.date,
  };
  saveQuizHistory(updatedHistory);
  return updatedHistory;
}

/**
 * Add used question set to history
 */
export function addUsedQuestionSet(questionIds: string[]): QuizHistory {
  const history = getQuizHistory();
  const updatedHistory: QuizHistory = {
    ...history,
    usedQuestionSets: [...history.usedQuestionSets, questionIds].slice(-10),
  };
  saveQuizHistory(updatedHistory);
  return updatedHistory;
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
 * Import quiz history from JSON
 */
export function importQuizHistory(jsonString: string): boolean {
  try {
    const imported = JSON.parse(jsonString) as QuizHistory;
    if (!imported.results || !Array.isArray(imported.results)) {
      throw new Error('Invalid quiz history format');
    }
    saveQuizHistory(imported);
    return true;
  } catch (error) {
    console.error('Failed to import quiz history:', error);
    return false;
  }
}
