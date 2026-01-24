import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Deck } from "../types";

interface DeckCardProps {
  deck: Deck;
}

export const DeckCard = ({ deck }: DeckCardProps) => {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Mock progress
  const progress = Math.floor(Math.random() * 100);
  const color =
    progress > 70
      ? colors.success
      : progress > 30
        ? colors.warning
        : colors.info;

  return (
    <Link href={`/deck/${deck.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        <View style={styles.content}>
          <Text style={[styles.progressText, { color: colors.success }]}>
            75% Complete
          </Text>
          <Text style={styles.title}>{deck.title}</Text>

          <View style={styles.statsRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>12 cards due</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Study Now</Text>
            <Ionicons name="arrow-forward" size={14} color="white" />
          </TouchableOpacity>
        </View>

        {/* Progress Ring Mockup */}
        <View style={[styles.ring, { borderColor: color }]}>
          <Text style={styles.ringText}>{progress}%</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 16,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    content: {
      flex: 1,
    },
    progressText: {
      fontSize: 12,
      fontWeight: "bold",
      textTransform: "uppercase",
      marginBottom: 4,
      letterSpacing: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    badge: {
      backgroundColor: colors.info + "20",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    badgeText: {
      color: colors.info,
      fontSize: 12,
      fontWeight: "600",
    },
    button: {
      marginTop: 16,
      backgroundColor: colors.primary, // Using primary for consistency
      alignSelf: "flex-start",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    buttonText: {
      color: "white",
      fontWeight: "600",
      fontSize: 14,
      marginRight: 8,
    },
    ring: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 4,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 16,
    },
    ringText: {
      fontWeight: "bold",
      color: colors.textSecondary,
    },
  });
