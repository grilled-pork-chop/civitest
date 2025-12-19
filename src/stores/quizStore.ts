import { Store } from '@tanstack/react-store';
import type {
  Question,
  QuizSession,
  QuizResult,
  QuizHistory,
  TopicPerformance,
  TopicId,
} from '@/types';
import { QUIZ_CONFIG, TOPICS } from '@/types';
import {
  selectQuestions,
  generateQuizId,
  shuffleChoices,
  calculatePercentage,
} from '@/utils/questions';
import {
  getQuizHistory,
  addQuizResult,
  addUsedQuestionSet,
} from '@/utils/localStorage';

export interface AppState {
  currentQuiz: QuizSession | null;
  quizHistory: QuizHistory;
  isLoading: boolean;
}

const initialState: AppState = {
  currentQuiz: null,
  quizHistory: getQuizHistory(),
  isLoading: false,
};

export const appStore = new Store<AppState>(initialState);

export const quizActions = {
  /**
   * Start a new quiz session
   */
  startQuiz: (allQuestions: Question[]) => {
    const history = getQuizHistory();
    const selectedQuestions = selectQuestions(
      allQuestions,
      QUIZ_CONFIG.totalQuestions,
      history.usedQuestionSets
    );

    const shuffledQuestions = selectedQuestions.map(shuffleChoices);

    addUsedQuestionSet(selectedQuestions.map((q) => q.id));

    const newQuiz: QuizSession = {
      id: generateQuizId(),
      startedAt: new Date().toISOString(),
      completedAt: null,
      questions: shuffledQuestions,
      answers: shuffledQuestions.map((q) => ({
        questionId: q.id,
        selectedChoiceIndex: null,
        isCorrect: false,
        timeTaken: 0,
      })),
      currentQuestionIndex: 0,
      timeRemaining: QUIZ_CONFIG.timeLimit,
      isCompleted: false,
      isPaused: false,
    };

    appStore.setState((state) => ({
      ...state,
      currentQuiz: newQuiz,
    }));

    return newQuiz;
  },

  /**
   * Answer a question
   */
  answerQuestion: (questionIndex: number, choiceIndex: number) => {
    appStore.setState((state) => {
      if (!state.currentQuiz || state.currentQuiz.isCompleted) return state;

      const question = state.currentQuiz.questions[questionIndex];
      if (!question) return state;

      const shuffledQuestion = question as Question & {
        shuffledChoices?: { isCorrect: boolean }[];
      };
      const isCorrect =
        shuffledQuestion.shuffledChoices?.[choiceIndex]?.isCorrect ?? false;

      const updatedAnswers = [...state.currentQuiz.answers];
      updatedAnswers[questionIndex] = {
        ...updatedAnswers[questionIndex],
        selectedChoiceIndex: choiceIndex,
        isCorrect,
      };

      return {
        ...state,
        currentQuiz: {
          ...state.currentQuiz,
          answers: updatedAnswers,
        },
      };
    });
  },

  /**
   * Navigate to a specific question
   */
  goToQuestion: (index: number) => {
    appStore.setState((state) => {
      if (!state.currentQuiz) return state;

      const clampedIndex = Math.max(
        0,
        Math.min(index, state.currentQuiz.questions.length - 1)
      );

      return {
        ...state,
        currentQuiz: {
          ...state.currentQuiz,
          currentQuestionIndex: clampedIndex,
        },
      };
    });
  },

  /**
   * Go to next question
   */
  nextQuestion: () => {
    appStore.setState((state) => {
      if (!state.currentQuiz) return state;

      const nextIndex = Math.min(
        state.currentQuiz.currentQuestionIndex + 1,
        state.currentQuiz.questions.length - 1
      );

      return {
        ...state,
        currentQuiz: {
          ...state.currentQuiz,
          currentQuestionIndex: nextIndex,
        },
      };
    });
  },

  /**
   * Go to previous question
   */
  prevQuestion: () => {
    appStore.setState((state) => {
      if (!state.currentQuiz) return state;

      const prevIndex = Math.max(state.currentQuiz.currentQuestionIndex - 1, 0);

      return {
        ...state,
        currentQuiz: {
          ...state.currentQuiz,
          currentQuestionIndex: prevIndex,
        },
      };
    });
  },

  /**
   * Update time remaining
   */
  updateTimeRemaining: (seconds: number) => {
    appStore.setState((state) => {
      if (!state.currentQuiz) return state;

      return {
        ...state,
        currentQuiz: {
          ...state.currentQuiz,
          timeRemaining: seconds,
        },
      };
    });
  },

  /**
   * Pause the quiz
   */
  pauseQuiz: () => {
    appStore.setState((state) => {
      if (!state.currentQuiz) return state;

      return {
        ...state,
        currentQuiz: {
          ...state.currentQuiz,
          isPaused: true,
        },
      };
    });
  },

  /**
   * Resume the quiz
   */
  resumeQuiz: () => {
    appStore.setState((state) => {
      if (!state.currentQuiz) return state;

      return {
        ...state,
        currentQuiz: {
          ...state.currentQuiz,
          isPaused: false,
        },
      };
    });
  },

  /**
   * End the quiz and calculate results
   */
  endQuiz: (): QuizResult | null => {
    const state = appStore.state;
    if (!state.currentQuiz) return null;

    const quiz = state.currentQuiz;
    const timeTaken = QUIZ_CONFIG.timeLimit - quiz.timeRemaining;

    const correctAnswers = quiz.answers.filter((a) => a.isCorrect).length;
    const percentage = calculatePercentage(
      correctAnswers,
      quiz.questions.length
    );
    const passed = percentage >= QUIZ_CONFIG.passingScore * 100;

    const topicPerformance: TopicPerformance[] = TOPICS.map((topic) => {
      const topicQuestions = quiz.questions.filter((q) => q.topic === topic.id);
      const topicAnswers = topicQuestions.map((q) =>
        quiz.answers.find((a) => a.questionId === q.id)
      );
      const correct = topicAnswers.filter((a) => a?.isCorrect).length;
      const total = topicQuestions.length;

      return {
        topicId: topic.id as TopicId,
        correct,
        total,
        percentage: calculatePercentage(correct, total),
      };
    }).filter((tp) => tp.total > 0);

    const result: QuizResult = {
      id: quiz.id,
      date: new Date().toISOString(),
      score: correctAnswers,
      totalQuestions: quiz.questions.length,
      percentage,
      passed,
      timeTaken,
      topicPerformance,
    };

    const updatedHistory = addQuizResult(result);

    appStore.setState((state) => ({
      ...state,
      currentQuiz: {
        ...quiz,
        isCompleted: true,
        completedAt: new Date().toISOString(),
      },
      quizHistory: updatedHistory,
    }));

    return result;
  },

  /**
   * Clear current quiz
   */
  clearQuiz: () => {
    appStore.setState((state) => ({
      ...state,
      currentQuiz: null,
    }));
  },

  /**
   * Refresh quiz history from localStorage
   */
  refreshHistory: () => {
    appStore.setState((state) => ({
      ...state,
      quizHistory: getQuizHistory(),
    }));
  },

  /**
   * Set loading state
   */
  setLoading: (isLoading: boolean) => {
    appStore.setState((state) => ({
      ...state,
      isLoading,
    }));
  },
};

export const quizSelectors = {
  getCurrentQuestion: (state: AppState) => {
    if (!state.currentQuiz) return null;
    return state.currentQuiz.questions[state.currentQuiz.currentQuestionIndex];
  },

  getCurrentAnswer: (state: AppState) => {
    if (!state.currentQuiz) return null;
    return state.currentQuiz.answers[state.currentQuiz.currentQuestionIndex];
  },

  getProgress: (state: AppState) => {
    if (!state.currentQuiz) return { answered: 0, total: 0, percentage: 0 };
    const answered = state.currentQuiz.answers.filter(
      (a) => a.selectedChoiceIndex !== null
    ).length;
    const total = state.currentQuiz.questions.length;
    return {
      answered,
      total,
      percentage: calculatePercentage(answered, total),
    };
  },

  getUnansweredCount: (state: AppState) => {
    if (!state.currentQuiz) return 0;
    return state.currentQuiz.answers.filter(
      (a) => a.selectedChoiceIndex === null
    ).length;
  },

  isQuizComplete: (state: AppState) => {
    return state.currentQuiz?.isCompleted ?? false;
  },
};
