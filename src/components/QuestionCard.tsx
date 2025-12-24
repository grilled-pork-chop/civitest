/**
 * Question card component
 * Displays a single quiz question with multiple choice options
 */

import React from 'react';
import { Check, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTopicName, getTopicColor, getQuestionTypeName, getQuestionTypeColor } from "@/utils/questions";
import type { Question, ShuffledQuestion } from "@/types";

/**
 * Props for QuestionCard component
 */
interface QuestionCardProps {
  /** Question data (original or shuffled) */
  question: Question | ShuffledQuestion;
  /** Current question number (1-indexed) */
  questionNumber: number;
  /** Total number of questions in quiz */
  totalQuestions: number;
  /** Index of selected choice (null if not answered) */
  selectedChoiceIndex: number | null;
  /** Callback when a choice is selected */
  onSelectChoice: (index: number) => void;
  /** Whether in review mode (shows correct/incorrect) */
  isReviewMode?: boolean;
  /** Whether to show explanation (review mode only) */
  showExplanation?: boolean;
  /** Whether interaction is disabled */
  disabled?: boolean;
}

/**
 * Interactive question card with multiple choice options
 * Displays question text, choices, topic/type badges, and optional explanation
 * Supports both quiz mode and review mode with visual feedback
 *
 * @param props - Component props
 * @returns Question card with interactive choices
 *
 * @example
 * ```tsx
 * <QuestionCard
 *   question={question}
 *   questionNumber={5}
 *   totalQuestions={20}
 *   selectedChoiceIndex={1}
 *   onSelectChoice={(index) => handleSelect(index)}
 *   isReviewMode={false}
 * />
 * ```
 */
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
    "shuffledChoices" in question
      ? (question as ShuffledQuestion).shuffledChoices
      : question.choices;

  const topicColor = getTopicColor(question.topic);
  const questionTypeColor = getQuestionTypeColor(question.type);

  const getChoiceState = (index: number) => {
    if (!isReviewMode) {
      return selectedChoiceIndex === index ? "selected" : "default";
    }

    if (choices[index].isCorrect) {
      return "correct";
    }
    if (selectedChoiceIndex === index && !choices[index].isCorrect) {
      return "incorrect";
    }
    return "default";
  };

  return (
    <div
      className="question-card animate-fade-in"
      role="form"
      aria-label={`Question ${questionNumber} sur ${totalQuestions}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-2 mb-4">
        {/* Première ligne : numéro + difficulté */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Question {questionNumber}/{totalQuestions}
          </span>
          {question.difficulty && (
            <span
              className={cn("text-xs px-2 py-1 rounded-full", {
                "bg-green-100 text-green-700": question.difficulty === "easy",
                "bg-yellow-100 text-yellow-700": question.difficulty === "medium",
                "bg-red-100 text-red-700": question.difficulty === "hard",
              })}
            >
              {question.difficulty === "easy" && "Facile"}
              {question.difficulty === "medium" && "Moyen"}
              {question.difficulty === "hard" && "Difficile"}
            </span>
          )}
        </div>
        {/* Deuxième ligne : badges */}
        <div className="flex items-center gap-2">
          <span
            className="topic-badge text-white text-xs"
            style={{ backgroundColor: topicColor }}
          >
            {getTopicName(question.topic, true)}
          </span>
          <span
            className="topic-badge text-white text-xs"
            style={{ backgroundColor: questionTypeColor }}
          >
            {getQuestionTypeName(question.type, true)}
          </span>
        </div>
      </div>
      {/* Question text */}
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6 leading-relaxed">
        {question.question}
      </h2>

      {/* Choices */}
      <div
        className="space-y-2 sm:space-y-3"
        role="radiogroup"
        aria-label="Réponses possibles"
      >
        {choices.map((choice, index) => {
          const state = getChoiceState(index);
          const isSelected = selectedChoiceIndex === index;
          const letter = String.fromCharCode(65 + index); // A, B, C, D

          return (
            <button
              key={index}
              onClick={() =>
                !disabled && !isReviewMode && onSelectChoice(index)
              }
              disabled={disabled || isReviewMode}
              className={cn("choice-button flex items-start gap-4 group", {
                "border-border bg-background": state === "default",
                "border-primary bg-primary/10": state === "selected",
                "border-green-500 bg-green-50": state === "correct",
                "border-red-500 bg-red-50": state === "incorrect",
                "cursor-not-allowed": disabled || isReviewMode,
                "cursor-pointer": !disabled && !isReviewMode,
              })}
              role="radio"
              aria-checked={isSelected}
              aria-label={`Option ${letter}: ${choice.label}`}
            >
              <span
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                  {
                    "bg-secondary text-secondary-foreground":
                      state === "default",
                    "bg-primary text-primary-foreground": state === "selected",
                    "bg-green-500 text-white": state === "correct",
                    "bg-red-500 text-white": state === "incorrect",
                  }
                )}
              >
                {state === "correct" ? (
                  <Check className="h-5 w-5" />
                ) : state === "incorrect" ? (
                  <X className="h-5 w-5" />
                ) : (
                  letter
                )}
              </span>
              <span
                className={cn("text-left flex-1 pt-1", {
                  "text-foreground":
                    state === "default" || state === "selected",
                  "text-green-900": state === "correct",
                  "text-red-900": state === "incorrect",
                })}
              >
                {choice.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation (review mode only) */}
      {showExplanation && question.explanation && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Explication</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard hint */}
      {!isReviewMode && !disabled && (
        <p className="hidden sm:block mt-4 text-xs text-muted-foreground text-center">
          Utilisez les touches{" "}
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">1-4</kbd> pour
          sélectionner une réponse
        </p>
      )}
    </div>
  );
});
