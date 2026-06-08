import React from 'react';
import { Modal, Pressable, View, Text } from 'react-native';
import { Button, type ButtonVariant } from './Button';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
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
        className="flex-1 items-center justify-center bg-black/50 px-6"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl bg-card p-6"
        >
          <View className={cn('mb-2', icon ? 'flex-row items-center gap-2' : undefined)}>
            {icon}
            <Text className="text-lg font-bold text-foreground">{title}</Text>
          </View>
          {description ? (
            <Text className="mb-5 text-sm text-muted-foreground leading-relaxed">
              {description}
            </Text>
          ) : (
            <View className="mb-5" />
          )}
          <View className="gap-2">
            <Button title={confirmLabel} variant={confirmVariant} fullWidth onPress={onConfirm} />
            <Button title={cancelLabel} variant="ghost" fullWidth onPress={onCancel} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
