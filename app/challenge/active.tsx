import { ChallengeCompleteModal } from "@components/challenge/ChallengeCompleteModal";
import { ChallengeFeedback } from "@components/challenge/ChallengeFeedback";
import { ChallengeHeader } from "@components/challenge/ChallengeHeader";
import { ChallengeInput } from "@components/challenge/ChallengeInput";
import { ChallengeQuestion } from "@components/challenge/ChallengeQuestion";

import { StreakCelebration } from "@components/modals/StreakCelebration";
import { Colors } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useSpeechRecognition } from "@hooks/useSpeechRecognition";
import { useTheme } from "@hooks/useThemeColor";
import { useStore } from "@store/useStore";
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
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


import { ChallengeResult, ChallengeService } from "@services/ChallengeService";
import LottieView from "lottie-react-native";
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

  const { allCards, checkStreak, session } = useStore();

  // Game State
  const [queue, setQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [celebration, setCelebration] = useState<{
    visible: boolean;
    streak: number;
    shieldUsed?: boolean;
  }>({ visible: false, streak: 0 });

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
              parsedStatuses.includes("learning")))
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
    try {
      const grading = await ChallengeService.evaluateSentence(
        currentCard.front_word,
        userInput
      );
      setResult(grading);
      setShowFeedback(difficulty === "easy");
    } catch (error) {
      // Ideally show an error toast here
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
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
      setShowFeedback(false);
    } else {
      // Finish Session
      setFinalScore(newTotal / queue.length);

      // Check Streak
      if (session?.user?.id) {
        checkStreak(session.user.id).then((result) => {
          if (result && result.celebration) {
            setCelebration({
              visible: false,
              streak: result.current_streak,
              shieldUsed: result.shieldUsed,
            });
          }
        });
      }

      setIsCompleteModalVisible(true);
    }
  };

  const toggleFeedback = () => setShowFeedback(!showFeedback);

  if (queue.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text }}>
            {t("challenge.active.preparing")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ChallengeCompleteModal
        visible={isCompleteModalVisible}
        score={finalScore}
        onClose={() => {
          setIsCompleteModalVisible(false);
          if (celebration.streak > 0) {
            setCelebration((prev) => ({ ...prev, visible: true }));
          } else {
            router.dismissAll();
          }
        }}
      />

      <StreakCelebration
        visible={celebration.visible}
        streak={celebration.streak}
        shieldUsed={celebration.shieldUsed}
        onClose={() => {
          setCelebration((prev) => ({ ...prev, visible: false }));
          router.dismissAll();
        }}
      />

      <ChallengeHeader currentIndex={currentIndex} total={queue.length} />

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
              <ChallengeQuestion card={currentCard} />

              <ChallengeInput
                value={userInput}
                onChangeText={setUserInput}
                isRecording={isRecording}
                isPaused={isPaused}
                isSubmitting={isSubmitting}
                result={result}
              />

              <ChallengeFeedback
                result={result}
                showFeedback={showFeedback}
                onToggleFeedback={toggleFeedback}
                passingScore={PASSING_SCORE}
              />
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>

        <View style={styles.footer}>
          {isSubmitting ? (
            <View style={styles.loadingFooter}>
              <LottieView
                source={require("@assets/animations/loading.json")}
                autoPlay
                loop
                style={styles.loadingLottieFooter}
              />
            </View>
          ) : !result ? (
            <View style={styles.footerRow}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.primary },
                  !userInput.trim() && { opacity: 0.7 },
                ]}
                onPress={handleSubmit}
                disabled={!userInput.trim()}
              >
                <Text style={styles.buttonText}>
                  {t("challenge.active.submit")}
                </Text>
              </TouchableOpacity>
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
    content: {
      flex: 1,
      padding: 20,
    },
    footer: {
      paddingHorizontal: 20,
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
    loadingFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingVertical: 8,
    },
    loadingLottieFooter: {
      width: 60,
      height: 60,
    },
    loadingTextFooter: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.primary,
    },
  });
