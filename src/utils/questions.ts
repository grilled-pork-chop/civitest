import type { Question, TopicId, ShuffledQuestion, QuestionType } from '@/types';
import { QUESTION_TYPES, SITUATIONAL_TOPIC_CONFIG, TOPICS } from '@/types';

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Shuffle choices for a question and track the mapping
 */
export function shuffleChoices(question: Question): ShuffledQuestion {
  const indices = question.choices.map((_, i) => i);
  const shuffledIndices = shuffle(indices);

  const shuffledChoices = shuffledIndices.map((i) => question.choices[i]);
  const originalToShuffledMap = indices.map((originalIndex) =>
    shuffledIndices.indexOf(originalIndex)
  );

  return {
    ...question,
    shuffledChoices,
    originalToShuffledMap,
  };
}


/**
 * Select questions with weighted distribution by topic
 * Ensures required number of situational questions for specific topics
 */
export function selectQuestions(
  allQuestions: Question[],
  usedQuestionSets: string[][] = []
): Question[] {
  const questionsByTopic = new Map<TopicId, Question[]>();

  for (const topic of TOPICS) {
    questionsByTopic.set(
      topic.id,
      allQuestions.filter((q) => q.topic === topic.id)
    );
  }

  const recentlyUsedIds = new Set(usedQuestionSets.slice(-3).flat());

  const selectedQuestions: Question[] = [];

  for (const topic of TOPICS) {
    const topicQuestions = questionsByTopic.get(topic.id) || [];
    const targetCount = topic.targetCount;
    const situationalRequired = SITUATIONAL_TOPIC_CONFIG[topic.id] || 0;

    if (situationalRequired > 0) {
      // Split by question type
      const situationalQuestions = topicQuestions.filter(
        (q) => q.type === 'situational'
      );
      const knowledgeQuestions = topicQuestions.filter(
        (q) => q.type === 'knowledge'
      );

      // Prioritize fresh questions for each type
      const freshSituational = situationalQuestions.filter(
        (q) => !recentlyUsedIds.has(q.id)
      );
      const usedSituational = situationalQuestions.filter((q) =>
        recentlyUsedIds.has(q.id)
      );
      const freshKnowledge = knowledgeQuestions.filter(
        (q) => !recentlyUsedIds.has(q.id)
      );
      const usedKnowledge = knowledgeQuestions.filter((q) =>
        recentlyUsedIds.has(q.id)
      );

      // Select situational questions
      const availableSituational = [
        ...shuffle(freshSituational),
        ...shuffle(usedSituational),
      ];
      const selectedSituational = availableSituational.slice(
        0,
        situationalRequired
      );

      // Select knowledge questions for remaining slots
      const knowledgeCount = targetCount - selectedSituational.length;
      const availableKnowledge = [
        ...shuffle(freshKnowledge),
        ...shuffle(usedKnowledge),
      ];
      const selectedKnowledge = availableKnowledge.slice(0, knowledgeCount);

      selectedQuestions.push(...selectedSituational, ...selectedKnowledge);
    } else {
      // Original logic for other topics
      const freshQuestions = topicQuestions.filter(
        (q) => !recentlyUsedIds.has(q.id)
      );
      const usedQuestions = topicQuestions.filter((q) =>
        recentlyUsedIds.has(q.id)
      );

      const availableQuestions = [
        ...shuffle(freshQuestions),
        ...shuffle(usedQuestions),
      ];
      const selected = availableQuestions.slice(0, targetCount);

      selectedQuestions.push(...selected);
    }
  }

  return shuffle(selectedQuestions);
}

/**
 * Generate a unique quiz ID
 */
export function generateQuizId(): string {
  return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format time in MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format time in minutes and seconds (verbose)
 */
export function formatTimeVerbose(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return `${secs} seconde${secs !== 1 ? 's' : ''}`;
  }
  if (secs === 0) {
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  }
  return `${mins} min ${secs} sec`;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Get color for score percentage
 */
export function getScoreColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get background color for score percentage
 */
export function getScoreBgColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-100';
  if (percentage >= 60) return 'bg-yellow-100';
  return 'bg-red-100';
}

/**
 * Get topic color by ID
 */
export function getTopicColor(topicId: TopicId): string {
  const topic = TOPICS.find((t) => t.id === topicId);
  return topic?.color || '#6B7280';
}

/**
 * Get topic name by ID
 */
export function getTopicName(topicId: TopicId, short = false): string {
  const topic = TOPICS.find((t) => t.id === topicId);
  return short ? topic?.nameShort || topicId : topic?.name || topicId;
}

/**
 * Get question type color by type
 */
export function getQuestionTypeColor(type: QuestionType): string {
  const questionType = QUESTION_TYPES.find((t) => t.id === type);
  return questionType?.color || '#6B7280';
}

/**
 * Get question type name
 */
export function getQuestionTypeName(type: QuestionType, short = false): string {
  const questionType = QUESTION_TYPES.find((t) => t.id === type);
  return short ? questionType?.nameShort || type : questionType?.name || type;
}

/**
 * Format date in French locale
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date short
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
