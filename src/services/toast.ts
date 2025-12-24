/**
 * Toast notification service
 * Provides user-friendly notifications using Sonner
 */

import { toast as sonnerToast } from 'sonner';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/app';

/**
 * Toast notification service
 * Wraps Sonner toast library with application-specific defaults
 */
export const toast = {
  /**
   * Show success notification
   *
   * @param message - Success message to display
   * @param options - Additional options for the toast
   *
   * @example
   * ```typescript
   * toast.success('Quiz history cleared successfully');
   * toast.success(SUCCESS_MESSAGES.QUIZ_HISTORY_CLEARED);
   * ```
   */
  success: (message: string, options?: { description?: string; duration?: number }) => {
    sonnerToast.success(message, {
      duration: options?.duration || 3000,
      description: options?.description,
    });
  },

  /**
   * Show error notification
   *
   * @param message - Error message to display
   * @param options - Additional options for the toast
   *
   * @example
   * ```typescript
   * toast.error('Failed to load questions');
   * toast.error(ERROR_MESSAGES.QUESTIONS_LOAD_FAILED, { description: 'Network error' });
   * ```
   */
  error: (message: string, options?: { description?: string; duration?: number }) => {
    sonnerToast.error(message, {
      duration: options?.duration || 5000,
      description: options?.description,
    });
  },

  /**
   * Show warning notification
   *
   * @param message - Warning message to display
   * @param options - Additional options for the toast
   *
   * @example
   * ```typescript
   * toast.warning('Storage quota exceeded');
   * toast.warning(ERROR_MESSAGES.STORAGE_QUOTA_EXCEEDED);
   * ```
   */
  warning: (message: string, options?: { description?: string; duration?: number }) => {
    sonnerToast.warning(message, {
      duration: options?.duration || 4000,
      description: options?.description,
    });
  },

  /**
   * Show info notification
   *
   * @param message - Info message to display
   * @param options - Additional options for the toast
   *
   * @example
   * ```typescript
   * toast.info('Questions loaded', { description: '120 questions available' });
   * ```
   */
  info: (message: string, options?: { description?: string; duration?: number }) => {
    sonnerToast.info(message, {
      duration: options?.duration || 3000,
      description: options?.description,
    });
  },

  /**
   * Show loading notification
   *
   * @param message - Loading message to display
   *
   * @returns Toast ID that can be used to dismiss or update the toast
   *
   * @example
   * ```typescript
   * const toastId = toast.loading('Importing quiz history...');
   * // Later:
   * toast.dismiss(toastId);
   * toast.success('Import complete!');
   * ```
   */
  loading: (message: string): string | number => {
    return sonnerToast.loading(message);
  },

  /**
   * Show promise-based notification
   * Automatically shows loading, success, or error based on promise state
   *
   * @param promise - Promise to track
   * @param messages - Messages for different states
   *
   * @example
   * ```typescript
   * toast.promise(
   *   importQuizHistory(data),
   *   {
   *     loading: 'Importing quiz history...',
   *     success: 'Import complete!',
   *     error: 'Import failed'
   *   }
   * );
   * ```
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ): void => {
    sonnerToast.promise(promise, messages);
  },

  /**
   * Dismiss a specific toast or all toasts
   *
   * @param toastId - Optional toast ID to dismiss. If not provided, dismisses all toasts
   *
   * @example
   * ```typescript
   * toast.dismiss(toastId);
   * toast.dismiss(); // Dismiss all
   * ```
   */
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};

/**
 * Re-export common error messages for convenience
 */
export { ERROR_MESSAGES, SUCCESS_MESSAGES };
