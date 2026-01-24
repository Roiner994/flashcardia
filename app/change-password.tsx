import { CustomAlert } from "@/components/CustomAlert";
import { useTheme } from "@/hooks/useThemeColor";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    if (confirmPassword.length > 0 && newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
        throw new Error("Incorrect current password");
      }

      // 2. Update to new password
      await updatePassword(newPassword);

      showAlert("success", "Success", "Password updated successfully", () =>
        router.back(),
      );
    } catch (e: any) {
      console.error(e);
      showAlert("error", "Error", e.message || "Failed to update password");
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
      opacity: 0.3, // Softer opacity
      backgroundColor: colors.primary, // Keep primary color but faded
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
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formSection}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={[styles.input, { marginBottom: 16 }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={[
                styles.input,
                errors.newPassword && { borderColor: colors.error },
              ]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.newPassword && (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            )}
            {!errors.newPassword && <View style={{ marginBottom: 16 }} />}

            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && { borderColor: colors.error },
              ]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter new password"
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
                <Text style={styles.actionButtonOutlineText}>Cancel</Text>
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
                    Update Password
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
