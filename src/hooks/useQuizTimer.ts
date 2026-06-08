import { useEffect, useRef } from 'react';
import { useStore } from '@tanstack/react-store';
import { appStore, quizActions } from '@/stores/quizStore';

/**
 * Timer hook for quiz countdown.
 * Fires `onTimeUp` when the countdown reaches zero. Pauses when the quiz is
 * paused or completed.
 *
 * The countdown is anchored to a wall-clock deadline rather than counting ticks,
 * so it stays accurate even when 1s ticks are delayed (busy JS thread) or the
 * app is briefly suspended. A plain `timeRemaining - 1` per tick would silently
 * hand the user extra time whenever ticks are missed. Pausing clears the
 * interval and resuming re-anchors from the preserved `timeRemaining`, so no
 * time is gained or lost across a pause.
 */
export function useQuizTimer(onTimeUp: () => void) {
  const currentQuiz = useStore(appStore, (state) => state.currentQuiz);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isActive = !!currentQuiz && !currentQuiz.isCompleted && !currentQuiz.isPaused;

  useEffect(() => {
    const clear = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (!isActive) {
      clear();
      return;
    }

    const endAt = Date.now() + (appStore.state.currentQuiz?.timeRemaining ?? 0) * 1000;

    intervalRef.current = setInterval(() => {
      if (!appStore.state.currentQuiz) return;
      const remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));

      if (remaining <= 0) {
        clear();
        quizActions.updateTimeRemaining(0);
        onTimeUp();
      } else {
        quizActions.updateTimeRemaining(remaining);
      }
    }, 1000);

    return clear;
  }, [isActive, onTimeUp]);

  return currentQuiz?.timeRemaining ?? 0;
}
