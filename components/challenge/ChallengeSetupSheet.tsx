import {
  CARD_STATUS,
  CardStatus,
  CHALLENGE_DIFFICULTY,
} from "@constants/AppConstants";
import { Colors } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useChallengeSetup } from "@hooks/useChallengeSetup";
import { useTheme } from "@hooks/useThemeColor";
import { Deck } from "@store/types";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ChallengeSetupSheetProps {
  visible: boolean;
  onClose: () => void;
  deck: Deck;
}

export function ChallengeSetupSheet({
  visible,
  onClose,
  deck,
}: ChallengeSetupSheetProps) {
  const { t } = useTranslation();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const {
    difficulty,
    setDifficulty,
    selectedStatuses,
    toggleStatus,
    cardLimit,
    setCardLimit,
    isCustomMode,
    setIsCustomMode,
    customValue,
    setCustomValue,
    filteredCardsCount,
    handleStart,
  } = useChallengeSetup(deck, onClose);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("challenge.setupTitle")}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={styles.content}
          >
            <View style={styles.deckHeader}>
              <Text style={styles.deckTitle}>{deck.title}</Text>
              <Text style={styles.cardCount}>
                <Text style={{ fontWeight: "700", color: colors.text }}>
                  {filteredCardsCount}
                </Text>{" "}
                {t("challenge.cardsAvailable", {
                  count: filteredCardsCount,
                }).replace(filteredCardsCount.toString(), "")}
              </Text>
            </View>

            {/* Filters */}
            <View style={styles.filterGrid}>
              {[
                {
                  s: CARD_STATUS.NEW,
                  l: t("challenge.filterNew"),
                  i: "sparkles",
                  c: colors.info,
                },
                {
                  s: CARD_STATUS.LEARNING,
                  l: t("challenge.filterActive"),
                  i: "school",
                  c: colors.error,
                },
                {
                  s: CARD_STATUS.REVIEW,
                  l: t("challenge.filterReview"),
                  i: "checkmark-circle",
                  c: colors.success,
                },
              ].map((item) => {
                const isSelected = selectedStatuses.includes(
                  item.s as CardStatus,
                );
                return (
                  <TouchableOpacity
                    key={item.s}
                    style={[
                      styles.filterCard,
                      {
                        backgroundColor: colors.surface,
                        overflow: "hidden",
                      },
                      isSelected
                        ? { borderColor: item.c }
                        : { borderColor: colors.border },
                    ]}
                    onPress={() => toggleStatus(item.s as CardStatus)}
                  >
                    {/* Tint Overlay */}
                    {isSelected && (
                      <View
                        style={[
                          StyleSheet.absoluteFill,
                          { backgroundColor: item.c, opacity: 0.12 },
                        ]}
                      />
                    )}

                    <View
                      style={[
                        styles.miniIcon,
                        { backgroundColor: item.c + "20" },
                      ]}
                    >
                      <Ionicons name={item.i as any} size={16} color={item.c} />
                    </View>
                    <Text
                      style={[
                        styles.filterText,
                        isSelected && { color: item.c, fontWeight: "700" },
                      ]}
                    >
                      {item.l}
                    </Text>
                    {isSelected && (
                      <View
                        style={[styles.miniBadge, { backgroundColor: item.c }]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Card Limit */}
            <Text style={styles.sectionTitle}>{t("challenge.limit")}</Text>
            <View style={styles.limitContainer}>
              {[10, 20, 50].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.limitOption,
                    !isCustomMode &&
                      cardLimit === num && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    (isCustomMode || cardLimit !== num) && {
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    setCardLimit(num);
                    setIsCustomMode(false);
                  }}
                >
                  <Text
                    style={[
                      styles.limitText,
                      !isCustomMode && cardLimit === num
                        ? { color: "white" }
                        : { color: colors.text },
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.limitOption,
                  !isCustomMode &&
                    cardLimit === 999 && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  (isCustomMode || cardLimit !== 999) && {
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => {
                  setCardLimit(999);
                  setIsCustomMode(false);
                }}
              >
                <Text
                  style={[
                    styles.limitText,
                    !isCustomMode && cardLimit === 999
                      ? { color: "white" }
                      : { color: colors.text },
                  ]}
                >
                  {t("challenge.all")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.limitOption,
                  isCustomMode && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                  !isCustomMode && { borderColor: colors.border },
                ]}
                onPress={() => {
                  setIsCustomMode(true);
                }}
              >
                {isCustomMode ? (
                  <TextInput
                    style={[
                      styles.limitText,
                      { color: "white", width: "100%", textAlign: "center" },
                    ]}
                    value={customValue}
                    onChangeText={(val) => {
                      setCustomValue(val);
                      const n = parseInt(val);
                      if (!isNaN(n)) setCardLimit(n);
                    }}
                    keyboardType="numeric"
                    autoFocus
                    placeholder="#"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                  />
                ) : (
                  <Ionicons name="pencil" size={20} color={colors.text} />
                )}
              </TouchableOpacity>
            </View>

            {/* Difficulty */}
            <Text style={styles.sectionTitle}>{t("challenge.modeTitle")}</Text>
            <View style={styles.modeContainer}>
              <View style={styles.modeRow}>
                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    { backgroundColor: colors.surface },
                    difficulty === CHALLENGE_DIFFICULTY.EASY && {
                      borderColor: colors.warning,
                    },
                  ]}
                  onPress={() => setDifficulty(CHALLENGE_DIFFICULTY.EASY)}
                >
                  {difficulty === CHALLENGE_DIFFICULTY.EASY && (
                    <>
                      <View
                        style={[
                          StyleSheet.absoluteFill,
                          { backgroundColor: colors.surface, borderRadius: 16 },
                        ]}
                      />
                      <View
                        style={[
                          StyleSheet.absoluteFill,
                          {
                            backgroundColor: colors.warning,
                            opacity: 0.1,
                            borderRadius: 16,
                          },
                        ]}
                      />
                    </>
                  )}
                  <Ionicons
                    name="bicycle"
                    size={24}
                    color={
                      difficulty === CHALLENGE_DIFFICULTY.EASY
                        ? colors.warning
                        : colors.text
                    }
                  />
                  <Text
                    style={[
                      styles.modeTitle,
                      difficulty === CHALLENGE_DIFFICULTY.EASY && {
                        color: colors.warning,
                      },
                    ]}
                  >
                    {t("challenge.easyTitle")}
                  </Text>
                  {difficulty === CHALLENGE_DIFFICULTY.EASY && (
                    <View
                      style={[
                        styles.selectedBadge,
                        { backgroundColor: colors.warning },
                      ]}
                    >
                      <Ionicons name="checkmark" size={12} color="white" />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    { backgroundColor: colors.surface },
                    difficulty === CHALLENGE_DIFFICULTY.HARD && {
                      borderColor: colors.error,
                    },
                  ]}
                  onPress={() => setDifficulty(CHALLENGE_DIFFICULTY.HARD)}
                >
                  {difficulty === CHALLENGE_DIFFICULTY.HARD && (
                    <>
                      <View
                        style={[
                          StyleSheet.absoluteFill,
                          { backgroundColor: colors.surface, borderRadius: 16 },
                        ]}
                      />
                      <View
                        style={[
                          StyleSheet.absoluteFill,
                          {
                            backgroundColor: colors.error,
                            opacity: 0.1,
                            borderRadius: 16,
                          },
                        ]}
                      />
                    </>
                  )}
                  <Ionicons
                    name="flame"
                    size={24}
                    color={
                      difficulty === CHALLENGE_DIFFICULTY.HARD
                        ? colors.error
                        : colors.text
                    }
                  />
                  <Text
                    style={[
                      styles.modeTitle,
                      difficulty === CHALLENGE_DIFFICULTY.HARD && {
                        color: colors.error,
                      },
                    ]}
                  >
                    {t("challenge.hardTitle")}
                  </Text>
                  {difficulty === CHALLENGE_DIFFICULTY.HARD && (
                    <View
                      style={[
                        styles.selectedBadge,
                        { backgroundColor: colors.error },
                      ]}
                    >
                      <Ionicons name="checkmark" size={12} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Description Below Cards */}
              <View
                style={[
                  styles.modeDescContainer,
                  {
                    backgroundColor:
                      difficulty === CHALLENGE_DIFFICULTY.EASY
                        ? colors.warning + "08"
                        : colors.error + "08",
                    borderColor:
                      difficulty === CHALLENGE_DIFFICULTY.EASY
                        ? colors.warning + "20"
                        : colors.error + "20",
                  },
                ]}
              >
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={
                    difficulty === CHALLENGE_DIFFICULTY.EASY
                      ? colors.warning
                      : colors.error
                  }
                />
                <Text
                  style={[
                    styles.modeDescBelow,
                    {
                      color:
                        difficulty === CHALLENGE_DIFFICULTY.EASY
                          ? colors.warning
                          : colors.error,
                    },
                  ]}
                >
                  {difficulty === CHALLENGE_DIFFICULTY.EASY
                    ? t("challenge.easyDesc")
                    : t("challenge.hardDesc")}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.startButton,
                filteredCardsCount === 0 && { opacity: 0.5 },
              ]}
              disabled={filteredCardsCount === 0}
              onPress={handleStart}
            >
              <Text style={styles.startButtonText}>{t("challenge.start")}</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    closeButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    scrollContent: {
      padding: 24,
      paddingBottom: 40,
    },
    content: {
    },
    deckHeader: {
      marginBottom: 24,
    },
    deckTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
    },
    cardCount: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginTop: 8,
      marginBottom: 12,
    },
    limitContainer: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 24,
    },
    limitOption: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    limitText: {
      fontSize: 16,
      fontWeight: "600",
    },
    filterGrid: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 20,
    },
    filterCard: {
      flex: 1,
      padding: 10,
      borderRadius: 12,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      minHeight: 70,
    },
    miniIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    filterText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    miniBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    modeContainer: {
      marginBottom: 30,
    },
    modeRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },
    modeCard: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 90,
    },
    modeTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
    },
    modeDescContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      marginTop: 8,
    },
    modeDescBelow: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
      lineHeight: 20,
    },
    selectedBadge: {
      position: "absolute",
      top: -8,
      right: -8,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.background,
      zIndex: 10000000
    },
    startButton: {
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      borderRadius: 16,
      gap: 8,
    },
    startButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
    },
  });
