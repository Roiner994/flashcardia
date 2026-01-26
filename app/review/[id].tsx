import { CustomAlert } from "@/components/modals/CustomAlert";
import { ReviewCard } from "@/components/review/ReviewCard";
import { ReviewControls } from "@/components/review/ReviewControls";
import { ReviewHeader } from "@/components/review/ReviewHeader";
import { AnimatedBottomSheet } from "@/components/ui/AnimatedBottomSheet";
import { BottomSheetHeader } from "@/components/ui/BottomSheetHeader";
import { useReviewSession } from "@/hooks/useReviewSession";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

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

  // Animation
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Animation Logic
  const flipCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(animatedValue, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
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
  const onRate = async (rating: "again" | "hard" | "good" | "easy") => {
    const result = await sessionHandleRating(rating);
    if (result && !result.isComplete) {
      resetFlip();
    } else if (result && result.isComplete) {
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
    Alert.alert("Delete Card", "Are you sure you want to delete this card?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
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
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No cards to review.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.goBackButton}
        >
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentCard) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading card...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomAlert
        visible={successModalVisible}
        type="success"
        title="Session Complete!"
        message="You've reviewed all cards for now. Great job!"
        onClose={() => {
          setSuccessModalVisible(false);
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
            <BottomSheetHeader title="Options" onClose={handleClose} />
            <View style={{ paddingTop: 8 }}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  handleClose();
                  setTimeout(() => onDelete(), 300);
                }}
              >
                <View
                  style={[styles.iconContainer, { backgroundColor: "#fee2e2" }]}
                >
                  <Ionicons name="trash-outline" size={24} color="#ef4444" />
                </View>
                <Text style={[styles.menuText, { color: "#ef4444" }]}>
                  Delete Card
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </AnimatedBottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb", // LIGHT MODE: gray-50
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#6b7280",
    fontSize: 16,
  },
  goBackButton: {
    backgroundColor: "#10b981", // green-500
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
