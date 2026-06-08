import React from 'react';
import { View, Text, type ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface CardProps extends ViewProps {
  className?: string;
}

/** Surface container with subtle border + elevation. */
export function Card({ className, children, ...rest }: CardProps) {
  return (
    <View
      className={cn(
        'bg-card border border-border rounded-2xl p-4',
        'shadow-sm shadow-black/5',
        className
      )}
      {...rest}
    >
      {children}
    </View>
  );
}

export function CardHeader({ className, children, ...rest }: CardProps) {
  return (
    <View className={cn('mb-3', className)} {...rest}>
      {children}
    </View>
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Text
      maxFontSizeMultiplier={1.4}
      className={cn('text-base font-semibold text-foreground', className)}
    >
      {children}
    </Text>
  );
}

export function CardContent({ className, children, ...rest }: CardProps) {
  return (
    <View className={cn(className)} {...rest}>
      {children}
    </View>
  );
}
