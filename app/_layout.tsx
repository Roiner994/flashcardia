import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/store/useStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { session, checkSession } = useStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (!session) return;
    const inAuthGroup = (segments[0] as string) === '(auth)';
    
    // Simple redirect logic if desired, or let user browse locally until they want to sync.
    // For this app, let's keep it open but maybe redirect OUT of login if logged in.
    if (session && inAuthGroup) {
        router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
        // Optional: Force login? Or allow guest mode?
        // App started as local-first, so allow guest mode.
    }
  }, [session, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="deck/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="review/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
