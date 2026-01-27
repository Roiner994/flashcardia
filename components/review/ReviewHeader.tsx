import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ReviewHeaderProps {
  onBack: () => void;
  onShowOptions: () => void;
  stats: {
    new: number;
    learning: number;
    review: number;
  };
}

export const ReviewHeader = ({
  onBack,
  onShowOptions,
  stats,
}: ReviewHeaderProps) => {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.closeButton}>
        <Ionicons name="close" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        {/* New (Blue) */}
        <Text style={[styles.statCount, { color: colors.info }]}>
          {stats.new}
        </Text>
        {/* Learning (Red) */}
        <Text style={[styles.statCount, { color: colors.error }]}>
          {stats.learning}
        </Text>
        {/* Review (Green) */}
        <Text style={[styles.statCount, { color: colors.success }]}>
          {stats.review}
        </Text>
      </View>

      <TouchableOpacity style={styles.optionsButton} onPress={onShowOptions}>
        <Ionicons name="options" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    closeButton: {
      padding: 4,
    },
    optionsButton: {
      padding: 4,
    },
    statsContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    statCount: {
      fontSize: 16,
      fontWeight: "bold",
      marginHorizontal: 4,
      minWidth: 20,
      textAlign: "center",
    },
  });
