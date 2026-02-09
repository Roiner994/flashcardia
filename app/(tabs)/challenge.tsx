import { ChallengeSetupSheet } from "@components/challenge/ChallengeSetupSheet";
// Refactored to avoid magic strings and centralized component organization
import { ChallengeDeckItem } from "@components/challenge/ChallengeDeckItem";
import { Colors } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useThemeColor";
import { Deck } from "@store/types";
import { useStore } from "@store/useStore";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChallengeScreen() {
  const { t } = useTranslation();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { decks } = useStore();

  const [setupVisible, setSetupVisible] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);

  const handleStartSetup = (deck: Deck) => {
    setSelectedDeck(deck);
    setSetupVisible(true);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, "#8b5cf6"]} // Deep Purple to Violet
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t("tabs.challenge")}</Text>
          </View>

          <View style={styles.heroContent}>
            <View style={styles.heroIconCircle}>
              <Ionicons name="trophy" size={32} color="#8b5cf6" />
            </View>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>{t("challenge.heroTitle")}</Text>
              <Text style={styles.heroSubtitle}>
                {t("challenge.heroSubtitle")}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.contentContainer}>
        <FlatList
          data={decks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChallengeDeckItem deck={item} onPress={handleStartSetup} />
          )}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="albums-outline"
                size={48}
                color={colors.textSecondary}
                style={{ marginBottom: 16 }}
              />
              <Text style={styles.emptyText}>{t("challenge.noDecks")}</Text>
            </View>
          }
        />
      </View>

      {selectedDeck && (
        <ChallengeSetupSheet
          visible={setupVisible}
          onClose={() => setSetupVisible(false)}
          deck={selectedDeck}
        />
      )}
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    heroGradient: {
      paddingBottom: 40,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
      elevation: 8,
      shadowColor: "#8b5cf6",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
    },
    safeArea: {
      paddingHorizontal: 20,
    },
    header: {
      paddingVertical: 16,
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: "800",
      color: "white",
      letterSpacing: -0.5,
    },
    heroContent: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.15)",
      padding: 24,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.2)",
    },
    heroIconCircle: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: "white",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
      shadowColor: "black",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    heroTextContainer: {
      flex: 1,
    },
    heroTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
      marginBottom: 6,
    },
    heroSubtitle: {
      fontSize: 14,
      color: "rgba(255,255,255,0.9)",
      lineHeight: 20,
      fontWeight: "500",
    },
    contentContainer: {
      flex: 1,
    },
    scrollContent: {
      padding: 24,
      paddingBottom: 100,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 16,
      marginLeft: 4,
    },
    chevronContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyState: {
      padding: 40,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderStyle: "dashed",
      borderWidth: 2,
      borderColor: colors.border,
      marginTop: 8,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: "500",
      textAlign: "center",
    },
  });
