import '../global.css';

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { queryClient } from '@/lib/queries';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ contentStyle: { backgroundColor: '#ffffff' } }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="quiz"
                options={{ headerShown: false, gestureEnabled: false }}
              />
              <Stack.Screen
                name="stats"
                options={{ title: 'Statistiques', headerBackTitle: 'Retour' }}
              />
              <Stack.Screen name="review" options={{ headerShown: false }} />
              <Stack.Screen name="review/[quizId]" options={{ headerShown: false }} />
            </Stack>
            <Toast topOffset={60} />
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
