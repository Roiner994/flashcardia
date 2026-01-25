import { CustomAlert } from "@/components/modals/CustomAlert";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useThemeColor";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useTheme();
  const { session, updatePassword } = useStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (newPassword.length > 0 && newPassword.length < 6) {
      newErrors.newPassword = t("changePassword.passwordLength");
    }
    if (confirmPassword.length > 0 && newPassword !== confirmPassword) {
      newErrors.confirmPassword = t("changePassword.passwordsDoNotMatch");
    }
    setErrors(newErrors);
  };

  React.useEffect(() => {
    validate();
  }, [newPassword, confirmPassword]);

  const isFormValid =
    currentPassword.length > 0 &&
    newPassword.length >= 6 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  const closeAlert = () => {
    setAlertVisible(false);
    if (alertConfig.onClose) {
      alertConfig.onClose();
    }
  };

  const handleSave = async () => {
    if (!isFormValid) return;

    setLoading(true);
    try {
      // 1. Verify current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session?.user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        throw new Error(t("changePassword.incorrectCurrent"));
      }

      // 2. Update to new password
      await updatePassword(newPassword);

      showAlert(
        "success",
        t("common.success"),
        t("changePassword.successMessage"),
        () => router.back(),
      );
    } catch (e: any) {
      console.error(e);
      showAlert(
        "error",
        t("common.error"),
        e.message || t("changePassword.errorMessage"),
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

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
        <Text style={styles.headerTitle}>{t("changePassword.title")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formSection}>
            <Text style={styles.label}>
              {t("changePassword.currentPassword")}
            </Text>
            <TextInput
              style={[styles.input, { marginBottom: 16 }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder={t("changePassword.currentPlaceholder")}
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={styles.label}>{t("changePassword.newPassword")}</Text>
            <TextInput
              style={[
                styles.input,
                errors.newPassword && { borderColor: colors.error },
              ]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t("changePassword.newPlaceholder")}
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.newPassword && (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            )}
            {!errors.newPassword && <View style={{ marginBottom: 16 }} />}

            <Text style={styles.label}>
              {t("changePassword.confirmPassword")}
            </Text>
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && { borderColor: colors.error },
              ]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t("changePassword.confirmPlaceholder")}
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
            {!errors.confirmPassword && <View style={{ marginBottom: 8 }} />}

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
                style={[
                  styles.actionButtonFilled,
                  !isFormValid && styles.actionButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.actionButtonFilledText}>
                    {t("changePassword.updateButton")}
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

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
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
    formSection: {
      paddingHorizontal: 24,
      paddingTop: 24,
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
      marginBottom: 8,
    },
    errorText: {
      fontSize: 12,
      color: colors.error,
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
      opacity: 1,
    },
    actionButtonDisabled: {
      opacity: 0.3,
      backgroundColor: colors.primary,
    },
    actionButtonFilledText: {
      fontSize: 16,
      fontWeight: "600",
      color: "white",
    },
  });
