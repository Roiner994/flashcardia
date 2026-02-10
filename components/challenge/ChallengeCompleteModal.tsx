import { useTheme } from "@hooks/useThemeColor";
import * as Haptics from "expo-haptics";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";

interface ChallengeCompleteModalProps {
  visible: boolean;
  score: number;
  onClose: () => void;
}

export const ChallengeCompleteModal: React.FC<ChallengeCompleteModalProps> = ({
  visible,
  score,
  onClose,
}) => {
  const { t } = useTranslation();
  const colors = useTheme();
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        animationRef.current?.play();
      }, 100);
    }
  }, [visible]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        },
        container: {
          width: Platform.OS === "web" ? 400 : "85%",
          backgroundColor: colors.surface,
          borderRadius: 24,
          padding: 24,
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 10,
          borderWidth: 1,
          borderColor: colors.border,
        },
        lottieContainer: {
          width: 150,
          height: 150,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 16,
        },
        lottie: {
          width: "100%",
          height: "100%",
        },
        title: {
          fontSize: 24,
          fontWeight: "800",
          color: colors.text,
          textAlign: "center",
          marginBottom: 12,
        },
        message: {
          fontSize: 18,
          color: colors.textSecondary,
          textAlign: "center",
          marginBottom: 32,
          lineHeight: 24,
        },
        scoreText: {
          fontWeight: "bold",
          color: colors.primary,
          fontSize: 20,
        },
        button: {
          backgroundColor: colors.primary,
          width: "100%",
          paddingVertical: 16,
          borderRadius: 16,
          alignItems: "center",
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        },
        buttonText: {
          color: "#ffffff",
          fontSize: 18,
          fontWeight: "bold",
        },
      }),
    [colors]
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          entering={ZoomIn.duration(500).springify()}
          style={styles.container}
        >
          <Animated.View
            entering={FadeIn.delay(300).duration(500)}
            style={styles.lottieContainer}
          >
            <LottieView
              ref={animationRef}
              source={require("@assets/animations/trophy.json")}
              style={styles.lottie}
              autoPlay={false}
              loop={false}
            />
          </Animated.View>

          <Text style={styles.title}>{t("challenge.active.completeTitle")}</Text>

          <Text style={styles.message}>
            {t("challenge.active.finalScore", { score: score.toFixed(1) })}
          </Text>

          <TouchableOpacity
            onPress={onClose}
            style={styles.button}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t("streak.continueButton")}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
