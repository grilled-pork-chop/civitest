/**
 * Statistics page
 * Displays quiz history, performance analytics, and statistics
 */

import React, { useState, Suspense, lazy } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Trash2, Download, Upload, Play, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { clearQuizHistory } from '@/utils/localStorage';
import { exportQuizHistoryFile, importQuizHistoryFile } from '@/services/quizExport';
import { quizActions } from '@/stores/quizStore';
import { queryClient, useQuestions } from '@/lib/queries';
import { useQuizStats } from '@/hooks/useQuizStats';
import { StatsSummaryCards } from '@/components/stats/StatsSummaryCards';
import { TrendChart } from '@/components/stats/TrendChart';
import { toast, SUCCESS_MESSAGES } from '@/services/toast';
import { Skeleton } from '@/components/ui/skeleton';

const TopicPerformanceChart = lazy(() =>
  import('@/components/stats/TopicPerformanceChart').then(m => ({ default: m.TopicPerformanceChart }))
);
const QuizResultsList = lazy(() =>
  import('@/components/stats/QuizResultsList').then(m => ({ default: m.QuizResultsList }))
);

/**
 * Statistics page component
 * Displays comprehensive quiz performance analytics
 *
 * @returns Statistics page UI
 */
export function StatsPage() {
  const navigate = useNavigate();
  const { data: questions } = useQuestions();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const stats = useQuizStats();

  /**
   * Start a new quiz
   */
  const handleNewQuiz = () => {
    if (questions) {
      quizActions.startQuiz(questions);
      navigate({ to: '/quiz' });
    }
  };

  /**
   * Clear all quiz history
   */
  const handleClearHistory = () => {
    clearQuizHistory();
    queryClient.invalidateQueries({ queryKey: ['quizHistory'] });
    quizActions.refreshHistory();
    setShowClearDialog(false);
    toast.success(SUCCESS_MESSAGES.QUIZ_HISTORY_CLEARED);
  };

  /**
   * Handle file import
   */
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await importQuizHistoryFile(file, () => {
      queryClient.invalidateQueries({ queryKey: ['quizHistory'] });
      quizActions.refreshHistory();
      event.target.value = '';
    });
  };

  if (!stats.hasResults) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="rounded-full bg-muted w-24 h-24 flex items-center justify-center mx-auto">
            <BarChart3 className="h-12 w-12 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Aucune statistique disponible</h2>
            <p className="text-muted-foreground mb-6">
              Commencez un examen pour voir vos statistiques et suivre votre progression.
            </p>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button size="lg" onClick={handleNewQuiz}>
              <Play className="mr-2 h-5 w-5" />
              Commencer un examen
            </Button>
            <Button variant="outline" size="lg" asChild>
              <label htmlFor="import-file" className="cursor-pointer">
                <Upload className="mr-2 h-5 w-5" />
                Importer l'historique
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                />
              </label>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
          <p className="text-muted-foreground">
            Analysez vos performances et suivez votre progression
          </p>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={exportQuizHistoryFile}
            className="flex-1 sm:flex-none"
          >
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>

          <Button variant="outline" asChild className="flex-1 sm:flex-none">
            <label htmlFor="import-file" className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Importer
              <input
                id="import-file"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </label>
          </Button>

          <Button
            variant="destructive"
            onClick={() => setShowClearDialog(true)}
            className="col-span-2 sm:flex-none" // Full width on mobile, auto on desktop
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Effacer l'historique
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <StatsSummaryCards
        totalQuizzes={stats.summary.totalQuizzes}
        averageScore={stats.summary.averageScore}
        passRate={stats.summary.passRate}
        averageTimePerQuiz={stats.summary.averageTimePerQuiz}
      />

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {stats.summary.recentTrend.length > 0 && (
          <TrendChart data={stats.summary.recentTrend} />
        )}

        <Suspense fallback={<Skeleton className="h-100 w-full" />}>
          <TopicPerformanceChart topicStats={stats.topicStats} />
        </Suspense>
      </div>

      {/* Results List */}
      <Suspense fallback={<Skeleton className="h-150 w-full" />}>
        <QuizResultsList results={stats.allResults} onNavigate={navigate} />
      </Suspense>

      {/* Clear Confirmation Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir effacer tout l'historique ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleClearHistory}>
              Effacer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
