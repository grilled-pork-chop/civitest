/**
 * Application-wide constants
 * Centralizes all magic numbers and configuration values
 */

/**
 * Timer warning thresholds (in seconds)
 */
export const TIMER_THRESHOLDS = {
  /** Show warning state when time remaining is less than 5 minutes */
  WARNING: 300,
  /** Show critical state when time remaining is less than 1 minute */
  CRITICAL: 60,
} as const;

/**
 * UI interaction constants
 */
export const UI_CONSTANTS = {
  /** Minimum swipe distance in pixels to trigger navigation */
  SWIPE_THRESHOLD: 50,
  /** Debounce delay for search/filter inputs in milliseconds */
  SEARCH_DEBOUNCE_MS: 300,
} as const;

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
} as const;

/**
 * Chart and visualization constants
 */
export const CHART_CONFIG = {
  /** Default chart height in pixels */
  DEFAULT_HEIGHT: 300,
  /** Performance chart height in pixels */
  PERFORMANCE_CHART_HEIGHT: 75,
  /** Score distribution chart height in pixels */
  SCORE_CHART_HEIGHT: 100,
} as const;

/**
 * File validation constants
 */
export const FILE_VALIDATION = {
  /** Allowed file extensions for import */
  ALLOWED_EXTENSIONS: ['.json'] as const,
  /** Maximum file size for import in bytes (5MB) */
  MAX_FILE_SIZE: 5 * 1024 * 1024,
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
  INVALID_FILE_TYPE: 'Veuillez sélectionner un fichier JSON valide',
  FILE_TOO_LARGE: 'Le fichier est trop volumineux',
  IMPORT_FAILED: 'Erreur lors de l\'importation des données',
  STORAGE_QUOTA_EXCEEDED: 'Espace de stockage insuffisant. Les anciens résultats ont été supprimés.',
  STORAGE_SAVE_FAILED: 'Impossible de sauvegarder les données',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  QUIZ_HISTORY_CLEARED: 'Historique supprimé avec succès',
  QUIZ_HISTORY_IMPORTED: 'Historique importé avec succès',
  QUIZ_HISTORY_EXPORTED: 'Historique exporté avec succès',
} as const;
