import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useThemeColor";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function DeckDetailSkeleton() {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.backButton} />
        <View style={styles.menuButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Banner Card */}
        <View style={styles.bannerCard}>
          <Animated.View
            style={[styles.iconContainer, { opacity: animatedValue }]}
          />
          <Animated.View
            style={[styles.deckTitle, { opacity: animatedValue }]}
          />
          <Animated.View
            style={[styles.cardCount, { opacity: animatedValue }]}
          />
          <Animated.View
            style={[styles.startButton, { opacity: animatedValue }]}
          />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[1, 2, 3].map((key) => (
            <View key={key} style={styles.statBox}>
              <Animated.View
                style={[styles.statNumber, { opacity: animatedValue }]}
              />
              <Animated.View
                style={[styles.statLabel, { opacity: animatedValue }]}
              />
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Animated.View
          style={[styles.sectionTitle, { opacity: animatedValue }]}
        />
        <View style={styles.actionCard}>
          <Animated.View
            style={[styles.actionIcon, { opacity: animatedValue }]}
          />
          <Animated.View
            style={[styles.actionText, { opacity: animatedValue }]}
          />
        </View>

        {/* Recent Cards */}
        <View style={styles.recentHeader}>
          <Animated.View
            style={[styles.sectionTitle, { opacity: animatedValue }]}
          />
          <Animated.View style={[styles.seeAll, { opacity: animatedValue }]} />
        </View>

        {[1, 2, 3].map((key) => (
          <View key={key} style={styles.cardItem}>
            <View style={styles.cardInfo}>
              <Animated.View
                style={[styles.cardFront, { opacity: animatedValue }]}
              />
              <Animated.View
                style={[styles.cardBack, { opacity: animatedValue }]}
              />
            </View>
            <Animated.View
              style={[styles.statusDot, { opacity: animatedValue }]}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      borderWidth: 1,
      borderColor: colors.border,
    },
    menuButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
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
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: colors.border + "40",
      marginBottom: 16,
    },
    deckTitle: {
      width: 150,
      height: 24,
      borderRadius: 6,
      backgroundColor: colors.border + "40",
      marginBottom: 8,
    },
    cardCount: {
      width: 100,
      height: 16,
      borderRadius: 4,
      backgroundColor: colors.border + "40",
      marginBottom: 20,
    },
    startButton: {
      width: "100%",
      height: 56,
      borderRadius: 12,
      backgroundColor: colors.border + "40",
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
    },
    statNumber: {
      width: 40,
      height: 24,
      borderRadius: 6,
      backgroundColor: colors.border + "40",
      marginBottom: 8,
    },
    statLabel: {
      width: 60,
      height: 12,
      borderRadius: 4,
      backgroundColor: colors.border + "40",
    },
    sectionTitle: {
      width: 120,
      height: 20,
      borderRadius: 6,
      backgroundColor: colors.border + "40",
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
    },
    actionIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.border + "40",
      marginRight: 12,
    },
    actionText: {
      flex: 1,
      height: 16,
      borderRadius: 4,
      backgroundColor: colors.border + "40",
    },
    recentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    seeAll: {
      width: 50,
      height: 16,
      borderRadius: 4,
      backgroundColor: colors.border + "40",
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
    },
    cardInfo: {
      flex: 1,
      gap: 6,
    },
    cardFront: {
      width: "50%",
      height: 16,
      borderRadius: 4,
      backgroundColor: colors.border + "40",
    },
    cardBack: {
      width: "80%",
      height: 14,
      borderRadius: 4,
      backgroundColor: colors.border + "40",
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.border + "40",
    },
  });
