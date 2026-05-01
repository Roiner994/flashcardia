import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { CustomAlert } from "@components/modals/CustomAlert";
import { Colors } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useThemeColor";
import { SocialService } from "@services/SocialService";
import { useStore } from "@store/useStore";
import { PublicDeckPreviewCard, PublicDeckPreviewResponse } from "@types";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { memo, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PreviewCardRowProps = {
  card: PublicDeckPreviewCard;
  expanded: boolean;
  selected: boolean;
  onToggleExpanded: (id: string) => void;
  onToggleSelected: (id: string) => void;
  colors: typeof Colors.light;
  meaningLabel: string;
  phoneticLabel: string;
  examplesLabel: string;
};

const PreviewCardRow = memo(function PreviewCardRow({
  card,
  expanded,
  selected,
  onToggleExpanded,
  onToggleSelected,
  colors,
  meaningLabel,
  phoneticLabel,
  examplesLabel,
}: PreviewCardRowProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.rowShell}>
      <TouchableOpacity
        style={styles.rowCard}
        activeOpacity={0.9}
        onPress={() => onToggleExpanded(card.id)}
      >
        <TouchableOpacity
          onPress={() => onToggleSelected(card.id)}
          style={styles.checkboxButton}
          hitSlop={10}
        >
          <Ionicons
            name={selected ? "checkbox" : "square-outline"}
            size={24}
            color={selected ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.rowTextWrap}>
          <Text style={styles.rowWord}>{card.front_word}</Text>
          <Text style={styles.rowDefinition} numberOfLines={expanded ? 4 : 1}>
            {card.definition}
          </Text>

          {expanded && (
            <View style={styles.expandedPanel}>
              {!!card.spanish_meaning && (
                <View style={styles.expandedBlock}>
                  <Text style={styles.expandedLabel}>{meaningLabel}</Text>
                  <Text style={styles.expandedText}>{card.spanish_meaning}</Text>
                </View>
              )}

              {!!card.phonetic && (
                <View style={styles.expandedBlock}>
                  <Text style={styles.expandedLabel}>{phoneticLabel}</Text>
                  <Text style={styles.expandedText}>{card.phonetic}</Text>
                </View>
              )}

              {card.examples?.length > 0 && (
                <View style={styles.expandedBlock}>
                  <Text style={styles.expandedLabel}>{examplesLabel}</Text>
                  {card.examples.slice(0, 3).map((example, idx) => (
                    <Text key={`${card.id}-${idx}`} style={styles.exampleText}>
                      • {example}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
});

export default function CommunityImportScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const router = useRouter();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const { session, loadDecks, loadAllCards } = useStore();

  const [preview, setPreview] = useState<PublicDeckPreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [deckName, setDeckName] = useState("");
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const cards = preview?.cards || [];
  const selectedCount = selectedIds.size;
  const allSelected = cards.length > 0 && selectedCount === cards.length;

  const loadPreview = async (currentDeckId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await SocialService.getDeckPreview(currentDeckId);
      setPreview(data);
      setSelectedIds(new Set(data.cards.map((card) => card.id)));
      setDeckName(data.deck.title);
    } catch (err: any) {
      setError(err?.message || t("community.previewLoadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!deckId) {
      setError(t("community.previewMissingDeck"));
      setLoading(false);
      return;
    }

    loadPreview(deckId);
  }, [deckId, t]);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(cards.map((card) => card.id)));
  };

  const handleClearAll = () => {
    setSelectedIds(new Set());
  };

  const handleImport = async () => {
    if (!preview) return;

    if (!session?.user?.id) {
      router.push("/(auth)/login");
      return;
    }

    if (selectedCount === 0) return;

    setImporting(true);
    try {
      const result = await SocialService.importSelectedCards(
        preview.deck.id,
        session.user.id,
        Array.from(selectedIds),
        deckName.trim(),
      );
      await Promise.all([loadDecks(), loadAllCards()]);
      setSuccessMessage(
        t("community.importSuccess", {
          count: result.imported_count,
          deck: deckName.trim() || preview.deck.title,
        }),
      );
      setSuccessVisible(true);
    } catch (err) {
      console.error(err);
      setSuccessVisible(false);
      setErrorMessage(t("community.importError"));
      setErrorVisible(true);
    } finally {
      setImporting(false);
    }
  };

  const renderItem = ({ item }: { item: PublicDeckPreviewCard }) => (
    <PreviewCardRow
      card={item}
      expanded={expandedIds.has(item.id)}
      selected={selectedIds.has(item.id)}
      onToggleExpanded={toggleExpanded}
      onToggleSelected={toggleSelected}
      colors={colors}
      meaningLabel={t("community.meaningLabel")}
      phoneticLabel={t("community.phoneticLabel")}
      examplesLabel={t("community.examplesLabel")}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <CustomAlert
        visible={successVisible}
        type="success"
        title={t("common.success")}
        message={successMessage}
        onClose={() => {
          setSuccessVisible(false);
          router.back();
        }}
      />
      <CustomAlert
        visible={errorVisible}
        type="error"
        title={t("common.error")}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.headerTextWrap} />

        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.centerText}>{t("community.previewLoading")}</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={44} color={colors.error} />
          <Text style={styles.errorTitle}>{t("community.previewLoadFailed")}</Text>
          <Text style={styles.errorBody}>{error}</Text>
          <Button
            title={t("community.retry")}
            onPress={() => {
              setPreview(null);
              setSelectedIds(new Set());
              setExpandedIds(new Set());
              if (deckId) loadPreview(deckId);
            }}
            icon="refresh"
            size="md"
            style={styles.retryButton}
          />
        </View>
      ) : (
        <>
          <View style={styles.topPanel}>
            <View style={styles.renameCard}>
              <View style={styles.renameHeader}>
                <View style={styles.renameIconWrap}>
                  <Ionicons name="create-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.renameTextWrap}>
                  <Text style={styles.renameTitle}>{t("community.renameTitle")}</Text>
                  <Text style={styles.renameSubtitle}>{t("community.renameSubtitle")}</Text>
                </View>
              </View>

              <Input
                label={t("community.deckNameLabel")}
                value={deckName}
                onChangeText={setDeckName}
                placeholder={t("community.deckNamePlaceholder")}
                leftIcon="albums-outline"
              />
            </View>

            <View style={styles.toolbarCard}>
              <TouchableOpacity
                style={styles.masterToggle}
                onPress={allSelected ? handleClearAll : handleSelectAll}
                disabled={cards.length === 0}
              >
                <Ionicons
                  name={
                    allSelected
                      ? "checkbox"
                      : selectedCount > 0
                        ? "remove-circle-outline"
                        : "square-outline"
                  }
                  size={24}
                  color={cards.length === 0 ? colors.textSecondary : colors.primary}
                />
                <View style={styles.masterToggleTextWrap}>
                  <Text style={styles.masterToggleTitle}>{t("community.selectAll")}</Text>
                  <Text style={styles.masterToggleSubtitle}>
                    {t("community.selectionCount", {
                      selected: selectedCount,
                      total: cards.length,
                    })}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.clearButton,
                  selectedCount === 0 && styles.clearButtonDisabled,
                ]}
                onPress={handleClearAll}
                disabled={selectedCount === 0}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={16}
                  color={selectedCount === 0 ? colors.textSecondary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.clearButtonText,
                    selectedCount === 0 && styles.clearButtonTextDisabled,
                  ]}
                >
                  {t("community.clearAll")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={cards}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            extraData={{
              selected: selectedIds,
              expanded: expandedIds,
            }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.centerState}>
                <Ionicons name="albums-outline" size={44} color={colors.textSecondary} />
                <Text style={styles.centerText}>{t("community.noCardsToImport")}</Text>
              </View>
            }
          />

          <View style={styles.footer}>
            <Button
              title={session ? t("community.importSelected") : t("community.signInToImport")}
              onPress={handleImport}
              loading={importing}
              disabled={selectedCount === 0}
              icon={session ? "download-outline" : "log-in-outline"}
              size="lg"
              style={styles.primaryFooterButton}
            />
            <Button
              title={t("common.cancel")}
              onPress={() => router.back()}
              variant="ghost"
              size="md"
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function createStyles(colors: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 10,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerTextWrap: {
      flex: 1,
      marginLeft: 14,
    },
    headerSpacer: {
      width: 40,
    },
    toolbar: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    topPanel: {
      paddingHorizontal: 20,
      paddingBottom: 12,
      gap: 12,
    },
    renameCard: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 2,
    },
    renameHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
      gap: 12,
    },
    renameIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 14,
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
    },
    renameTextWrap: {
      flex: 1,
    },
    renameTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "800",
    },
    renameSubtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 2,
      lineHeight: 18,
      fontWeight: "500",
    },
    toolbarCard: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 2,
    },
    masterToggle: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    masterToggleTextWrap: {
      flex: 1,
    },
    masterToggleTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "800",
    },
    masterToggleSubtitle: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 3,
      lineHeight: 17,
      fontWeight: "600",
    },
    clearButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.background,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    clearButtonDisabled: {
      opacity: 0.55,
    },
    clearButtonText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: "700",
    },
    clearButtonTextDisabled: {
      color: colors.textSecondary,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    rowShell: {
      marginBottom: 12,
    },
    rowCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      flexDirection: "row",
      alignItems: "flex-start",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    checkboxButton: {
      marginRight: 12,
      paddingTop: 2,
    },
    rowTextWrap: {
      flex: 1,
      marginRight: 10,
    },
    rowWord: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 4,
    },
    rowDefinition: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
    },
    expandedPanel: {
      marginTop: 14,
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 14,
      gap: 12,
    },
    expandedBlock: {
      gap: 4,
    },
    expandedLabel: {
      fontSize: 11,
      fontWeight: "800",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    expandedText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.text,
      fontWeight: "500",
    },
    exampleText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.text,
      fontWeight: "500",
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 20,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    primaryFooterButton: {
      marginBottom: 6,
    },
    centerState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
    },
    centerText: {
      marginTop: 14,
      color: colors.textSecondary,
      fontSize: 15,
      textAlign: "center",
      lineHeight: 22,
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
  });
}
