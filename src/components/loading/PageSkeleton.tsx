/**
 * Skeleton loading components for different page types
 * Provides better UX by showing layout while content loads
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Loading skeleton for statistics page
 * Mimics the layout of StatsPage with charts and cards
 */
export function StatsPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Results List */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Loading skeleton for review page
 * Mimics the layout of ReviewPage with question card
 */
export function ReviewPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-20 w-full" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for home page
 * Mimics the layout of HomePage with hero and recent results
 */
export function HomePageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-12">
        <Skeleton className="h-12 w-96 mx-auto" />
        <Skeleton className="h-6 w-[500px] mx-auto" />
        <Skeleton className="h-12 w-48 mx-auto mt-8" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Results */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}


/**
 * Loading skeleton for quiz page
 */
export function QuizPageSkeleton() {
  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Timer */}
            <Skeleton className="h-8 w-28 rounded-md" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-md sm:hidden" />
              <Skeleton className="h-9 w-20 rounded-md hidden sm:block" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 pb-32 sm:pb-8">
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
          {/* Question area */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Question header */}
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-5/6" />
                </div>

                {/* Answers */}
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Desktop navigation */}
            <div className="hidden sm:flex items-center justify-between">
              <Skeleton className="h-10 w-32 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>

          {/* Desktop progress */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-5 gap-2">
                {[...Array(20)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-8 rounded-md" />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* MOBILE FOOTER */}
      <footer className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t p-4 pb-8">
        <div className="flex gap-3 max-w-md mx-auto">
          <Skeleton className="flex-1 h-12 rounded-xl" />
          <Skeleton className="flex-[3] h-12 rounded-xl" />
        </div>
      </footer>
    </div>
  );
}