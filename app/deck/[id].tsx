import { AnimatedBottomSheet } from "@/components/AnimatedBottomSheet";
import { BottomSheetHeader } from "@/components/BottomSheetHeader";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useThemeColor";
import { MagicCardResult, MagicGenerator } from "@/services/MagicGenerator";
import { useStore } from "@/store/useStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function DeckDetailScreen() {
  const { t } = useTranslation();
  const { id, initialMagicWord } = useLocalSearchParams<{
    id: string;
    initialMagicWord?: string;
  }>();
  const router = useRouter();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);
  const { decks, currentCards, loadCards, addCard, updateDeck, isLoading } =
    useStore();

  // Settings/Menu State
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [creationStep, setCreationStep] = useState<"input" | "preview">(
    "input",
  );
  const [magicWord, setMagicWord] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] =
    useState<MagicCardResult | null>(null);

  const deck = decks.find((d) => d.id === id);

  useEffect(() => {
    if (id) {
      loadCards(id);
    }
  }, [id]);

  useEffect(() => {
    if (initialMagicWord) {
      setMagicWord(initialMagicWord);
      setModalVisible(true);
      setCreationStep("input");
    }
  }, [initialMagicWord]);

  if (!deck) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("deck.notFound")}</Text>
      </View>
    );
  }

  // Stats
  const getCount = (status: string) =>
    currentCards.filter((c) => (c.status || "new") === status).length;
  const newCount = getCount("new");
  const learningCount = getCount("learning");
  const reviewCount = currentCards.filter(
    (c) => c.status === "review" || c.status === "mastered",
  ).length;

  // Magic Logic
  async function handleMagicGenerate() {
    if (!magicWord.trim()) return;
    setIsGenerating(true);
    try {
      const result = await MagicGenerator.generateCard(magicWord);
      setGeneratedResult(result);
      setCreationStep("preview");
    } catch (error) {
      Alert.alert(t("magic.errorTitle"), t("magic.errorBody"));
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSaveCard() {
    if (!generatedResult) return;
    await addCard({
      deck_id: id,
      front_word: magicWord,
      definition: generatedResult.definition,
      spanish_meaning: generatedResult.spanish_meaning,
      phonetic: generatedResult.phonetic || null,
      examples: generatedResult.examples,
      status: "new",
      next_review_at: null,
      interval: 0,
      ease_factor: 2.5,
    });
    setModalVisible(false);
    resetCreation();
    loadCards(id);
  }

  const resetCreation = () => {
    setMagicWord("");
    setGeneratedResult(null);
    setCreationStep("input");
  };

  const handleStartSession = () => {
    if (currentCards.length === 0) {
      Alert.alert(t("deck.noCardsAlertTitle"), t("deck.noCardsAlertBody"));
      return;
    }
    router.push(`/review/${id}`);
  };

  const speak = (text: string) => {
    if (!text) return;
    console.log("Speaking:", text);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Speech.stop();
    Speech.speak(text, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.9,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setSettingsVisible(true)}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Deck Banner */}
        <TouchableOpacity style={styles.bannerCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="language" size={32} color={colors.primary} />
          </View>
          <Text style={styles.deckTitle}>{deck.title}</Text>
          <Text style={styles.cardCount}>
            {currentCards.length} {t("deck.cardsTotal")}
          </Text>

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartSession}
          >
            <Ionicons name="play-circle-outline" size={24} color="white" />
            <Text style={styles.startButtonText}>{t("deck.startSession")}</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.info }]}>
              {newCount}
            </Text>
            <Text style={styles.statLabel}>{t("deck.new")}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.error }]}>
              {learningCount}
            </Text>
            <Text style={styles.statLabel}>{t("deck.learning")}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {reviewCount}
            </Text>
            <Text style={styles.statLabel}>{t("deck.review")}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>{t("deck.quickActions")}</Text>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="sparkles" size={20} color={colors.primary} />
          </View>
          <Text style={styles.actionText}>{t("deck.createCardAI")}</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.icon} />
        </TouchableOpacity>

        {/* Recent Cards */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>{t("deck.recentCards")}</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>{t("deck.seeAll")}</Text>
          </TouchableOpacity>
        </View>

        {currentCards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t("deck.noCards")}</Text>
          </View>
        ) : (
          currentCards.slice(0, 5).map((card) => (
            <View key={card.id} style={styles.cardItem}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardFront}>{card.front_word}</Text>
                <Text style={styles.cardBack}>{card.definition}</Text>
              </View>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      card.status === "mastered"
                        ? colors.success
                        : card.status === "learning"
                          ? colors.error
                          : colors.info,
                  },
                ]}
              />
            </View>
          ))
        )}
      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={isSettingsVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.inputModalContent}>
            <View style={styles.modalGrabber} />
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setSettingsVisible(false)}
            >
              <Ionicons name="close" size={20} color={colors.icon} />
            </TouchableOpacity>

            <View style={styles.inputModalHeader}>
              <Text style={styles.inputModalTitle}>
                {t("deckSettings.title")}
              </Text>
              <Text style={styles.inputModalSub}>
                {t("deckSettings.subtitle")}
              </Text>
            </View>

            <View style={styles.settingItemRow}>
              <View style={styles.settingIconCol}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.info}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>
                  {t("deckSettings.dailyLimit")}
                </Text>
                <Text style={styles.settingHint}>
                  {t("deckSettings.dailyLimitHint")}
                </Text>
              </View>
              <View style={styles.limitControls}>
                <TouchableOpacity
                  onPress={() =>
                    updateDeck(deck.id, {
                      daily_new_limit: Math.max(
                        1,
                        (deck.daily_new_limit ?? 10) - 1,
                      ),
                    })
                  }
                  style={styles.controlButton}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                <Text style={styles.limitValue}>
                  {deck.daily_new_limit ?? 10}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    updateDeck(deck.id, {
                      daily_new_limit: Math.min(
                        100,
                        (deck.daily_new_limit ?? 10) + 1,
                      ),
                    })
                  }
                  style={styles.controlButton}
                >
                  <Ionicons name="add" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.deleteDeckButton}
              onPress={() => {
                Alert.alert(
                  t("deckSettings.deleteConfirmTitle"),
                  t("deckSettings.deleteConfirmBody"),
                  [
                    { text: t("common.cancel"), style: "cancel" },
                    {
                      text: t("deckSettings.delete"),
                      style: "destructive",
                      onPress: async () => {
                        await useStore.getState().deleteDeck(deck.id);
                        setSettingsVisible(false);
                        router.back();
                      },
                    },
                  ],
                );
              }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text style={styles.deleteDeckText}>
                {t("deckSettings.deleteDeck")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Magic Creation Input - Bottom Sheet */}
      {creationStep === "input" && (
        <AnimatedBottomSheet
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          snapPoint={40}
        >
          {(handleClose) => (
            <>
              <BottomSheetHeader
                title={t("magic.title")}
                subtitle={t("magic.subtitle")}
                onClose={handleClose}
              />

              <View style={styles.bottomSheetContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t("magic.inputLabel")}</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.magicInputMain}
                      placeholder={t("magic.placeholder")}
                      placeholderTextColor={colors.textSecondary}
                      value={magicWord}
                      onChangeText={setMagicWord}
                    />
                    <TouchableOpacity style={styles.micButton}>
                      <Ionicons
                        name="mic-outline"
                        size={24}
                        color={colors.icon}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.inputNote}>{t("magic.note")}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.mainGenerateButton,
                    (!magicWord.trim() || isGenerating) &&
                      styles.buttonDisabled,
                  ]}
                  onPress={handleMagicGenerate}
                  disabled={!magicWord.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={20} color="white" />
                      <Text style={styles.mainGenerateButtonText}>
                        {t("magic.generate")}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </AnimatedBottomSheet>
      )}

      {/* Magic Creation Preview - Full Screen */}
      {creationStep === "preview" && (
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={false}
        >
          <SafeAreaView style={styles.previewSafeArea}>
            <View style={styles.previewHeader}>
              <TouchableOpacity
                onPress={() => setCreationStep("input")}
                style={styles.previewBack}
              >
                <Ionicons name="arrow-back" size={24} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.previewHeaderTitle}>
                {t("magic.previewTitle")}
              </Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView
              style={styles.previewScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.previewCardBody}>
                <View style={styles.wordHeroContainer}>
                  <Text style={styles.previewWordMain}>{magicWord}</Text>

                  <TouchableOpacity
                    onPress={() => speak(magicWord)}
                    style={styles.phoneticRow}
                  >
                    <View style={styles.audioButtonPreview}>
                      <Ionicons
                        name="volume-medium"
                        size={18}
                        color={colors.primary}
                      />
                    </View>
                    <Text style={styles.phoneticTextPreview}>
                      {generatedResult?.phonetic}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.contentBlock}>
                  <Text style={styles.contentLabel}>{t("magic.concept")}</Text>
                  <Text style={styles.contentText}>
                    {generatedResult?.definition}
                  </Text>
                </View>

                <View style={styles.contentBlock}>
                  <Text style={styles.contentLabel}>{t("magic.meaning")}</Text>
                  <View style={styles.meaningBox}>
                    <Text style={styles.contentText}>
                      {generatedResult?.spanish_meaning}
                    </Text>
                  </View>
                </View>

                <View style={styles.contentBlock}>
                  <Text style={styles.contentLabel}>{t("magic.examples")}</Text>
                  {generatedResult?.examples.map((ex, idx) => (
                    <View key={idx} style={styles.exampleListItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.exampleItemText}>{ex}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.previewFooter}>
              <TouchableOpacity
                style={styles.saveToDeckButton}
                onPress={handleSaveCard}
              >
                <Ionicons name="checkmark" size={24} color="white" />
                <Text style={styles.saveToDeckText}>{t("magic.save")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteTryAgain}
                onPress={resetCreation}
              >
                <Text style={styles.deleteTryAgainText}>
                  {t("magic.tryAgain")}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const createStyles = (
  colors: typeof Colors.light,
  insets: { bottom: number },
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    loadingText: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    menuButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 20,
    },
    bannerCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 24,
      alignItems: "center",
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    iconEmoji: {
      fontSize: 32,
    },
    deckTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 4,
    },
    cardCount: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 20,
    },
    startButton: {
      backgroundColor: colors.primary,
      width: "100%",
      paddingVertical: 16,
      borderRadius: 12,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    startButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 18,
      marginLeft: 8,
    },
    statsRow: {
      flexDirection: "row",
      marginBottom: 24,
      gap: 12,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: "800",
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 12,
    },
    actionCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    actionIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    actionText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    recentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    seeAll: {
      color: colors.primary,
      fontWeight: "600",
    },
    emptyState: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 32,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyText: {
      color: colors.textSecondary,
    },
    cardItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    cardInfo: {
      flex: 1,
    },
    cardFront: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    cardBack: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },

    // Modal Input Styles
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.3)",
    },
    inputModalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 24,
      paddingBottom: Math.max(insets.bottom, 20),
    },
    modalGrabber: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 16,
    },
    bottomSheetContent: {
      paddingTop: 16,
      paddingBottom: 8,
    },
    closeModalButton: {
      position: "absolute",
      top: 8,
      right: 16,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    inputModalHeader: {
      alignItems: "center",
      marginBottom: 32,
      paddingHorizontal: 20,
    },
    inputModalTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 8,
    },
    inputModalSub: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    inputGroup: {
      marginBottom: 32,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 64,
    },
    magicInputMain: {
      flex: 1,
      fontSize: 18,
      fontWeight: "500",
      color: colors.text,
    },
    micButton: {
      padding: 8,
    },
    inputNote: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 12,
    },
    mainGenerateButton: {
      backgroundColor: colors.primary,
      height: 64,
      borderRadius: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    mainGenerateButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
      marginLeft: 12,
    },
    buttonDisabled: {
      opacity: 0.5,
    },

    // Preview Styles
    previewContainer: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    previewSafeArea: {
      flex: 1,
    },
    previewHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    previewBack: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    previewHeaderTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    previewScroll: {
      flex: 1,
    },
    previewCardBody: {
      padding: 24,
    },
    previewWordMain: {
      fontSize: 40,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
      marginBottom: 16,
    },
    wordHeroContainer: {
      backgroundColor: colors.background,
      borderRadius: 24,
      padding: 32,
      alignItems: "center",
      marginBottom: 24,
    },
    phoneticRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 100,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    audioButtonPreview: {
      marginRight: 8,
    },
    phoneticTextPreview: {
      fontSize: 18,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 24,
    },
    contentBlock: {
      marginBottom: 32,
    },
    contentLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textSecondary,
      letterSpacing: 1.2,
      marginBottom: 8,
      textTransform: "uppercase",
    },
    contentText: {
      fontSize: 16,
      color: colors.text, // was slate-700, so text is appropriate or slightly lighter
      lineHeight: 24,
      fontWeight: "500",
    },
    meaningBox: {
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 12,
    },
    exampleListItem: {
      flexDirection: "row",
      marginBottom: 16,
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginTop: 10,
      marginRight: 12,
    },
    exampleItemText: {
      flex: 1,
      fontSize: 16,
      color: colors.text, // was gray-600, so text or textSecondary
      lineHeight: 24,
    },
    previewFooter: {
      padding: 24,
      paddingBottom: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    saveToDeckButton: {
      backgroundColor: colors.primary,
      height: 56,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    saveToDeckText: {
      color: "white",
      fontSize: 16,
      fontWeight: "700",
      marginLeft: 10,
    },
    deleteTryAgain: {
      alignItems: "center",
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    deleteTryAgainText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "600",
    },
    // Settings Menu Styles
    settingItemRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingIconCol: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    settingLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    settingHint: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    limitControls: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 4,
    },
    controlButton: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    limitValue: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginHorizontal: 12,
      minWidth: 24,
      textAlign: "center",
    },
    deleteDeckButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      marginTop: 24,
      backgroundColor: colors.error + "20",
      borderRadius: 12,
    },
    deleteDeckText: {
      color: colors.error,
      fontWeight: "700",
      marginLeft: 8,
    },
  });
