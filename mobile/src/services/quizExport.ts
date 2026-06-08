/**
 * Quiz data export/import service (React Native).
 *
 * Export: write history JSON to a cache file and open the native share sheet.
 * Import: pick a .json document, read it, validate and load it.
 * Fully offline — sharing/importing is user-initiated and local.
 */

import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import {
  exportQuizHistory,
  importQuizHistory as importQuizHistoryUtil,
} from '@/utils/storage';
import { logger } from './logger';
import { toast, SUCCESS_MESSAGES, ERROR_MESSAGES } from './toast';
import { FILE_VALIDATION } from '@/constants/app';

/**
 * Export quiz history to a JSON file and open the share sheet.
 *
 * @returns True if export was successful
 */
export async function exportQuizHistoryFile(): Promise<boolean> {
  try {
    const data = exportQuizHistory();
    const filename = `civitest-history-${new Date().toISOString().split('T')[0]}.json`;

    const file = new File(Paths.cache, filename);
    if (file.exists) {
      file.delete();
    }
    file.create();
    file.write(data);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Exporter l\'historique CiviTest',
        UTI: 'public.json',
      });
    }

    logger.info('Quiz history exported', { date: new Date().toISOString() });
    toast.success(SUCCESS_MESSAGES.QUIZ_HISTORY_EXPORTED);
    return true;
  } catch (error) {
    logger.error('Failed to export quiz history', {}, error as Error);
    toast.error("Erreur lors de l'exportation des données");
    return false;
  }
}

/**
 * Validate a picked file's name and size before importing.
 */
export function validateImportFile(file: { name: string; size?: number }): {
  valid: boolean;
  error?: string;
} {
  const hasValidExtension = FILE_VALIDATION.ALLOWED_EXTENSIONS.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );

  if (!hasValidExtension) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_FILE_TYPE };
  }

  if (file.size != null && file.size > FILE_VALIDATION.MAX_FILE_SIZE) {
    return { valid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE };
  }

  return { valid: true };
}

/**
 * Pick a JSON file and import quiz history from it.
 *
 * @param onSuccess - Callback invoked after a successful import
 * @returns True if import was successful
 */
export async function importQuizHistoryFile(
  onSuccess?: () => void
): Promise<boolean> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return false;
    }

    const asset = result.assets[0];
    const validation = validateImportFile({
      name: asset.name,
      size: asset.size ?? undefined,
    });
    if (!validation.valid) {
      toast.error(validation.error!);
      logger.warn('Invalid import file', {
        fileName: asset.name,
        fileSize: asset.size,
        error: validation.error,
      });
      return false;
    }

    const file = new File(asset.uri);
    const content = await file.text();

    const importResult = importQuizHistoryUtil(content);

    if (importResult.success) {
      toast.success(SUCCESS_MESSAGES.QUIZ_HISTORY_IMPORTED);
      logger.info('Quiz history imported', { fileName: asset.name });
      onSuccess?.();
      return true;
    }

    toast.error(ERROR_MESSAGES.IMPORT_FAILED, {
      description: importResult.error || 'Format de données invalide',
    });
    logger.error('Import validation failed', {
      fileName: asset.name,
      error: importResult.error,
    });
    return false;
  } catch (error) {
    toast.error(ERROR_MESSAGES.IMPORT_FAILED);
    logger.error('Import failed', {}, error as Error);
    return false;
  }
}
