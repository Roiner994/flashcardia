import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useThemeColor";
import { useStore } from "@/store/useStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChallengeScreen() {
  const { t } = useTranslation();
  const colors = useTheme(); // Custom hook ensuring we get the current colors
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { decks } = useStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("tabs.challenge")}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.heroCard}>
          <Ionicons name="trophy" size={48} color={colors.primary} />
          <Text style={styles.heroTitle}>Challenge Mode</Text>
          <Text style={styles.heroSubtitle}>
            Test your knowledge by writing sentences with your cards. AI will
            grade your creativity and grammar!
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Pick a Deck to Start</Text>

        {decks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No decks found. Create one first!
            </Text>
          </View>
        ) : (
          decks.map((deck) => (
            <TouchableOpacity
              key={deck.id}
              style={styles.deckCard}
              // For now, we don't have the config screen, but we will go there next.
              onPress={() => router.push(`/challenge/setup?deckId=${deck.id}`)}
            >
              <View style={styles.deckIcon}>
                <Ionicons name="book" size={24} color={colors.text} />
              </View>
              <View style={styles.deckInfo}>
                <Text style={styles.deckName}>{deck.title}</Text>
                <Text style={styles.deckSub}>Tap to configure challenge</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))
        )}
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
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    content: {
      padding: 20,
    },
    heroCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      marginBottom: 32,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginTop: 12,
      marginBottom: 8,
    },
    heroSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
    },
    deckCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    deckIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    deckInfo: {
      flex: 1,
    },
    deckName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    deckSub: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    emptyState: {
      padding: 20,
      alignItems: "center",
    },
    emptyText: {
      color: colors.textSecondary,
    },
  });
