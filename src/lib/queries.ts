import { useQuery, QueryClient } from '@tanstack/react-query';
import type { Question } from '@/types';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

async function fetchQuestions(): Promise<Question[]> {
  const response = await fetch('/questions.json');

  if (!response.ok) {
    throw new Error(`Failed to fetch questions: ${response.statusText}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('Invalid questions data: expected an array');
  }

  return data as Question[];
}

export function useQuestions() {
  return useQuery({
    queryKey: ['questions'],
    queryFn: fetchQuestions,
    staleTime: Infinity,
  });
}

export function useQuestionCountByTopic() {
  const { data: questions } = useQuestions();

  if (!questions) {
    return {};
  }

  return questions.reduce(
    (acc, q) => {
      acc[q.topic] = (acc[q.topic] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}
