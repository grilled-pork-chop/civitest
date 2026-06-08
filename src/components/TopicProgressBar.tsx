import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/ui/Text';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getTopicColor, getTopicName } from '@/utils/questions';
import { colors } from '@/theme/tokens';
import { PASS_PERCENTAGE, type TopicId } from '@/types';
import { cn } from '@/lib/utils';

/**
 * One topic's score as a labeled progress bar. Shared by the results summary
 * and the review screen.
 * - `colorMode='topic'`: bar uses the topic's brand color.
 * - `colorMode='passfail'`: bar is green/red against the 80% threshold.
 */
export const TopicProgressBar = React.memo(function TopicProgressBar({
  topicId,
  correct,
  total,
  percentage,
  colorMode = 'topic',
  showDot = false,
  showCounts = false,
  height = 12,
}: {
  topicId: TopicId;
  correct: number;
  total: number;
  percentage: number;
  colorMode?: 'topic' | 'passfail';
  showDot?: boolean;
  showCounts?: boolean;
  height?: number;
}) {
  const isPassing = percentage >= PASS_PERCENTAGE;
  const barColor =
    colorMode === 'topic' ? getTopicColor(topicId) : isPassing ? colors.green500 : colors.red500;

  return (
    <View>
      <View className="flex-row justify-between items-center mb-1.5">
        <View className="flex-row items-center gap-1.5 flex-1 pr-2">
          {showDot ? (
            <View
              style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getTopicColor(topicId) }}
            />
          ) : null}
          <AppText size="body" weight="medium" numberOfLines={1}>
            {getTopicName(topicId, true)}
          </AppText>
        </View>
        <AppText
          size="body"
          weight="semibold"
          className={cn(isPassing ? 'text-green-600' : 'text-red-600')}
        >
          {showCounts ? `${correct}/${total} (${percentage}%)` : `${percentage}%`}
        </AppText>
      </View>
      <ProgressBar percentage={percentage} color={barColor} height={height} />
    </View>
  );
});
