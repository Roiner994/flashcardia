import { CustomAlert } from "@components/modals/CustomAlert";
import { AnimatedBottomSheet } from "@components/ui/AnimatedBottomSheet";
import { BottomSheetHeader } from "@components/ui/BottomSheetHeader";
import { Colors } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useThemeColor";
import { Deck } from "@store/types";
import { useStore } from "@store/useStore";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DeckSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  deck: Deck;
}

export function DeckSettingsSheet({
  visible,
  onClose,
  deck,
}: DeckSettingsSheetProps) {
  const { t } = useTranslation();
  const colors = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { updateDeck, deleteDeck } = useStore();

  const [deleteAlertVisible, setDeleteAlertVisible] = React.useState(false);

  const handleDelete = () => {
    setDeleteAlertVisible(true);
  };

  const confirmDelete = async () => {
    setDeleteAlertVisible(false);
    onClose();
    // Small delay to allow sheet to close
    setTimeout(async () => {
      await deleteDeck(deck.id);
      router.back();
    }, 300);
  };

  const currentLimit = deck.daily_new_limit ?? 10;

  return (
    <AnimatedBottomSheet
      visible={visible}
      onClose={onClose}
      snapPoint={32}
      renderOverlays={() => (
        <CustomAlert
          visible={deleteAlertVisible}
          type="danger"
          title={t("deckSettings.deleteConfirmTitle")}
          message={t("deckSettings.deleteConfirmBody")}
          onClose={() => setDeleteAlertVisible(false)}
          onConfirm={confirmDelete}
          confirmText={t("deckSettings.delete")}
          cancelText={t("common.cancel")}
        />
      )}
    >
      {(handleClose) => (
        <>
          <BottomSheetHeader
            title={t("deckSettings.title")}
            subtitle={t("deckSettings.subtitle")}
            onClose={handleClose}
          />

          <View style={styles.content}>
            <View style={styles.settingItemRow}>
              <View style={styles.settingIconCol}>
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>
                  {t("deckSettings.dailyLimit")}
                </Text>
                <Text style={styles.settingHint}>
                  {t("deckSettings.dailyLimitHint")}
                </Text>
              </View>
              <View style={styles.limitControls}>
                <TouchableOpacity
                  onPress={() =>
                    updateDeck(deck.id, {
                      daily_new_limit: Math.max(1, currentLimit - 1),
                    })
                  }
                  style={styles.controlButton}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                <Text style={styles.limitValue}>{currentLimit}</Text>
                <TouchableOpacity
                  onPress={() =>
                    updateDeck(deck.id, {
                      daily_new_limit: Math.min(100, currentLimit + 1),
                    })
                  }
                  style={styles.controlButton}
                >
                  <Ionicons name="add" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.deleteDeckButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text style={styles.deleteDeckText}>
                {t("deckSettings.deleteDeck")}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </AnimatedBottomSheet>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    content: {
      paddingTop: 16,
    },
    settingItemRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },
    settingIconCol: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: colors.primary + "15", // Light primary background
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    settingLabel: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    settingHint: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 16,
      maxWidth: "90%",
    },
    limitControls: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    controlButton: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.background, // Alternating bg
      alignItems: "center",
      justifyContent: "center",
    },
    limitValue: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginHorizontal: 12,
      minWidth: 24,
      textAlign: "center",
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 24,
      opacity: 0.5,
    },
    deleteDeckButton: {
      backgroundColor: colors.error + "15", // Light red background
      borderRadius: 16,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    deleteDeckText: {
      color: colors.error,
      fontSize: 16,
      fontWeight: "700",
      marginLeft: 8,
    },
  });
