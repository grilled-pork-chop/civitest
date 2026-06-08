/**
 * Application-wide constants
 * Centralizes all magic numbers and configuration values
 */

/**
 * Storage quota management constants
 */
export const STORAGE_LIMITS = {
  /** Maximum number of quiz results to keep when quota exceeded */
  MAX_QUIZ_RESULTS: 20,
  /** Maximum number of used question sets to keep when quota exceeded */
  MAX_QUESTION_SETS: 5,
  /** Maximum number of question set history to track */
  MAX_QUESTION_SET_HISTORY: 10,
} as const;

/**
 * Quiz history display constants
 */
export const DISPLAY_LIMITS = {
  /** Number of recent quizzes to display on home page */
  RECENT_QUIZZES_COUNT: 5,
  /** Number of recent quiz sets to avoid repetition */
  RECENT_QUIZ_SET_LIMIT: 3,
  /** Number of recent results to show in trend chart */
  TREND_CHART_LIMIT: 10,
  /** Max results rendered in the history list (non-virtualized ScrollView) */
  HISTORY_LIST_LIMIT: 50,
} as const;

/**
 * Question file names
 */
export const QUESTION_FILES = [
  'pv_questions.json',
  'sip_questions.json',
  'dd_questions.json',
  'hgc_questions.json',
  'vsf_questions.json',
  'pv_x_questions.json',
  'sip_x_questions.json',
  'dd_x_questions.json',
  'hgc_x_questions.json',
  'vsf_x_questions.json',
  'pv_s_questions.json',
  'dd_s_questions.json',
] as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  QUESTIONS_LOAD_FAILED: 'Impossible de charger les questions. Veuillez réessayer.',
  QUIZ_NOT_FOUND: 'Quiz non trouvé',
  STORAGE_QUOTA_EXCEEDED: 'Espace de stockage insuffisant. Les anciens résultats ont été supprimés.',
  STORAGE_SAVE_FAILED: 'Impossible de sauvegarder les données',
} as const;
