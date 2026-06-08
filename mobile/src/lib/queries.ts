import { useEffect } from 'react';
import { useQuery, QueryClient } from '@tanstack/react-query';
import type { Question } from '@/types';
import { validateQuestions } from './schemas';
import { QUESTION_DATA } from './questionData';
import { logger } from '@/services/logger';
import { toast } from '@/services/toast';
import { QUESTION_FILES, ERROR_MESSAGES } from '@/constants/app';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: 1000 * 60 * 30,
      retry: 0,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Load all question files from the bundled JSON.
 * Fully offline — no network requests.
 *
 * @returns Array of validated questions
 * @throws Error if validation fails
 */
async function fetchQuestions(): Promise<Question[]> {
  const loadedFiles: unknown[] = [];
  const missingFiles: string[] = [];

  for (const file of QUESTION_FILES) {
    const data = QUESTION_DATA[file];
    if (data) {
      loadedFiles.push(data);
    } else {
      missingFiles.push(file);
    }
  }

  if (loadedFiles.length === 0) {
    throw new Error('Failed to load any question files');
  }

  if (missingFiles.length > 0) {
    logger.warn(`Missing ${missingFiles.length} bundled question file(s)`, {
      missingFiles,
      loadedCount: loadedFiles.length,
    });
  }

  const allQuestions = loadedFiles.flat();

  try {
    return validateQuestions(allQuestions);
  } catch (error) {
    logger.error(
      'Question validation failed',
      { questionCount: allQuestions.length },
      error as Error
    );
    throw new Error('Invalid question data format. Please check the question files.');
  }
}

/**
 * React Query hook to load and cache questions.
 * Questions are cached indefinitely once loaded.
 */
export function useQuestions() {
  const query = useQuery({
    queryKey: ['questions'],
    queryFn: fetchQuestions,
    staleTime: Infinity,
    retry: false,
  });

  useEffect(() => {
    if (query.error && query.isError) {
      toast.error(ERROR_MESSAGES.QUESTIONS_LOAD_FAILED, { duration: 5000 });
      logger.error(
        'Failed to load questions in useQuestions hook',
        {},
        query.error as Error
      );
    }
  }, [query.error, query.isError]);

  return query;
}

export function useQuestionCountByTopic(): Record<string, number> {
  const { data: questions } = useQuestions();

  if (!questions) {
    return {};
  }

  return questions.reduce(
    (acc: Record<string, number>, q: Question) => {
      acc[q.topic] = (acc[q.topic] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}
