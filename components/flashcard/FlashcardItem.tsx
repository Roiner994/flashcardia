import { Colors } from "@constants/Colors";
import { useTheme } from "@hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card } from "../../types";

interface FlashcardItemProps {
  card: Card;
  onPress: () => void;
}

export const FlashcardItem = ({ card, onPress }: FlashcardItemProps) => {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const getStatusColor = (status: Card["status"]) => {
    switch (status) {
      case "mastered":
        return { bg: colors.success + "20", text: colors.success };
      case "learning":
        return { bg: colors.warning + "20", text: colors.warning };
      default:
        return { bg: colors.info + "20", text: colors.info };
    }
  };

  const statusColors = getStatusColor(card.status || "new");

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="text" size={20} color={colors.textSecondary} />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.frontWord}>{card.front_word}</Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}
            >
              <Text style={[styles.statusText, { color: statusColors.text }]}>
                {card.status || "NEW"}
              </Text>
            </View>
          </View>
          <Text style={styles.definition} numberOfLines={1}>
            {card.definition}
          </Text>
        </View>
      </View>
      <Ionicons name="pencil" size={16} color={colors.icon} />
    </TouchableOpacity>
  );
};

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    iconContainer: {
      width: 40,
      height: 40,
      backgroundColor: colors.background,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    textContainer: {
      flex: 1,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    frontWord: {
      color: colors.text,
      fontWeight: "bold",
      fontSize: 18,
      marginRight: 8,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 10,
      fontWeight: "bold",
      textTransform: "uppercase",
    },
    definition: {
      color: colors.textSecondary,
      fontSize: 14,
    },
  });
