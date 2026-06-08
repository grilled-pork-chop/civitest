/**
 * Quiz screen — interactive timed exam with swipe navigation, progress sheet,
 * and confirmation dialogs. Domain logic (timer, scoring) is preserved from
 * the store/hook layer.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, BackHandler } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '@tanstack/react-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useReducedMotion } from 'react-native-reanimated';
import { MotiView } from 'moti';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight, Send, LayoutGrid, AlertTriangle } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Timer } from '@/components/Timer';
import { QuestionCard } from '@/components/QuestionCard';
import { QuizProgress } from '@/components/QuizProgress';
import { ResultsSummary } from '@/components/ResultsSummary';
import { appStore, quizActions, quizSelectors } from '@/stores/quizStore';
import { useQuizTimer } from '@/hooks/useQuizTimer';
import { QUIZ_CONFIG } from '@/types';
import type { QuizResult } from '@/types';
import { colors } from '@/theme/tokens';

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const currentQuiz = useStore(appStore, (state) => state.currentQuiz);
  const currentQuestion = useStore(appStore, quizSelectors.getCurrentQuestion);
  const currentAnswer = useStore(appStore, quizSelectors.getCurrentAnswer);
  const unansweredCount = useStore(appStore, quizSelectors.getUnansweredCount);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const sheetRef = useRef<BottomSheetModal>(null);
  const reduceMotion = useReducedMotion();

  // If there's no quiz (e.g. deep link), go home.
  useEffect(() => {
    if (!currentQuiz) router.replace('/');
  }, [currentQuiz]);

  const handleTimeUp = useCallback(() => {
    const result = quizActions.endQuiz();
    if (result) {
      setQuizResult(result);
      Haptics.notificationAsync(
        result.passed
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error
      ).catch(() => {});
    }
  }, []);

  const timeRemaining = useQuizTimer(handleTimeUp);

  const handleSelectChoice = useCallback(
    (choiceIndex: number) => {
      if (!currentQuiz || currentQuiz.isCompleted) return;
      quizActions.answerQuestion(currentQuiz.currentQuestionIndex, choiceIndex);
    },
    [currentQuiz]
  );

  const handleSubmit = useCallback(() => {
    const result = quizActions.endQuiz();
    if (result) {
      setQuizResult(result);
      Haptics.notificationAsync(
        result.passed
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error
      ).catch(() => {});
    }
    setShowSubmitDialog(false);
  }, []);

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
  }, [activeIndex]);

  const goNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    quizActions.nextQuestion();
  }, []);
  const goPrev = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    quizActions.prevQuestion();
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
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted-foreground mt-4">Chargement…</Text>
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
  const answeredCount = totalQuestions - unansweredCount;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="px-4 pb-3 bg-card border-b border-border"
      >
        <View className="flex-row items-center justify-between gap-3">
          <Timer timeRemaining={timeRemaining} totalTime={QUIZ_CONFIG.timeLimit} />
          <View className="flex-row items-center gap-2">
            <Button
              title="Grille"
              variant="outline"
              size="sm"
              onPress={() => sheetRef.current?.present()}
              icon={<LayoutGrid size={18} color={colors.foreground} />}
            />
            <Button
              title="Terminer"
              size="sm"
              onPress={() => setShowSubmitDialog(true)}
              icon={<Send size={16} color={colors.primaryForeground} />}
            />
          </View>
        </View>

        {/* Position + progress */}
        <View className="mt-3">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-sm font-semibold text-foreground">
              Question {activeIndex + 1}
              <Text className="text-muted-foreground font-normal"> / {totalQuestions}</Text>
            </Text>
            <Text className="text-xs text-muted-foreground">
              {answeredCount} répondue{answeredCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <ProgressBar percentage={((activeIndex + 1) / totalQuestions) * 100} height={4} />
        </View>
      </View>

      {/* Question (swipeable) */}
      <GestureDetector gesture={swipe}>
        <ScrollView
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
            <Text className="text-center text-xs text-muted-foreground mt-4">
              Glissez à gauche ou à droite pour naviguer
            </Text>
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
          icon={<ChevronLeft size={20} color={colors.foreground} />}
          className="flex-1"
        />
        <Button
          title={isLast ? 'Terminer' : 'Suivant'}
          onPress={isLast ? () => setShowSubmitDialog(true) : goNext}
          icon={isLast ? <Send size={18} color={colors.primaryForeground} /> : undefined}
          iconRight={isLast ? undefined : <ChevronRight size={20} color={colors.primaryForeground} />}
          className="flex-[2]"
        />
      </View>

      {/* Progress bottom sheet */}
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['60%']}
        backgroundStyle={{ backgroundColor: colors.card }}
        handleIndicatorStyle={{ backgroundColor: colors.border }}
      >
        <BottomSheetView style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }}>
          <Text className="text-lg font-bold text-foreground mb-1">Progression</Text>
          <Text className="text-sm text-muted-foreground mb-4">
            Touchez un numéro pour y accéder
          </Text>
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
        onConfirm={handleSubmit}
        onCancel={() => setShowSubmitDialog(false)}
      />
      <ConfirmDialog
        visible={showExitDialog}
        title="Quitter"
        description="Votre progression sera perdue."
        confirmLabel="Quitter"
        confirmVariant="destructive"
        icon={<AlertTriangle size={20} color={colors.warning} />}
        onConfirm={handleExit}
        onCancel={() => setShowExitDialog(false)}
      />
    </View>
  );
}
