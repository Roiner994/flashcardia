import { Colors } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useThemeColor";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ChallengeHeaderProps {
  currentIndex: number;
  total: number;
}

export const ChallengeHeader = React.memo(
  ({ currentIndex, total }: ChallengeHeaderProps) => {
    const router = useRouter();
    const colors = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const progress = total > 0 ? (currentIndex + 1) / total : 0;

    return (
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progress * 100}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1}/{total}
        </Text>
      </View>
    );
  }
);

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    closeButton: {
      padding: 4,
    },
    progressContainer: {
      flex: 1,
      height: 8,
      backgroundColor: colors.surface,
      borderRadius: 4,
      marginHorizontal: 16,
      overflow: "hidden",
    },
    progressBar: {
      height: "100%",
      borderRadius: 4,
    },
    progressText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textSecondary,
    },
  });
