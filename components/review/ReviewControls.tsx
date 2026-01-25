import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ReviewControlsProps {
  isFlipped: boolean;
  onRate: (rating: "again" | "hard" | "good" | "easy") => void;
}

export const ReviewControls = ({ isFlipped, onRate }: ReviewControlsProps) => {
  return (
    <View style={styles.controlsContainer}>
      {isFlipped ? (
        <View style={styles.controlsRow}>
          <TouchableOpacity
            onPress={() => onRate("again")}
            style={[styles.ratingButton, styles.ratingAgain]}
          >
            <Text style={[styles.ratingLabel, styles.textRed]}>Again</Text>
            <Text style={[styles.ratingSub, styles.textRedDim]}>1m</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onRate("hard")}
            style={[styles.ratingButton, styles.ratingHard]}
          >
            <Text style={[styles.ratingLabel, styles.textOrange]}>Hard</Text>
            <Text style={[styles.ratingSub, styles.textOrangeDim]}>10m</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onRate("good")}
            style={[styles.ratingButton, styles.ratingGood]}
          >
            <Text style={[styles.ratingLabel, styles.textGreen]}>Good</Text>
            <Text style={[styles.ratingSub, styles.textGreenDim]}>1d</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onRate("easy")}
            style={[styles.ratingButton, styles.ratingEasy]}
          >
            <Text style={[styles.ratingLabel, styles.textBlue]}>Easy</Text>
            <Text style={[styles.ratingSub, styles.textBlueDim]}>4d</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.tapHintContainer}>
          <Text style={styles.tapHintText}>Tap card to see answer</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    height: 128,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  ratingButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingAgain: {
    borderColor: "#fee2e2", // red-100
  },
  ratingHard: {
    borderColor: "#ffedd5", // orange-100
  },
  ratingGood: {
    borderColor: "#dcfce7", // green-100
  },
  ratingEasy: {
    borderColor: "#dbeafe", // blue-100
  },
  ratingLabel: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },
  ratingSub: {
    fontSize: 12,
    color: "#9ca3af",
  },
  textRed: { color: "#ef4444" },
  textRedDim: { color: "#fca5a5" },
  textOrange: { color: "#f97316" },
  textOrangeDim: { color: "#fdba74" },
  textGreen: { color: "#10b981" },
  textGreenDim: { color: "#86efac" },
  textBlue: { color: "#3b82f6" },
  textBlueDim: { color: "#93c5fd" },
  tapHintContainer: {
    alignItems: "center",
  },
  tapHintText: {
    color: "#9ca3af", // gray-400
    fontWeight: "600",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
