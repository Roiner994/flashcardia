import { CreateDeckSheet } from "@components/home/CreateDeckSheet";
import { DeckListItem } from "@components/home/DeckListItem";
import { DeckListSkeleton } from "@components/home/DeckListSkeleton";
import { StatsDashboard } from "@components/home/StatsDashboard";
import { CARD_STATUS, ROUTES } from "@constants/AppConstants";
import { Colors } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useThemeColor";
import { useStore } from "@store/useStore";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import "../../global.css";

export default function HomeScreen() {
  const router = useRouter();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);

  const { t } = useTranslation();
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);

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

  const handleCreateDeck = async (title: string) => {
    await createDeck(title);
    setBottomSheetVisible(false);
  };

  useEffect(() => {
    loadDecks();
    loadAllCards();
  }, []);

  // Calculate Stats
  let dueToday = 0;
  const now = new Date();

  decks.forEach((deck) => {
    const deckCards = allCards.filter((c) => c.deck_id === deck.id);

    // 1. Due reviews
    const reviewsDue = deckCards.filter((c) => {
      if (c.status === CARD_STATUS.NEW) return false;
      if (!c.next_review_at) return true;
      return new Date(c.next_review_at) <= now;
    }).length;

    // 2. New cards allowed
    const limit = deck.daily_new_limit ?? dailyNewLimit;
    const newAllowed = deckCards
      .filter((c) => c.status === CARD_STATUS.NEW)
      .slice(0, limit).length;

    dueToday += reviewsDue + newAllowed;
  });

  const learnedWords = allCards.filter(
    (c) => c.status !== CARD_STATUS.NEW,
  ).length;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* <Image
              source={require("@assets/images/only-icon.png")}
              style={{
                width: 30,
                height: 30,
                }}
                resizeMode="contain"
            /> */}
            <Text style={[styles.headerTitle]}>
              <Text style={{ color: (colors as any).brandPurple }}>
                {t("home.brandPart1")}
              </Text>
              <Text style={{ color: (colors as any).brandCyan }}>
                {t("home.brandPart2")}
              </Text>
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => {
                if (!session) router.push(ROUTES.AUTH_LOGIN as any);
              }}
              style={[
                styles.authButton,
                {
                  backgroundColor: session
                    ? colors.success + "20"
                    : colors.surface,
                },
              ]}
            >
              <Ionicons
                name={session ? "cloud-done" : "cloud-offline-outline"}
                size={20}
                color={session ? colors.success : colors.icon}
              />
            </TouchableOpacity>

            <View style={styles.avatar}>
              {session?.user?.user_metadata?.avatar_url ? (
                <Image
                  source={{ uri: session.user.user_metadata.avatar_url }}
                  style={styles.avatarImage}
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: colors.surface,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="person"
                    size={24}
                    color={colors.textSecondary}
                  />
                </View>
              )}
            </View>
          </View>
        </View>

        <FlatList
          data={decks}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <StatsDashboard dueToday={dueToday} learnedWords={learnedWords} />
              <Text style={styles.sectionTitle}>{t("home.yourDecks")}</Text>
            </>
          }
          renderItem={({ item, index }) => {
            const deckCards = allCards.filter((c) => c.deck_id === item.id);
            const newCards = deckCards.filter(
              (c) => c.status === CARD_STATUS.NEW,
            ).length;
            const learningCards = deckCards.filter(
              (c) => c.status === CARD_STATUS.LEARNING,
            ).length;
            const masteredCards = deckCards.filter(
              (c) => c.status === CARD_STATUS.MASTERED,
            ).length;
            const totalCards = deckCards.length;

            return (
              <DeckListItem
                deck={item}
                index={index}
                totalCards={totalCards}
                newCards={newCards}
                learningCards={learningCards}
                masteredCards={masteredCards}
                onPress={(id) => router.push(ROUTES.DECK_DETAILS(id) as any)}
              />
            );
          }}
          ListEmptyComponent={
            isLoading ? (
              <DeckListSkeleton />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{t("home.noDecks")}</Text>
              </View>
            )
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshing={isLoading}
          onRefresh={loadDecks}
        />
      </View>

      {/* Floating Add Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setBottomSheetVisible(true)}
          style={styles.fab}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {/* Create Deck Bottom Sheet */}
      <CreateDeckSheet
        visible={isBottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        onCreate={handleCreateDeck}
      />
    </SafeAreaView>
  );
}

const createStyles = (
  colors: typeof Colors.light,
  insets: { bottom: number },
) =>
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
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
      marginLeft: 8,
    },
    authButton: {
      padding: 8,
      borderRadius: 20,
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
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginRight: 8,
      marginBottom: 16,
    },
    emptyState: {
      alignItems: "center",
      marginTop: 16,
    },
    emptyText: {
      color: colors.textSecondary,
    },
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
    image: {
      width: 60,
      height: 60,
    }
  });
