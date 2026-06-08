/**
 * Home screen — hero, quick stats, recent results, exam info.
 */

import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useStore } from '@tanstack/react-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Play,
  Clock,
  Target,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  ChevronRight,
  BarChart3,
  Settings as SettingsIcon,
} from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tricolor } from '@/components/ui/Tricolor';
import { ResultCard } from '@/components/stats/QuizResultsList';
import { useQuestions } from '@/lib/queries';
import { useQuizStats } from '@/hooks/useQuizStats';
import { appStore, quizActions } from '@/stores/quizStore';
import { getQuestionTypeColor } from '@/utils/questions';
import { TOPICS } from '@/types';
import { useThemeColors } from '@/theme/useTheme';
import { cn } from '@/lib/utils';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const { data: questions, isLoading, error, refetch } = useQuestions();
  const currentQuiz = useStore(appStore, (state) => state.currentQuiz);
  const { summary, allResults } = useQuizStats();
  const recentResults = allResults.slice(0, 3);

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
        <AlertCircle size={48} color={c.destructive} />
        <Text className="text-xl font-semibold mt-4 mb-2 text-foreground">Erreur de chargement</Text>
        <Text className="text-muted-foreground mb-4 text-center">
          Impossible de charger les questions. Veuillez réessayer.
        </Text>
        <Button title="Réessayer" onPress={() => refetch()} />
      </View>
    );
  }

  const hasActiveQuiz = currentQuiz && !currentQuiz.isCompleted;
  const knowledgeCount = questions?.filter((q) => q.type === 'knowledge').length || 0;
  const situationalCount = questions?.filter((q) => q.type === 'situational').length || 0;

  return (
    <>
    <StatusBar style="light" />
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
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-white text-xl font-display">CiviTest</Text>
            <View className="flex-row items-center">
              <Button
                title="Statistiques"
                variant="ghost"
                size="sm"
                onPress={() => router.push('/stats')}
                icon={<BarChart3 size={18} color="#ffffff" />}
                textClassName="text-white"
              />
              <Button
                title="Réglages"
                variant="ghost"
                size="sm"
                onPress={() => router.push('/settings')}
                icon={<SettingsIcon size={20} color="#ffffff" />}
                textClassName="hidden"
                accessibilityLabel="Réglages"
              />
            </View>
          </View>

          <Text className="text-white text-4xl font-display mb-3 leading-tight">
            Préparez votre Examen Civique
          </Text>
          <Text className="text-white/80 text-base mb-6 leading-relaxed">
            Entraînez-vous dans les conditions réelles de l'examen civique français.
            40 questions, 45 minutes, 80% requis pour réussir.
          </Text>

          <View className="gap-3">
            {hasActiveQuiz ? (
              <>
                <Button
                  title="Continuer le quiz"
                  size="lg"
                  fullWidth
                  variant="secondary"
                  onPress={() => router.push('/quiz')}
                  icon={<Play size={20} color={c.primary} />}
                />
                <Button
                  title="Nouveau quiz"
                  size="lg"
                  fullWidth
                  variant="ghost"
                  onPress={handleStartQuiz}
                  className="border border-white/40"
                  textClassName="text-white"
                />
              </>
            ) : (
              <Button
                title="Commencer un quiz"
                size="lg"
                fullWidth
                variant="secondary"
                onPress={handleStartQuiz}
                disabled={!questions || questions.length === 0}
                icon={<Play size={20} color={c.primary} />}
              />
            )}
          </View>

          {/* Quick facts */}
          <View className="flex-row flex-wrap gap-x-5 gap-y-2 mt-6">
            <Fact icon={<BookOpen size={16} color="#ffffff" />} text={`${questions?.length || 0} questions`} />
            <Fact icon={<Clock size={16} color="#ffffff" />} text="45 minutes" />
            <Fact icon={<Target size={16} color="#ffffff" />} text="80% requis" />
          </View>

          {/* Type distribution */}
          <View className="flex-row gap-4 mt-3">
            <Dot color={getQuestionTypeColor('knowledge')} text={`${knowledgeCount} connaissances`} />
            <Dot color={getQuestionTypeColor('situational')} text={`${situationalCount} situations`} />
          </View>
        </View>
        <Tricolor height={5} />
      </LinearGradient>

      {/* Body */}
      <View className="px-4 py-6 gap-8">
        {/* Performance */}
        {summary.totalQuizzes > 0 ? (
          <View>
            <SectionTitle icon={<TrendingUp size={22} color={c.primary} />} title="Vos performances" />
            <View className="flex-row flex-wrap gap-3">
              <StatTile label="Quiz complétés" value={`${summary.totalQuizzes}`} icon={<CheckCircle2 size={18} color={c.blue600} />} bg="bg-blue-50" />
              <StatTile label="Taux de réussite" value={`${summary.passRate}%`} icon={<Award size={18} color={summary.passRate >= 80 ? c.green600 : c.yellow600} />} bg={summary.passRate >= 80 ? 'bg-green-50' : 'bg-yellow-50'} />
              <StatTile label="Score moyen" value={`${summary.averageScore}%`} icon={<Target size={18} color={summary.averageScore >= 80 ? c.green600 : c.yellow600} />} bg={summary.averageScore >= 80 ? 'bg-green-50' : 'bg-yellow-50'} />
              <StatTile label="Meilleur score" value={`${summary.bestScore}%`} icon={<TrendingUp size={18} color="#9333ea" />} bg="bg-purple-50" />
            </View>
          </View>
        ) : null}

        {/* Recent results */}
        {recentResults.length > 0 ? (
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <SectionTitle icon={<Calendar size={22} color={c.primary} />} title="Vos 3 derniers résultats" noMargin />
              <Button
                title="Voir tout"
                variant="ghost"
                size="sm"
                onPress={() => router.push('/stats')}
                icon={<ChevronRight size={16} color={c.foreground} />}
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
        ) : null}

        {/* First-time welcome */}
        {summary.totalQuizzes === 0 ? (
          <View className="items-center py-8">
            <BookOpen size={56} color={c.mutedForeground} />
            <Text className="text-2xl font-display mt-4 mb-2 text-foreground">Bienvenue sur CiviTest !</Text>
            <Text className="text-muted-foreground mb-6 text-center px-4">
              Commencez votre premier quiz pour voir vos statistiques et suivre votre progression.
            </Text>
            <Button title="Commencer maintenant" size="lg" onPress={handleStartQuiz} icon={<Play size={20} color={c.primaryForeground} />} />
          </View>
        ) : null}

        {/* Exam info */}
        <Card>
          <CardHeader>
            <CardTitle>À propos de l'examen</CardTitle>
          </CardHeader>
          <Text className="text-sm text-muted-foreground mb-4 leading-relaxed">
            L'examen civique est obligatoire pour la naturalisation française et certains
            titres de séjour. Il évalue votre connaissance des valeurs, principes et
            institutions de la République.
          </Text>
          <View className="gap-2">
            <InfoItem icon={<BookOpen size={16} color={c.mutedForeground} />} text="40 questions à choix multiples" />
            <InfoItem icon={<Clock size={16} color={c.mutedForeground} />} text="45 minutes maximum" />
            <InfoItem icon={<Target size={16} color={c.mutedForeground} />} text="32/40 minimum pour réussir (80%)" />
            <InfoItem icon={<Award size={16} color={c.mutedForeground} />} text="1 seule bonne réponse par question" />
          </View>
        </Card>

        {/* Topics */}
        <Card>
          <CardHeader>
            <CardTitle>Les 5 thèmes</CardTitle>
          </CardHeader>
          <View className="gap-3">
            {TOPICS.map((topic) => (
              <View key={topic.id} className="flex-row items-center gap-3">
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: topic.color }} />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground">{topic.nameShort}</Text>
                  <Text className="text-xs text-muted-foreground">~{topic.targetCount} questions</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Conseils</CardTitle>
          </CardHeader>
          {[
            'Lisez attentivement chaque question',
            'Gérez bien votre temps (env. 1 min/question)',
            'Répondez à toutes les questions',
            'Entraînez-vous régulièrement',
          ].map((tip) => (
            <View key={tip} className="flex-row gap-2 mb-2">
              <Text className="text-blue-500">•</Text>
              <Text className="flex-1 text-blue-800 text-sm">{tip}</Text>
            </View>
          ))}
        </Card>

        <Text className="text-center text-xs text-muted-foreground mt-2">
          CiviTest · Application hors-ligne · Données stockées sur votre appareil
        </Text>
      </View>
    </ScrollView>
    </>
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

function Dot({ color, text }: { color: string; text: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text className="text-white/60 text-xs">{text}</Text>
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

function StatTile({ label, value, icon, bg }: { label: string; value: string; icon: React.ReactNode; bg: string }) {
  return (
    <View className={cn('rounded-2xl p-4 flex-1', bg)} style={{ minWidth: '45%' }}>
      <View className="mb-2">{icon}</View>
      <Text className="text-2xl font-bold text-foreground">{value}</Text>
      <Text className="text-xs text-muted-foreground uppercase font-semibold mt-0.5">{label}</Text>
    </View>
  );
}

function InfoItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View className="flex-row items-center gap-2">
      {icon}
      <Text className="text-sm text-foreground">{text}</Text>
    </View>
  );
}
