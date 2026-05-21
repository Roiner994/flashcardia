import { Colors } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useThemeColor";
import { CardDraft } from "@types";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import * as Speech from "expo-speech";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CardEditorModalProps = {
  visible: boolean;
  title: string;
  saveLabel: string;
  secondaryLabel: string;
  secondaryVariant?: "neutral" | "destructive";
  draft: CardDraft | null;
  isSaving?: boolean;
  onClose: () => void;
  onSave: () => void;
  onSecondaryAction: () => void;
  onChangeField: <K extends keyof CardDraft>(field: K, value: CardDraft[K]) => void;
  onChangeExample: (index: number, value: string) => void;
  onAddExample: () => void;
  onRemoveExample: (index: number) => void;
};

export function CardEditorModal({
  visible,
  title,
  saveLabel,
  secondaryLabel,
  secondaryVariant = "neutral",
  draft,
  isSaving = false,
  onClose,
  onSave,
  onSecondaryAction,
  onChangeField,
  onChangeExample,
  onAddExample,
  onRemoveExample,
}: CardEditorModalProps) {
  const { t } = useTranslation();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        onChangeField("image_url", result.assets[0].uri);
      }
    } catch (error) {
      console.error("Failed to pick image", error);
    }
  };

  const handlePlayAudio = async () => {
    if (!draft?.audio_url) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Speech.stop();
    Speech.speak(draft.front_word || "", {
      language: "en-US",
      pitch: 1.0,
      rate: 0.9,
    });
  };

  const handleToggleRecording = async () => {
    onChangeField("audio_source", "tts");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={isSaving ? undefined : onClose}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {isSaving && (
          <View style={styles.savingOverlay}>
            <View style={styles.savingCard}>
              <LottieView
                source={require("@assets/animations/generating.json")}
                autoPlay
                loop
                style={styles.savingLottie}
              />
              <Text style={styles.savingTitle}>{t("cardEditor.savingTitle")}</Text>
              <Text style={styles.savingBody}>{t("cardEditor.savingBody")}</Text>
            </View>
          </View>
        )}

        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton} disabled={isSaving}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={[colors.surface, colors.background]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            {draft?.image_url ? (
              <View style={styles.heroImageWrap}>
                <Image source={{ uri: draft.image_url }} style={styles.heroImage} contentFit="cover" />
                <View style={styles.heroImageActions}>
                  <TouchableOpacity
                    style={styles.mediaChip}
                    onPress={handlePickImage}
                    disabled={isSaving}
                  >
                    <Ionicons name="image-outline" size={16} color={colors.text} />
                    <Text style={styles.mediaChipText}>{t("cardEditor.changeImage")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.mediaChip, styles.mediaChipDanger]}
                    onPress={() => onChangeField("image_url", null)}
                    disabled={isSaving}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                    <Text style={[styles.mediaChipText, { color: colors.error }]}>
                      {t("cardEditor.removeImage")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.heroPlaceholder} onPress={handlePickImage} disabled={isSaving}>
                <View style={styles.heroPlaceholderIcon}>
                  <Ionicons name="image-outline" size={24} color={colors.primary} />
                </View>
                <Text style={styles.heroPlaceholderTitle}>{t("cardEditor.addImage")}</Text>
                <Text style={styles.heroPlaceholderBody}>{t("cardEditor.addImageHint")}</Text>
              </TouchableOpacity>
            )}

            <TextInput
              style={styles.wordInput}
              value={draft?.front_word || ""}
              onChangeText={(value) => onChangeField("front_word", value)}
              placeholder={t("cardEditor.wordPlaceholder")}
              placeholderTextColor={colors.textSecondary}
              editable={!isSaving}
            />

            <View style={styles.audioStack}>
              <View style={styles.phoneticWrap}>
                <Ionicons name="volume-medium-outline" size={16} color={colors.primary} />
                <TextInput
                  style={styles.phoneticInput}
                  value={draft?.phonetic || ""}
                  onChangeText={(value) => onChangeField("phonetic", value)}
                  placeholder={t("cardEditor.phoneticPlaceholder")}
                  placeholderTextColor={colors.textSecondary}
                  editable={!isSaving}
                />
              </View>

              <TouchableOpacity
                style={styles.audioAction}
                onPress={handleToggleRecording}
                disabled={isSaving}
              >
                <Ionicons name="mic-off-outline" size={18} color={colors.primary} />
                <Text style={styles.audioActionText}>
                  {t("cardEditor.recordingUnavailable")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.audioMetaRow}>
              {draft?.audio_source === "recorded" && draft.audio_url ? (
                <>
                  <TouchableOpacity style={styles.inlineAudioButton} onPress={handlePlayAudio}>
                    <Ionicons name="play" size={16} color={colors.primary} />
                    <Text style={styles.inlineAudioText}>{t("review.playAudio")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.inlineAudioButton}
                    onPress={() => {
                      onChangeField("audio_url", null);
                      onChangeField("audio_source", "tts");
                    }}
                    disabled={isSaving}
                  >
                    <Ionicons name="close-circle-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.inlineAudioText}>{t("cardEditor.useTts")}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.audioFallbackText}>{t("cardEditor.ttsFallback")}</Text>
              )}
            </View>
          </LinearGradient>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>{t("magic.concept")}</Text>
            <TextInput
              multiline
              style={styles.textArea}
              value={draft?.definition || ""}
              onChangeText={(value) => onChangeField("definition", value)}
              placeholder={t("cardEditor.definitionPlaceholder")}
              placeholderTextColor={colors.textSecondary}
              editable={!isSaving}
            />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>{t("magic.meaning")}</Text>
            <TextInput
              multiline
              style={styles.textArea}
              value={draft?.spanish_meaning || ""}
              onChangeText={(value) => onChangeField("spanish_meaning", value)}
              placeholder={t("cardEditor.meaningPlaceholder")}
              placeholderTextColor={colors.textSecondary}
              editable={!isSaving}
            />
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>{t("magic.examples")}</Text>
              <TouchableOpacity style={styles.addExampleButton} onPress={onAddExample} disabled={isSaving}>
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={styles.addExampleText}>{t("cardEditor.addExample")}</Text>
              </TouchableOpacity>
            </View>

            {(draft?.examples || []).map((example, index) => (
              <View key={`example-${index}`} style={styles.exampleEditorRow}>
                <View style={styles.exampleBullet} />
                <TextInput
                  multiline
                  style={styles.exampleInput}
                  value={example}
                  onChangeText={(value) => onChangeExample(index, value)}
                  placeholder={t("cardEditor.examplePlaceholder")}
                  placeholderTextColor={colors.textSecondary}
                  editable={!isSaving}
                />
                <TouchableOpacity onPress={() => onRemoveExample(index)} style={styles.removeExampleButton} disabled={isSaving}>
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryButton} onPress={onSave} disabled={isSaving}>
            <Ionicons name="checkmark" size={22} color="white" />
            <Text style={styles.primaryButtonText}>
              {isSaving ? t("common.loading") : saveLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              secondaryVariant === "destructive" && styles.secondaryButtonDanger,
              isSaving && styles.buttonDisabled,
            ]}
            onPress={onSecondaryAction}
            disabled={isSaving}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                secondaryVariant === "destructive" && styles.secondaryButtonTextDanger,
              ]}
            >
              {secondaryLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    savingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(15, 23, 42, 0.28)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 20,
      paddingHorizontal: 28,
    },
    savingCard: {
      width: "100%",
      maxWidth: 320,
      backgroundColor: colors.surface,
      borderRadius: 28,
      paddingVertical: 28,
      paddingHorizontal: 24,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.14,
      shadowRadius: 24,
      elevation: 14,
    },
    savingLottie: {
      width: 132,
      height: 132,
      marginBottom: 8,
    },
    savingTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
      letterSpacing: -0.4,
      marginBottom: 8,
    },
    savingBody: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      fontWeight: "500",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 56,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
    },
    headerSpacer: {
      width: 40,
      height: 40,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 140,
    },
    heroCard: {
      borderRadius: 28,
      padding: 18,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 5,
    },
    heroImageWrap: {
      marginBottom: 18,
    },
    heroImage: {
      width: "100%",
      height: 180,
      borderRadius: 22,
      backgroundColor: colors.background,
    },
    heroImageActions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 12,
      flexWrap: "wrap",
    },
    heroPlaceholder: {
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.primary + "35",
      borderStyle: "dashed",
      paddingVertical: 28,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      marginBottom: 18,
    },
    heroPlaceholderIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary + "15",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    heroPlaceholderTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    heroPlaceholderBody: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.textSecondary,
      textAlign: "center",
    },
    wordInput: {
      fontSize: 32,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
      marginBottom: 14,
      paddingHorizontal: 8,
    },
    audioStack: {
      gap: 10,
    },
    phoneticWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderWidth: 1,
      borderColor: colors.border,
    },
    phoneticInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 17,
      color: colors.textSecondary,
      fontWeight: "600",
    },
    audioAction: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary + "14",
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 8,
    },
    audioActionText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: "700",
      textAlign: "center",
    },
    audioMetaRow: {
      marginTop: 12,
    },
    inlineAudioButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inlineAudioText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
    },
    audioFallbackText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      textAlign: "center",
    },
    mediaChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.surface,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    mediaChipDanger: {
      borderColor: colors.error + "40",
    },
    mediaChipText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
    },
    sectionCard: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 14,
      marginBottom: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 10,
      elevation: 2,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.textSecondary,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      marginBottom: 10,
    },
    textArea: {
      minHeight: 44,
      maxHeight: 120,
      color: colors.text,
      fontSize: 16,
      lineHeight: 23,
      paddingTop: 0,
      paddingBottom: 0,
      textAlignVertical: "top",
    },
    addExampleButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    addExampleText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "700",
    },
    exampleEditorRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 14,
    },
    exampleBullet: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginTop: 12,
      marginRight: 10,
    },
    exampleInput: {
      flex: 1,
      fontSize: 15,
      lineHeight: 22,
      color: colors.text,
      minHeight: 44,
      textAlignVertical: "top",
    },
    removeExampleButton: {
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },
    footer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 18,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    primaryButton: {
      height: 56,
      borderRadius: 18,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      marginBottom: 10,
    },
    primaryButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "800",
    },
    secondaryButton: {
      height: 52,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryButtonDanger: {
      borderColor: colors.error + "35",
      backgroundColor: colors.error + "08",
    },
    secondaryButtonText: {
      color: colors.textSecondary,
      fontSize: 15,
      fontWeight: "700",
    },
    secondaryButtonTextDanger: {
      color: colors.error,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
  });
