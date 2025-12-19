import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Send,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Timer } from '@/components/Timer';
import { QuestionCard } from '@/components/QuestionCard';
import { QuizProgress } from '@/components/QuizProgress';
import { ResultsSummary } from '@/components/ResultsSummary';
import { appStore, quizActions, quizSelectors } from '@/stores/quizStore';
import {
  useQuizTimer,
  useKeyboardNavigation,
  usePreventNavigation,
} from '@/hooks';
import { QUIZ_CONFIG } from '@/types';
import type { QuizResult } from '@/types';

export function QuizPage() {
  const navigate = useNavigate();
  const currentQuiz = useStore(appStore, (state) => state.currentQuiz);
  const currentQuestion = useStore(appStore, quizSelectors.getCurrentQuestion);
  const currentAnswer = useStore(appStore, quizSelectors.getCurrentAnswer);
  const progress = useStore(appStore, quizSelectors.getProgress);
  const unansweredCount = useStore(appStore, quizSelectors.getUnansweredCount);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (!currentQuiz) {
      navigate({ to: '/' });
    }
  }, [currentQuiz, navigate]);

  const handleTimeUp = useCallback(() => {
    setShowTimeUpDialog(true);
    const result = quizActions.endQuiz();
    if (result) {
      setQuizResult(result);
    }
  }, []);

  const timeRemaining = useQuizTimer(handleTimeUp);

  usePreventNavigation(
    !!currentQuiz && !currentQuiz.isCompleted,
    'Voulez-vous vraiment quitter ? Votre progression sera perdue.'
  );

  const handleSelectChoice = useCallback(
    (choiceIndex: number) => {
      if (!currentQuiz || currentQuiz.isCompleted) return;
      quizActions.answerQuestion(currentQuiz.currentQuestionIndex, choiceIndex);
    },
    [currentQuiz]
  );

  useKeyboardNavigation(!currentQuiz?.isCompleted && !showSubmitDialog, {
    onNext: quizActions.nextQuestion,
    onPrev: quizActions.prevQuestion,
    onSelect: handleSelectChoice,
    onSubmit: () => setShowSubmitDialog(true),
  });

  const handleSubmit = useCallback(() => {
    const result = quizActions.endQuiz();
    if (result) {
      setQuizResult(result);
    }
    setShowSubmitDialog(false);
  }, []);

  const handleExit = useCallback(() => {
    quizActions.clearQuiz();
    navigate({ to: '/' });
  }, [navigate]);

  const handleReview = useCallback(() => {
    navigate({ to: '/review' });
  }, [navigate]);

  if (!currentQuiz || !currentQuestion) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (currentQuiz.isCompleted && quizResult) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <ResultsSummary result={quizResult} />

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button size="lg" onClick={handleReview}>
            <CheckCircle className="mr-2 h-5 w-5" />
            Revoir les réponses
          </Button>
          <Button size="lg" variant="outline" onClick={handleExit}>
            <Home className="mr-2 h-5 w-5" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      {/* Quiz header */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Timer */}
            <Timer
              timeRemaining={timeRemaining}
              totalTime={QUIZ_CONFIG.timeLimit}
            />

            {/* Progress summary */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-sm">
                <span className="font-semibold">{progress.answered}</span>
                <span className="text-muted-foreground">
                  /{progress.total} répondues
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExitDialog(true)}
              >
                Quitter
              </Button>
              <Button size="sm" onClick={() => setShowSubmitDialog(true)}>
                <Send className="mr-2 h-4 w-4" />
                Terminer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Question area */}
          <div className="lg:col-span-3">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentQuiz.currentQuestionIndex + 1}
              totalQuestions={currentQuiz.questions.length}
              selectedChoiceIndex={currentAnswer?.selectedChoiceIndex ?? null}
              onSelectChoice={handleSelectChoice}
              disabled={currentQuiz.isCompleted}
            />

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={quizActions.prevQuestion}
                disabled={currentQuiz.currentQuestionIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>

              <span className="hidden sm:inline text-sm text-muted-foreground">
                Utilisez <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">←</kbd>{' '}
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">→</kbd> pour naviguer
              </span>

              <Button
                onClick={quizActions.nextQuestion}
                disabled={
                  currentQuiz.currentQuestionIndex ===
                  currentQuiz.questions.length - 1
                }
              >
                Suivant
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-40">
              <h3 className="text-sm font-semibold mb-3">Progression</h3>
              <QuizProgress
                answers={currentQuiz.answers}
                currentIndex={currentQuiz.currentQuestionIndex}
                onNavigate={quizActions.goToQuestion}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit confirmation dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminer l'examen ?</DialogTitle>
            <DialogDescription>
              {unansweredCount > 0 ? (
                <span className="text-amber-600">
                  Attention : {unansweredCount} question
                  {unansweredCount > 1 ? 's' : ''} non répondue
                  {unansweredCount > 1 ? 's' : ''}.
                </span>
              ) : (
                'Vous avez répondu à toutes les questions.'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Une fois terminé, vous ne pourrez plus modifier vos réponses.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Continuer le quiz
            </Button>
            <Button onClick={handleSubmit}>Confirmer et terminer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit confirmation dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Quitter le quiz ?
            </DialogTitle>
            <DialogDescription>
              Votre progression sera perdue si vous quittez maintenant.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>
              Continuer le quiz
            </Button>
            <Button variant="destructive" onClick={handleExit}>
              Quitter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time up dialog */}
      <Dialog open={showTimeUpDialog} onOpenChange={() => { }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Temps écoulé !
            </DialogTitle>
            <DialogDescription>
              Le temps imparti est terminé. Vos réponses ont été enregistrées
              automatiquement.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowTimeUpDialog(false)}>
              Voir mes résultats
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
