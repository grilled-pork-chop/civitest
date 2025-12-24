/**
 * Quiz results summary component
 * Displays comprehensive quiz results with stats and topic breakdown
 */

import React from 'react';
import {
  Trophy,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTimeVerbose, getTopicName, getTopicColor } from '@/utils/questions';
import { QUIZ_CONFIG } from '@/types';
import type { QuizResult, TopicPerformance } from '@/types';

/**
 * Props for ResultsSummary component
 */
interface ResultsSummaryProps {
  /** Quiz result data to display */
  result: QuizResult;
  /** Whether to show detailed stats and topic breakdown */
  showDetailed?: boolean;
}

/**
 * Comprehensive quiz results display
 * Shows pass/fail banner, overall stats, topic performance, and improvement tips
 * Includes visual feedback with color-coded pass/fail states
 *
 * @param props - Component props
 * @returns Results summary with detailed statistics
 *
 * @example
 * ```tsx
 * <ResultsSummary
 *   result={quizResult}
 *   showDetailed={true}
 * />
 * ```
 */
export function ResultsSummary({ result, showDetailed = true }: ResultsSummaryProps) {
  const { score, totalQuestions, percentage, passed, timeTaken, topicPerformance } =
    result;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main result banner */}
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl p-8 text-center',
          passed
            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
            : 'bg-gradient-to-br from-red-500 to-rose-600'
        )}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          {passed ? (
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white" />
          ) : (
            <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white" />
          )}
        </div>

        <div className="relative">
          {passed ? (
            <Trophy className="mx-auto h-16 w-16 text-white mb-4" />
          ) : (
            <XCircle className="mx-auto h-16 w-16 text-white mb-4" />
          )}

          <h2 className="text-3xl font-bold text-white mb-2">
            {passed ? 'Félicitations !' : 'Continuez vos efforts'}
          </h2>

          <p className="text-white/90 text-lg mb-6">
            {passed
              ? 'Vous avez réussi l\'examen civique !'
              : 'Vous n\'avez pas atteint le score minimum requis.'}
          </p>

          <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur rounded-xl px-8 py-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-white">{percentage}%</div>
              <div className="text-white/80 text-sm mt-1">
                {score} / {totalQuestions} bonnes réponses
              </div>
            </div>
          </div>

          <p className="text-white/70 text-sm mt-4">
            Score minimum requis : {QUIZ_CONFIG.passingScore * 100}% ({QUIZ_CONFIG.passingQuestions} bonnes réponses)
          </p>
        </div>
      </div>

      {showDetailed && (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Target className="h-5 w-5" />}
              label="Score"
              value={`${score}/${totalQuestions}`}
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="Pourcentage"
              value={`${percentage}%`}
              color={passed ? 'text-green-600' : 'text-red-600'}
              bgColor={passed ? 'bg-green-50' : 'bg-red-50'}
            />
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="Temps"
              value={formatTimeVerbose(timeTaken)}
              color="text-purple-600"
              bgColor="bg-purple-50"
            />
            <StatCard
              icon={<Award className="h-5 w-5" />}
              label="Résultat"
              value={passed ? 'Réussi' : 'Échoué'}
              color={passed ? 'text-green-600' : 'text-red-600'}
              bgColor={passed ? 'bg-green-50' : 'bg-red-50'}
            />
          </div>

          {/* Topic performance */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Performance par thème</h3>
            <div className="space-y-4">
              {topicPerformance.map((tp) => (
                <TopicProgressBar key={tp.topicId} performance={tp} />
              ))}
            </div>
          </div>

          {/* Tips */}
          {!passed && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-amber-900 mb-3">
                Conseils pour progresser
              </h3>
              <ul className="space-y-2 text-amber-800 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  Concentrez-vous sur les thèmes où vous avez obtenu moins de 80%
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  Relisez les explications des questions que vous avez manquées
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  Pratiquez régulièrement pour améliorer votre score
                </li>
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Props for StatCard sub-component
 */
interface StatCardProps {
  /** Icon to display */
  icon: React.ReactNode;
  /** Stat label */
  label: string;
  /** Stat value */
  value: string;
  /** Text color CSS class */
  color: string;
  /** Background color CSS class */
  bgColor: string;
}

/**
 * Individual stat card for displaying a single metric
 * Memoized to prevent unnecessary re-renders in grid
 */
const StatCard = React.memo(function StatCard({ icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <div className={cn('rounded-xl p-4', bgColor)}>
      <div className={cn('flex items-center gap-2 mb-2', color)}>
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className={cn('text-2xl font-bold', color)}>{value}</div>
    </div>
  );
});

/**
 * Props for TopicProgressBar sub-component
 */
interface TopicProgressBarProps {
  /** Topic performance data */
  performance: TopicPerformance;
}

/**
 * Progress bar showing performance for a single topic
 * Memoized to prevent unnecessary re-renders in list
 */
const TopicProgressBar = React.memo(function TopicProgressBar({ performance }: TopicProgressBarProps) {
  const { topicId, correct, total, percentage } = performance;
  const color = getTopicColor(topicId);
  const isPassing = percentage >= 80;

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium">{getTopicName(topicId, true)}</span>
        <span
          className={cn('text-sm font-semibold', {
            'text-green-600': isPassing,
            'text-red-600': !isPassing,
          })}
        >
          {correct}/{total} ({percentage}%)
        </span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
});