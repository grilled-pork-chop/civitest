import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Button, type ButtonVariant } from './Button';
import { AppText, Heading } from './Text';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  /** Optional tertiary action shown above cancel (e.g. "jump to unanswered"). */
  extraLabel?: string;
  onExtra?: () => void;
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Centered modal confirmation dialog (replaces the web Radix Dialog).
 * Tapping the backdrop cancels.
 */
export function ConfirmDialog({
  visible,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  confirmVariant = 'default',
  extraLabel,
  onExtra,
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable
        onPress={onCancel}
        accessibilityViewIsModal
        className="flex-1 items-center justify-center bg-black/50 px-6"
      >
        <Pressable
          accessibilityRole="alert"
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl bg-card p-6"
        >
          <View className={cn('mb-2', icon ? 'flex-row items-center gap-2' : undefined)}>
            {icon}
            <Heading size="h3">{title}</Heading>
          </View>
          {description ? (
            <AppText color="muted" className="mb-5 leading-relaxed">
              {description}
            </AppText>
          ) : (
            <View className="mb-5" />
          )}
          <View className="gap-2">
            <Button title={confirmLabel} variant={confirmVariant} fullWidth onPress={onConfirm} />
            {extraLabel && onExtra ? (
              <Button title={extraLabel} variant="outline" fullWidth onPress={onExtra} />
            ) : null}
            <Button title={cancelLabel} variant="ghost" fullWidth onPress={onCancel} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
