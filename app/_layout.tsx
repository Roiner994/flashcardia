import "@/i18n";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "../global.css";

import { useStore } from "@/store/useStore";
import { useColorScheme } from "react-native";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const { session, checkSession, loadSettings, themeMode } = useStore();
  const systemColorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkSession();
    loadSettings();
  }, [checkSession, loadSettings]);

  const effectiveTheme = themeMode === "system" ? systemColorScheme : themeMode;

  useEffect(() => {
    if (!session) return;
    const inAuthGroup = (segments[0] as string) === "(auth)";

    // Redirect authenticated users away from the auth screens (login)
    if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, segments]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider
        value={effectiveTheme === "dark" ? DarkTheme : DefaultTheme}
      >
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          <Stack.Screen name="deck/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="review/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
          <Stack.Screen
            name="edit-profile"
            options={{
              title: "Edit Profile",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="change-password"
            options={{
              title: "Change Password",
              headerShown: false,
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
