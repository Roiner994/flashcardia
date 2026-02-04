import { CustomAlert } from "@components/modals/CustomAlert";
import { useTheme } from "@hooks/useThemeColor";
import { useStore } from "@store/useStore";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useTheme();
  const { session, updateProfile } = useStore();

  const [name, setName] = useState(
    session?.user?.user_metadata?.full_name || "",
  );
  const [avatarUrl, setAvatarUrl] = useState(
    session?.user?.user_metadata?.avatar_url || "",
  );
  const [loading, setLoading] = useState(false);

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
    onClose?: () => void;
  }>({
    type: "success",
    title: "",
    message: "",
  });

  const showAlert = (
    type: "success" | "error",
    title: string,
    message: string,
    onClose?: () => void,
  ) => {
    setAlertConfig({ type, title, message, onClose });
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
    if (alertConfig.onClose) {
      alertConfig.onClose();
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUrl(result.assets[0].uri);
      }
    } catch (e) {
      showAlert("error", t("common.error"), t("editProfile.pickImageError"));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update profile
      await updateProfile({
        full_name: name,
        avatar_url: avatarUrl,
      });

      showAlert(
        "success",
        t("common.success"),
        t("editProfile.updateSuccess"),
        () => router.back(),
      );
    } catch (e: any) {
      console.error(e);
      showAlert(
        "error",
        t("common.error"),
        e.message || t("editProfile.updateError"),
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
      marginLeft: -12,
    },
    cancelButton: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    saveButton: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
    },
    content: {
      flex: 1,
    },
    avatarSection: {
      alignItems: "center",
      paddingVertical: 32,
    },
    avatarContainer: {
      position: "relative",
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    editIconBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.background,
    },
    formSection: {
      paddingHorizontal: 24,
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textSecondary,
      marginBottom: 8,
      textTransform: "uppercase",
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      marginBottom: 16,
    },
    inputDisabled: {
      backgroundColor: colors.background,
      color: colors.textSecondary,
    },
    helperText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: -12,
      marginBottom: 16,
      marginLeft: 4,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 24,
    },
    actionButtonOutline: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      marginRight: 12,
      justifyContent: "center",
    },
    actionButtonOutlineText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    actionButtonFilled: {
      flex: 2,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    actionButtonFilledText: {
      fontSize: 16,
      fontWeight: "600",
      color: "white",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <CustomAlert
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={closeAlert}
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("editProfile.title")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarSection}>
            <TouchableOpacity
              onPress={pickImage}
              style={styles.avatarContainer}
            >
              <Image
                source={{
                  uri:
                    avatarUrl ||
                    "https://i.pravatar.cc/150?u=" + (session?.user?.id || ""),
                }}
                style={styles.avatar}
              />
              <View style={styles.editIconBadge}>
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>{t("editProfile.emailLabel")}</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={session?.user?.email}
              editable={false}
              placeholder={t("editProfile.emailPlaceholder")}
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>{t("editProfile.fullNameLabel")}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t("editProfile.namePlaceholder")}
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButtonOutline}
                onPress={() => router.back()}
              >
                <Text style={styles.actionButtonOutlineText}>
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButtonFilled}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.actionButtonFilledText}>
                    {t("editProfile.saveChanges")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
