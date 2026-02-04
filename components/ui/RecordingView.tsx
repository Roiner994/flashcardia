import { Colors } from "@constants/Colors";
import { useTheme } from "@hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface RecordingViewProps {
  onStop: () => void;
  onCancel: () => void;
  transcription?: string; // Optional realtime preview
  allowPause?: boolean;
  isPaused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
}

export function RecordingView({
  onStop,
  onCancel,
  transcription,
  allowPause = false,
  isPaused = false,
  onPause,
  onResume,
}: RecordingViewProps) {
  const colors = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  // Simple pulsing animation
  useEffect(() => {
    if (isPaused) {
      scale.stopAnimation();
      scale.setValue(1);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [scale, isPaused]);

  // Manual truncation from the beginning to show the end of the text
  const MAX_DISPLAY_LENGTH = 80;
  const displayText = useMemo(() => {
    if (isPaused) return "Paused";
    if (!transcription) return "Listening...";
    if (transcription.length <= MAX_DISPLAY_LENGTH) return transcription;
    // Truncate from the beginning, show the end
    return "..." + transcription.slice(-MAX_DISPLAY_LENGTH);
  }, [transcription, isPaused]);

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {/* Visualizer Area */}
      <View style={styles.visualizerContainer}>
        <Animated.View
          style={[
            styles.micCircle,
            { transform: [{ scale }] },
            isPaused && { opacity: 0.5, transform: [{ scale: 1 }] },
          ]}
        >
          <Ionicons name={isPaused ? "pause" : "mic"} size={32} color="white" />
        </Animated.View>
        <View style={styles.textContainer}>
          <Text style={styles.listeningText}>{displayText}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", gap: 16 }}>
          {allowPause && (
            <TouchableOpacity
              style={[
                styles.iconButton,
                {
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
              ]}
              onPress={isPaused ? onResume : onPause}
            >
              <Ionicons
                name={isPaused ? "play" : "pause"}
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.stopButton} onPress={onStop}>
            <Ionicons name="checkmark" size={24} color="white" />
            <Text style={styles.stopText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function getStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      // padding: 24,
      paddingBottom: 10,
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderRadius: 24,
      height: 250,
    },
    visualizerContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 32,
      flex: 1,
    },
    micCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    textContainer: {
      height: 72,
      justifyContent: "center",
      overflow: "hidden",
    },
    listeningText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
      paddingHorizontal: 20,
      lineHeight: 24,
    },
    controlsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      paddingHorizontal: 16,
    },
    cancelButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
    },
    cancelText: {
      marginLeft: 8,
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: "600",
    },
    stopButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
    },
    stopText: {
      marginLeft: 8,
      fontSize: 16,
      color: "white",
      fontWeight: "600",
    },
    iconButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
