/**
 * Quiz progress tracker component
 * Displays progress bar and question navigation grid
 */

import { cn } from '@/lib/utils';
import type { QuizAnswer } from '@/types';

/**
 * Props for QuizProgress component
 */
interface QuizProgressProps {
  /** Array of answers for all questions */
  answers: QuizAnswer[];
  /** Index of current question */
  currentIndex: number;
  /** Callback when navigating to a different question */
  onNavigate: (index: number) => void;
  /** Whether navigation is disabled */
  disabled?: boolean;
  /** Whether in review mode (shows correct/incorrect colors) */
  isReviewMode?: boolean;
}

/**
 * Progress indicator with question navigation grid
 * Shows completion percentage, progress bar, and clickable question numbers
 * Color-codes questions based on answered status or correctness in review mode
 *
 * @param props - Component props
 * @returns Progress tracker with navigation grid
 *
 * @example
 * ```tsx
 * <QuizProgress
 *   answers={quizAnswers}
 *   currentIndex={4}
 *   onNavigate={(index) => setCurrentIndex(index)}
 *   isReviewMode={false}
 * />
 * ```
 */
export function QuizProgress({
  answers,
  currentIndex,
  onNavigate,
  disabled = false,
  isReviewMode = false,
}: QuizProgressProps) {
  const answeredCount = answers.filter(
    (a) => a.selectedChoiceIndex !== null
  ).length;

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">
          {answeredCount} / {answers.length} répondu{answeredCount !== 1 ? 'es' : 'e'}
        </span>
        <span className="font-medium">
          {Math.round((answeredCount / answers.length) * 100)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
          style={{ width: `${(answeredCount / answers.length) * 100}%` }}
        />
      </div>

      {/* Question grid */}
      <div
        className="grid grid-cols-8 sm:grid-cols-10 gap-1 sm:gap-1.5 mt-4"
        role="navigation"
        aria-label="Navigation des questions"
      >
        {answers.map((answer, index) => {
          const isAnswered = answer.selectedChoiceIndex !== null;
          const isCurrent = index === currentIndex;

          let bgColor = 'bg-secondary';
          if (isReviewMode) {
            if (answer.isCorrect) {
              bgColor = 'bg-green-500';
            } else if (isAnswered) {
              bgColor = 'bg-red-500';
            }
          } else if (isAnswered) {
            bgColor = 'bg-primary';
          }

          return (
            <button
              key={index}
              onClick={() => !disabled && onNavigate(index)}
              disabled={disabled}
              className={cn(
                'w-full aspect-square rounded text-xs font-medium transition-all',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                bgColor,
                {
                  'text-primary-foreground': isAnswered && !isReviewMode,
                  'text-white': isReviewMode && isAnswered,
                  'text-secondary-foreground': !isAnswered,
                  'ring-2 ring-primary ring-offset-2': isCurrent,
                  'hover:opacity-80': !disabled,
                  'cursor-not-allowed opacity-50': disabled,
                }
              )}
              aria-label={`Question ${index + 1}${isAnswered ? ' (répondue)' : ''}`}
              aria-current={isCurrent ? 'true' : undefined}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="hidden sm:flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-secondary" />
          <span>Non répondue</span>
        </div>
        {isReviewMode ? (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>Correcte</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span>Incorrecte</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary" />
            <span>Répondue</span>
          </div>
        )}
      </div>
    </div>
  );
}