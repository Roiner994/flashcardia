import { Card } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
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
              <Text style={styles.pillLabelText}>CONCEPT</Text>
            </View>
            <Text style={styles.frontWord}>{card.front_word}</Text>

            <View style={styles.tapToFlipContainer}>
              <Ionicons
                name="finger-print"
                size={20}
                color="#9ca3af"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.tapToFlipText}>TAP TO FLIP</Text>
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
                <Text style={styles.pillLabelTextBack}>DEFINITION</Text>
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
              <Ionicons name="volume-high" size={24} color="#10b981" />
              <Text style={styles.audioButtonText}>Play Audio</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1, // Softer shadow for light mode
    shadowRadius: 20,
    elevation: 10,
  },
  cardFront: {
    backgroundColor: "white", // LIGHT CARD
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    borderWidth: 1,
    borderColor: "#e5e7eb", // gray-200
  },
  cardBack: {
    backgroundColor: "white", // LIGHT CARD
    padding: 32,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e5e7eb", // gray-200
  },
  pillLabelContainer: {
    backgroundColor: "#f3f4f6", // gray-100
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    marginBottom: 32,
  },
  pillLabelText: {
    color: "#6b7280", // gray-500
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  frontWord: {
    fontSize: 42,
    fontWeight: "800",
    color: "#111827", // gray-900
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
    color: "#9ca3af", // gray-400
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  cardBackContent: {
    alignItems: "center",
    flex: 1,
  },
  pillLabelContainerBack: {
    backgroundColor: "#ecfdf5", // green-50
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    marginBottom: 24,
  },
  pillLabelTextBack: {
    color: "#059669", // green-600
    fontSize: 12,
    fontWeight: "bold",
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
    fontWeight: "600",
    color: "#1f2937", // gray-800
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 24,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: "#f3f4f6", // gray-100
    marginBottom: 24,
  },
  exampleContainer: {
    backgroundColor: "#f9fafb", // gray-50
    padding: 16,
    borderRadius: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  exampleText: {
    color: "#4b5563", // gray-600
    textAlign: "center",
    fontStyle: "italic",
    fontSize: 16,
    lineHeight: 24,
  },
  audioButton: {
    backgroundColor: "#f3f4f6", // gray-100
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  audioButtonText: {
    color: "#374151", // gray-700
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
});
