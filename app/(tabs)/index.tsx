import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useThemeColor";
import { useStore } from "@/store/useStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../../global.css";

export default function HomeScreen() {
  const router = useRouter();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [isModalVisible, setModalVisible] = React.useState(false);
  const [newDeckTitle, setNewDeckTitle] = React.useState("");
  const {
    decks,
    allCards,
    loadDecks,
    loadAllCards,
    isLoading,
    dailyNewLimit,
    session,
    createDeck,
  } = useStore();

  const handleCreateDeck = async () => {
    if (!newDeckTitle.trim()) return;
    await createDeck(newDeckTitle);
    setNewDeckTitle("");
    setModalVisible(false);
  };

  console.log("HomeScreen rendering. Session exists:", !!session);

  useEffect(() => {
    loadDecks();
    loadAllCards();
  }, []);

  // Calculate Due Today based on SRS/Daily Limits per deck
  let dueToday = 0;
  const now = new Date();

  decks.forEach((deck) => {
    const deckCards = allCards.filter((c) => c.deck_id === deck.id);

    // 1. Due reviews (Learning, Review, Mastered)
    const reviewsDue = deckCards.filter((c) => {
      if (c.status === "new") return false;
      if (!c.next_review_at) return true;
      return new Date(c.next_review_at) <= now;
    }).length;

    // 2. New cards allowed (capped by deck-specific limit or global default)
    const limit = deck.daily_new_limit ?? dailyNewLimit;
    const newAllowed = deckCards
      .filter((c) => c.status === "new")
      .slice(0, limit).length;

    dueToday += reviewsDue + newAllowed;
  });

  // Learned = Any card that is no longer 'new'
  const learnedWords = allCards.filter((c) => c.status !== "new").length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="sparkles" size={24} color={colors.primary} />
            <Text style={styles.headerTitle}>MagicDeck</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity
              onPress={() => {
                if (!session) router.push("/(auth)/login");
              }}
              style={{
                padding: 8,
                backgroundColor: session
                  ? colors.success + "20"
                  : colors.surface,
                borderRadius: 20,
              }}
            >
              <Ionicons
                name={session ? "cloud-done" : "cloud-offline-outline"}
                size={20}
                color={session ? colors.success : colors.icon}
              />
            </TouchableOpacity>

            <View style={styles.avatar}>
              <Image
                source={{
                  uri: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
                }}
                style={styles.avatarImage}
              />
            </View>
          </View>
        </View>

        <FlatList
          data={decks}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              {/* Stats Dashboard */}
              <View style={styles.statsDashboard}>
                <View style={styles.statBox}>
                  <View style={styles.statHeader}>
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={colors.error}
                    />
                    <Text style={styles.statLabel}>Due Today</Text>
                  </View>
                  <Text style={styles.statValue}>{dueToday} Cards</Text>
                </View>

                <View style={styles.statBox}>
                  <View style={styles.statHeader}>
                    <Ionicons
                      name="trending-up-outline"
                      size={20}
                      color={colors.success}
                    />
                    <Text style={styles.statLabel}>Learned</Text>
                  </View>
                  <Text style={styles.statValue}>{learnedWords} Words</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Your Decks</Text>
            </>
          }
          renderItem={({ item, index }) => {
            const deckCards = allCards.filter((c) => c.deck_id === item.id);
            const newCards = deckCards.filter((c) => c.status === "new").length;
            const learningCards = deckCards.filter(
              (c) => c.status === "learning",
            ).length;
            const masteredCards = deckCards.filter(
              (c) => c.status === "mastered",
            ).length;
            const totalCards = deckCards.length;

            const iconBgColors = [
              colors.success + "20",
              colors.warning + "20",
              colors.info + "20",
              "#9333ea20",
            ];
            const iconColors = [
              colors.success,
              colors.warning,
              colors.info,
              "#9333ea",
            ];

            const colorIndex = index % iconBgColors.length;

            return (
              <TouchableOpacity
                onPress={() => router.push(`/deck/${item.id}`)}
                style={styles.deckItem}
              >
                <View
                  style={[
                    styles.deckIcon,
                    { backgroundColor: iconBgColors[colorIndex] },
                  ]}
                >
                  <Ionicons
                    name="language"
                    size={24}
                    color={iconColors[colorIndex]}
                  />
                </View>

                <View style={styles.deckInfo}>
                  <Text style={styles.deckTitle}>{item.title}</Text>
                  <Text style={styles.deckSubtitle}>
                    Total: {totalCards} cards
                  </Text>
                </View>

                <View style={styles.badges}>
                  <View style={[styles.badge, styles.badgeBlue]}>
                    <Text style={styles.badgeTextBlue}>{newCards}</Text>
                  </View>
                  <View style={[styles.badge, styles.badgeRed]}>
                    <Text style={styles.badgeTextRed}>{learningCards}</Text>
                  </View>
                  <View style={[styles.badge, styles.badgeGreen]}>
                    <Text style={styles.badgeTextGreen}>{masteredCards}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No decks found.</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshing={isLoading}
          onRefresh={loadDecks}
        />
      </View>
      {/* Floating Add Button */}
      {session && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setModalVisible(true)}
            style={styles.fab}
          >
            <Ionicons name="add" size={32} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Create Deck Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Collection</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons
                  name="close-circle"
                  size={28}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Deck Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Spanish Basics"
                placeholderTextColor={colors.textSecondary}
                value={newDeckTitle}
                onChangeText={setNewDeckTitle}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateDeck}
            >
              <Text style={styles.createButtonText}>Create Deck</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.text,
      marginLeft: 8,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: colors.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    avatarImage: {
      width: "100%",
      height: "100%",
    },
    statsDashboard: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 32,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    statHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    statLabel: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 8,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginRight: 8,
      marginBottom: 16,
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
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    deckIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    deckInfo: {
      flex: 1,
    },
    deckTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
    },
    deckSubtitle: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    badges: {
      flexDirection: "row",
      gap: 8,
    },
    badge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      minWidth: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeBlue: {
      backgroundColor: colors.info + "20", // Opacity 20%
    },
    badgeRed: {
      backgroundColor: colors.error + "20", // Opacity 20%
    },
    badgeGreen: {
      backgroundColor: colors.success + "20", // Opacity 20%
    },
    badgeTextBlue: {
      color: colors.info,
      fontWeight: "bold",
      fontSize: 12,
    },
    badgeTextRed: {
      color: colors.error,
      fontWeight: "bold",
      fontSize: 12,
    },
    badgeTextGreen: {
      color: colors.success,
      fontWeight: "bold",
      fontSize: 12,
    },
    emptyState: {
      alignItems: "center",
      marginTop: 16,
    },
    emptyText: {
      color: colors.textSecondary,
    },

    // FAB & Modal Styles
    fabContainer: {
      position: "absolute",
      bottom: 24,
      right: 24,
    },
    fab: {
      backgroundColor: colors.primary,
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      backgroundColor: colors.surface,
      padding: 32,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    inputContainer: {
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
    },
    inputLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
      marginBottom: 8,
    },
    input: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
    },
    createButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
    },
    createButtonText: {
      color: "white", // Always white on primary
      fontWeight: "bold",
      fontSize: 18,
    },
  });
