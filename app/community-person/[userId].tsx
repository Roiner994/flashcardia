import { Button } from "@components/ui/Button";
import { Colors } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SocialService } from "@services/SocialService";
import { useStore } from "@store/useStore";
import { CommunityPersonDecksResponse, Profile, PublicDeck } from "@types";
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

function PersonDeckCard({
  deck,
  ownerName,
  onLike,
  onAdd,
  colors,
  t,
}: {
  deck: PublicDeck;
  ownerName: string;
  onLike: (deckId: string) => void;
  onAdd: (deckId: string) => void;
  colors: typeof Colors.light;
  t: (key: string, options?: any) => string;
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.cardShell}>
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <LinearGradient
            colors={[colors.primary, "#a78bfa"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.deckIcon}
          >
            <Ionicons name="sparkles" size={18} color={colors.white} />
          </LinearGradient>

          <View style={styles.cardTitleWrap}>
            <Text style={styles.cardEyebrow}>{t("community.deckSpotlight")}</Text>
            <Text style={styles.cardTitle}>{deck.title}</Text>
            <Text style={styles.cardSubtitle}>{ownerName}</Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricPill}>
            <Ionicons name="heart-outline" size={14} color={colors.primary} />
            <Text style={styles.metricText}>{deck.likes_count || 0}</Text>
          </View>
          <View style={styles.metricPill}>
            <Ionicons name="download-outline" size={14} color={colors.info} />
            <Text style={styles.metricText}>{deck.downloads_count || 0}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => onLike(deck.id)}
          >
            <Ionicons
              name={deck.liked_by_user ? "heart" : "heart-outline"}
              size={18}
              color={colors.primary}
            />
            <Text style={styles.secondaryActionText}>{t("community.like")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => onAdd(deck.id)}
          >
            <Ionicons name="download-outline" size={18} color={colors.white} />
            <Text style={styles.primaryActionText}>{t("community.add")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function CommunityPersonScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const { session } = useStore();

  const [data, setData] = useState<CommunityPersonDecksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!userId) {
        setError(t("community.personLoadError"));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await SocialService.getPersonPublicDecks(
          userId,
          session?.user?.id,
        );
        if (!cancelled) setData(result);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || t("community.personLoadError"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, session?.user?.id, t]);

  const handleLike = async (deckId: string) => {
    if (!session?.user?.id) {
      router.push("/(auth)/login");
      return;
    }

    if (!data) return;

    const targetDeck = data.decks.find((deck) => deck.id === deckId);
    const wasLiked = !!targetDeck?.liked_by_user;
    const optimisticDelta = wasLiked ? -1 : 1;

    setData((prev) =>
      prev
        ? {
            ...prev,
            decks: prev.decks.map((deck) =>
              deck.id === deckId
                ? {
                    ...deck,
                    liked_by_user: !wasLiked,
                    likes_count: Math.max(0, (deck.likes_count || 0) + optimisticDelta),
                  }
                : deck,
            ),
          }
        : prev,
    );

    try {
      const liked = await SocialService.toggleLike(deckId, session.user.id);
      setData((prev) =>
        prev
          ? {
              ...prev,
              decks: prev.decks.map((deck) =>
                deck.id === deckId
                  ? {
                      ...deck,
                      liked_by_user: liked,
                      likes_count: Math.max(
                        0,
                        (deck.likes_count || 0) +
                          (liked === wasLiked ? -optimisticDelta : 0),
                      ),
                    }
                  : deck,
              ),
            }
          : prev,
      );
    } catch (err) {
      console.error(err);
      setData((prev) =>
        prev
          ? {
              ...prev,
              decks: prev.decks.map((deck) =>
                deck.id === deckId
                  ? {
                      ...deck,
                      liked_by_user: wasLiked,
                      likes_count: Math.max(0, (deck.likes_count || 0) - optimisticDelta),
                    }
                  : deck,
              ),
            }
          : prev,
      );
      Alert.alert(t("common.error"), t("community.likeError"));
    }
  };

  const handleAdd = (deckId: string) => {
    router.push({
      pathname: "/community-import/[deckId]",
      params: { deckId },
    });
  };

  const person: Profile | null = data?.person || null;
  const displayName =
    person?.full_name || person?.username || t("community.anonymous");

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[colors.primary, "#7c3aed"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.heroHeader}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>

          {person && (
            <View style={styles.heroIdentityCard}>
              {person.avatar_url ? (
                <Image source={{ uri: person.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={28} color={colors.white} />
                </View>
              )}

              <View style={styles.heroTextWrap}>
                <Text style={styles.heroTitle}>{displayName}</Text>
                <Text style={styles.heroSubtitle}>
                  {t("community.publicDeckCreator")}
                </Text>
              </View>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.centerText}>{t("community.personLoading")}</Text>
          </View>
        ) : error ? (
          <View style={styles.centerState}>
            <Ionicons name="alert-circle-outline" size={44} color={colors.error} />
            <Text style={styles.errorTitle}>{t("community.personLoadFailed")}</Text>
            <Text style={styles.errorBody}>{error}</Text>
            <Button
              title={t("community.retry")}
              icon="refresh"
              onPress={() => router.replace(`/community-person/${userId}` as any)}
              size="md"
              style={styles.retryButton}
            />
          </View>
        ) : (
          <FlatList
            data={data?.decks || []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PersonDeckCard
                deck={item}
                ownerName={displayName}
                onLike={handleLike}
                onAdd={handleAdd}
                colors={colors}
                t={t}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              person ? (
                <View style={styles.summaryRow}>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>
                      {person.current_streak || 0}
                    </Text>
                    <Text style={styles.summaryLabel}>{t("community.dayStreak")}</Text>
                  </View>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>
                      {person.public_deck_count || 0}
                    </Text>
                    <Text style={styles.summaryLabel}>{t("community.publicDecks")}</Text>
                  </View>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <Ionicons
                  name="albums-outline"
                  size={44}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyTitle}>{t("community.noDecksTitle")}</Text>
                <Text style={styles.emptyText}>{t("community.personNoPublicDecksBody")}</Text>
              </View>
            }
          />
        )}
      </View>
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
      paddingBottom: 24,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
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
      paddingTop: 8,
      paddingBottom: 18,
    },
    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.15)",
    },
    heroIdentityCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.16)",
      padding: 20,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.16)",
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 24,
      marginRight: 16,
      backgroundColor: colors.white,
    },
    avatarPlaceholder: {
      width: 72,
      height: 72,
      borderRadius: 24,
      marginRight: 16,
      backgroundColor: "rgba(255,255,255,0.22)",
      alignItems: "center",
      justifyContent: "center",
    },
    heroTextWrap: {
      flex: 1,
    },
    heroTitle: {
      color: colors.white,
      fontSize: 28,
      fontWeight: "800",
      letterSpacing: -0.7,
    },
    heroSubtitle: {
      color: "rgba(255,255,255,0.86)",
      fontSize: 14,
      marginTop: 6,
      fontWeight: "500",
      lineHeight: 20,
    },
    contentContainer: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 110,
      gap: 18,
    },
    summaryRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 18,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 22,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryValue: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "800",
      letterSpacing: -0.7,
    },
    summaryLabel: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
      marginTop: 4,
    },
    centerState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 28,
    },
    centerText: {
      marginTop: 14,
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
      fontWeight: "500",
    },
    errorTitle: {
      marginTop: 14,
      color: colors.text,
      fontSize: 20,
      fontWeight: "800",
      textAlign: "center",
    },
    errorBody: {
      marginTop: 8,
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 21,
      textAlign: "center",
    },
    retryButton: {
      marginTop: 18,
      alignSelf: "stretch",
    },
    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: 28,
      padding: 28,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: "dashed",
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      marginTop: 14,
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
  });
