/**
 * Skeleton loading component
 * Displays a placeholder shimmer effect while content is loading
 */

import { cn } from '@/lib/utils';

/**
 * Props for Skeleton component
 */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional CSS class names */
  className?: string;
}

/**
 * Skeleton component for loading states
 * Shows an animated shimmer effect to indicate loading content
 *
 * @param props - Component props
 * @returns Skeleton loading placeholder
 *
 * @example
 * ```tsx
 * <Skeleton className="h-12 w-full" />
 * <Skeleton className="h-4 w-3/4" />
 * ```
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}
