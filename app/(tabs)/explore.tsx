import { Colors } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SocialService } from "@services/SocialService";
import { useStore } from "@store/useStore";
import { Profile, PublicDeck } from "@types";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_SIZE = 20;

export default function ExploreScreen() {
  const router = useRouter();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const { session } = useStore();

  const [activeTab, setActiveTab] = useState<"decks" | "people">("decks");
  const [decks, setDecks] = useState<PublicDeck[]>([]);
  const [people, setPeople] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const fetchInitialData = async () => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    try {
      if (activeTab === "decks") {
        const data = await SocialService.getExploreDecks(1, session?.user?.id);
        if (data.length < PAGE_SIZE) setHasMore(false);
        setDecks(data);
      } else {
        const data = await SocialService.searchPeople("", 1);
        if (data.length < PAGE_SIZE) setHasMore(false);
        setPeople(data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t("common.error"), t("community.loadDataError"));
    } finally {
      setLoading(false);
    }
  };

  const loadMoreData = async () => {
    if (!hasMore || isFetchingMore || loading) return;
    setIsFetchingMore(true);
    try {
      const nextPage = page + 1;
      if (activeTab === "decks") {
        const data = await SocialService.getExploreDecks(nextPage, session?.user?.id);
        if (data.length < PAGE_SIZE) setHasMore(false);
        setDecks((prev) => [...prev, ...data]);
      } else {
        const data = await SocialService.searchPeople("", nextPage);
        if (data.length < PAGE_SIZE) setHasMore(false);
        setPeople((prev) => [...prev, ...data]);
      }
      setPage(nextPage);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [activeTab, session?.user?.id]);

  const handleLike = async (deckId: string) => {
    if (!session?.user?.id) {
      router.push("/(auth)/login");
      return;
    }

    const targetDeck = decks.find((deck) => deck.id === deckId);
    const wasLiked = !!targetDeck?.liked_by_user;
    const optimisticDelta = wasLiked ? -1 : 1;

    setDecks((prev) =>
      prev.map((deck) =>
        deck.id === deckId
          ? {
              ...deck,
              liked_by_user: !wasLiked,
              likes_count: Math.max(0, (deck.likes_count || 0) + optimisticDelta),
            }
          : deck,
      ),
    );

    try {
      const liked = await SocialService.toggleLike(deckId, session.user.id);
      setDecks((prev) =>
        prev.map((deck) =>
          deck.id === deckId
            ? {
                ...deck,
                liked_by_user: liked,
                likes_count: Math.max(
                  0,
                  (deck.likes_count || 0) + (liked === wasLiked ? -optimisticDelta : 0),
                ),
              }
            : deck,
        ),
      );
    } catch (error) {
      console.error(error);
      setDecks((prev) =>
        prev.map((deck) =>
          deck.id === deckId
            ? {
                ...deck,
                liked_by_user: wasLiked,
                likes_count: Math.max(0, (deck.likes_count || 0) - optimisticDelta),
              }
            : deck,
        ),
      );
      Alert.alert(t("common.error"), t("community.likeError"));
    }
  };

  const handleFork = async (deckId: string) => {
    router.push({
      pathname: "/community-import/[deckId]",
      params: { deckId },
    });
  };

  const handleOpenPerson = (userId: string) => {
    router.push({
      pathname: "/community-person/[userId]",
      params: { userId },
    });
  };

  const renderDeck = ({ item, index }: { item: PublicDeck; index: number }) => {
    const ownerName =
      item.profiles?.full_name ||
      item.profiles?.username ||
      t("community.anonymous");

    const gradients: [string, string][] = [
      [colors.primary, "#a78bfa"],
      [colors.info, "#7dd3fc"],
      [colors.warning, "#f9a8d4"],
    ];
    const gradient = gradients[index % gradients.length];

    return (
      <View style={styles.cardShell}>
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.deckIcon}
            >
              <Ionicons name="sparkles" size={18} color={colors.white} />
            </LinearGradient>

            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardEyebrow}>{t("community.deckSpotlight")}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{ownerName}</Text>
            </View>

          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricPill}>
              <Ionicons name="heart-outline" size={14} color={colors.primary} />
              <Text style={styles.metricText}>{item.likes_count || 0}</Text>
            </View>
            <View style={styles.metricPill}>
              <Ionicons name="download-outline" size={14} color={colors.info} />
              <Text style={styles.metricText}>{item.downloads_count || 0}</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => handleLike(item.id)}
            >
              <Ionicons
                name={item.liked_by_user ? "heart" : "heart-outline"}
                size={18}
                color={colors.primary}
              />
              <Text style={styles.secondaryActionText}>{t("community.like")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryAction}
              onPress={() => handleFork(item.id)}
            >
              <Ionicons name="download-outline" size={18} color={colors.white} />
              <Text style={styles.primaryActionText}>{t("community.add")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderPerson = ({ item, index }: { item: Profile; index: number }) => {
    const displayName =
      item.full_name || item.username || t("community.anonymous");
    const isLeader = index < 3;

    return (
      <View style={styles.cardShell}>
        <TouchableOpacity
          style={styles.personCard}
          activeOpacity={0.92}
          onPress={() => handleOpenPerson(item.id)}
        >
          <View style={styles.personHeader}>
            <View style={styles.personIdentity}>
              {item.avatar_url ? (
                <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
              ) : (
                <LinearGradient
                  colors={[colors.primary, "#c4b5fd"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarPlaceholder}
                >
                  <Ionicons name="person" size={20} color={colors.white} />
                </LinearGradient>
              )}

              <View style={styles.personInfo}>
                <Text style={styles.personName}>{displayName}</Text>
                <Text style={styles.personCaption}>
                  {t("community.publicDeckCreator")}
                </Text>
              </View>
            </View>

            <View style={styles.personMetaColumn}>
              <View style={[styles.rankBadge, isLeader && styles.rankBadgeHot]}>
                <Text
                  style={[styles.rankText, isLeader && styles.rankTextHot]}
                >
                  #{index + 1}
                </Text>
              </View>
              <View style={styles.deckCountBadge}>
                <Ionicons name="albums-outline" size={14} color={colors.primary} />
                <Text style={styles.deckCountText}>
                  {t("community.publicDeckCount", {
                    count: item.public_deck_count || 0,
                  })}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.streakPanel}>
            <View>
              <Text style={styles.streakValue}>{item.current_streak}</Text>
              <Text style={styles.streakLabel}>{t("community.dayStreak")}</Text>
            </View>
            <View style={styles.streakIconWrap}>
              <Ionicons name="flame" size={20} color="#f97316" />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => {
    const isDecks = activeTab === "decks";
    return (
      <View style={styles.emptyCard}>
        <LinearGradient
          colors={[colors.primary, "#c4b5fd"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyIcon}
        >
          <Ionicons
            name={isDecks ? "albums-outline" : "people-outline"}
            size={24}
            color={colors.white}
          />
        </LinearGradient>
        <Text style={styles.emptyTitle}>
          {isDecks ? t("community.noDecksTitle") : t("community.noPeopleTitle")}
        </Text>
        <Text style={styles.emptyText}>
          {isDecks ? t("community.noDecksBody") : t("community.noPeopleBody")}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, "#7c3aed"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroTitle}>{t("tabs.explore")}</Text>
            <Text style={styles.heroSubtitle}>{t("community.subtitle")}</Text>
          </View>

          <View style={styles.segmentedWrap}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                activeTab === "decks" && styles.segmentButtonActive,
              ]}
              onPress={() => setActiveTab("decks")}
            >
              <Ionicons
                name="albums-outline"
                size={16}
                color={activeTab === "decks" ? colors.primary : colors.white}
              />
              <Text
                style={[
                  styles.segmentText,
                  activeTab === "decks" && styles.segmentTextActive,
                ]}
              >
                {t("community.decks")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentButton,
                activeTab === "people" && styles.segmentButtonActive,
              ]}
              onPress={() => setActiveTab("people")}
            >
              <Ionicons
                name="people-outline"
                size={16}
                color={activeTab === "people" ? colors.primary : colors.white}
              />
              <Text
                style={[
                  styles.segmentText,
                  activeTab === "people" && styles.segmentTextActive,
                ]}
              >
                {t("community.people")}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading && page === 1 ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      ) : (
        <FlatList<any>
          data={activeTab === "decks" ? decks : people}
          key={activeTab}
          keyExtractor={(item) => item.id}
          renderItem={activeTab === "decks" ? (renderDeck as any) : (renderPerson as any)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={
            isFetchingMore ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={styles.footerLoader}
              />
            ) : null
          }
        />
      )}
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    heroGradient: {
      paddingBottom: 28,
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
      shadowColor: "#7c3aed",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.18,
      shadowRadius: 24,
      elevation: 8,
    },
    safeArea: {
      paddingHorizontal: 20,
    },
    heroHeader: {
      paddingTop: 10,
      paddingBottom: 18,
    },
    heroTitle: {
      fontSize: 34,
      fontWeight: "800",
      color: colors.white,
      letterSpacing: -0.8,
      marginBottom: 8,
    },
    heroSubtitle: {
      fontSize: 15,
      lineHeight: 21,
      color: "rgba(255,255,255,0.85)",
      maxWidth: "88%",
      fontWeight: "500",
    },
    segmentedWrap: {
      flexDirection: "row",
      backgroundColor: "rgba(255,255,255,0.16)",
      borderRadius: 20,
      padding: 6,
      gap: 8,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
    },
    segmentButton: {
      flex: 1,
      borderRadius: 16,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    segmentButtonActive: {
      backgroundColor: colors.white,
    },
    segmentText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: "700",
    },
    segmentTextActive: {
      color: colors.primary,
    },
    loader: {
      flex: 1,
      justifyContent: "center",
    },
    listContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 112,
      gap: 18,
    },
    cardShell: {
      borderRadius: 28,
      shadowColor: "#0f172a",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 5,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 28,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border + "80",
    },
    cardTopRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    deckIcon: {
      width: 52,
      height: 52,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    cardTitleWrap: {
      flex: 1,
    },
    cardEyebrow: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 3,
    },
    cardTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.6,
    },
    cardSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
      fontWeight: "500",
    },
    metricRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 18,
    },
    metricPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.background,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    metricText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "700",
    },
    cardFooter: {
      flexDirection: "row",
      gap: 10,
    },
    secondaryAction: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.background,
      borderRadius: 16,
      paddingVertical: 14,
    },
    secondaryActionText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "700",
    },
    primaryAction: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 14,
    },
    primaryActionText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: "700",
    },
    personCard: {
      backgroundColor: colors.surface,
      borderRadius: 28,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border + "80",
    },
    personHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 18,
    },
    personIdentity: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      marginRight: 12,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 20,
      marginRight: 14,
    },
    avatarPlaceholder: {
      width: 56,
      height: 56,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    personInfo: {
      flex: 1,
    },
    personMetaColumn: {
      alignItems: "flex-end",
      gap: 10,
    },
    personName: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.4,
    },
    personCaption: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
      fontWeight: "500",
    },
    deckCountBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.primary + "12",
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    deckCountText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.primary,
    },
    rankBadge: {
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: colors.background,
    },
    rankBadgeHot: {
      backgroundColor: "#fef3c7",
    },
    rankText: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.textSecondary,
    },
    rankTextHot: {
      color: "#b45309",
    },
    streakPanel: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.background,
      borderRadius: 22,
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    streakValue: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.7,
    },
    streakLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
      fontWeight: "600",
    },
    streakIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 16,
      backgroundColor: "#fff7ed",
      alignItems: "center",
      justifyContent: "center",
    },
    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: 28,
      padding: 28,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: "dashed",
      marginTop: 8,
    },
    emptyIcon: {
      width: 56,
      height: 56,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 8,
      textAlign: "center",
    },
    emptyText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      textAlign: "center",
      maxWidth: 280,
    },
    footerLoader: {
      marginVertical: 24,
    },
  });
