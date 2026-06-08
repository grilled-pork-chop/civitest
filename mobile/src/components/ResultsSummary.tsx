/**
 * Quiz results summary component
 * Displays pass/fail banner, key stats, and per-topic performance.
 */

import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, XCircle, Clock, Target, TrendingUp, Award } from 'lucide-react-native';
import { QUIZ_CONFIG } from '@/types';
import type { QuizResult } from '@/types';
import { formatTimeVerbose } from '@/utils/questions';
import { AppText, Heading } from '@/components/ui/Text';
import { StatTile } from '@/components/ui/StatTile';
import { TopicProgressBar } from '@/components/TopicProgressBar';
import { useThemeColors } from '@/theme/useTheme';

interface ResultsSummaryProps {
  result: QuizResult;
  showDetailed?: boolean;
}

export function ResultsSummary({ result, showDetailed = true }: ResultsSummaryProps) {
  const c = useThemeColors();
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
        {passed ? <Trophy size={56} color="#ffffff" /> : <XCircle size={56} color="#ffffff" />}
        <Heading size="display" color="white" className="mt-3 mb-1 text-center">
          {passed ? 'Félicitations !' : 'Continuez vos efforts'}
        </Heading>
        <AppText size="title" className="text-white/90 mb-5 text-center">
          {passed
            ? "Vous avez réussi l'examen civique !"
            : "Vous n'avez pas atteint le score minimum requis."}
        </AppText>

        <View className="bg-white/20 rounded-2xl px-8 py-4 items-center">
          <AppText weight="bold" className="text-5xl text-white">
            {percentage}%
          </AppText>
          <AppText size="body" className="text-white/80 mt-1">
            {score} / {totalQuestions} bonnes réponses
          </AppText>
        </View>

        <AppText size="caption" className="text-white/70 mt-4 text-center">
          Score minimum requis : {QUIZ_CONFIG.passingScore * 100}% (
          {QUIZ_CONFIG.passingQuestions} bonnes réponses)
        </AppText>
      </LinearGradient>

      {showDetailed ? (
        <>
          {/* Stats grid */}
          <View className="flex-row flex-wrap gap-3">
            <StatTile
              icon={<Target size={20} color={c.blue600} />}
              label="Score"
              value={`${score}/${totalQuestions}`}
              bg="bg-blue-50"
              valueClass="text-blue-600"
              labelClass="text-blue-600"
              labelPosition="beside"
            />
            <StatTile
              icon={<TrendingUp size={20} color={passed ? c.green600 : c.red600} />}
              label="Pourcentage"
              value={`${percentage}%`}
              bg={passed ? 'bg-green-50' : 'bg-red-50'}
              valueClass={passed ? 'text-green-600' : 'text-red-600'}
              labelClass={passed ? 'text-green-600' : 'text-red-600'}
              labelPosition="beside"
            />
            <StatTile
              icon={<Clock size={20} color="#9333ea" />}
              label="Temps"
              value={formatTimeVerbose(timeTaken)}
              bg="bg-purple-50"
              valueClass="text-purple-600"
              labelClass="text-purple-600"
              labelPosition="beside"
            />
            <StatTile
              icon={<Award size={20} color={passed ? c.green600 : c.red600} />}
              label="Résultat"
              value={passed ? 'Réussi' : 'Échoué'}
              bg={passed ? 'bg-green-50' : 'bg-red-50'}
              valueClass={passed ? 'text-green-600' : 'text-red-600'}
              labelClass={passed ? 'text-green-600' : 'text-red-600'}
              labelPosition="beside"
            />
          </View>

          {/* Topic performance */}
          <View className="bg-card border border-border rounded-2xl p-5">
            <Heading size="h3" className="mb-4">
              Performance par thème
            </Heading>
            <View className="gap-4">
              {topicPerformance.map((tp) => (
                <TopicProgressBar
                  key={tp.topicId}
                  topicId={tp.topicId}
                  correct={tp.correct}
                  total={tp.total}
                  percentage={tp.percentage}
                  colorMode="topic"
                  showCounts
                />
              ))}
            </View>
          </View>

          {/* Tips when failed */}
          {!passed ? (
            <View className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <Heading size="h3" className="text-amber-900 mb-3">
                Conseils pour progresser
              </Heading>
              {[
                'Concentrez-vous sur les thèmes où vous avez obtenu moins de 80%',
                'Relisez les explications des questions que vous avez manquées',
                'Pratiquez régulièrement pour améliorer votre score',
              ].map((tip) => (
                <View key={tip} className="flex-row gap-2 mb-2">
                  <AppText className="text-amber-500">•</AppText>
                  <AppText className="flex-1 text-amber-800">{tip}</AppText>
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}
