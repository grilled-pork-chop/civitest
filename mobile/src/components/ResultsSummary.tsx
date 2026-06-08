/**
 * Quiz results summary component
 * Displays pass/fail banner, key stats, and per-topic performance.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, XCircle, Clock, Target, TrendingUp, Award } from 'lucide-react-native';
import { QUIZ_CONFIG } from '@/types';
import type { QuizResult, TopicPerformance } from '@/types';
import { formatTimeVerbose, getTopicName, getTopicColor } from '@/utils/questions';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors } from '@/theme/tokens';
import { cn } from '@/lib/utils';

interface ResultsSummaryProps {
  result: QuizResult;
  showDetailed?: boolean;
}

export function ResultsSummary({ result, showDetailed = true }: ResultsSummaryProps) {
  const { score, totalQuestions, percentage, passed, timeTaken, topicPerformance } = result;

  return (
    <View className="gap-6">
      {/* Main banner */}
      <LinearGradient
        colors={passed ? ['#22c55e', '#059669'] : ['#ef4444', '#e11d48']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 24, padding: 28, alignItems: 'center' }}
      >
        {passed ? (
          <Trophy size={56} color="#ffffff" />
        ) : (
          <XCircle size={56} color="#ffffff" />
        )}
        <Text className="text-2xl font-bold text-white mt-3 mb-1 text-center">
          {passed ? 'Félicitations !' : 'Continuez vos efforts'}
        </Text>
        <Text className="text-white/90 text-base mb-5 text-center">
          {passed
            ? "Vous avez réussi l'examen civique !"
            : "Vous n'avez pas atteint le score minimum requis."}
        </Text>

        <View className="bg-white/20 rounded-2xl px-8 py-4 items-center">
          <Text className="text-5xl font-bold text-white">{percentage}%</Text>
          <Text className="text-white/80 text-sm mt-1">
            {score} / {totalQuestions} bonnes réponses
          </Text>
        </View>

        <Text className="text-white/70 text-xs mt-4 text-center">
          Score minimum requis : {QUIZ_CONFIG.passingScore * 100}% (
          {QUIZ_CONFIG.passingQuestions} bonnes réponses)
        </Text>
      </LinearGradient>

      {showDetailed ? (
        <>
          {/* Stats grid */}
          <View className="flex-row flex-wrap gap-3">
            <StatCard
              icon={<Target size={20} color={colors.blue600} />}
              label="Score"
              value={`${score}/${totalQuestions}`}
              bg="bg-blue-50"
              textClass="text-blue-600"
            />
            <StatCard
              icon={<TrendingUp size={20} color={passed ? colors.green600 : colors.red600} />}
              label="Pourcentage"
              value={`${percentage}%`}
              bg={passed ? 'bg-green-50' : 'bg-red-50'}
              textClass={passed ? 'text-green-600' : 'text-red-600'}
            />
            <StatCard
              icon={<Clock size={20} color="#9333ea" />}
              label="Temps"
              value={formatTimeVerbose(timeTaken)}
              bg="bg-purple-50"
              textClass="text-purple-600"
            />
            <StatCard
              icon={<Award size={20} color={passed ? colors.green600 : colors.red600} />}
              label="Résultat"
              value={passed ? 'Réussi' : 'Échoué'}
              bg={passed ? 'bg-green-50' : 'bg-red-50'}
              textClass={passed ? 'text-green-600' : 'text-red-600'}
            />
          </View>

          {/* Topic performance */}
          <View className="bg-card border border-border rounded-2xl p-5">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Performance par thème
            </Text>
            <View className="gap-4">
              {topicPerformance.map((tp) => (
                <TopicProgressBar key={tp.topicId} performance={tp} />
              ))}
            </View>
          </View>

          {/* Tips when failed */}
          {!passed ? (
            <View className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <Text className="text-lg font-semibold text-amber-900 mb-3">
                Conseils pour progresser
              </Text>
              {[
                'Concentrez-vous sur les thèmes où vous avez obtenu moins de 80%',
                'Relisez les explications des questions que vous avez manquées',
                'Pratiquez régulièrement pour améliorer votre score',
              ].map((tip) => (
                <View key={tip} className="flex-row gap-2 mb-2">
                  <Text className="text-amber-500">•</Text>
                  <Text className="flex-1 text-amber-800 text-sm">{tip}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  bg,
  textClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
  textClass: string;
}) {
  return (
    <View className={cn('rounded-2xl p-4 flex-1', bg)} style={{ minWidth: '45%' }}>
      <View className="flex-row items-center gap-2 mb-2">
        {icon}
        <Text className={cn('text-sm font-medium', textClass)}>{label}</Text>
      </View>
      <Text className={cn('text-2xl font-bold', textClass)}>{value}</Text>
    </View>
  );
}

const TopicProgressBar = React.memo(function TopicProgressBar({
  performance,
}: {
  performance: TopicPerformance;
}) {
  const { topicId, correct, total, percentage } = performance;
  const color = getTopicColor(topicId);
  const isPassing = percentage >= 80;

  return (
    <View>
      <View className="flex-row justify-between items-center mb-1.5">
        <Text className="text-sm font-medium text-foreground">{getTopicName(topicId, true)}</Text>
        <Text className={cn('text-sm font-semibold', isPassing ? 'text-green-600' : 'text-red-600')}>
          {correct}/{total} ({percentage}%)
        </Text>
      </View>
      <ProgressBar percentage={percentage} color={color} height={12} />
    </View>
  );
});
