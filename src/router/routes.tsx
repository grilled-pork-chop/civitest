/**
 * Application routing configuration
 * Uses lazy loading for code splitting and better performance
 */

import React, { lazy, Suspense } from 'react';
import { createRootRoute, createRoute } from '@tanstack/react-router';
import { RootLayout } from '@/components/layout/RootLayout';
import { HomePage } from '@/pages';
import { StatsPageSkeleton, ReviewPageSkeleton, QuizPageSkeleton } from '@/components/loading/PageSkeleton';

// Lazy load heavy pages
const QuizPage = lazy(() => import('@/pages/QuizPage').then(m => ({ default: m.QuizPage })));
const ReviewPage = lazy(() => import('@/pages/ReviewPage').then(m => ({ default: m.ReviewPage })));
const StatsPage = lazy(() => import('@/pages/StatsPage').then(m => ({ default: m.StatsPage })));

/**
 * Wrapper component for lazy-loaded routes with Suspense
 */
function withSuspense(
  Component: React.ComponentType<any>,
  Fallback: React.ComponentType
) {
  return function SuspenseWrapper(props: any) {
    return (
      <Suspense fallback={<Fallback />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

export const rootRoute = createRootRoute({
  component: RootLayout,
});

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

export const quizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/quiz',
  component: withSuspense(QuizPage, QuizPageSkeleton),
});

export const reviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/review',
  component: withSuspense(ReviewPage, ReviewPageSkeleton),
});

export const reviewByIdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/review/$quizId',
  component: withSuspense(ReviewPage, ReviewPageSkeleton),
});

export const statsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stats',
  component: withSuspense(StatsPage, StatsPageSkeleton),
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  quizRoute,
  reviewRoute,
  reviewByIdRoute,
  statsRoute,
]);