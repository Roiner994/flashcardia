import { Colors } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useThemeColor";
import { Deck } from "@store/types";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DeckListItemProps {
  deck: Deck;
  totalCards: number;
  newCards: number;
  learningCards: number;
  masteredCards: number;
  index: number;
  onPress: (id: string) => void;
}

export const DeckListItem = React.memo(function DeckListItem({
  deck,
  totalCards,
  newCards,
  learningCards,
  masteredCards,
  index,
  onPress,
}: DeckListItemProps) {
  const { t } = useTranslation();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const iconBgColors = [
    colors.success + "20",
    colors.warning + "20",
    colors.info + "20",
    "#9333ea20",
  ];
  const iconColors = [colors.success, colors.warning, colors.info, "#9333ea"];

  const colorIndex = index % iconBgColors.length;

  return (
    <TouchableOpacity onPress={() => onPress(deck.id)} style={styles.deckItem}>
      <View
        style={[styles.deckIcon, { backgroundColor: iconBgColors[colorIndex] }]}
      >
        <Ionicons name="language" size={24} color={iconColors[colorIndex]} />
      </View>

      <View style={styles.deckInfo}>
        <Text style={styles.deckTitle}>{deck.title}</Text>
        <Text style={styles.deckSubtitle}>
          {t("magic.total")}: {totalCards} {t("home.cards").toLowerCase()}
        </Text>
      </View>

      <View style={styles.badges}>
        <View style={[styles.badge, styles.badgeBlue]}>
          <Text style={styles.badgeTextBlue}>{newCards}</Text>
        </View>
        <View style={[styles.badge, styles.badgeRed]}>
          <Text style={styles.badgeTextRed}>{learningCards}</Text>
        </View>
        <View style={[styles.badge, styles.badgeGreen]}>
          <Text style={styles.badgeTextGreen}>{masteredCards}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    deckItem: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    deckIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    deckInfo: {
      flex: 1,
    },
    deckTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
    },
    deckSubtitle: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    badges: {
      flexDirection: "row",
      gap: 8,
    },
    badge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      minWidth: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeBlue: {
      backgroundColor: colors.info + "20",
    },
    badgeRed: {
      backgroundColor: colors.error + "20",
    },
    badgeGreen: {
      backgroundColor: colors.success + "20",
    },
    badgeTextBlue: {
      color: colors.info,
      fontWeight: "bold",
      fontSize: 12,
    },
    badgeTextRed: {
      color: colors.error,
      fontWeight: "bold",
      fontSize: 12,
    },
    badgeTextGreen: {
      color: colors.success,
      fontWeight: "bold",
      fontSize: 12,
    },
  });
