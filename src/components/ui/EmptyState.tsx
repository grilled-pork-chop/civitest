import React from 'react';
import { View } from 'react-native';
import { AppText, Heading } from './Text';

/**
 * Centered empty / error state: icon, title, description, and optional actions.
 * Shared by Home (welcome/error), Stats (no data) and Review (error/no-match).
 */
export function EmptyState({
  icon,
  title,
  description,
  children,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  // w-full matters: the parent screens use `items-center`, which sizes this node to
  // fit its content. Without it the action block's `w-full` resolves against the
  // widest wrapped text line rather than the screen width.
  return (
    <View className={className ?? 'w-full items-center'}>
      {icon}
      <Heading size="h1" className="mt-4 mb-2 text-center">
        {title}
      </Heading>
      {description ? (
        <AppText color="muted" className="mb-6 text-center leading-relaxed">
          {description}
        </AppText>
      ) : null}
      {children ? <View className="w-full gap-3">{children}</View> : null}
    </View>
  );
}
