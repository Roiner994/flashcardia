import { useTheme } from "@hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CustomAlertProps {
  visible: boolean;
  type?: "success" | "error" | "info" | "warning" | "danger";
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

/**
 * CustomAlert - A cross-platform alert modal.
 * Note: On native, this is rendered as an absolute-positioned View to allow
 * layering over other Modals/BottomSheets (especially on iOS).
 */
export const CustomAlert = ({
  visible,
  type = "info",
  title,
  message,
  onClose,
  onConfirm,
  confirmText,
  cancelText = "Cancel",
}: CustomAlertProps) => {
  const colors = useTheme();

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
      case "danger":
        return "alert-circle";
      case "warning":
        return "warning";
      default:
        return "information-circle";
    }
  };

  const getColor = () => {
    switch (type) {
      case "success":
        return colors.success;
      case "error":
      case "danger":
        return colors.error;
      case "warning":
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.45)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      // For web, ensure it's fixed to the viewport if needed,
      // but absoluteFill + shared container usually works.
      ...(Platform.OS === "web" ? { position: "fixed" } : {}),
    },
    container: {
      width: Platform.OS === "web" ? 400 : "85%",
      backgroundColor: colors.surface,
      borderRadius: 24,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
    },
    content: {
      padding: 24,
      alignItems: "center",
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: getColor() + "15",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    message: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      fontWeight: "500",
    },
    footer: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    button: {
      flex: 1,
      paddingVertical: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButton: {
      borderRightWidth: onConfirm ? 1 : 0,
      borderRightColor: colors.border,
    },
    confirmButton: {
      backgroundColor: "transparent",
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    confirmButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: getColor(),
    },
  });

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name={getIcon()} size={28} color={getColor()} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, onConfirm ? styles.cancelButton : {}]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>
              {onConfirm ? cancelText : "OK"}
            </Text>
          </TouchableOpacity>

          {onConfirm && (
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>
                {confirmText || "Confirm"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};
