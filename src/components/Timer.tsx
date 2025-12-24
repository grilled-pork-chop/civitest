/**
 * Quiz timer component
 * Displays remaining time with visual warnings as time runs low
 */

import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime } from '@/utils/questions';

/**
 * Props for Timer component
 */
interface TimerProps {
  /** Time remaining in seconds */
  timeRemaining: number;
  /** Total time allocated in seconds */
  totalTime: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Countdown timer with warning states
 * Shows time remaining with progress bar and color-coded warnings
 * - Normal: blue clock icon
 * - Warning (≤5min): yellow styling
 * - Critical (≤1min): red styling with pulse animation
 *
 * @param props - Component props
 * @returns Timer display with progress bar
 *
 * @example
 * ```tsx
 * <Timer
 *   timeRemaining={180}
 *   totalTime={1200}
 * />
 * ```
 */
export function Timer({ timeRemaining, totalTime, className }: TimerProps) {
  const percentage = (timeRemaining / totalTime) * 100;
  const isWarning = timeRemaining <= 300;
  const isCritical = timeRemaining <= 60;

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2 rounded-lg border transition-all duration-300',
        {
          'bg-card border-border': !isWarning,
          'bg-yellow-50 border-yellow-200': isWarning && !isCritical,
          'bg-red-50 border-red-200 animate-timer-pulse': isCritical,
        },
        className
      )}
      role="timer"
      aria-live="polite"
      aria-label={`Temps restant: ${formatTime(timeRemaining)}`}
    >
      {isCritical ? (
        <AlertTriangle
          className="h-5 w-5 text-red-600 animate-pulse"
          aria-hidden="true"
        />
      ) : (
        <Clock
          className={cn('h-5 w-5', {
            'text-muted-foreground': !isWarning,
            'text-yellow-600': isWarning && !isCritical,
          })}
          aria-hidden="true"
        />
      )}

      <div className="flex flex-col">
        <span
          className={cn('text-base sm:text-lg font-mono font-semibold tabular-nums', {
            'text-foreground': !isWarning,
            'text-yellow-700': isWarning && !isCritical,
            'text-red-700': isCritical,
          })}
        >
          {formatTime(timeRemaining)}
        </span>
        <span className="hidden sm:block text-xs text-muted-foreground">restant</span>
      </div>

      <div className="hidden sm:block w-24 h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-1000 ease-linear rounded-full',
            {
              'bg-primary': !isWarning,
              'bg-yellow-500': isWarning && !isCritical,
              'bg-red-500': isCritical,
            }
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}