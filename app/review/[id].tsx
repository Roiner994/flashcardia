import { CustomAlert } from "@components/modals/CustomAlert";
import { StreakCelebration } from "@components/modals/StreakCelebration";
import { ReviewCard } from "@components/review/ReviewCard";
import { ReviewControls } from "@components/review/ReviewControls";
import { ReviewHeader } from "@components/review/ReviewHeader";
import { AnimatedBottomSheet } from "@components/ui/AnimatedBottomSheet";
import { BottomSheetHeader } from "@components/ui/BottomSheetHeader";
import { SRSRating } from "@constants/AppConstants";
import { Colors } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useReviewSession } from "@hooks/useReviewSession";
import { useTheme } from "@hooks/useThemeColor";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import LottieView from "lottie-react-native";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReviewScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Custom Hook for Session Logic
  const {
    cards,
    loading,
    stats,
    handleRating: sessionHandleRating,
    handleDeleteCurrentCard,
    currentCard,
  } = useReviewSession(id);

  // Local UI State
  const [isFlipped, setIsFlipped] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [celebration, setCelebration] = useState<{ visible: boolean; streak: number; shieldUsed?: boolean }>({ visible: false, streak: 0 });

  // Animation
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Animation Logic
  const flipCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(animatedValue, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 20,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const resetFlip = () => {
    animatedValue.setValue(0);
    setIsFlipped(false);
  };

  // Interpolations
  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });
  const frontOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });
  const backOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  // Action Handlers
  const onRate = async (rating: SRSRating) => {
    const result = await sessionHandleRating(rating);
    if (result && !result.isComplete) {
      resetFlip();
    } else if (result && result.isComplete) {
      if (result.celebration) {
          setCelebration({ 
              visible: false, // Don't show yet, wait for success modal close
              streak: result.celebration.current_streak, 
              shieldUsed: result.celebration.shieldUsed 
          });
      }
      setSuccessModalVisible(true);
    }
  };

  const speak = () => {
    if (currentCard?.front_word) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Speech.stop();
      Speech.speak(currentCard.front_word, {
        language: "en-US",
        pitch: 1.0,
        rate: 0.9,
      });
    }
  };

  const onDelete = async () => {
    setMenuVisible(false);
    Alert.alert(t("review.deleteConfirmTitle"), t("review.deleteConfirmBody"), [
      { text: t("review.cancel"), style: "cancel" },
      {
        text: t("review.delete"),
        style: "destructive",
        onPress: async () => {
          const result = await handleDeleteCurrentCard();
          if (result && result.success) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (!result.isDeckEmpty) {
              if (isFlipped) resetFlip();
            }
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("@assets/animations/loading.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("review.noCards")}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.goBackButton}
        >
          <Text style={styles.goBackButtonText}>{t("review.goBack")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentCard) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("@assets/animations/loading.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomAlert
        visible={successModalVisible}
        type="success"
        title={t("review.sessionComplete")}
        message={t("review.sessionCompleteMsg")}
        onClose={() => {
          setSuccessModalVisible(false);
          if (celebration.streak > 0) {
             setCelebration(prev => ({ ...prev, visible: true }));
          } else {
             router.back();
          }
        }}
      />
      <StreakCelebration 
        visible={celebration.visible} 
        streak={celebration.streak}
        shieldUsed={celebration.shieldUsed} 
        onClose={() => {
            setCelebration(prev => ({ ...prev, visible: false }));
            router.back();
        }}
      />
      <ReviewHeader
        onBack={() => router.back()}
        onShowOptions={() => setMenuVisible(true)}
        stats={stats}
      />

      <ReviewCard
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={flipCard}
        onSpeak={speak}
        frontStyle={{
          transform: [{ rotateY: frontInterpolate }],
          opacity: frontOpacity,
        }}
        backStyle={{
          transform: [{ rotateY: backInterpolate }],
          opacity: backOpacity,
        }}
      />

      <ReviewControls isFlipped={isFlipped} onRate={onRate} />

      {/* Options Sheet */}
      <AnimatedBottomSheet
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        snapPoint={25}
      >
        {(handleClose) => (
          <>
            <BottomSheetHeader
              title={t("review.options")}
              onClose={handleClose}
            />
            <View style={{ paddingTop: 8 }}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  handleClose();
                  setTimeout(() => onDelete(), 300);
                }}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: colors.error + "15" },
                  ]}
                >
                  <Ionicons
                    name="trash-outline"
                    size={24}
                    color={colors.error}
                  />
                </View>
                <Text style={[styles.menuText, { color: colors.error }]}>
                  {t("review.deleteCard")}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </AnimatedBottomSheet>
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
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    lottie: {
      width: 150,
      height: 150,
    },
    loadingText: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    goBackButton: {
      backgroundColor: colors.success,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 16,
    },
    goBackButtonText: {
      color: "white",
      fontWeight: "bold",
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      borderRadius: 12,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    menuText: {
      fontSize: 16,
      fontWeight: "600",
    },
  });
