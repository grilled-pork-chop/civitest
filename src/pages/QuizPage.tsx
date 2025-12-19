import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Send,
  Home,
  LayoutGrid,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
  const unansweredCount = useStore(appStore, quizSelectors.getUnansweredCount);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [_, setShowTimeUpDialog] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (!currentQuiz) navigate({ to: '/' });
  }, [currentQuiz, navigate]);

  const handleTimeUp = useCallback(() => {
    setShowTimeUpDialog(true);
    const result = quizActions.endQuiz();
    if (result) setQuizResult(result);
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

  // Swipe logic for mobile native feel
  const handleDragEnd = (_: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      if (currentQuiz && currentQuiz.currentQuestionIndex < currentQuiz.questions.length - 1) {
        quizActions.nextQuestion();
      }
    } else if (info.offset.x > swipeThreshold) {
      if (currentQuiz && currentQuiz.currentQuestionIndex > 0) {
        quizActions.prevQuestion();
      }
    }
  };

  const handleSubmit = useCallback(() => {
    const result = quizActions.endQuiz();
    if (result) setQuizResult(result);
    setShowSubmitDialog(false);
  }, []);

  const handleExit = useCallback(() => {
    quizActions.clearQuiz();
    navigate({ to: '/' });
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
          <Button size="lg" onClick={() => navigate({ to: '/review' })}>
            <CheckCircle className="mr-2 h-5 w-5" /> Revoir les réponses
          </Button>
          <Button size="lg" variant="outline" onClick={handleExit}>
            <Home className="mr-2 h-5 w-5" /> Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-slate-50">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Timer timeRemaining={timeRemaining} totalTime={QUIZ_CONFIG.timeLimit} />
            
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="sm:hidden">
                    <LayoutGrid className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85vw] p-0 flex flex-col">
                  <SheetHeader className="p-6 border-b text-left">
                    <SheetTitle>Progression</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto p-6">
                    <QuizProgress
                      answers={currentQuiz.answers}
                      currentIndex={currentQuiz.currentQuestionIndex}
                      onNavigate={quizActions.goToQuestion}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <Button variant="outline" size="sm" onClick={() => setShowExitDialog(true)} className="hidden sm:flex">
                Quitter
              </Button>
              <Button size="sm" onClick={() => setShowSubmitDialog(true)}>
                <Send className="sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Terminer</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 pb-32 sm:pb-8">
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuiz.currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
                className="touch-pan-y"
              >
                <QuestionCard
                  question={currentQuestion}
                  questionNumber={currentQuiz.currentQuestionIndex + 1}
                  totalQuestions={currentQuiz.questions.length}
                  selectedChoiceIndex={currentAnswer?.selectedChoiceIndex ?? null}
                  onSelectChoice={handleSelectChoice}
                  disabled={currentQuiz.isCompleted}
                />
              </motion.div>
            </AnimatePresence>

            {/* DESKTOP NAV */}
            <div className="hidden sm:flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={quizActions.prevQuestion}
                disabled={currentQuiz.currentQuestionIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Précédent
              </Button>
              <Button
                onClick={quizActions.nextQuestion}
                disabled={currentQuiz.currentQuestionIndex === currentQuiz.questions.length - 1}
              >
                Suivant <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-sm font-semibold mb-4 uppercase text-muted-foreground">Progression</h3>
              <QuizProgress
                answers={currentQuiz.answers}
                currentIndex={currentQuiz.currentQuestionIndex}
                onNavigate={quizActions.goToQuestion}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* MOBILE STICKY FOOTER */}
      <footer className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t p-4 pb-8">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl"
            onClick={quizActions.prevQuestion}
            disabled={currentQuiz.currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            className="flex-[3] h-12 rounded-xl font-bold shadow-sm"
            onClick={
              currentQuiz.currentQuestionIndex === currentQuiz.questions.length - 1 
              ? () => setShowSubmitDialog(true) 
              : quizActions.nextQuestion
            }
          >
            {currentQuiz.currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Terminer' : 'Suivant'}
            <ChevronRight className="ml-1 h-5 w-5" />
          </Button>
        </div>
      </footer>

      {/* DIALOGS */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="w-[92vw] rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Soumettre l'examen ?</DialogTitle>
            <DialogDescription>
              {unansweredCount > 0 
                ? `Attention : ${unansweredCount} question(s) sans réponse.` 
                : 'Toutes les questions sont répondues.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row mt-4">
            <Button className="w-full sm:flex-1" onClick={handleSubmit}>Confirmer</Button>
            <Button variant="ghost" className="w-full sm:flex-1" onClick={() => setShowSubmitDialog(false)}>Annuler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="w-[92vw] rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Quitter
            </DialogTitle>
            <DialogDescription>Votre progression sera perdue.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row mt-4">
            <Button variant="destructive" className="w-full sm:flex-1" onClick={handleExit}>Quitter</Button>
            <Button variant="outline" className="w-full sm:flex-1" onClick={() => setShowExitDialog(false)}>Annuler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}