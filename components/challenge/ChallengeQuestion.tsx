import { Colors } from "@constants/Colors";
import { useTheme } from "@hooks/useThemeColor";
import { Card } from "@store/types";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

interface ChallengeQuestionProps {
  card: Card;
}

export const ChallengeQuestion = React.memo(({ card }: ChallengeQuestionProps) => {
  const { t } = useTranslation();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.instruction}>
        {t("challenge.active.makeSentence")}
      </Text>
      <Text style={styles.targetWord}>{card?.front_word}</Text>
      <Text style={styles.definitionHint}>{card?.definition}</Text>
    </View>
  );
});

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    cardContainer: {
      alignItems: "center",
      marginVertical: 32,
    },
    instruction: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    targetWord: {
      fontSize: 36,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    definitionHint: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      fontStyle: "italic",
    },
  });
