import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ReviewScreen } from '@/components/ReviewScreen';

/** Review a historical quiz loaded by id. */
export default function ReviewById() {
  const { quizId } = useLocalSearchParams<{ quizId?: string }>();
  return <ReviewScreen quizId={quizId} />;
}
