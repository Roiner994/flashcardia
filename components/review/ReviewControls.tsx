import { Colors } from "@constants/Colors";
import { useTheme } from "@hooks/useThemeColor";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ReviewControlsProps {
  isFlipped: boolean;
  onRate: (rating: "again" | "hard" | "good" | "easy") => void;
}

export const ReviewControls = ({ isFlipped, onRate }: ReviewControlsProps) => {
  const { t } = useTranslation();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.controlsContainer}>
      {isFlipped ? (
        <View style={styles.controlsRow}>
          <TouchableOpacity
            onPress={() => onRate("again")}
            style={[styles.ratingButton, { borderColor: colors.error + "40" }]}
          >
            <Text style={[styles.ratingLabel, { color: colors.error }]}>
              {t("review.rateAgain")}
            </Text>
            <Text style={[styles.ratingSub, { color: colors.error + "80" }]}>
              1m
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onRate("hard")}
            style={[
              styles.ratingButton,
              { borderColor: colors.warning + "40" },
            ]}
          >
            <Text style={[styles.ratingLabel, { color: colors.warning }]}>
              {t("review.rateHard")}
            </Text>
            <Text style={[styles.ratingSub, { color: colors.warning + "80" }]}>
              10m
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onRate("good")}
            style={[
              styles.ratingButton,
              { borderColor: colors.success + "40" },
            ]}
          >
            <Text style={[styles.ratingLabel, { color: colors.success }]}>
              {t("review.rateGood")}
            </Text>
            <Text style={[styles.ratingSub, { color: colors.success + "80" }]}>
              1d
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onRate("easy")}
            style={[styles.ratingButton, { borderColor: colors.info + "40" }]}
          >
            <Text style={[styles.ratingLabel, { color: colors.info }]}>
              {t("review.rateEasy")}
            </Text>
            <Text style={[styles.ratingSub, { color: colors.info + "80" }]}>
              4d
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.tapHintContainer}>
          <Text style={styles.tapHintText}>{t("review.tapToSeeAnswer")}</Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    controlsContainer: {
      height: 128,
      paddingHorizontal: 24,
      justifyContent: "center",
    },
    controlsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    ratingButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: "center",
      borderWidth: 1.5,
      backgroundColor: colors.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    ratingLabel: {
      fontWeight: "700",
      fontSize: 14,
      marginBottom: 4,
      textTransform: "uppercase",
    },
    ratingSub: {
      fontSize: 12,
      fontWeight: "500",
    },
    tapHintContainer: {
      alignItems: "center",
    },
    tapHintText: {
      color: colors.textSecondary,
      fontWeight: "700",
      fontSize: 14,
      textTransform: "uppercase",
      letterSpacing: 2,
    },
  });
