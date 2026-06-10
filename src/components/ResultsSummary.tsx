/**
 * Quiz results summary component
 * Displays pass/fail banner, key stats, and per-topic performance.
 */

import React from 'react';
import { View, type TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useReducedMotion } from 'react-native-reanimated';
import { Trophy, XCircle, Clock, Gauge } from 'lucide-react-native';
import { QUIZ_CONFIG } from '@/types';
import type { QuizResult } from '@/types';
import { formatTimeVerbose } from '@/utils/questions';
import { AppText, Heading } from '@/components/ui/Text';
import { StatTile } from '@/components/ui/StatTile';
import { TopicProgressBar } from '@/components/TopicProgressBar';
import { useThemeColors } from '@/theme/useTheme';

const tabular: TextStyle = { fontVariant: ['tabular-nums'] };

interface ResultsSummaryProps {
  result: QuizResult;
  showDetailed?: boolean;
}

export function ResultsSummary({ result, showDetailed = true }: ResultsSummaryProps) {
  const c = useThemeColors();
  const reduceMotion = useReducedMotion();
  const { score, totalQuestions, percentage, passed, timeTaken, topicPerformance } = result;

  // Genuinely-new insight (not already shown in the banner): how far above or
  // below the required passing percentage this score landed.
  const margin = percentage - QUIZ_CONFIG.passingScore * 100;
  const marginLabel = `${margin >= 0 ? '+' : '−'}${Math.abs(margin)} pts`;

  // Staggered fade/slide-up entrance. Reduced-motion: final state, no transition.
  const enter = (delay: number) =>
    reduceMotion
      ? {
          from: { opacity: 1, translateY: 0 },
          animate: { opacity: 1, translateY: 0 },
          transition: { duration: 0 },
        }
      : {
          from: { opacity: 0, translateY: 8 },
          animate: { opacity: 1, translateY: 0 },
          transition: { type: 'timing' as const, duration: 260, delay },
        };

  return (
    <View className="gap-5">
      {/* Main banner */}
      <MotiView
        from={reduceMotion ? { opacity: 1, scale: 1, translateY: 0 } : { opacity: 0, scale: 0.96, translateY: 8 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: reduceMotion ? 0 : 260 }}
      >
        <LinearGradient
          colors={passed ? ['#22c55e', '#059669'] : ['#ef4444', '#e11d48']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 20, padding: 22, alignItems: 'center' }}
        >
          <MotiView
            from={reduceMotion ? { scale: 1 } : { scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', damping: 12, stiffness: 180, delay: 120 }}
          >
            {passed ? <Trophy size={44} color="#ffffff" /> : <XCircle size={44} color="#ffffff" />}
          </MotiView>
          <Heading size="h1" color="white" className="mt-3 mb-1 text-center">
            {passed ? 'Félicitations !' : 'Continuez vos efforts'}
          </Heading>
          <AppText size="body" className="text-white/90 mb-4 text-center">
            {passed
              ? "Vous avez réussi l'examen civique !"
              : "Vous n'avez pas atteint le score minimum requis."}
          </AppText>

          <View className="bg-white/20 rounded-2xl px-6 py-3 items-center">
            <AppText weight="bold" className="text-4xl text-white" style={tabular}>
              {percentage}%
            </AppText>
            <AppText size="body" className="text-white/80 mt-1" style={tabular}>
              {score} / {totalQuestions} bonnes réponses
            </AppText>
          </View>

          <AppText size="caption" className="text-white/70 mt-3 text-center">
            Score minimum requis : {QUIZ_CONFIG.passingScore * 100}% (
            {QUIZ_CONFIG.passingQuestions} bonnes réponses)
          </AppText>
        </LinearGradient>
      </MotiView>

      {showDetailed ? (
        <>
          {/* Meta row — only metrics the banner doesn't already show */}
          <MotiView {...enter(80)} className="flex-row flex-wrap gap-3">
            <StatTile
              icon={<Clock size={20} color="#9333ea" />}
              label="Temps"
              value={formatTimeVerbose(timeTaken)}
              bg="bg-purple-50"
              valueClass="text-purple-600"
              labelClass="text-purple-600"
              labelPosition="beside"
              valueStyle={tabular}
            />
            <StatTile
              icon={<Gauge size={20} color={margin >= 0 ? c.green600 : c.red600} />}
              label="vs seuil requis"
              value={marginLabel}
              bg={margin >= 0 ? 'bg-green-50' : 'bg-red-50'}
              valueClass={margin >= 0 ? 'text-green-600' : 'text-red-600'}
              labelClass={margin >= 0 ? 'text-green-600' : 'text-red-600'}
              labelPosition="beside"
              valueStyle={tabular}
            />
          </MotiView>

          {/* Topic performance */}
          <MotiView {...enter(160)} className="bg-card border border-border rounded-2xl p-5">
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
          </MotiView>
        </>
      ) : null}
    </View>
  );
}
