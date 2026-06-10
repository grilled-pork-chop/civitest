import { useEffect, useRef } from 'react';
import { useStore } from '@tanstack/react-store';
import { appStore, quizActions } from '@/stores/quizStore';

/**
 * Timer hook for quiz countdown.
 * Decrements the store's `timeRemaining` every second and fires `onTimeUp`
 * when it reaches zero. Pauses when the quiz is paused or completed.
 */
export function useQuizTimer(onTimeUp: () => void) {
  const currentQuiz = useStore(appStore, (state) => state.currentQuiz);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuiz?.isCompleted, currentQuiz?.isPaused, onTimeUp]);

  return currentQuiz?.timeRemaining ?? 0;
}
