import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime } from '@/utils/questions';

interface TimerProps {
  timeRemaining: number;
  totalTime: number;
  className?: string;
}

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