import { Colors } from "@constants/Colors";
import { useTheme } from "@hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

interface StatsDashboardProps {
  dueToday: number;
  learnedWords: number;
}

export function StatsDashboard({
  dueToday,
  learnedWords,
}: StatsDashboardProps) {
  const { t } = useTranslation();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.statsDashboard}>
      <View style={styles.statBox}>
        <View style={styles.statHeader}>
          <Ionicons name="time-outline" size={20} color={colors.error} />
          <Text style={styles.statLabel}>{t("home.dueToday")}</Text>
        </View>
        <Text style={styles.statValue}>
          {dueToday} {t("home.cards")}
        </Text>
      </View>

      <View style={styles.statBox}>
        <View style={styles.statHeader}>
          <Ionicons
            name="trending-up-outline"
            size={20}
            color={colors.success}
          />
          <Text style={styles.statLabel}>{t("home.learned")}</Text>
        </View>
        <Text style={styles.statValue}>
          {learnedWords} {t("home.words")}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    statsDashboard: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 32,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    statHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    statLabel: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 8,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.text,
    },
  });
