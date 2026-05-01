import { useTheme } from "@hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import "../../global.css";

export default function TabLayout() {
  const { t } = useTranslation();
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.decks"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "layers" : "layers-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t("tabs.explore") || "Explore",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "earth" : "earth-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="challenge"
        options={{
          title: t("tabs.challenge"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "trophy" : "trophy-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
