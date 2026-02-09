import { Colors } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useThemeColor";
import { Deck } from "@store/types";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface ChallengeDeckItemProps {
  deck: Deck;
  onPress: (deck: Deck) => void;
}

export const ChallengeDeckItem = React.memo(({ deck, onPress }: ChallengeDeckItemProps) => {
  const { t } = useTranslation();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={styles.deckCard}
      onPress={() => onPress(deck)}
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
          <Text style={styles.deckSub}>{t("challenge.tapToConfigure")}</Text>
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
  );
});

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
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
  });
