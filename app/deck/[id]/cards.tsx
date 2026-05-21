import { Colors } from "@constants/Colors";
import { CardEditorModal } from "@components/deck/CardEditorModal";
import { useTheme } from "@hooks/useThemeColor";
import { useStore } from "@store/useStore";
import { Ionicons } from "@expo/vector-icons";
import { DataService } from "@services/DataService";
import { Card, CardDraft } from "@types";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

const createDraftFromCard = (card: Card): CardDraft => ({
  front_word: card.front_word,
  definition: card.definition,
  spanish_meaning: card.spanish_meaning,
  phonetic: card.phonetic || "",
  examples: card.examples?.length ? card.examples : [""],
  image_url: card.image_url ?? null,
  audio_url: card.audio_url ?? null,
  audio_source: card.audio_source ?? "tts",
});

export default function DeckCardsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { allCards, decks, loadAllCards, updateCard } = useStore();
  const deck = decks.find((d) => d.id === id);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [draft, setDraft] = useState<CardDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadAllCards();
  }, [loadAllCards]);

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

  const updateDraftField = <K extends keyof CardDraft>(field: K, value: CardDraft[K]) => {
    setDraft((current) => (current ? { ...current, [field]: value } : current));
  };

  const updateExample = (index: number, value: string) => {
    setDraft((current) => {
      if (!current) return current;
      const nextExamples = [...current.examples];
      nextExamples[index] = value;
      return { ...current, examples: nextExamples };
    });
  };

  const addExample = () => {
    setDraft((current) => (current ? { ...current, examples: [...current.examples, ""] } : current));
  };

  const removeExample = (index: number) => {
    setDraft((current) => {
      if (!current) return current;
      const nextExamples = current.examples.filter((_, itemIndex) => itemIndex !== index);
      return { ...current, examples: nextExamples.length ? nextExamples : [""] };
    });
  };

  const openEditor = (card: Card) => {
    setEditingCard(card);
    setDraft(createDraftFromCard(card));
  };

  const handleSaveEdit = async () => {
    if (!editingCard || !draft) return;

    try {
      setIsSaving(true);
      const imageUrl =
        draft.image_url && draft.image_url !== editingCard.image_url
          ? await DataService.uploadCardMedia(draft.image_url, editingCard.deck_id, "image")
          : draft.image_url;
      const audioUrl =
        draft.audio_source === "recorded" && draft.audio_url && draft.audio_url !== editingCard.audio_url
          ? await DataService.uploadCardMedia(draft.audio_url, editingCard.deck_id, "audio")
          : draft.audio_url;

      await updateCard(editingCard.id, {
        front_word: draft.front_word.trim(),
        definition: draft.definition.trim(),
        spanish_meaning: draft.spanish_meaning.trim(),
        phonetic: draft.phonetic.trim() || null,
        examples: draft.examples.map((example) => example.trim()).filter(Boolean),
        image_url: imageUrl || null,
        audio_url: draft.audio_source === "recorded" ? audioUrl || null : null,
        audio_source: draft.audio_source === "recorded" && audioUrl ? "recorded" : "tts",
      });

      setEditingCard(null);
      setDraft(null);
    } catch (error) {
      console.error("Failed to update card", error);
    } finally {
      setIsSaving(false);
    }
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
          <TouchableOpacity style={styles.cardItem} activeOpacity={0.9} onPress={() => openEditor(item)}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.cardThumb} contentFit="cover" />
            ) : (
              <View style={styles.cardThumbPlaceholder}>
                <Ionicons name="image-outline" size={18} color={colors.primary} />
              </View>
            )}
            <View style={styles.cardInfo}>
              <Text style={styles.cardFront}>{item.front_word}</Text>
              <Text style={styles.cardBack} numberOfLines={2}>
                {item.definition}
              </Text>
            </View>
            {item.audio_source === "recorded" && item.audio_url ? (
              <Ionicons
                name="mic"
                size={18}
                color={colors.primary}
                style={styles.audioBadge}
              />
            ) : null}
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
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {searchQuery ? t("common.noResults") : t("deck.noCards")}
            </Text>
          </View>
        }
      />

      <CardEditorModal
        visible={!!editingCard}
        title={t("cardEditor.editTitle")}
        saveLabel={t("cardEditor.saveChanges")}
        secondaryLabel={t("common.cancel")}
        draft={draft}
        isSaving={isSaving}
        onClose={() => {
          setEditingCard(null);
          setDraft(null);
        }}
        onSave={handleSaveEdit}
        onSecondaryAction={() => {
          setEditingCard(null);
          setDraft(null);
        }}
        onChangeField={updateDraftField}
        onChangeExample={updateExample}
        onAddExample={addExample}
        onRemoveExample={removeExample}
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
    cardThumb: {
      width: 48,
      height: 48,
      borderRadius: 14,
      marginRight: 12,
      backgroundColor: colors.background,
    },
    cardThumbPlaceholder: {
      width: 48,
      height: 48,
      borderRadius: 14,
      marginRight: 12,
      backgroundColor: colors.primary + "14",
      alignItems: "center",
      justifyContent: "center",
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
    audioBadge: {
      marginRight: 12,
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
