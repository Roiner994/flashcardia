import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StatsScreen() {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Statistics</Text>
        </View>

        <View style={styles.placeholder}>
          <Ionicons
            name="stats-chart-outline"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={styles.placeholderTitle}>Coming Soon</Text>
          <Text style={styles.placeholderText}>
            Track your learning progress, streaks, and achievements here.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    header: {
      paddingVertical: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
    },
    placeholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 100,
    },
    placeholderTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    placeholderText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      paddingHorizontal: 40,
    },
  });
