import "@i18n";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "../global.css";

import CustomSplashScreen from "@components/SplashScreen";
import { useStore } from "@store/useStore";
import { useColorScheme } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const { session, checkSession, loadSettings, themeMode } = useStore();
  const systemColorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await checkSession();
        await loadSettings();

        // Artificial delay: Ensure custom splash is visible for at least 2 seconds
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Hiding the native splash screen here will verify that the custom splash component is rendered
        await SplashScreen.hideAsync();
        setIsAppReady(true);
      }
    }

    prepare();
  }, [checkSession, loadSettings]);

  const effectiveTheme = themeMode === "system" ? systemColorScheme : themeMode;

  useEffect(() => {
    if (!session) return;
    const inAuthGroup = (segments[0] as string) === "(auth)";

    // Redirect authenticated users away from the auth screens (login)
    if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, segments, router]);

  if (!isAppReady) {
    return <CustomSplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider
        value={effectiveTheme === "dark" ? DarkTheme : DefaultTheme}
      >
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          <Stack.Screen name="deck/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="deck/[id]/cards"
            options={{ headerShown: false }}
          />
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
        <StatusBar style={effectiveTheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
