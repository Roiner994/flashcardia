import { Colors } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useThemeColor";
import { ChallengeResult } from "@services/ChallengeService";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ChallengeFeedbackProps {
  result: ChallengeResult | null;
  showFeedback: boolean;
  onToggleFeedback: () => void;
  passingScore: number;
}

export const ChallengeFeedback = React.memo(
  ({
    result,
    showFeedback,
    onToggleFeedback,
    passingScore,
  }: ChallengeFeedbackProps) => {
    const { t } = useTranslation();
    const colors = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    if (!result) return null;

    const isPassing = (result.score ?? 0) >= passingScore;

    return (
      <View
        style={[
          styles.resultCard,
          isPassing
            ? { borderColor: colors.success }
            : { borderColor: colors.error },
        ]}
      >
        <View style={styles.scoreRow}>
          <View style={styles.scoreHeaderLeft}>
            <Ionicons
              name={isPassing ? "checkmark-circle" : "alert-circle"}
              size={28}
              color={isPassing ? colors.success : colors.error}
            />
            <Text
              style={[
                styles.scoreLabel,
                { color: isPassing ? colors.success : colors.error },
              ]}
            >
              {t("challenge.active.scoreLabel", {
                score: result.score,
              })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onToggleFeedback}
            style={styles.clueButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showFeedback ? "bulb" : "bulb-outline"}
              size={24}
              color="#FFC107"
            />
          </TouchableOpacity>
        </View>

        {showFeedback && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>{result.feedback}</Text>
            {result.improved_phrase && (
              <View style={styles.improvedContainer}>
                <View style={styles.improvedLabelRow}>
                  <Ionicons name="sparkles" size={16} color={colors.primary} />
                  <Text style={styles.improvedLabel}>
                    {t("challenge.active.improved")}
                  </Text>
                </View>
                <Text style={styles.improvedText}>{result.improved_phrase}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }
);

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    resultCard: {
      padding: 20,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    scoreRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
    },
    scoreHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    scoreLabel: {
      fontSize: 24,
      fontWeight: "800",
    },
    clueButton: {
      padding: 10,
      borderRadius: 12,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    feedbackContainer: {
      marginTop: 16,
    },
    feedbackText: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
    },
    improvedContainer: {
      marginTop: 20,
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
    },
    improvedLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    improvedLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    improvedText: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
      fontStyle: "italic",
    },
  });
