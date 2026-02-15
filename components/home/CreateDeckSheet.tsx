import { AnimatedBottomSheet } from "@components/ui/AnimatedBottomSheet";
import { BottomSheetHeader } from "@components/ui/BottomSheetHeader";
import { Colors } from "@constants/Colors";
import { useTheme } from "@hooks/useThemeColor";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CreateDeckSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (title: string) => Promise<void>;
}

export function CreateDeckSheet({
  visible,
  onClose,
  onCreate,
}: CreateDeckSheetProps) {
  const { t } = useTranslation();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [title, setTitle] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) return;
    await onCreate(title);
    setTitle("");
    onClose();
  };

  return (
    <AnimatedBottomSheet visible={visible} onClose={onClose} snapPoint={35}>
      {(handleClose) => (
        <>
          <BottomSheetHeader
            title={t("home.newCollection")}
            onClose={handleClose}
          />

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t("home.deckTitle")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("home.deckTitlePlaceholder")}
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createButtonText}>{t("home.createDeck")}</Text>
          </TouchableOpacity>
        </>
      )}
    </AnimatedBottomSheet>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    inputContainer: {
      backgroundColor: colors.background,
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
      marginTop: 8,
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
      color: "white",
      fontWeight: "bold",
      fontSize: 18,
    },
  });
