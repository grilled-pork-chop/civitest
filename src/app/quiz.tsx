/**
 * Quiz screen — interactive timed exam with swipe navigation, pause/resume,
 * a progress sheet, and confirmation dialogs. Domain logic (timer, scoring) is
 * preserved from the store/hook layer.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, ScrollView, ActivityIndicator, BackHandler } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '@tanstack/react-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useReducedMotion } from 'react-native-reanimated';
import { MotiView } from 'moti';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  LayoutGrid,
  AlertTriangle,
  Pause,
  Play,
  CheckCircle2,
  Circle,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AppText, Heading } from '@/components/ui/Text';
import { Timer } from '@/components/Timer';
import { QuestionCard } from '@/components/QuestionCard';
import { QuizProgress } from '@/components/QuizProgress';
import { ResultsSummary } from '@/components/ResultsSummary';
import { appStore, quizActions, quizSelectors } from '@/stores/quizStore';
import { useQuizTimer } from '@/hooks/useQuizTimer';
import { haptics } from '@/services/haptics';
import { useThemeColors } from '@/theme/useTheme';
import { formatTime } from '@/utils/questions';
import type { QuizResult } from '@/types';

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const currentQuiz = useStore(appStore, (state) => state.currentQuiz);
  const currentQuestion = useStore(appStore, quizSelectors.getCurrentQuestion);
  const currentAnswer = useStore(appStore, quizSelectors.getCurrentAnswer);
  const unansweredCount = useStore(appStore, quizSelectors.getUnansweredCount);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const sheetRef = useRef<BottomSheetModal>(null);
  const scrollRef = useRef<ScrollView>(null);
  const reduceMotion = useReducedMotion();

  // If there's no quiz (e.g. deep link), go home.
  useEffect(() => {
    if (!currentQuiz) router.replace('/');
  }, [currentQuiz]);

  const finishQuiz = useCallback(() => {
    const result = quizActions.endQuiz();
    if (result) {
      setQuizResult(result);
      haptics.notify(result.passed ? 'success' : 'error');
    }
  }, []);

  const timeRemaining = useQuizTimer(finishQuiz);

  const handleSelectChoice = useCallback(
    (choiceIndex: number) => {
      if (!currentQuiz || currentQuiz.isCompleted) return;
      quizActions.answerQuestion(currentQuiz.currentQuestionIndex, choiceIndex);
    },
    [currentQuiz]
  );

  const handleSubmit = useCallback(() => {
    finishQuiz();
    setShowSubmitDialog(false);
  }, [finishQuiz]);

  // Tap-outside / dim backdrop so the progress sheet can be dismissed by tapping away.
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  const handleExit = useCallback(() => {
    quizActions.clearQuiz();
    router.replace('/');
  }, []);

  // Android hardware back → confirm exit while exam is in progress.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentQuiz && !currentQuiz.isCompleted) {
        setShowExitDialog(true);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [currentQuiz]);

  const isLast =
    !!currentQuiz && currentQuiz.currentQuestionIndex === currentQuiz.questions.length - 1;

  // Track navigation direction so question transitions slide the right way.
  const activeIndex = currentQuiz?.currentQuestionIndex ?? 0;
  const prevIndexRef = useRef(activeIndex);
  const direction = activeIndex >= prevIndexRef.current ? 1 : -1;
  useEffect(() => {
    prevIndexRef.current = activeIndex;
    // Auto-scroll back to the top of each new question.
    scrollRef.current?.scrollTo({ y: 0, animated: !reduceMotion });
  }, [activeIndex, reduceMotion]);

  const goNext = useCallback(() => {
    haptics.impact('light');
    quizActions.nextQuestion();
  }, []);
  const goPrev = useCallback(() => {
    haptics.impact('light');
    quizActions.prevQuestion();
  }, []);

  const jumpToFirstUnanswered = useCallback(() => {
    const idx = appStore.state.currentQuiz?.answers.findIndex(
      (a) => a.selectedChoiceIndex === null
    );
    if (idx != null && idx >= 0) quizActions.goToQuestion(idx);
    setShowSubmitDialog(false);
  }, []);

  // Swipe gesture: left → next, right → prev.
  const swipe = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onEnd((e) => {
      if (e.translationX < -50) {
        runOnJS(goNext)();
      } else if (e.translationX > 50) {
        runOnJS(goPrev)();
      }
    });

  if (!currentQuiz || !currentQuestion) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={c.primary} />
        <AppText color="muted" className="mt-4">
          Chargement…
        </AppText>
      </View>
    );
  }

  // Completed → results
  if (currentQuiz.isCompleted && quizResult) {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 16,
        }}
      >
        <ResultsSummary result={quizResult} />
        <View className="gap-3 mt-6">
          <Button
            title="Revoir les réponses"
            size="lg"
            fullWidth
            onPress={() => router.replace('/review')}
          />
          <Button title="Retour à l'accueil" size="lg" variant="outline" fullWidth onPress={handleExit} />
        </View>
      </ScrollView>
    );
  }

  const totalQuestions = currentQuiz.questions.length;
  const currentAnswered = (currentAnswer?.selectedChoiceIndex ?? null) !== null;
  const isPaused = currentQuiz.isPaused;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="px-4 pb-3 bg-card border-b border-border"
      >
        <View className="flex-row items-center justify-between gap-3">
          <Timer timeRemaining={timeRemaining} />
          <View className="flex-row items-center gap-2 shrink-0">
            <Button
              title="Pause"
              variant="outline"
              size="sm"
              onPress={() => quizActions.pauseQuiz()}
              icon={<Pause size={18} color={c.foreground} />}
            />
            <Button
              title="Terminer"
              size="sm"
              onPress={() => setShowSubmitDialog(true)}
              icon={<Send size={16} color={c.primaryForeground} />}
            />
          </View>
        </View>

        {/* Position + per-question status */}
        <View className="mt-3">
          <View className="flex-row items-center justify-between mb-1.5">
            <AppText weight="semibold" size="title">
              Question {activeIndex + 1}
              <AppText color="muted"> / {totalQuestions}</AppText>
            </AppText>
            <View className="flex-row items-center gap-2">
              <View
                className={`flex-row items-center gap-1 rounded-full px-2 py-0.5 ${
                  currentAnswered ? 'bg-green-50' : 'bg-secondary'
                }`}
              >
                {currentAnswered ? (
                  <CheckCircle2 size={13} color={c.green600} />
                ) : (
                  <Circle size={13} color={c.mutedForeground} />
                )}
                <AppText
                  size="caption"
                  weight="medium"
                  className={currentAnswered ? 'text-green-700' : 'text-muted-foreground'}
                >
                  {currentAnswered ? 'Répondue' : 'Non répondue'}
                </AppText>
              </View>
              <Button
                title="Grille"
                variant="ghost"
                size="sm"
                onPress={() => sheetRef.current?.present()}
                icon={<LayoutGrid size={16} color={c.foreground} />}
              />
            </View>
          </View>
          <ProgressBar percentage={((activeIndex + 1) / totalQuestions) * 100} height={4} />
        </View>
      </View>

      {/* Question (swipeable) */}
      <GestureDetector gesture={swipe}>
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <MotiView
            key={activeIndex}
            from={{ opacity: reduceMotion ? 1 : 0, translateX: reduceMotion ? 0 : direction * 28 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: reduceMotion ? 0 : 220 }}
          >
            <QuestionCard
              question={currentQuestion}
              questionNumber={activeIndex + 1}
              totalQuestions={totalQuestions}
              selectedChoiceIndex={currentAnswer?.selectedChoiceIndex ?? null}
              onSelectChoice={handleSelectChoice}
              disabled={currentQuiz.isCompleted}
            />
          </MotiView>
          {activeIndex === 0 ? (
            <AppText size="caption" color="muted" className="text-center mt-4">
              Glissez à gauche ou à droite pour naviguer
            </AppText>
          ) : null}
        </ScrollView>
      </GestureDetector>

      {/* Bottom action bar */}
      <View
        style={{ paddingBottom: insets.bottom + 12 }}
        className="px-4 pt-3 bg-card border-t border-border flex-row gap-3"
      >
        <Button
          title="Précédent"
          variant="outline"
          onPress={goPrev}
          disabled={activeIndex === 0}
          icon={<ChevronLeft size={20} color={c.foreground} />}
          className="flex-1"
        />
        <Button
          title={isLast ? 'Terminer' : 'Suivant'}
          onPress={isLast ? () => setShowSubmitDialog(true) : goNext}
          icon={isLast ? <Send size={18} color={c.primaryForeground} /> : undefined}
          iconRight={isLast ? undefined : <ChevronRight size={20} color={c.primaryForeground} />}
          className="flex-[2]"
        />
      </View>

      {/* Paused overlay */}
      {isPaused ? (
        <View
          className="absolute inset-0 items-center justify-center bg-primary/95 px-8"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
          <Pause size={56} color="#ffffff" />
          <Heading size="h1" color="white" className="mt-4 mb-1 text-center">
            Examen en pause
          </Heading>
          <AppText className="text-white/80 text-center mb-1">
            Le minuteur est arrêté.
          </AppText>
          <AppText weight="bold" className="text-white text-2xl mb-8">
            {formatTime(timeRemaining)}
          </AppText>
          <View className="w-full max-w-xs gap-3">
            <Button
              title="Reprendre"
              size="lg"
              variant="secondary"
              fullWidth
              onPress={() => quizActions.resumeQuiz()}
              icon={<Play size={20} color={c.primary} />}
            />
            <Button
              title="Quitter l'examen"
              size="lg"
              variant="ghost"
              fullWidth
              textClassName="text-white"
              className="border border-white/40"
              onPress={() => {
                quizActions.resumeQuiz();
                setShowExitDialog(true);
              }}
            />
          </View>
        </View>
      ) : null}

      {/* Progress bottom sheet */}
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['60%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: c.card }}
        handleIndicatorStyle={{ backgroundColor: c.border }}
      >
        <BottomSheetView style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }}>
          <Heading size="h3" className="mb-1">
            Progression
          </Heading>
          <AppText color="muted" className="mb-4">
            Touchez un numéro pour y accéder
          </AppText>
          <QuizProgress
            answers={currentQuiz.answers}
            currentIndex={currentQuiz.currentQuestionIndex}
            onNavigate={(i) => {
              quizActions.goToQuestion(i);
              sheetRef.current?.dismiss();
            }}
          />
        </BottomSheetView>
      </BottomSheetModal>

      {/* Dialogs */}
      <ConfirmDialog
        visible={showSubmitDialog}
        title="Soumettre l'examen ?"
        description={
          unansweredCount > 0
            ? `Attention : ${unansweredCount} question(s) sans réponse.`
            : 'Toutes les questions sont répondues.'
        }
        confirmLabel="Confirmer"
        extraLabel={unansweredCount > 0 ? 'Aller à la 1ʳᵉ sans réponse' : undefined}
        onExtra={unansweredCount > 0 ? jumpToFirstUnanswered : undefined}
        onConfirm={handleSubmit}
        onCancel={() => setShowSubmitDialog(false)}
      />
      <ConfirmDialog
        visible={showExitDialog}
        title="Quitter"
        description="Votre progression sera perdue."
        confirmLabel="Quitter"
        confirmVariant="destructive"
        icon={<AlertTriangle size={20} color={c.warning} />}
        onConfirm={handleExit}
        onCancel={() => setShowExitDialog(false)}
      />
    </View>
  );
}
