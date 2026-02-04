import { CustomAlert } from "@components/modals/CustomAlert";

import { Colors } from "@constants/Colors";
import { useSpeechRecognition } from "@hooks/useSpeechRecognition";
import { useTheme } from "@hooks/useThemeColor";
import { useStore } from "@store/useStore";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock AI Service until Phase 4
const mockGradeSentence = async (sentence: string, word: string) => {
  return new Promise<{ score: number; feedbackKey: string }>((resolve) => {
    setTimeout(() => {
      const length = sentence.length;
      const score =
        length > 20 ? Math.min(10, 5 + Math.random() * 5) : Math.random() * 5;
      resolve({
        score: Number(score.toFixed(1)),
        feedbackKey:
          score > 7
            ? "challenge.active.feedbackExcellent"
            : "challenge.active.feedbackImprove",
      });
    }, 1500);
  });
};

const PASSING_SCORE = 5.5;

export default function ActiveChallengeScreen() {
  const { deckId, difficulty, statuses, limit } = useLocalSearchParams<{
    deckId: string;
    difficulty: string;
    statuses: string;
    limit: string;
  }>();
  const router = useRouter();
  const colors = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { allCards } = useStore();

  // Game State
  const [queue, setQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    feedbackKey: string;
  } | null>(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // Speech Recognition
  const {
    isRecording,
    isPaused,
    transcript,
    start,
    pause,
    resume,
    setTranscript,
  } = useSpeechRecognition({
    initialTranscript: "", // Will be set on start
    onError: (e) => {
      // Handle error
      console.log("Speech Error", e);
    },
  });

  // Sync transcript
  useEffect(() => {
    if (isRecording || isPaused) {
      setUserInput(transcript);
    }
  }, [transcript, isRecording, isPaused]);

  // Initialize Game
  useEffect(() => {
    if (allCards.length > 0 && queue.length === 0) {
      const parsedStatuses = statuses ? JSON.parse(statuses) : ["new"];
      const limitCount = limit ? parseInt(limit, 10) : 10;

      const filtered = allCards.filter(
        (c) =>
          c.deck_id === deckId &&
          ((c.status === "new" && parsedStatuses.includes("new")) ||
            (c.status === "mastered" && parsedStatuses.includes("review")) ||
            ((c.status === "learning" || c.status === "review") &&
              parsedStatuses.includes("learning"))),
      );

      // Shuffle logic could go here
      const shuffled = [...filtered]
        .sort(() => Math.random() - 0.5)
        .slice(0, limitCount);
      setQueue(shuffled);
    }
  }, [allCards, deckId, statuses, limit, queue.length]);

  const currentCard = queue[currentIndex];

  const handleSubmit = async () => {
    if (!userInput.trim()) return;

    setIsSubmitting(true);
    const grading = await mockGradeSentence(userInput, currentCard.front_word);
    setResult(grading);
    setIsSubmitting(false);
  };

  const handleNext = () => {
    if (difficulty === "hard" && result && result.score < PASSING_SCORE) {
      // Retry in hard mode
      setResult(null);
      setUserInput("");
      return;
    }

    const scoreToAdd = result?.score || 0;
    const newTotal = sessionScore + scoreToAdd;
    setSessionScore(newTotal);

    if (currentIndex < queue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserInput("");
      setResult(null);
    } else {
      // Finish Session
      setFinalScore(newTotal / queue.length);
      setIsCompleteModalVisible(true);
    }
  };

  if (queue.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 10 }}>
            {t("challenge.active.preparing")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <CustomAlert
        visible={isCompleteModalVisible}
        type="success"
        title={t("challenge.active.completeTitle")}
        message={t("challenge.active.finalScore", {
          score: finalScore.toFixed(1),
        })}
        onClose={() => {
          setIsCompleteModalVisible(false);
          router.dismissAll();
        }}
      />

      {/* Top Bar */}
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
                width: `${((currentIndex + 1) / queue.length) * 100}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1}/{queue.length}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.content}>
              <View style={styles.cardContainer}>
                <Text style={styles.instruction}>
                  {t("challenge.active.makeSentence")}
                </Text>
                <Text style={styles.targetWord}>{currentCard?.front_word}</Text>
                <Text style={styles.definitionHint}>
                  {currentCard?.definition}
                </Text>
              </View>

              <View style={{ marginBottom: 24 }}>
                <TextInput
                  style={[
                    styles.input,
                    isRecording && !isPaused && styles.inputDisabled,
                  ]}
                  placeholder={t("challenge.active.inputPlaceholder")}
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  value={userInput}
                  onChangeText={setUserInput}
                  editable={
                    (!isRecording || isPaused) && !isSubmitting && !result
                  }
                />
              </View>

              {result && (
                <View
                  style={[
                    styles.resultCard,
                    (result?.score ?? 0) >= PASSING_SCORE
                      ? { borderColor: colors.success }
                      : { borderColor: colors.error },
                  ]}
                >
                  <View style={styles.scoreRow}>
                    <Text
                      style={[
                        styles.scoreLabel,
                        {
                          color:
                            (result?.score ?? 0) >= PASSING_SCORE
                              ? colors.success
                              : colors.error,
                        },
                      ]}
                    >
                      {t("challenge.active.scoreLabel", {
                        score: result.score,
                      })}
                    </Text>
                    <Ionicons
                      name={
                        (result?.score ?? 0) >= PASSING_SCORE
                          ? "checkmark-circle"
                          : "warning"
                      }
                      size={24}
                      color={
                        (result?.score ?? 0) >= PASSING_SCORE
                          ? colors.success
                          : colors.error
                      }
                    />
                  </View>
                  <Text style={styles.feedbackText}>
                    {t(result.feedbackKey)}
                  </Text>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>

        <View style={styles.footer}>
          {!result ? (
            <View style={styles.footerRow}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.primary },
                  (!userInput.trim() || isSubmitting) && { opacity: 0.7 },
                ]}
                onPress={handleSubmit}
                disabled={!userInput.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>
                    {t("challenge.active.submit")}
                  </Text>
                )}
              </TouchableOpacity>
              {!isSubmitting && (
                <TouchableOpacity
                  style={styles.micFooterButton}
                  onPress={() => {
                    if (isRecording && !isPaused) {
                      pause();
                      Keyboard.dismiss();
                    } else if (isPaused) {
                      setTranscript(userInput);
                      resume();
                    } else {
                      start(userInput);
                    }
                  }}
                >
                  <Ionicons
                    name={
                      isRecording && !isPaused
                        ? "pause"
                        : isPaused
                          ? "mic"
                          : "mic-outline"
                    }
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.footerRow}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor:
                      (result?.score ?? 0) < PASSING_SCORE &&
                      difficulty === "hard"
                        ? colors.warning
                        : colors.success,
                  },
                ]}
                onPress={handleNext}
              >
                <Text style={styles.buttonText}>
                  {(result?.score ?? 0) < PASSING_SCORE && difficulty === "hard"
                    ? t("challenge.active.tryAgain")
                    : t("challenge.active.nextCard")}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
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
    content: {
      flex: 1,
      padding: 20,
    },
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

    input: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      fontSize: 18,
      color: colors.text,
      minHeight: 120,
      textAlignVertical: "top",
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputDisabled: {
      backgroundColor: colors.background, // Slightly darker/different to indicate disabled?
      opacity: 0.7,
    },
    resultCard: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 2,
    },
    scoreRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    scoreLabel: {
      fontSize: 20,
      fontWeight: "bold",
    },
    feedbackText: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 22,
    },
    footer: {
      padding: 20,
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    actionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      borderRadius: 16,
      gap: 8,
    },
    buttonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
    },
    micFooterButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
