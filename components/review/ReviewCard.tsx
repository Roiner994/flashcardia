import { Colors } from "@constants/Colors";
import { useTheme } from "@hooks/useThemeColor";
import { Card } from "@types";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface ReviewCardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
  onSpeak: () => void;
  frontStyle: any;
  backStyle: any;
}

export const ReviewCard = ({
  card,
  isFlipped,
  onFlip,
  onSpeak,
  frontStyle,
  backStyle,
}: ReviewCardProps) => {
  const { t } = useTranslation();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity activeOpacity={1} onPress={onFlip}>
        <View>
          {/* Front Side */}
          <Animated.View
            pointerEvents={isFlipped ? "none" : "auto"}
            style={[styles.card, styles.cardFront, frontStyle]}
          >
            <View style={styles.pillLabelContainer}>
              <Text style={styles.pillLabelText}>{t("review.concept")}</Text>
            </View>
            <Text style={styles.frontWord}>{card.front_word}</Text>

            <View style={styles.tapToFlipContainer}>
              <Ionicons
                name="finger-print"
                size={20}
                color={colors.textSecondary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.tapToFlipText}>{t("review.tapToFlip")}</Text>
            </View>
          </Animated.View>

          {/* Back Side */}
          <Animated.View
            pointerEvents={isFlipped ? "auto" : "none"}
            style={[
              styles.card,
              styles.cardBack,
              backStyle,
              { position: "absolute", top: 0 },
            ]}
          >
            <View style={styles.cardBackContent}>
              <View style={styles.pillLabelContainerBack}>
                <Text style={styles.pillLabelTextBack}>
                  {t("review.definition")}
                </Text>
              </View>
              <ScrollView contentContainerStyle={styles.cardBackScroll}>
                <Text style={styles.definitionText}>{card.definition}</Text>
                <View style={styles.divider} />
                {card.examples && card.examples.length > 0 && (
                  <View style={styles.exampleContainer}>
                    <Text style={styles.exampleText}>"{card.examples[0]}"</Text>
                  </View>
                )}
              </ScrollView>
            </View>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onSpeak();
              }}
              style={styles.audioButton}
            >
              <Ionicons name="volume-high" size={24} color={colors.primary} />
              <Text style={styles.audioButtonText}>
                {t("review.playAudio")}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    cardContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    card: {
      width: width * 0.85,
      height: 480,
      borderRadius: 40,
      backfaceVisibility: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    cardFront: {
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardBack: {
      backgroundColor: colors.surface,
      padding: 32,
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border,
    },
    pillLabelContainer: {
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 100,
      marginBottom: 32,
    },
    pillLabelText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    frontWord: {
      fontSize: 42,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
      marginBottom: 40,
      lineHeight: 50,
    },
    tapToFlipContainer: {
      position: "absolute",
      bottom: 40,
      flexDirection: "row",
      alignItems: "center",
    },
    tapToFlipText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: 2,
    },
    cardBackContent: {
      alignItems: "center",
      flex: 1,
    },
    pillLabelContainerBack: {
      backgroundColor: colors.success + "20",
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 100,
      marginBottom: 24,
    },
    pillLabelTextBack: {
      color: colors.success,
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    cardBackScroll: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    definitionText: {
      fontSize: 24,
      fontWeight: "500",
      color: colors.text,
      textAlign: "center",
      lineHeight: 32,
      marginBottom: 24,
    },
    divider: {
      width: 40,
      height: 2,
      backgroundColor: colors.border,
      marginVertical: 24,
    },
    exampleContainer: {
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 16,
      width: "100%",
      borderWidth: 1,
      borderColor: colors.border,
    },
    exampleText: {
      color: colors.textSecondary,
      textAlign: "center",
      fontStyle: "italic",
      fontSize: 16,
      lineHeight: 24,
    },
    audioButton: {
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 16,
    },
    audioButtonText: {
      color: colors.text,
      fontWeight: "bold",
      marginLeft: 8,
      fontSize: 16,
    },
  });
