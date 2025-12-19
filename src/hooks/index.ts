import { useEffect, useRef, useCallback, useState } from 'react';
import { useStore } from '@tanstack/react-store';
import { appStore, quizActions } from '@/stores/quizStore';

/**
 * Timer hook for quiz countdown
 */
export function useQuizTimer(onTimeUp: () => void) {
  const currentQuiz = useStore(appStore, (state) => state.currentQuiz);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!currentQuiz || currentQuiz.isCompleted || currentQuiz.isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const state = appStore.state;
      if (!state.currentQuiz) return;

      const newTime = state.currentQuiz.timeRemaining - 1;

      if (newTime <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        quizActions.updateTimeRemaining(0);
        onTimeUp();
      } else {
        quizActions.updateTimeRemaining(newTime);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentQuiz?.isCompleted, currentQuiz?.isPaused, onTimeUp]);

  return currentQuiz?.timeRemaining ?? 0;
}

/**
 * Keyboard navigation hook
 */
export function useKeyboardNavigation(
  enabled: boolean,
  options: {
    onNext?: () => void;
    onPrev?: () => void;
    onSelect?: (index: number) => void;
    onSubmit?: () => void;
  }
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'n':
          e.preventDefault();
          options.onNext?.();
          break;
        case 'ArrowLeft':
        case 'p':
          e.preventDefault();
          options.onPrev?.();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          e.preventDefault();
          options.onSelect?.(parseInt(e.key) - 1);
          break;
        case 'Enter':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            options.onSubmit?.();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, options]);
}

/**
 * Prevent back navigation during quiz
 */
export function usePreventNavigation(enabled: boolean, message: string) {
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, message]);
}

/**
 * Local storage sync hook
 */
export function useLocalStorageSync<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error saving to localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * Focus trap for modals
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef]);
}

/**
 * Window size hook
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

/**
 * Is mobile hook
 */
export function useIsMobile() {
  const { width } = useWindowSize();
  return width < 768;
}
