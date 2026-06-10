import React from 'react';
import { View } from 'react-native';
import { AppText } from './Text';
import { cn } from '@/lib/utils';

/**
 * Tinted statistic tile. Used for the Home performance grid and the post-quiz
 * results stats. `labelPosition` + `valueClass` cover both layouts.
 */
export function StatTile({
  icon,
  label,
  value,
  bg = 'bg-secondary',
  valueClass = 'text-foreground',
  labelClass = 'text-muted-foreground',
  labelPosition = 'below',
  uppercase = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg?: string;
  valueClass?: string;
  labelClass?: string;
  labelPosition?: 'below' | 'beside';
  uppercase?: boolean;
}) {
  return (
    <View className={cn('rounded-2xl p-4 flex-1', bg)} style={{ minWidth: '45%' }}>
      {labelPosition === 'beside' ? (
        <View className="flex-row items-center gap-2 mb-2">
          {icon}
          <AppText size="body" weight="medium" className={labelClass}>
            {label}
          </AppText>
        </View>
      ) : (
        <View className="mb-2">{icon}</View>
      )}
      <AppText weight="bold" className={cn('text-2xl', valueClass)}>
        {value}
      </AppText>
      {labelPosition === 'below' ? (
        <AppText
          size="caption"
          weight="semibold"
          className={cn('mt-0.5', uppercase && 'uppercase', labelClass)}
        >
          {label}
        </AppText>
      ) : null}
    </View>
  );
}
