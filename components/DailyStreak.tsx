import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export const DailyStreak = () => {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Daily Streak</Text>
          <Text style={styles.subtitle}>You're 57% through today's goal!</Text>
        </View>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color={colors.warning} />
          <Text style={styles.streakText}>12 Days</Text>
        </View>
      </View>

      {/* Week Days Visual */}
      <View style={styles.daysRow}>
        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => {
          const isActive = index < 3; // Mock active state
          const isToday = index === 3;

          return (
            <View
              key={index}
              style={[
                styles.dayCircle,
                isActive
                  ? { backgroundColor: colors.primary }
                  : isToday
                    ? {
                        backgroundColor: colors.primary + "20",
                        borderColor: colors.primary,
                        borderWidth: 2,
                      }
                    : { backgroundColor: colors.background },
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  isActive
                    ? { color: "white" }
                    : { color: colors.textSecondary },
                ]}
              >
                {day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 16,
      marginBottom: 24, // Was 8 (mb-8 often larger)
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    title: {
      color: colors.text,
      fontWeight: "bold",
      fontSize: 18,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    streakBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.warning + "20",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    streakText: {
      color: colors.warning,
      fontWeight: "bold",
      marginLeft: 4,
    },
    daysRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    dayCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    dayText: {
      fontWeight: "600",
      fontSize: 14,
    },
  });
