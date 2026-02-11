import { Colors } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useThemeColor";
import { Card } from "@types";
import React, { useEffect, useMemo, useState } from "react";
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
  const [showMeaning, setShowMeaning] = useState(false);

  useEffect(() => {
    setShowMeaning(false);
  }, [isFlipped]);

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
              <ScrollView contentContainerStyle={styles.cardBackScroll}>
                <View style={styles.pillLabelContainerBack}>
                <Text style={styles.pillLabelTextBack}>
                  {t("review.definition")}
                </Text>
              </View>
                <Text style={styles.definitionText}>{card.definition}</Text>
                
                {card.spanish_meaning && (
                    <View style={styles.meaningContainer}>
                        <TouchableOpacity
                            style={[
                                styles.meaningChip,
                                showMeaning && styles.meaningChipActive,
                            ]}
                            onPress={(e) => {
                                e.stopPropagation();
                                setShowMeaning(!showMeaning);
                            }}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={showMeaning ? "eye-off-outline" : "eye-outline"}
                                size={16}
                                color={showMeaning ? colors.surface : colors.primary}
                            />
                            <Text style={[
                                styles.meaningLabel,
                                showMeaning && styles.meaningLabelActive,
                            ]}>
                                {showMeaning ? t("review.meaning") : t("review.meaning")}
                            </Text>
                        </TouchableOpacity>
                        {showMeaning && (
                            <Text style={styles.meaningText}>{card.spanish_meaning}</Text>
                        )}
                    </View>
                )}
                
                {/* Phonetic & Audio */}
                <TouchableOpacity 
                    style={styles.phoneticContainer} 
                    onPress={(e) => {
                        e.stopPropagation();
                        onSpeak();
                    }}
                >
                    <Ionicons name="volume-high" size={24} color={colors.primary} />
                    {card.phonetic && (
                        <Text style={styles.phoneticText}>/{card.phonetic}/</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.divider} />
                {card.examples && card.examples.length > 0 && (
                  <View style={styles.exampleContainer}>
                    {card.examples.slice(0, 3).map((example, index) => (
                        <Text key={index} style={[styles.exampleText, index > 0 && { marginTop: 12 }]}>
                            "{example}"
                        </Text>
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>
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
      height: 520,
      borderRadius: 40,
      backfaceVisibility: "hidden",
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
      padding: 24,
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
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 100,
      marginBottom: 12,
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
      fontSize: 18,
      fontWeight: "500",
      color: colors.text,
      textAlign: "center",
      lineHeight: 26,
      marginBottom: 12,
    },
    divider: {
      width: 40,
      height: 2,
      backgroundColor: colors.border,
      marginVertical: 12,
    },
    exampleContainer: {
      backgroundColor: colors.background,
      padding: 12,
      borderRadius: 12,
      width: "100%",
      borderWidth: 1,
      borderColor: colors.border,
    },
    exampleText: {
      color: colors.textSecondary,
      textAlign: "center",
      fontStyle: "italic",
      fontSize: 13,
      lineHeight: 20,
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
    phoneticContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 8,
        borderRadius: 8,
        backgroundColor: colors.background,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    phoneticText: {
        fontSize: 15,
        color: colors.textSecondary,
        marginLeft: 8,
        fontStyle: "italic",
        fontFamily: "System",
    },
    meaningContainer: {
        alignItems: "center",
        marginBottom: 12,
        width: "100%",
    },
    meaningChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: colors.primary + "60",
        backgroundColor: colors.primary + "10",
    },
    meaningChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    meaningLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.primary,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    meaningLabelActive: {
        color: colors.surface,
    },
    meaningText: {
        fontSize: 16,
        color: colors.text,
        textAlign: "center",
        fontWeight: "500",
        marginTop: 8,
    },
  });
