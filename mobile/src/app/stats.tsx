/**
 * Stats screen — summary cards, charts, and quiz history with export/import/clear.
 */

import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trash2, Download, Upload, Play, BarChart3 } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { StatsSummaryCards } from '@/components/stats/StatsSummaryCards';
import { TrendChart } from '@/components/stats/TrendChart';
import { TopicPerformanceChart } from '@/components/stats/TopicPerformanceChart';
import { QuizResultsList } from '@/components/stats/QuizResultsList';
import { clearQuizHistory } from '@/utils/storage';
import { exportQuizHistoryFile, importQuizHistoryFile } from '@/services/quizExport';
import { quizActions } from '@/stores/quizStore';
import { queryClient, useQuestions } from '@/lib/queries';
import { useQuizStats } from '@/hooks/useQuizStats';
import { toast, SUCCESS_MESSAGES } from '@/services/toast';
import { useThemeColors } from '@/theme/useTheme';

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const { data: questions } = useQuestions();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const stats = useQuizStats();

  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['quizHistory'] });
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

  const handleClearHistory = () => {
    clearQuizHistory();
    refresh();
    setShowClearDialog(false);
    toast.success(SUCCESS_MESSAGES.QUIZ_HISTORY_CLEARED);
  };

  const handleImport = async () => {
    await importQuizHistoryFile(refresh);
  };

  if (!stats.hasResults) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center px-6"
        style={{ paddingBottom: insets.bottom }}
      >
        <StatusBar style="light" />
        <View className="w-24 h-24 rounded-full bg-muted items-center justify-center mb-6">
          <BarChart3 size={48} color={c.mutedForeground} />
        </View>
        <Text className="text-2xl font-display mb-2 text-foreground text-center">
          Aucune statistique disponible
        </Text>
        <Text className="text-muted-foreground mb-6 text-center">
          Commencez un examen pour voir vos statistiques et suivre votre progression.
        </Text>
        <View className="gap-3 w-full">
          <Button
            title="Commencer un examen"
            size="lg"
            fullWidth
            onPress={handleNewQuiz}
            icon={<Play size={20} color={c.primaryForeground} />}
          />
          <Button
            title="Importer l'historique"
            size="lg"
            variant="outline"
            fullWidth
            onPress={handleImport}
            icon={<Upload size={20} color={c.foreground} />}
          />
        </View>
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
      <StatusBar style="light" />
      {/* Actions */}
      <View className="flex-row flex-wrap gap-2">
        <Button
          title="Exporter"
          variant="outline"
          onPress={exportQuizHistoryFile}
          icon={<Download size={16} color={c.foreground} />}
          className="flex-1"
        />
        <Button
          title="Importer"
          variant="outline"
          onPress={handleImport}
          icon={<Upload size={16} color={c.foreground} />}
          className="flex-1"
        />
        <Button
          title="Effacer l'historique"
          variant="destructive"
          fullWidth
          onPress={() => setShowClearDialog(true)}
          icon={<Trash2 size={16} color={c.destructiveForeground} />}
        />
      </View>

      <StatsSummaryCards
        totalQuizzes={stats.summary.totalQuizzes}
        averageScore={stats.summary.averageScore}
        passRate={stats.summary.passRate}
        averageTimePerQuiz={stats.summary.averageTimePerQuiz}
      />

      {stats.summary.recentTrend.length > 0 ? <TrendChart data={stats.summary.recentTrend} /> : null}

      <TopicPerformanceChart topicStats={stats.topicStats} />

      <QuizResultsList results={stats.allResults} onReview={(id) => router.push(`/review/${id}`)} />

      <ConfirmDialog
        visible={showClearDialog}
        title="Confirmer la suppression"
        description="Êtes-vous sûr de vouloir effacer tout l'historique ? Cette action est irréversible."
        confirmLabel="Effacer"
        confirmVariant="destructive"
        onConfirm={handleClearHistory}
        onCancel={() => setShowClearDialog(false)}
      />
    </ScrollView>
  );
}
