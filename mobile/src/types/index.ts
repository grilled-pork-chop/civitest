export type QuestionType = 'knowledge' | 'situational';

export type TopicId =
  | 'principes_valeurs'
  | 'institutions'
  | 'droits_devoirs'
  | 'histoire_geographie_culture'
  | 'vivre_france';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Choice {
  label: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  topic: TopicId;
  choices: Choice[];
  explanation: string;
  difficulty: Difficulty;
}

export interface TopicConfig {
  id: TopicId;
  name: string;
  nameShort: string;
  targetCount: number;
  color: string;
}

/**
 * Question type configuration
 */
export interface QuestionTypeConfig {
  id: QuestionType;
  name: string;
  nameShort: string;
  color: string;
}

export const TOPICS: TopicConfig[] = [
  {
    id: 'principes_valeurs',
    name: 'Principes et valeurs de la République',
    nameShort: 'Principes & Valeurs',
    targetCount: 11,
    color: '#002654',
  },
  {
    id: 'institutions',
    name: 'Système institutionnel et politique',
    nameShort: 'Institutions',
    targetCount: 6,
    color: '#1E40AF',
  },
  {
    id: 'droits_devoirs',
    name: 'Droits et devoirs',
    nameShort: 'Droits & Devoirs',
    targetCount: 11,
    color: '#059669',
  },
  {
    id: 'histoire_geographie_culture',
    name: 'Histoire, géographie et culture',
    nameShort: 'Histoire & Culture',
    targetCount: 8,
    color: '#9333EA',
  },
  {
    id: 'vivre_france',
    name: 'Vivre dans la société française',
    nameShort: 'Vie Quotidienne',
    targetCount: 4,
    color: '#CE1126',
  },
];

export const TOPIC_MAP: Record<TopicId, TopicConfig> = TOPICS.reduce(
  (acc, topic) => ({ ...acc, [topic.id]: topic }),
  {} as Record<TopicId, TopicConfig>
);

/**
 * Topics that require situational questions
 */
export const SITUATIONAL_TOPIC_CONFIG: Partial<Record<TopicId, number>> = {
  principes_valeurs: 6,
  droits_devoirs: 6,
};

/**
 * Question type configuration
 */
export const QUESTION_TYPES: QuestionTypeConfig[] = [
  {
    id: 'knowledge',
    name: 'Connaissance',
    nameShort: 'Connaissance',
    color: '#6366F1', // Indigo
  },
  {
    id: 'situational',
    name: 'Mise en situation',
    nameShort: 'Situation',
    color: '#F59E0B', // Amber
  },
];

export interface QuizAnswer {
  questionId: string;
  selectedChoiceIndex: number | null;
  isCorrect: boolean;
  timeTaken: number;
}

export interface QuizSession {
  id: string;
  startedAt: string;
  completedAt: string | null;
  questions: Question[];
  answers: QuizAnswer[];
  currentQuestionIndex: number;
  timeRemaining: number;
  isCompleted: boolean;
  isPaused: boolean;
}

export interface QuizResult {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  timeTaken: number;
  topicPerformance: TopicPerformance[];
  questions?: Question[];
  answers?: QuizAnswer[];
}

export interface TopicPerformance {
  topicId: TopicId;
  correct: number;
  total: number;
  percentage: number;
}

export interface QuizHistory {
  results: QuizResult[];
  usedQuestionSets: string[][];
  lastQuizDate: string | null;
}

export interface AppState {
  currentQuiz: QuizSession | null;
  quizHistory: QuizHistory;
  isLoading: boolean;
}

export const QUIZ_CONFIG = {
  totalQuestions: 40,
  timeLimit: 45 * 60,
  passingScore: 0.8,
  passingQuestions: 32,
} as const;

export interface ShuffledQuestion extends Question {
  shuffledChoices: Choice[];
  originalToShuffledMap: number[];
}
