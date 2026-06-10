/**
 * Review screen — step through a quiz's answers one at a time. The default
 * view stays light (app bar · correctness filter · the question · a fixed
 * prev/next bar); secondary data lives in bottom sheets:
 *  - Filtres  → thème / type filters
 *  - Grille   → the full question grid
 *  - Résumé   → score ring + per-topic breakdown
 * Shared by /review and /review/[quizId].
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, ActivityIndicator, Pressable, Modal, Animated } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { router } from 'expo-router';
import { useStore } from '@tanstack/react-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  List,
  AlertCircle,
  Layers,
  SlidersHorizontal,
  LayoutGrid,
  Trophy,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AppText, Heading } from '@/components/ui/Text';
import { EmptyState } from '@/components/ui/EmptyState';
import { TopicProgressBar } from '@/components/TopicProgressBar';
import { QuestionCard } from '@/components/QuestionCard';
import { QuizProgress } from '@/components/QuizProgress';
import { appStore, quizActions } from '@/stores/quizStore';
import { getTopicName, getTopicColor, getQuestionTypeColor } from '@/utils/questions';
import { isTopicId } from '@/utils/typeGuards';
import { haptics } from '@/services/haptics';
import { QUIZ_CONFIG, type QuestionType, type TopicId } from '@/types';
import { useThemeColors } from '@/theme/useTheme';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'correct' | 'incorrect';

export function ReviewScreen({ quizId }: { quizId?: string }) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const currentQuiz = useStore(appStore, (state) => state.currentQuiz);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<FilterType>('all');
  const [topicFilter, setTopicFilter] = useState<TopicId | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all');
  const [loadError, setLoadError] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const open = (set: (v: boolean) => void) => {
    haptics.selection();
    set(true);
  };

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

  // Keep the shown question if it still matches; otherwise snap to the first match.
  useEffect(() => {
    if (filteredIndices.length > 0 && !filteredIndices.includes(currentIndex)) {
      setCurrentIndex(filteredIndices[0]);
    }
  }, [filteredIndices, currentIndex]);

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
  const advancedActiveCount = (typeFilter !== 'all' ? 1 : 0) + (topicFilter !== 'all' ? 1 : 0);

  const goToPrev = () => {
    if (currentFilteredPosition > 0) setCurrentIndex(filteredIndices[currentFilteredPosition - 1]);
  };
  const goToNext = () => {
    if (currentFilteredPosition < filteredIndices.length - 1)
      setCurrentIndex(filteredIndices[currentFilteredPosition + 1]);
  };

  const resetAdvanced = () => {
    setTypeFilter('all');
    setTopicFilter('all');
  };
  const resetFilters = () => {
    setFilter('all');
    resetAdvanced();
  };

  // Grid navigation should always land on the chosen question, so clear filters.
  const navigateFromGrid = (i: number) => {
    resetFilters();
    setCurrentIndex(i);
    setGridOpen(false);
  };

  if (loadError) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center px-6"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <EmptyState
          icon={<AlertCircle size={56} color={c.mutedForeground} />}
          title="Quiz non disponible"
          description="Ce quiz n'est plus disponible pour révision."
        >
          <Button title="Voir les statistiques" variant="outline" fullWidth onPress={() => router.replace('/stats')} />
          <Button title="Retour à l'accueil" fullWidth onPress={() => router.replace('/')} />
        </EmptyState>
      </View>
    );
  }

  if (!currentQuiz || !currentQuiz.isCompleted || !currentQuestion || !currentAnswer) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={c.primary} />
        <AppText color="muted" className="mt-4">
          Chargement…
        </AppText>
      </View>
    );
  }

  const totalQ = currentQuiz.questions.length;
  const scorePct = Math.round((correctCount / totalQ) * 100);
  const passed = scorePct >= QUIZ_CONFIG.passingScore * 100;
  const statusColor = passed ? c.green600 : c.red600;
  const hasMatches = filteredIndices.length > 0;
  const posText = hasMatches ? `${currentFilteredPosition + 1} / ${filteredIndices.length}` : '0 / 0';

  return (
    <View className="flex-1 bg-background">
      {/* App bar */}
      <View
        style={{ paddingTop: insets.top + 6 }}
        className="px-2 pb-2 flex-row items-center border-b border-border bg-background"
      >
        <NavIcon
          label="Retour"
          icon={<ArrowLeft size={22} color={c.foreground} />}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
        <Heading size="h2" className="flex-1 text-center" numberOfLines={1}>
          Révision
        </Heading>
        <ScoreChip pct={scorePct} passed={passed} green={c.green600} red={c.red600} onPress={() => open(setResumeOpen)} />
      </View>

      {/* Correctness filter + advanced filters trigger */}                                                        
      <View className="px-4 pt-3 pb-3 flex-row items-center gap-2 border-b border-border">                                                                                           
        <View                                                                                                                                                                        
          className="flex-1 flex-row bg-secondary rounded-xl p-1"                                                                                                                    
          accessibilityRole="tablist"                                                                                                                                                
          accessibilityLabel="Filtrer par exactitude"                                                                                                                                
        >                                                                                                                                                                            
          <Segment active={filter === 'all'} label="Toutes" count={totalQ}                                                                                                           
            icon={<List size={14} color={filter === 'all' ? c.foreground : c.mutedForeground} />}                                                                                    
            onPress={() => setFilter('all')} />                                                                                                                                      
          <Segment active={filter === 'correct'} label="Justes" count={correctCount}                                                                                                 
            icon={<CheckCircle size={14} color={c.green600} />}                                                                                                                      
            onPress={() => setFilter('correct')} />                                                                                                                                  
          <Segment active={filter === 'incorrect'} label="Fausses" count={incorrectCount}                                                                                            
            icon={<XCircle size={14} color={c.red600} />}                                                                                                                            
            onPress={() => setFilter('incorrect')} />                                                                                                                                
        </View>                                                                                                                                                                      
        <FilterButton count={advancedActiveCount} color={c.foreground} onPress={() => open(setFilterOpen)} />                                                                        
      </View>        
      {/* The question (primary content) */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {hasMatches ? (
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={totalQ}
            selectedChoiceIndex={currentAnswer.selectedChoiceIndex}
            onSelectChoice={() => {}}
            isReviewMode
            showExplanation
          />
        ) : (
          <Card>
            <View className="py-8 items-center">
              <AppText color="muted" className="text-center mb-4">
                Aucune question ne correspond aux filtres sélectionnés.
              </AppText>
              <Button title="Réinitialiser les filtres" variant="outline" onPress={resetFilters} />
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Fixed bottom navigation */}
      <View
        style={{ paddingBottom: insets.bottom + 12 }}
        className="px-4 pt-3 bg-card border-t border-border flex-row items-center gap-3"
      >
        <Button
          title="Précédent"
          variant="outline"
          onPress={goToPrev}
          disabled={currentFilteredPosition <= 0}
          icon={<ChevronLeft size={18} color={c.foreground} />}
          className="flex-1"
        />
        <GridButton posText={posText} color={c.foreground} onPress={() => open(setGridOpen)} />
        <Button
          title="Suivant"
          onPress={goToNext}
          disabled={!hasMatches || currentFilteredPosition >= filteredIndices.length - 1}
          iconRight={<ChevronRight size={18} color={c.primaryForeground} />}
          className="flex-1"
        />
      </View>

      {/* Filtres sheet */}
      <Sheet visible={filterOpen} onClose={() => setFilterOpen(false)} c={c} insets={insets}>
        <Heading size="h3">Filtres</Heading>

        <View>
            <AppText size="caption" weight="semibold" color="muted" className="mb-2 uppercase tracking-wide">
              Type de question
            </AppText>
            <View className="flex-row flex-wrap gap-2">
              <Chip active={typeFilter === 'all'} onPress={() => setTypeFilter('all')}
                icon={<Layers size={14} color={typeFilter === 'all' ? '#fff' : c.foreground} />} label={`Tous (${totalQ})`} />
              <Chip active={typeFilter === 'knowledge'} onPress={() => setTypeFilter('knowledge')}
                dot={getQuestionTypeColor('knowledge')} label={`Connaissance (${knowledgeCount})`} />
              <Chip active={typeFilter === 'situational'} onPress={() => setTypeFilter('situational')}
                dot={getQuestionTypeColor('situational')} label={`Situation (${situationalCount})`} />
            </View>
          </View>

          <View>
            <AppText size="caption" weight="semibold" color="muted" className="mb-2 uppercase tracking-wide">
              Thème
            </AppText>
            <View className="flex-row flex-wrap gap-2">
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
            </View>
          </View>

          {advancedActiveCount > 0 ? (
            <Pressable onPress={resetAdvanced} accessibilityRole="button" className="self-start" hitSlop={8}>
              <AppText size="body" weight="semibold" color="primary">
                Réinitialiser thème et type
              </AppText>
            </Pressable>
          ) : null}
      </Sheet>

      {/* Grille sheet */}
      <Sheet visible={gridOpen} onClose={() => setGridOpen(false)} c={c} insets={insets}>
        <View>
          <Heading size="h3" className="mb-1">
            Toutes les questions
          </Heading>
          <AppText color="muted" className="mb-4">
            Touchez un numéro pour y accéder
          </AppText>
          <QuizProgress
            answers={currentQuiz.answers}
            currentIndex={currentIndex}
            onNavigate={navigateFromGrid}
            isReviewMode
          />
        </View>
      </Sheet>

      {/* Résumé sheet */}
      <Sheet visible={resumeOpen} onClose={() => setResumeOpen(false)} c={c} insets={insets}>
        <Heading size="h3">Résumé</Heading>
        <View className="flex-row items-center gap-4">
          <ScoreRing pct={scorePct} color={statusColor} track={c.border} />
          <View className="flex-1 gap-2">
            <View className="flex-row items-baseline gap-1.5">
              <AppText weight="bold" className="text-2xl" style={{ fontVariant: ['tabular-nums'] }}>
                {correctCount}
              </AppText>
              <AppText size="body" color="muted">
                / {totalQ} bonnes réponses
              </AppText>
            </View>
            <StatusPill passed={passed} green={c.green600} red={c.red600} />
            <AppText size="caption" color="muted">
              Seuil de réussite : {Math.round(QUIZ_CONFIG.passingScore * 100)} %
            </AppText>
          </View>
        </View>

        <View>
          <AppText size="caption" weight="semibold" color="muted" className="mb-2 uppercase tracking-wide">
            Résumé par thème
          </AppText>
          <View className="gap-3">
            {Object.entries(topicStats).map(([topicId, st]) => (
              <TopicProgressBar
                key={topicId}
                topicId={topicId as TopicId}
                correct={st.correct}
                total={st.total}
                percentage={Math.round((st.correct / st.total) * 100)}
                colorMode="passfail"
                showDot
                height={6}
              />
            ))}
          </View>
        </View>
      </Sheet>
    </View>
  );
}

/**
 * Bottom sheet built on RN's core Modal — no portal / navigation-context coupling.
 * The backdrop fades while the panel slides up (matching the gorhom sheet on the
 * quiz screen), rather than Modal's built-in `slide` which drags the backdrop up too.
 */
function Sheet({
  visible,
  onClose,
  c,
  insets,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  c: ReturnType<typeof useThemeColors>;
  insets: EdgeInsets;
  children: React.ReactNode;
}) {
  // Keep the Modal mounted through the exit animation.
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;
  const sheetHeight = useRef(0);
  // translateY is driven imperatively so it can use the measured panel height.
  const translateY = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      return;
    }
    // Animate out, then unmount.
    Animated.parallel([
      Animated.timing(progress, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(translateY, {
        toValue: sheetHeight.current || 600,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible, progress, translateY]);

  // Once mounted (and measured), animate in.
  useEffect(() => {
    if (!mounted) return;
    Animated.parallel([
      Animated.timing(progress, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 22,
        stiffness: 240,
        mass: 0.9,
        useNativeDriver: true,
      }),
    ]).start();
  }, [mounted, progress, translateY]);

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: progress }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fermer"
            onPress={onClose}
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          />
        </Animated.View>
        <Animated.View
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0) sheetHeight.current = h;
          }}
          style={{
            backgroundColor: c.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: insets.bottom + 20,
            maxHeight: '85%',
            transform: [{ translateY }],
          }}
        >
          <View
            style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: c.border, marginBottom: 12 }}
          />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 4 }}>
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

/** Circular score gauge with the percentage centered. */
function ScoreRing({
  pct,
  color,
  track,
  size = 84,
  stroke = 8,
}: {
  pct: number;
  color: string;
  track: string;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = circ * (1 - clamped / 100);
  const cxy = size / 2;
  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={cxy} cy={cxy} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={cxy}
          cy={cxy}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <AppText weight="bold" className="text-xl" style={{ color, fontVariant: ['tabular-nums'] }}>
        {clamped}%
      </AppText>
    </View>
  );
}

/** Borderless ghost icon button for the app bar. */
function NavIcon({ label, icon, onPress }: { label: string; icon: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="w-11 h-11 rounded-full items-center justify-center active:bg-secondary"
    >
      {icon}
    </Pressable>
  );
}

/** Compact pass/fail score pill in the app bar — opens the Résumé sheet. */
function ScoreChip({
  pct,
  passed,
  green,
  red,
  onPress,
}: {
  pct: number;
  passed: boolean;
  green: string;
  red: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={`Score ${pct} %, voir le résumé`}
      className={cn('flex-row items-center gap-1.5 h-9 px-2.5 rounded-full', passed ? 'bg-green-50' : 'bg-red-50')}
    >
      {passed ? <Trophy size={14} color={green} /> : <XCircle size={14} color={red} />}
      <AppText
        size="body"
        weight="bold"
        className={passed ? 'text-green-700' : 'text-red-700'}
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {pct}%
      </AppText>
    </Pressable>
  );
}

/** Advanced-filters trigger — a square button matching the segmented control's height. */
function FilterButton({ count, color, onPress }: { count: number; color: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel="Filtres thème et type"
      className="h-14 px-3 rounded-xl bg-secondary items-center justify-center active:opacity-80"
    >
      <SlidersHorizontal size={20} color={color} />
      {count > 0 ? (
        <View className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary items-center justify-center border-2 border-background">
          <AppText size="caption" weight="bold" color="white">
            {count}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

/** Center control of the bottom bar: position + opens the question grid. */
function GridButton({ posText, color, onPress }: { posText: string; color: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel="Grille des questions"
      className="items-center justify-center px-2 active:opacity-70"
      style={{ minHeight: 48 }}
    >
      <LayoutGrid size={20} color={color} />
      <AppText size="caption" color="muted" className="mt-0.5" style={{ fontVariant: ['tabular-nums'] }}>
        {posText}
      </AppText>
    </Pressable>
  );
}

/** Pass/fail badge shown in the Résumé sheet. */
function StatusPill({ passed, green, red }: { passed: boolean; green: string; red: string }) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-1.5 px-2.5 py-1 rounded-full self-start',
        passed ? 'bg-green-50' : 'bg-red-50'
      )}
    >
      {passed ? <Trophy size={13} color={green} /> : <XCircle size={13} color={red} />}
      <AppText size="caption" weight="semibold" className={passed ? 'text-green-700' : 'text-red-700'}>
        {passed ? 'Réussi' : 'Échoué'}
      </AppText>
    </View>
  );
}

/** One segment of the correctness segmented control. */
function Segment({
  active,
  label,
  count,
  icon,
  onPress,
}: {
  active: boolean;
  label: string;
  count: number;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${label}, ${count}`}
      className={cn(
        'flex-1 flex-row items-center justify-center gap-1 rounded-lg',
        active ? 'bg-card shadow-sm shadow-black/5' : ''
      )}
      style={{ height: 40 }}
    >
      {icon}
      <AppText
        size="body"
        weight={active ? 'semibold' : 'medium'}
        color={active ? 'default' : 'muted'}
        numberOfLines={1}
        className="text-[13px]"
      >
        {label}
      </AppText>
      <AppText size="caption" color="muted" style={{ fontVariant: ['tabular-nums'] }}>
        {count}
      </AppText>
    </Pressable>
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
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={cn(
        'flex-row items-center gap-1.5 px-3.5 rounded-full border',
        active ? 'bg-primary border-primary' : 'bg-background border-border'
      )}
      style={{ height: 40 }}
    >
      {icon}
      {dot ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} /> : null}
      <AppText size="body" weight="medium" className={active ? 'text-primary-foreground' : 'text-foreground'}>
        {label}
      </AppText>
    </Pressable>
  );
}
