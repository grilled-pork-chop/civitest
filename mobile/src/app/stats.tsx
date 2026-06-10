import React, { useCallback, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Play, BarChart3 } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatsSummaryCards } from '@/components/stats/StatsSummaryCards';
import { TrendChart } from '@/components/stats/TrendChart';
import { TopicPerformanceChart } from '@/components/stats/TopicPerformanceChart';
import { QuizResultsList } from '@/components/stats/QuizResultsList';
import { quizActions } from '@/stores/quizStore';
import { queryClient, useQuestions } from '@/lib/queries';
import { useQuizStats } from '@/hooks/useQuizStats';
import { useThemeColors } from '@/theme/useTheme';

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const { data: questions } = useQuestions();
  const stats = useQuizStats();

  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['quizHistory'] });
    queryClient.invalidateQueries({ queryKey: ['quizStatistics'] });
    quizActions.refreshHistory();
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refresh();
    setTimeout(() => setRefreshing(false), 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewQuiz = () => {
    if (questions) {
      quizActions.startQuiz(questions);
      router.push('/quiz');
    }
  };

  if (!stats.hasResults) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center px-6"
        style={{ paddingBottom: insets.bottom }}
      >
        <EmptyState
          icon={
            <View className="w-24 h-24 rounded-full bg-muted items-center justify-center">
              <BarChart3 size={48} color={c.mutedForeground} />
            </View>
          }
          title="Aucune statistique disponible"
          description="Commencez un examen pour voir vos statistiques et suivre votre progression."
        >
          <Button
            title="Commencer un examen"
            size="lg"
            onPress={handleNewQuiz}
            icon={<Play size={20} color={c.primaryForeground} />}
            className="rounded-2xl"
          />
        </EmptyState>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32, gap: 24 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} colors={[c.primary]} />
      }
    >
      <StatsSummaryCards
        totalQuizzes={stats.summary.totalQuizzes}
        averageScore={stats.summary.averageScore}
        passRate={stats.summary.passRate}
        averageTimePerQuiz={stats.summary.averageTimePerQuiz}
      />

      {stats.summary.recentTrend.length > 0 ? <TrendChart data={stats.summary.recentTrend} /> : null}

      <TopicPerformanceChart topicStats={stats.topicStats} />

      <QuizResultsList results={stats.displayResults} totalCount={stats.allResults.length} onReview={(id) => router.push(`/review/${id}`)} />
    </ScrollView>
  );
}
