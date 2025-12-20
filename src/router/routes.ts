import { createRootRoute, createRoute } from '@tanstack/react-router';
import { RootLayout } from '@/components/layout/RootLayout';
import { HomePage, QuizPage, ReviewPage, StatsPage } from '@/pages';

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
  component: QuizPage,
});

export const reviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/review',
  component: ReviewPage,
});

export const reviewByIdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/review/$quizId',
  component: ReviewPage,
});

export const statsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stats',
  component: StatsPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  quizRoute,
  reviewRoute,
  reviewByIdRoute,
  statsRoute,
]);