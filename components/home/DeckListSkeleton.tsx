import { Colors } from "@constants/Colors";
import { useTheme } from "@hooks/useThemeColor";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export function DeckListSkeleton() {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {/* Simulate 3 skeleton items */}
      {[1, 2, 3].map((key) => (
        <SkeletonItem key={key} styles={styles} colors={colors} />
      ))}
    </View>
  );
}

function SkeletonItem({
  styles,
  colors,
}: {
  styles: any;
  colors: typeof Colors.light;
}) {
  const animatedValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.deckItem}>
      {/* Icon Placeholder */}
      <Animated.View style={[styles.deckIcon, { opacity: animatedValue }]} />

      {/* Info Placeholder */}
      <View style={styles.deckInfo}>
        <Animated.View style={[styles.deckTitle, { opacity: animatedValue }]} />
        <Animated.View
          style={[styles.deckSubtitle, { opacity: animatedValue }]}
        />
      </View>

      {/* Badges Placeholder */}
      <View style={styles.badges}>
        <Animated.View style={[styles.badge, { opacity: animatedValue }]} />
        <Animated.View style={[styles.badge, { opacity: animatedValue }]} />
        <Animated.View style={[styles.badge, { opacity: animatedValue }]} />
      </View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      paddingBottom: 20,
    },
    deckItem: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    deckIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.border + "40", // Faint placeholder
      marginRight: 16,
    },
    deckInfo: {
      flex: 1,
      gap: 8,
    },
    deckTitle: {
      height: 20,
      width: "60%",
      borderRadius: 4,
      backgroundColor: colors.border + "40",
    },
    deckSubtitle: {
      height: 14,
      width: "40%",
      borderRadius: 4,
      backgroundColor: colors.border + "40",
    },
    badges: {
      flexDirection: "row",
      gap: 8,
    },
    badge: {
      width: 32,
      height: 24,
      borderRadius: 8,
      backgroundColor: colors.border + "40",
    },
  });
