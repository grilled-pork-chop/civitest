/**
 * Question card component
 * Displays a single quiz question with multiple choice options.
 * Supports quiz mode and review mode (correct/incorrect feedback).
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, X, Info } from 'lucide-react-native';
import type { Question, ShuffledQuestion } from '@/types';
import {
  getTopicName,
  getTopicColor,
  getQuestionTypeName,
  getQuestionTypeColor,
} from '@/utils/questions';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/theme/tokens';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question | ShuffledQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedChoiceIndex: number | null;
  onSelectChoice: (index: number) => void;
  isReviewMode?: boolean;
  showExplanation?: boolean;
  disabled?: boolean;
}

type ChoiceState = 'default' | 'selected' | 'correct' | 'incorrect';

const difficultyLabel: Record<string, string> = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile',
};

const difficultyClasses: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

export const QuestionCard = React.memo(function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedChoiceIndex,
  onSelectChoice,
  isReviewMode = false,
  showExplanation = false,
  disabled = false,
}: QuestionCardProps) {
  const choices =
    'shuffledChoices' in question
      ? (question as ShuffledQuestion).shuffledChoices
      : question.choices;

  const getChoiceState = (index: number): ChoiceState => {
    if (!isReviewMode) {
      return selectedChoiceIndex === index ? 'selected' : 'default';
    }
    if (choices[index].isCorrect) return 'correct';
    if (selectedChoiceIndex === index && !choices[index].isCorrect) return 'incorrect';
    return 'default';
  };

  const handlePress = (index: number) => {
    if (disabled || isReviewMode) return;
    Haptics.selectionAsync().catch(() => {});
    onSelectChoice(index);
  };

  return (
    <View
      className="bg-card border border-border rounded-2xl p-4"
      accessibilityLabel={`Question ${questionNumber} sur ${totalQuestions}`}
    >
      {/* Header */}
      <View className="gap-2 mb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium text-muted-foreground">
            Question {questionNumber}/{totalQuestions}
          </Text>
          {question.difficulty ? (
            <View className={cn('px-2 py-1 rounded-full', difficultyClasses[question.difficulty])}>
              <Text className={cn('text-xs', difficultyClasses[question.difficulty])}>
                {difficultyLabel[question.difficulty]}
              </Text>
            </View>
          ) : null}
        </View>
        <View className="flex-row items-center gap-2">
          <Badge label={getTopicName(question.topic, true)} color={getTopicColor(question.topic)} />
          <Badge
            label={getQuestionTypeName(question.type, true)}
            color={getQuestionTypeColor(question.type)}
          />
        </View>
      </View>

      {/* Question text */}
      <Text className="text-lg font-semibold text-foreground mb-5 leading-relaxed">
        {question.question}
      </Text>

      {/* Choices */}
      <View className="gap-2.5" accessibilityRole="radiogroup">
        {choices.map((choice, index) => {
          const state = getChoiceState(index);
          const isSelected = selectedChoiceIndex === index;
          const letter = String.fromCharCode(65 + index);

          return (
            <Pressable
              key={index}
              onPress={() => handlePress(index)}
              disabled={disabled || isReviewMode}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected, disabled: disabled || isReviewMode }}
              accessibilityLabel={`Option ${letter}: ${choice.label}`}
              className={cn(
                'flex-row items-start gap-3 p-3.5 rounded-xl border-2',
                state === 'default' && 'border-border bg-background',
                state === 'selected' && 'border-primary bg-primary/10',
                state === 'correct' && 'border-green-500 bg-green-50',
                state === 'incorrect' && 'border-red-500 bg-red-50'
              )}
              style={{ minHeight: 52 }}
            >
              <View
                className={cn(
                  'w-8 h-8 rounded-full items-center justify-center',
                  state === 'default' && 'bg-secondary',
                  state === 'selected' && 'bg-primary',
                  state === 'correct' && 'bg-green-500',
                  state === 'incorrect' && 'bg-red-500'
                )}
              >
                {state === 'correct' ? (
                  <Check size={18} color="#ffffff" />
                ) : state === 'incorrect' ? (
                  <X size={18} color="#ffffff" />
                ) : (
                  <Text
                    className={cn(
                      'text-sm font-semibold',
                      state === 'selected' ? 'text-primary-foreground' : 'text-secondary-foreground'
                    )}
                  >
                    {letter}
                  </Text>
                )}
              </View>
              <Text
                className={cn(
                  'flex-1 pt-1 text-base leading-relaxed',
                  state === 'correct' && 'text-green-900',
                  state === 'incorrect' && 'text-red-900',
                  (state === 'default' || state === 'selected') && 'text-foreground'
                )}
              >
                {choice.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Explanation (review mode only) */}
      {showExplanation && question.explanation ? (
        <View className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl flex-row gap-3">
          <Info size={20} color={colors.blue600} />
          <View className="flex-1">
            <Text className="font-semibold text-blue-900 mb-1">Explication</Text>
            <Text className="text-blue-800 text-sm leading-relaxed">{question.explanation}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
});
