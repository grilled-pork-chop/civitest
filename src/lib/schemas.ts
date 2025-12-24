import { z } from 'zod';

/**
 * Runtime validation schemas using Zod
 * These schemas validate data from external sources (JSON files, localStorage, user imports)
 */

export const QuestionTypeSchema = z.enum(['knowledge', 'situational']);

export const TopicIdSchema = z.enum([
  'principes_valeurs',
  'institutions',
  'droits_devoirs',
  'histoire_geographie_culture',
  'vivre_france',
]);

export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);

export const ChoiceSchema = z.object({
  label: z.string().min(1, 'Choice label cannot be empty'),
  isCorrect: z.boolean(),
});

export const QuestionSchema = z.object({
  id: z.string().min(1, 'Question ID cannot be empty'),
  question: z.string().min(1, 'Question text cannot be empty'),
  type: QuestionTypeSchema,
  topic: TopicIdSchema,
  choices: z
    .array(ChoiceSchema)
    .min(2, 'Question must have at least 2 choices')
    .max(6, 'Question cannot have more than 6 choices')
    .refine(
      (choices) => choices.filter((c) => c.isCorrect).length > 0,
      'Question must have at least one correct answer'
    ),
  explanation: z.string().optional().default(''),
  difficulty: DifficultySchema.optional().default('medium'),
});

export const QuizAnswerSchema = z.object({
  questionId: z.string(),
  selectedChoiceIndex: z.number().nullable(),
  isCorrect: z.boolean(),
  timeTaken: z.number().min(0),
});

export const TopicPerformanceSchema = z.object({
  topicId: TopicIdSchema,
  correct: z.number().min(0),
  total: z.number().min(0),
  percentage: z.number().min(0).max(100),
});

export const QuizResultSchema = z.object({
  id: z.string(),
  date: z.string(),
  score: z.number().min(0),
  totalQuestions: z.number().min(0),
  percentage: z.number().min(0).max(100),
  passed: z.boolean(),
  timeTaken: z.number().min(0),
  topicPerformance: z.array(TopicPerformanceSchema),
  questions: z.array(QuestionSchema).optional(),
  answers: z.array(QuizAnswerSchema).optional(),
});

export const QuizHistorySchema = z.object({
  results: z.array(QuizResultSchema),
  usedQuestionSets: z.array(z.array(z.string())),
  lastQuizDate: z.string().nullable(),
});

/**
 * Validates an array of questions from JSON files
 */
export function validateQuestions(data: unknown): z.infer<typeof QuestionSchema>[] {
  return z.array(QuestionSchema).parse(data);
}

/**
 * Validates quiz history data from localStorage or import
 */
export function validateQuizHistory(data: unknown): z.infer<typeof QuizHistorySchema> {
  return QuizHistorySchema.parse(data);
}
