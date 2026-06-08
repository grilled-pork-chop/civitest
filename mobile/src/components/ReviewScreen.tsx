/**
 * Review screen — review answers for the current or a historical quiz, with
 * correctness/topic/type filters. Shared by /review and /review/[quizId].
 */

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { useReducedMotion } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useStore } from '@tanstack/react-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  RotateCcw,
  CheckCircle,
  XCircle,
  List,
  AlertCircle,
  Layers,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { QuestionCard } from '@/components/QuestionCard';
import { QuizProgress } from '@/components/QuizProgress';
import { appStore, quizActions } from '@/stores/quizStore';
import { useQuestions } from '@/lib/queries';
import { getTopicName, getTopicColor, getQuestionTypeColor } from '@/utils/questions';
import { isTopicId } from '@/utils/typeGuards';
import type { QuestionType, TopicId } from '@/types';
import { useThemeColors } from '@/theme/useTheme';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'correct' | 'incorrect';

export function ReviewScreen({ quizId }: { quizId?: string }) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const c = useThemeColors();
  const currentQuiz = useStore(appStore, (state) => state.currentQuiz);
  const { data: questions } = useQuestions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<FilterType>('all');
  const [topicFilter, setTopicFilter] = useState<TopicId | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (quizId) {
      const loaded = quizActions.loadQuizForReview(quizId);
      if (!loaded) setLoadError(true);
    }
  }, [quizId]);

  useEffect(() => {
    if (!quizId && (!currentQuiz || !currentQuiz.isCompleted)) {
      router.replace('/');
    }
  }, [currentQuiz, quizId]);

  const filteredIndices = useMemo(() => {
    if (!currentQuiz) return [];
    return currentQuiz.answers
      .map((answer, index) => ({ answer, index }))
      .filter(({ answer, index }) => {
        const question = currentQuiz.questions[index];
        if (filter === 'correct' && !answer.isCorrect) return false;
        if (filter === 'incorrect' && answer.isCorrect) return false;
        if (topicFilter !== 'all' && question.topic !== topicFilter) return false;
        if (typeFilter !== 'all' && question.type !== typeFilter) return false;
        return true;
      })
      .map(({ index }) => index);
  }, [currentQuiz, filter, topicFilter, typeFilter]);

  useEffect(() => {
    if (filteredIndices.length > 0) setCurrentIndex(filteredIndices[0]);
  }, [filteredIndices]);

  const correctCount = useMemo(
    () => currentQuiz?.answers.filter((a) => a.isCorrect).length ?? 0,
    [currentQuiz?.answers]
  );
  const incorrectCount = useMemo(
    () => currentQuiz?.answers.filter((a) => !a.isCorrect).length ?? 0,
    [currentQuiz?.answers]
  );
  const knowledgeCount = useMemo(
    () => currentQuiz?.questions.filter((q) => q.type === 'knowledge').length ?? 0,
    [currentQuiz?.questions]
  );
  const situationalCount = useMemo(
    () => currentQuiz?.questions.filter((q) => q.type === 'situational').length ?? 0,
    [currentQuiz?.questions]
  );

  const topicStats = useMemo(() => {
    if (!currentQuiz) return {} as Record<TopicId, { correct: number; total: number }>;
    return currentQuiz.questions.reduce(
      (acc, question, index) => {
        const answer = currentQuiz.answers[index];
        if (!acc[question.topic]) acc[question.topic] = { correct: 0, total: 0 };
        acc[question.topic].total++;
        if (answer.isCorrect) acc[question.topic].correct++;
        return acc;
      },
      {} as Record<TopicId, { correct: number; total: number }>
    );
  }, [currentQuiz]);

  const currentFilteredPosition = filteredIndices.indexOf(currentIndex);
  const currentQuestion = currentQuiz?.questions[currentIndex];
  const currentAnswer = currentQuiz?.answers[currentIndex];

  const goToPrev = () => {
    if (currentFilteredPosition > 0) setCurrentIndex(filteredIndices[currentFilteredPosition - 1]);
  };
  const goToNext = () => {
    if (currentFilteredPosition < filteredIndices.length - 1)
      setCurrentIndex(filteredIndices[currentFilteredPosition + 1]);
  };

  const handleNewQuiz = () => {
    if (questions) {
      quizActions.startQuiz(questions);
      router.replace('/quiz');
    }
  };

  if (loadError) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center px-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <AlertCircle size={56} color={c.mutedForeground} />
        <Text className="text-2xl font-display mt-4 mb-2 text-foreground text-center">
          Quiz non disponible
        </Text>
        <Text className="text-muted-foreground mb-6 text-center">
          Ce quiz n'est plus disponible pour révision.
        </Text>
        <View className="gap-3 w-full">
          <Button title="Voir les statistiques" variant="outline" fullWidth onPress={() => router.replace('/stats')} />
          <Button title="Retour à l'accueil" fullWidth onPress={() => router.replace('/')} />
        </View>
      </View>
    );
  }

  if (!currentQuiz || !currentQuiz.isCompleted || !currentQuestion || !currentAnswer) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={c.primary} />
        <Text className="text-muted-foreground mt-4">Chargement…</Text>
      </View>
    );
  }

  const totalQ = currentQuiz.questions.length;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-3 bg-card border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-display text-foreground">Révision</Text>
            <Text className="text-muted-foreground text-xs">
              {correctCount}/{totalQ} bonnes réponses ({Math.round((correctCount / totalQ) * 100)}%)
            </Text>
          </View>
          <View className="flex-row gap-2">
            <Button
              title="Accueil"
              variant="outline"
              size="sm"
              onPress={() => router.replace('/')}
              icon={<Home size={16} color={c.foreground} />}
            />
            <Button
              title="Rejouer"
              size="sm"
              onPress={handleNewQuiz}
              icon={<RotateCcw size={16} color={c.primaryForeground} />}
            />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Correctness filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip active={filter === 'all'} onPress={() => setFilter('all')} icon={<List size={14} color={filter === 'all' ? '#fff' : c.foreground} />} label={`Toutes (${totalQ})`} />
          <Chip active={filter === 'correct'} onPress={() => setFilter('correct')} icon={<CheckCircle size={14} color={filter === 'correct' ? '#fff' : c.green600} />} label={`Correctes (${correctCount})`} />
          <Chip active={filter === 'incorrect'} onPress={() => setFilter('incorrect')} icon={<XCircle size={14} color={filter === 'incorrect' ? '#fff' : c.red600} />} label={`Incorrectes (${incorrectCount})`} />
        </ScrollView>

        {/* Type filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip active={typeFilter === 'all'} onPress={() => setTypeFilter('all')} icon={<Layers size={14} color={typeFilter === 'all' ? '#fff' : c.foreground} />} label={`Tous (${totalQ})`} />
          <Chip active={typeFilter === 'knowledge'} onPress={() => setTypeFilter('knowledge')} dot={getQuestionTypeColor('knowledge')} label={`Connaissance (${knowledgeCount})`} />
          <Chip active={typeFilter === 'situational'} onPress={() => setTypeFilter('situational')} dot={getQuestionTypeColor('situational')} label={`Situation (${situationalCount})`} />
        </ScrollView>

        {/* Topic filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip active={topicFilter === 'all'} onPress={() => setTopicFilter('all')} label="Tous les thèmes" />
          {Object.entries(topicStats).map(([topicId, st]) => (
            <Chip
              key={topicId}
              active={topicFilter === topicId}
              onPress={() => setTopicFilter(isTopicId(topicId) ? topicId : 'all')}
              dot={getTopicColor(topicId as TopicId)}
              label={`${getTopicName(topicId as TopicId, true)} (${st.correct}/${st.total})`}
            />
          ))}
        </ScrollView>

        {/* Current question */}
        {filteredIndices.length > 0 ? (
          <>
            <MotiView
              key={currentIndex}
              from={{ opacity: reduceMotion ? 1 : 0, translateY: reduceMotion ? 0 : 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: reduceMotion ? 0 : 200 }}
            >
              <QuestionCard
                question={currentQuestion}
                questionNumber={currentIndex + 1}
                totalQuestions={totalQ}
                selectedChoiceIndex={currentAnswer.selectedChoiceIndex}
                onSelectChoice={() => {}}
                isReviewMode
                showExplanation
              />
            </MotiView>
            <View className="flex-row items-center justify-between">
              <Button title="Précédent" variant="outline" onPress={goToPrev} disabled={currentFilteredPosition <= 0} icon={<ChevronLeft size={18} color={c.foreground} />} />
              <Text className="text-sm text-muted-foreground">
                {currentFilteredPosition + 1} / {filteredIndices.length}
                {filter !== 'all' ? ' (filtrées)' : ''}
              </Text>
              <Button title="Suivant" onPress={goToNext} disabled={currentFilteredPosition >= filteredIndices.length - 1} icon={<ChevronRight size={18} color={c.primaryForeground} />} />
            </View>
          </>
        ) : (
          <Card>
            <View className="py-8 items-center">
              <Text className="text-muted-foreground text-center mb-4">
                Aucune question ne correspond aux filtres sélectionnés.
              </Text>
              <Button
                title="Réinitialiser les filtres"
                variant="outline"
                onPress={() => {
                  setFilter('all');
                  setTopicFilter('all');
                  setTypeFilter('all');
                }}
              />
            </View>
          </Card>
        )}

        {/* Progress grid */}
        <Card>
          <CardHeader>
            <CardTitle>Toutes les questions</CardTitle>
          </CardHeader>
          <QuizProgress
            answers={currentQuiz.answers}
            currentIndex={currentIndex}
            onNavigate={setCurrentIndex}
            isReviewMode
          />
        </Card>

        {/* Topic summary */}
        <Card>
          <CardHeader>
            <CardTitle>Résumé par thème</CardTitle>
          </CardHeader>
          <View className="gap-3">
            {Object.entries(topicStats).map(([topicId, st]) => {
              const percentage = Math.round((st.correct / st.total) * 100);
              const isPassing = percentage >= 80;
              return (
                <View key={topicId}>
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center gap-1.5">
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getTopicColor(topicId as TopicId) }} />
                      <Text className="text-sm text-foreground">{getTopicName(topicId as TopicId, true)}</Text>
                    </View>
                    <Text className={cn('font-medium text-sm', isPassing ? 'text-green-600' : 'text-red-600')}>
                      {percentage}%
                    </Text>
                  </View>
                  <ProgressBar percentage={percentage} color={isPassing ? c.green500 : c.red500} height={6} />
                </View>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

function Chip({
  active,
  onPress,
  label,
  icon,
  dot,
}: {
  active: boolean;
  onPress: () => void;
  label: string;
  icon?: React.ReactNode;
  dot?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={cn(
        'flex-row items-center gap-1.5 px-3 rounded-full border',
        active ? 'bg-primary border-primary' : 'bg-background border-border'
      )}
      style={{ height: 36 }}
    >
      {icon}
      {dot ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} /> : null}
      <Text className={cn('text-sm font-medium', active ? 'text-primary-foreground' : 'text-foreground')}>
        {label}
      </Text>
    </Pressable>
  );
}
