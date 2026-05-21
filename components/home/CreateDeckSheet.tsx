import { Colors } from "@constants/Colors";
import { useTheme } from "@hooks/useThemeColor";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface CreateDeckSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (title: string, isPublic: boolean) => Promise<void>;
}

const width = Dimensions.get("window").width;

export function CreateDeckSheet({
  visible,
  onClose,
  onCreate,
}: CreateDeckSheetProps) {
  const { t } = useTranslation();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    await onCreate(title, isPublic);
    setTitle("");
    setIsPublic(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <TouchableWithoutFeedback>
              <View style={styles.card}>
                <Text style={styles.title}>{t("home.newCollection")}</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{t("home.deckTitle")}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t("home.deckTitlePlaceholder")}
                    placeholderTextColor={colors.textSecondary}
                    value={title}
                    onChangeText={setTitle}
                    autoFocus
                  />
                </View>

                <View style={styles.toggleContainer}>
                  <Text style={styles.inputLabel}>{t("community.shareToCommunity")}</Text>
                  <TouchableOpacity
                    style={[styles.toggle, isPublic && styles.toggleActive]}
                    onPress={() => setIsPublic(!isPublic)}
                  >
                    <View style={[styles.toggleThumb, isPublic && styles.toggleThumbActive]} />
                  </TouchableOpacity>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onClose}
                  >
                    <Text style={styles.cancelButtonText}>
                      {t("common.cancel")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.createButton,
                      !title.trim() && styles.buttonDisabled,
                    ]}
                    onPress={handleCreate}
                    disabled={!title.trim()}
                  >
                    <Text style={styles.createButtonText}>
                      {t("home.createDeck")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      width: width-64,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 10,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
      marginBottom: 20,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
      marginBottom: 8,
    },
    input: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      backgroundColor: colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    buttonRow: {
      flexDirection: "row",
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      color: colors.text,
      fontWeight: "600",
      fontSize: 16,
    },
    createButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      backgroundColor: colors.primary,
    },
    createButtonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    toggleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    toggle: {
      width: 50,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.border,
      padding: 2,
    },
    toggleActive: {
      backgroundColor: colors.primary,
    },
    toggleThumb: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: "white",
    },
    toggleThumbActive: {
      transform: [{ translateX: 20 }],
    },
  });
