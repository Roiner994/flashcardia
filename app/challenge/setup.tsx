import { BottomSheetHeader } from "@/components/ui/BottomSheetHeader";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useThemeColor";
import { useStore } from "@/store/useStore";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Difficulty = "easy" | "hard";
type CardStatus = "new" | "learning" | "review";

export default function ChallengeSetupScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { decks, allCards } = useStore();
  const deck = decks.find((d) => d.id === deckId);
  const deckCards = allCards.filter((c) => c.deck_id === deckId);

  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [selectedStatuses, setSelectedStatuses] = useState<CardStatus[]>([
    "new",
    "learning",
    "review",
  ]);
  const [cardLimit, setCardLimit] = useState(10);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const toggleStatus = (status: CardStatus) => {
    setSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        // Prevent deselecting the last one
        if (prev.length === 1) return prev;
        return prev.filter((s) => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const filteredCardsCount = useMemo(() => {
    return deckCards.filter((card) => {
      if (card.status === "new" && selectedStatuses.includes("new"))
        return true;
      if (card.status === "mastered" && selectedStatuses.includes("review"))
        return true;
      if (
        (card.status === "learning" || card.status === "review") &&
        selectedStatuses.includes("learning")
      )
        return true;
      return false;
    }).length;
  }, [deckCards, selectedStatuses]);

  const handleStart = () => {
    router.push({
      pathname: "/challenge/active",
      params: {
        deckId,
        difficulty,
        statuses: JSON.stringify(selectedStatuses),
        limit: cardLimit.toString(),
      },
    });
  };

  if (!deck) return null;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Modal Handle */}
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>

      <View style={styles.headerContainer}>
        <BottomSheetHeader
          title="Challenge Setup"
          onClose={() => router.back()}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.deckHeader}>
          <Text style={styles.deckTitle}>{deck.title}</Text>
          <Text style={styles.cardCount}>
            <Text style={{ fontWeight: "700", color: colors.text }}>
              {filteredCardsCount}
            </Text>{" "}
            cards available
          </Text>
        </View>

        {/* Filters */}

        <View style={styles.filterGrid}>
          {[
            { s: "new", l: "New", c: colors.info, i: "sparkles" },
            { s: "learning", l: "Active", i: "school", c: colors.error },
            {
              s: "review",
              l: "Review",
              i: "checkmark-circle",
              c: colors.success,
            },
          ].map((item) => {
            const isSelected = selectedStatuses.includes(item.s as CardStatus);
            return (
              <TouchableOpacity
                key={item.s}
                style={[
                  styles.filterCard,
                  { backgroundColor: colors.surface, overflow: "hidden" },
                  isSelected
                    ? { borderColor: item.c }
                    : { borderColor: colors.border },
                ]}
                onPress={() => toggleStatus(item.s as CardStatus)}
              >
                {/* Tint Overlay */}
                {isSelected && (
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      { backgroundColor: item.c, opacity: 0.12 },
                    ]}
                  />
                )}

                <View
                  style={[styles.miniIcon, { backgroundColor: item.c + "20" }]}
                >
                  <Ionicons name={item.i as any} size={16} color={item.c} />
                </View>
                <Text
                  style={[
                    styles.filterText,
                    isSelected && { color: item.c, fontWeight: "700" },
                  ]}
                >
                  {item.l}
                </Text>
                {isSelected && (
                  <View
                    style={[styles.miniBadge, { backgroundColor: item.c }]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Card Limit */}
        <Text style={styles.sectionTitle}>Number of Cards</Text>
        <View style={styles.limitContainer}>
          {[10, 20, 50].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.limitOption,
                !isCustomMode &&
                  cardLimit === num && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                (isCustomMode || cardLimit !== num) && {
                  borderColor: colors.border,
                },
              ]}
              onPress={() => {
                setCardLimit(num);
                setIsCustomMode(false);
              }}
            >
              <Text
                style={[
                  styles.limitText,
                  !isCustomMode && cardLimit === num
                    ? { color: "white" }
                    : { color: colors.text },
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.limitOption,
              !isCustomMode &&
                cardLimit === 999 && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              (isCustomMode || cardLimit !== 999) && {
                borderColor: colors.border,
              },
            ]}
            onPress={() => {
              setCardLimit(999);
              setIsCustomMode(false);
            }}
          >
            <Text
              style={[
                styles.limitText,
                !isCustomMode && cardLimit === 999
                  ? { color: "white" }
                  : { color: colors.text },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.limitOption,
              isCustomMode && {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
              !isCustomMode && { borderColor: colors.border },
            ]}
            onPress={() => {
              setIsCustomMode(true);
            }}
          >
            {isCustomMode ? (
              <TextInput
                style={[
                  styles.limitText,
                  { color: "white", width: "100%", textAlign: "center" },
                ]}
                value={customValue}
                onChangeText={(val) => {
                  setCustomValue(val);
                  const n = parseInt(val);
                  if (!isNaN(n)) setCardLimit(n);
                }}
                keyboardType="numeric"
                autoFocus
                placeholder="#"
                placeholderTextColor="rgba(255,255,255,0.6)"
              />
            ) : (
              <Ionicons name="pencil" size={16} color={colors.text} />
            )}
          </TouchableOpacity>
        </View>

        {/* Difficulty */}
        <Text style={styles.sectionTitle}>Difficulty Mode</Text>
        <View style={styles.modeContainer}>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[
                styles.modeCard,
                { backgroundColor: colors.surface },
                difficulty === "easy" && {
                  borderColor: colors.warning,
                },
              ]}
              onPress={() => setDifficulty("easy")}
            >
              {difficulty === "easy" && (
                <>
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      { backgroundColor: colors.surface, borderRadius: 16 },
                    ]}
                  />
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      {
                        backgroundColor: colors.warning,
                        opacity: 0.1,
                        borderRadius: 16,
                      },
                    ]}
                  />
                </>
              )}
              <Ionicons
                name="bicycle"
                size={24}
                color={difficulty === "easy" ? colors.warning : colors.text}
              />
              <Text
                style={[
                  styles.modeTitle,
                  difficulty === "easy" && { color: colors.warning },
                ]}
              >
                Easy
              </Text>
              {difficulty === "easy" && (
                <View
                  style={[
                    styles.selectedBadge,
                    { backgroundColor: colors.warning },
                  ]}
                >
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeCard,
                { backgroundColor: colors.surface },
                difficulty === "hard" && {
                  borderColor: colors.error,
                },
              ]}
              onPress={() => setDifficulty("hard")}
            >
              {difficulty === "hard" && (
                <>
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      { backgroundColor: colors.surface, borderRadius: 16 },
                    ]}
                  />
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      {
                        backgroundColor: colors.error,
                        opacity: 0.1,
                        borderRadius: 16,
                      },
                    ]}
                  />
                </>
              )}
              <Ionicons
                name="flame"
                size={24}
                color={difficulty === "hard" ? colors.error : colors.text}
              />
              <Text
                style={[
                  styles.modeTitle,
                  difficulty === "hard" && { color: colors.error },
                ]}
              >
                Hard
              </Text>
              {difficulty === "hard" && (
                <View
                  style={[
                    styles.selectedBadge,
                    { backgroundColor: colors.error },
                  ]}
                >
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Description Below Cards */}
          <View
            style={[
              styles.modeDescContainer,
              {
                backgroundColor:
                  difficulty === "easy"
                    ? colors.warning + "08"
                    : colors.error + "08",
                borderColor:
                  difficulty === "easy"
                    ? colors.warning + "20"
                    : colors.error + "20",
              },
            ]}
          >
            <Ionicons
              name="information-circle"
              size={20}
              color={difficulty === "easy" ? colors.warning : colors.error}
            />
            <Text
              style={[
                styles.modeDescBelow,
                {
                  color: difficulty === "easy" ? colors.warning : colors.error,
                },
              ]}
            >
              {difficulty === "easy"
                ? "Just finish all cards. No score requirements. Great for practice."
                : "Must achieve > 5.5 score on each card. AI judges strictly!"}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            filteredCardsCount === 0 && { opacity: 0.5 },
          ]}
          disabled={filteredCardsCount === 0}
          onPress={handleStart}
        >
          <Text style={styles.startButtonText}>Start Challenge</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    handleContainer: {
      alignItems: "center",
      paddingVertical: 12,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
    },
    headerContainer: {
      paddingHorizontal: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + "40",
    },
    content: {
      padding: 24,
      paddingTop: 12,
    },
    deckHeader: {
      marginBottom: 24,
    },
    deckTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
    },
    cardCount: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginTop: 8,
      marginBottom: 12,
    },
    section: {
      marginBottom: 24,
      gap: 12,
    },
    limitContainer: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 24,
    },
    limitOption: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },
    limitText: {
      fontSize: 16,
      fontWeight: "600",
    },
    filterGrid: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 20,
    },
    filterCard: {
      flex: 1,
      padding: 10,
      borderRadius: 12,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      minHeight: 70,
    },
    miniIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    filterText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    miniBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    filterOption: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    filterLabel: {
      flex: 1,
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.textSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    modeContainer: {
      marginBottom: 30,
    },
    modeRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },
    modeCard: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      minHeight: 90,
    },
    modeTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
    },
    modeDescContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      marginTop: 8,
    },
    modeDescBelow: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
      lineHeight: 20,
    },
    selectedBadge: {
      position: "absolute",
      top: -8,
      right: -8,
      width: 20,
      height: 20,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    footer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    startButton: {
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      borderRadius: 16,
      gap: 8,
    },
    startButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
    },
  });
