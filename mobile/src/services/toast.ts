/**
 * Toast notification service
 * Wraps react-native-toast-message behind the app's existing toast API
 * so call sites stay unchanged.
 */

import Toast from 'react-native-toast-message';
import { ERROR_MESSAGES } from '@/constants/app';

interface ToastOptions {
  description?: string;
  duration?: number;
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    Toast.show({
      type: 'success',
      text1: message,
      text2: options?.description,
      visibilityTime: options?.duration ?? 3000,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    Toast.show({
      type: 'error',
      text1: message,
      text2: options?.description,
      visibilityTime: options?.duration ?? 5000,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    Toast.show({
      type: 'info',
      text1: message,
      text2: options?.description,
      visibilityTime: options?.duration ?? 4000,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    Toast.show({
      type: 'info',
      text1: message,
      text2: options?.description,
      visibilityTime: options?.duration ?? 3000,
    });
  },

  loading: (message: string): string | number => {
    Toast.show({
      type: 'info',
      text1: message,
      autoHide: false,
    });
    return Date.now();
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ): void => {
    Toast.show({ type: 'info', text1: messages.loading, autoHide: false });
    promise
      .then((data) => {
        const text =
          typeof messages.success === 'function' ? messages.success(data) : messages.success;
        Toast.show({ type: 'success', text1: text });
      })
      .catch((err: Error) => {
        const text = typeof messages.error === 'function' ? messages.error(err) : messages.error;
        Toast.show({ type: 'error', text1: text });
      });
  },

  dismiss: (_toastId?: string | number) => {
    Toast.hide();
  },
};

export { ERROR_MESSAGES };
