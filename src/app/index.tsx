/**
 * Home screen — adaptive. Returning users get a readiness ring + recent
 * results; first-time users get an editorial intro + a link to the guide.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Play,
  Clock,
  Target,
  BookOpen,
  AlertCircle,
  Calendar,
  ChevronRight,
  BarChart3,
  Settings as SettingsIcon,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tricolor } from '@/components/ui/Tricolor';
import { ReadinessRing } from '@/components/home/ReadinessRing';
import { ResultCard } from '@/components/stats/QuizResultsList';
import { useQuestions } from '@/lib/queries';
import { useQuizStats } from '@/hooks/useQuizStats';
import { quizActions } from '@/stores/quizStore';
import { useThemeColors } from '@/theme/useTheme';
import { haptics } from '@/services/haptics';
import { cn } from '@/lib/utils';

const PASS_THRESHOLD = 80;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const { data: questions, isLoading, error, refetch } = useQuestions();
  const { summary, allResults } = useQuizStats();
  const recentResults = allResults.slice(0, 3);
  const canStart = !!questions && questions.length > 0;

  const handleStartQuiz = () => {
    if (!questions || questions.length === 0) return;
    quizActions.startQuiz(questions);
    router.push('/quiz');
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={c.primary} />
        <Text className="text-muted-foreground mt-4">Chargement des questions…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <EmptyState
          icon={<AlertCircle size={48} color={c.destructive} />}
          title="Erreur de chargement"
          description="Impossible de charger les questions. Veuillez réessayer."
        >
          <Button title="Réessayer" fullWidth onPress={() => refetch()} />
        </EmptyState>
      </View>
    );
  }

  const hasResults = summary.totalQuizzes > 0;

  return (
    <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={['#012a5e', '#002654', '#001d44']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 16 }}
        >
          <View className="px-5 pb-6">
            {/* Top bar */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-white text-xl font-display">CiviTest</Text>
              <View className="flex-row items-center -mr-2">
                <HeaderIconButton
                  onPress={() => router.push('/guide')}
                  icon={<BookOpen size={22} color="#ffffff" />}
                  label="Le guide"
                />
                <HeaderIconButton
                  onPress={() => router.push('/stats')}
                  icon={<BarChart3 size={22} color="#ffffff" />}
                  label="Statistiques"
                />
                <HeaderIconButton
                  onPress={() => router.push('/settings')}
                  icon={<SettingsIcon size={22} color="#ffffff" />}
                  label="Réglages"
                />
              </View>
            </View>

            {hasResults ? (
              /* Returning user — readiness ring */
              <View className="items-center">
                <View
                  accessible
                  accessibilityLabel={`Score moyen ${summary.averageScore} %, objectif ${PASS_THRESHOLD} %`}
                >
                  <ReadinessRing value={summary.averageScore}>
                    <Text className="text-white text-5xl font-display leading-none">
                      {summary.averageScore}
                      <Text className="text-2xl text-white/80 font-display">%</Text>
                    </Text>
                    <Text className="text-white/55 text-[11px] mt-2.5 uppercase tracking-[3px]">
                      moyenne
                    </Text>
                  </ReadinessRing>
                </View>

                <View className="w-full mt-6">
                  <StartButton onPress={handleStartQuiz} disabled={!canStart} />
                </View>

                <View className="flex-row flex-wrap gap-x-5 gap-y-2 mt-6">
                  <Fact icon={<BookOpen size={16} color="#ffffff" />} text={`${questions?.length || 0} questions`} />
                  <Fact icon={<Clock size={16} color="#ffffff" />} text="45 minutes" />
                  <Fact icon={<Target size={16} color="#ffffff" />} text="80% requis" />
                </View>
              </View>
            ) : (
              /* First-time user — editorial intro */
              <View>
                <Text className="text-white text-4xl font-display mb-3 leading-tight">
                  Préparez votre Examen Civique
                </Text>
                <Text className="text-white/80 text-base mb-6 leading-relaxed">
                  Entraînez-vous dans les conditions réelles de l’examen civique français.
                </Text>

                <StartButton onPress={handleStartQuiz} disabled={!canStart} />

                <View className="flex-row flex-wrap gap-x-5 gap-y-2 mt-6">
                  <Fact icon={<BookOpen size={16} color="#ffffff" />} text={`${questions?.length || 0} questions`} />
                  <Fact icon={<Clock size={16} color="#ffffff" />} text="45 minutes" />
                  <Fact icon={<Target size={16} color="#ffffff" />} text="80% requis" />
                </View>
              </View>
            )}
          </View>
          <Tricolor height={3} />
        </LinearGradient>

        {/* Body */}
        <View className="px-4 py-6 gap-8">
          {hasResults ? (
            /* Returning user — recent results preview */
            recentResults.length > 0 ? (
              <View>
                <View className="flex-row items-center justify-between mb-4">
                  <SectionTitle
                    icon={<Calendar size={20} color={c.primary} />}
                    title="Vos derniers résultats"
                    noMargin
                  />
                  <Button
                    title="Tout voir"
                    variant="ghost"
                    size="sm"
                    onPress={() => router.push('/stats')}
                    iconRight={<ChevronRight size={16} color={c.foreground} />}
                  />
                </View>
                <View className="gap-3">
                  {recentResults.map((result) => (
                    <ResultCard
                      key={result.id}
                      result={result}
                      onReview={() => router.push(`/review/${result.id}`)}
                    />
                  ))}
                </View>
              </View>
            ) : null
          ) : (
            /* First-time user — placeholder until first result */
            <EmptyState
              icon={
                <View className="w-24 h-24 rounded-full bg-muted items-center justify-center">
                  <Calendar size={48} color={c.mutedForeground} />
                </View>
              }
              title="Vos résultats ici"
              description="Complétez votre premier examen pour voir vos scores et suivre votre progression."
            />
          )}
        </View>
    </ScrollView>
  );
}

/**
 * Primary hero CTA. The hero is always dark republican-blue (both themes), so
 * this button is fixed white with deep-blue label/icon rather than the
 * theme-reactive `secondary` variant (which went dark-on-dark in dark mode).
 */
function StartButton({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  const BLUE = '#002654';
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        haptics.selection();
        onPress();
      }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityLabel="Commencer un quiz"
      // Static style object (driven by `pressed` state). A style *function* is
      // dropped by NativeWind's JSX wrapper, which lost the white background.
      style={{
        width: '100%',
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 16,
        backgroundColor: pressed && !disabled ? '#e8eef5' : '#ffffff',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Play size={20} color={BLUE} />
      <Text style={{ fontFamily: 'Inter_600SemiBold', color: BLUE, fontSize: 16 }}>
        Commencer un quiz
      </Text>
    </Pressable>
  );
}

function HeaderIconButton({
  icon,
  onPress,
  label,
}: {
  icon: React.ReactNode;
  onPress: () => void;
  label: string;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      // Static style (driven by `pressed`): a style function is dropped by
      // NativeWind's JSX wrapper, so the press highlight never showed.
      style={{
        height: 44,
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
        backgroundColor: pressed ? 'rgba(255,255,255,0.18)' : 'transparent',
      }}
    >
      {icon}
    </Pressable>
  );
}

function Fact({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View className="flex-row items-center gap-2">
      {icon}
      <Text className="text-white/80 text-sm">{text}</Text>
    </View>
  );
}

function SectionTitle({ icon, title, noMargin }: { icon: React.ReactNode; title: string; noMargin?: boolean }) {
  return (
    <View className={cn('flex-row items-center gap-2', !noMargin && 'mb-4')}>
      {icon}
      <Text className="text-xl font-display text-foreground">{title}</Text>
    </View>
  );
}

