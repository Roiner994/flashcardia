import { Colors } from "@constants/Colors";
import { useTheme } from "@hooks/useThemeColor";
import { useStore } from "@store/useStore";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterStatus = "all" | "new" | "learning" | "mastered";

export default function DeckCardsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { allCards, decks } = useStore();
  const deck = decks.find((d) => d.id === id);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const deckCards = useMemo(() => {
    return allCards.filter((c) => c.deck_id === id);
  }, [allCards, id]);

  const filteredCards = useMemo(() => {
    let cards = deckCards;

    // 1. Status Filter
    if (filterStatus !== "all") {
      if (filterStatus === "learning") {
        cards = cards.filter(
          (c) => c.status === "learning" || c.status === "review",
        );
      } else {
        cards = cards.filter((c) => c.status === filterStatus);
      }
    }

    // 2. Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      cards = cards.filter(
        (c) =>
          c.front_word.toLowerCase().includes(query) ||
          c.definition.toLowerCase().includes(query),
      );
    }

    return cards;
  }, [deckCards, searchQuery, filterStatus]);

  const FilterChip = ({
    status,
    label,
    color,
    icon,
  }: {
    status: FilterStatus;
    label: string;
    color: string;
    icon?: keyof typeof Ionicons.glyphMap;
  }) => {
    const isSelected = filterStatus === status;
    return (
      <TouchableOpacity
        style={[
          styles.filterChip,
          isSelected && { backgroundColor: color + "20", borderColor: color },
          !isSelected && { borderColor: colors.border },
        ]}
        onPress={() => setFilterStatus(status)}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={14}
            color={color}
            style={{ marginRight: 4 }}
          />
        )}
        <Text
          style={[
            styles.filterLabel,
            isSelected
              ? { color: color, fontWeight: "600" }
              : { color: colors.textSecondary },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {deck?.title || t("deck.allCards")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("common.search")}
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <FilterChip
          status="all"
          label={t("common.all")}
          color={colors.primary}
        />
        <FilterChip
          status="new"
          label={t("deck.new")}
          color={colors.info}
          icon="radio-button-on"
        />
        <FilterChip
          status="learning"
          label={t("deck.learning")}
          color={colors.error}
          icon="radio-button-on"
        />
        <FilterChip
          status="mastered"
          label={t("deck.review")} // Using 'Review' label for checked/done items generally, or 'Mastered' if trans key exists. Re-using deck.review for Green as per user request context or similar.
          // Wait, user said: "for colors, blue, green and red".
          // Blue = New (info)
          // Red = Learning (error) - User said "unlearn" but grouped safely.
          // Green = Mastered/Review? Let's use 'mastered' status for green.
          // Let's use deck.review for now as "Mastered" usually implies done.
          // Actually, let's look at translation keys.
          // "new": "New", "learning": "Learning", "review": "Review".
          // User requested: "search learned, for learn, and unlearn"
          // Mapped to: Mastered (Green), New (Blue), Learning (Red).
          color={colors.success}
          icon="checkmark-circle"
        />
      </View>

      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.cardItem}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardFront}>{item.front_word}</Text>
              <Text style={styles.cardBack} numberOfLines={2}>
                {item.definition}
              </Text>
            </View>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    item.status === "mastered"
                      ? colors.success
                      : item.status === "learning" || item.status === "review"
                        ? colors.error
                        : colors.info,
                },
              ]}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {searchQuery ? t("common.noResults") : t("deck.noCards")}
            </Text>
          </View>
        }
      />
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
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginBottom: 12,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 16,
      color: colors.text,
    },
    filterContainer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      marginBottom: 16,
      gap: 8,
    },
    filterChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      backgroundColor: colors.surface,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: "500",
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    cardItem: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    cardInfo: {
      flex: 1,
      marginRight: 12,
    },
    cardFront: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    cardBack: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 40,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 16,
    },
  });
