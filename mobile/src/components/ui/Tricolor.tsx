import React from 'react';
import { View } from 'react-native';
import { TRICOLOR } from '@/theme/tokens';

/**
 * The French tricolor band (bleu-blanc-rouge), used as a sparing republican
 * accent under headers/hero sections.
 */
export function Tricolor({ height = 4 }: { height?: number }) {
  return (
    <View className="flex-row" style={{ height }}>
      {TRICOLOR.map((c) => (
        <View key={c} style={{ flex: 1, backgroundColor: c }} />
      ))}
    </View>
  );
}
