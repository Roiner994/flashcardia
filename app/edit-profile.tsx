import { CustomAlert } from "@components/modals/CustomAlert";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useThemeColor";
import { supabase } from "@lib/supabase";
import { useStore } from "@store/useStore";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
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
  const [username, setUsername] = useState(
    session?.user?.user_metadata?.username || ""
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
      let finalAvatarUrl = avatarUrl;

      // Check if the avatar is a local file (upload needed)
      if (avatarUrl && !avatarUrl.startsWith("http")) {
        const fileExt = avatarUrl.split(".").pop()?.toLowerCase() ?? "jpg";
        const fileName = `${session?.user?.id}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Use fetch to get the blob/buffer from the local URI
        const response = await fetch(avatarUrl);
        const arrayBuffer = await response.arrayBuffer();

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, arrayBuffer, {
            contentType: `image/${fileExt}`,
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
        finalAvatarUrl = data.publicUrl;
      }

      // Update profile
      await updateProfile({
        full_name: name,
        username: username,
        avatar_url: finalAvatarUrl,
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
    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 24,
      gap: 12,
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
            <Input
                label={t("editProfile.emailLabel")}
                value={session?.user?.email}
                editable={false}
                placeholder={t("editProfile.emailPlaceholder")}
            />

            <Input
                label={t("editProfile.fullNameLabel")}
                value={name}
                onChangeText={setName}
                placeholder={t("editProfile.namePlaceholder")}
                autoCapitalize="words"
            />

            <Input
                label={t("community.usernameLabel")}
                value={username}
                onChangeText={setUsername}
                placeholder={t("community.usernamePlaceholder")}
                autoCapitalize="none"
            />

            <View style={styles.actions}>
              <Button 
                variant="outline" 
                title={t("common.cancel")} 
                onPress={() => router.back()} 
                style={{ flex: 1 }}
              />
              <Button 
                variant="primary" 
                title={t("editProfile.saveChanges")} 
                onPress={handleSave} 
                loading={loading}
                style={{ flex: 2 }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
