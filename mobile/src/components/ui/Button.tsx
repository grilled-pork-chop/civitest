import React from 'react';
import { Pressable, Text, View, ActivityIndicator, type PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'default' | 'outline' | 'destructive' | 'ghost' | 'secondary';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon element (e.g. a lucide icon). */
  icon?: React.ReactNode;
  /** Trailing icon element, rendered after the label. */
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  haptic?: boolean;
  className?: string;
  textClassName?: string;
}

const containerVariants: Record<ButtonVariant, string> = {
  default: 'bg-primary active:opacity-90',
  secondary: 'bg-secondary active:opacity-80',
  outline: 'border border-border bg-background active:bg-secondary',
  destructive: 'bg-destructive active:opacity-90',
  ghost: 'bg-transparent active:bg-secondary',
};

const textVariants: Record<ButtonVariant, string> = {
  default: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
  outline: 'text-foreground',
  destructive: 'text-destructive-foreground',
  ghost: 'text-foreground',
};

const sizeContainer: Record<ButtonSize, string> = {
  sm: 'h-11 px-3 rounded-md', // 44pt min height
  md: 'h-12 px-4 rounded-lg',
  lg: 'h-14 px-6 rounded-xl',
};

const sizeText: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-base',
};

/**
 * Accessible button with variants/sizes. Always ≥44pt tall, gives press
 * feedback and optional light haptic.
 */
export function Button({
  title,
  onPress,
  variant = 'default',
  size = 'md',
  icon,
  iconRight,
  fullWidth,
  loading,
  haptic = true,
  disabled,
  className,
  textClassName,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (isDisabled) return;
    if (haptic) {
      Haptics.selectionAsync().catch(() => {});
    }
    onPress?.();
  };

  const indicatorColor =
    variant === 'default' || variant === 'destructive' ? '#f8fafc' : '#002654';

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      accessibilityLabel={title}
      className={cn(
        'flex-row items-center justify-center gap-2',
        containerVariants[variant],
        sizeContainer[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
        className
      )}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={indicatorColor} />
      ) : (
        <>
          {icon ? <View>{icon}</View> : null}
          <Text
            numberOfLines={1}
            maxFontSizeMultiplier={1.4}
            className={cn('font-semibold', textVariants[variant], sizeText[size], textClassName)}
          >
            {title}
          </Text>
          {iconRight ? <View>{iconRight}</View> : null}
        </>
      )}
    </Pressable>
  );
}
