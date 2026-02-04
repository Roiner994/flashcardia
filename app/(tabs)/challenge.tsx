import { ChallengeSetupSheet } from "@components/challenge/ChallengeSetupSheet";
// Refactored to avoid magic strings and centralized component organization
import { Colors } from "@constants/Colors";
import { useTheme } from "@hooks/useThemeColor";
import { Deck } from "@store/types";
import { useStore } from "@store/useStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>{t("challenge.pickDeck")}</Text>

        {decks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="albums-outline"
              size={48}
              color={colors.textSecondary}
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.emptyText}>{t("challenge.noDecks")}</Text>
          </View>
        ) : (
          decks.map((deck) => (
            <TouchableOpacity
              key={deck.id}
              style={styles.deckCard}
              onPress={() => handleStartSetup(deck)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[colors.surface, colors.surface]}
                style={styles.deckCardGradient}
              >
                <View style={styles.deckIcon}>
                  <Ionicons name="book" size={24} color={colors.primary} />
                </View>
                <View style={styles.deckInfo}>
                  <Text style={styles.deckName}>{deck.title}</Text>
                  <Text style={styles.deckSub}>
                    {t("challenge.tapToConfigure")}
                  </Text>
                </View>
                <View style={styles.chevronContainer}>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

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
    deckCard: {
      marginBottom: 12,
      borderRadius: 20,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    deckCardGradient: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border + "80", // lighter border
    },
    deckIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.primary + "15", // very light primary
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    deckInfo: {
      flex: 1,
    },
    deckName: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    deckSub: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: "500",
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
