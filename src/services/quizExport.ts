/**
 * Quiz data export/import service
 * Handles exporting and importing quiz history data
 */

import { exportQuizHistory, importQuizHistory as importQuizHistoryUtil } from '@/utils/localStorage';
import { logger } from './logger';
import { toast, SUCCESS_MESSAGES, ERROR_MESSAGES } from './toast';
import { FILE_VALIDATION } from '@/constants/app';

/**
 * Export quiz history to a JSON file
 * Downloads the file to the user's device
 *
 * @returns True if export was successful
 *
 * @example
 * ```typescript
 * const success = exportQuizHistoryFile();
 * ```
 */
export function exportQuizHistoryFile(): boolean {
  try {
    const data = exportQuizHistory();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civitest-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    logger.info('Quiz history exported', {
      date: new Date().toISOString()
    });
    toast.success(SUCCESS_MESSAGES.QUIZ_HISTORY_EXPORTED);
    return true;
  } catch (error) {
    logger.error('Failed to export quiz history', {}, error as Error);
    toast.error('Erreur lors de l\'exportation des données');
    return false;
  }
}

/**
 * Validate if a file is acceptable for import
 *
 * @param file - File to validate
 * @returns Object with validation result and error message if invalid
 *
 * @example
 * ```typescript
 * const validation = validateImportFile(file);
 * if (!validation.valid) {
 *   toast.error(validation.error);
 * }
 * ```
 */
export function validateImportFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file extension
  const hasValidExtension = FILE_VALIDATION.ALLOWED_EXTENSIONS.some(ext =>
    file.name.toLowerCase().endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_FILE_TYPE
    };
  }

  // Check file size
  if (file.size > FILE_VALIDATION.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: ERROR_MESSAGES.FILE_TOO_LARGE
    };
  }

  return { valid: true };
}

/**
 * Import quiz history from a file
 * Validates and loads the data into localStorage
 *
 * @param file - File containing quiz history JSON
 * @param onSuccess - Callback function called on successful import
 * @returns Promise that resolves to true if import was successful
 *
 * @example
 * ```typescript
 * await importQuizHistoryFile(file, () => {
 *   quizActions.refreshHistory();
 * });
 * ```
 */
export async function importQuizHistoryFile(
  file: File,
  onSuccess?: () => void
): Promise<boolean> {
  // Validate file
  const validation = validateImportFile(file);
  if (!validation.valid) {
    toast.error(validation.error!);
    logger.warn('Invalid import file', {
      fileName: file.name,
      fileSize: file.size,
      error: validation.error
    });
    return false;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result;

      if (!content || typeof content !== 'string') {
        toast.error(ERROR_MESSAGES.IMPORT_FAILED);
        logger.error('FileReader returned invalid content', {
          contentType: typeof content
        });
        resolve(false);
        return;
      }

      const result = importQuizHistoryUtil(content);

      if (result.success) {
        toast.success(SUCCESS_MESSAGES.QUIZ_HISTORY_IMPORTED);
        logger.info('Quiz history imported', {
          fileName: file.name,
          fileSize: file.size
        });
        onSuccess?.();
        resolve(true);
      } else {
        toast.error(ERROR_MESSAGES.IMPORT_FAILED, {
          description: result.error || 'Format de données invalide'
        });
        logger.error('Import validation failed', {
          fileName: file.name,
          error: result.error
        });
        resolve(false);
      }
    };

    reader.onerror = () => {
      toast.error(ERROR_MESSAGES.IMPORT_FAILED);
      logger.error('FileReader error', {
        fileName: file.name
      });
      resolve(false);
    };

    reader.readAsText(file);
  });
}
