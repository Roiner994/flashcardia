import { Colors } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useThemeColor";
import React, { useMemo } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewStyle,
} from "react-native";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "google";

export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  textStyle?: TextStyle;
}

export const Button = ({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  style,
  textStyle,
  disabled,
  ...props
}: ButtonProps) => {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "primary":
        return styles.primaryButton;
      case "secondary":
        return styles.secondaryButton;
      case "outline":
        return styles.outlineButton;
      case "ghost":
        return styles.ghostButton;
      case "danger":
        return styles.dangerButton;
      case "google":
        return styles.googleButton;
      default:
        return styles.primaryButton;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case "sm":
        return styles.smButton;
      case "md":
        return styles.mdButton;
      case "lg":
        return styles.lgButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "primary":
      case "danger":
        return styles.primaryText;
      case "secondary":
        return styles.secondaryText;
      case "outline":
      case "ghost":
      case "google":
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  const getIconColor = () => {
    if (disabled) return colors.textSecondary;
    switch (variant) {
      case "primary":
      case "danger":
        return "white";
      case "secondary":
        return colors.primary;
      case "outline":
      case "ghost":
      case "google":
        return colors.text;
      default:
        return "white";
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        getSizeStyle(),
        getVariantStyle(),
        disabled || loading ? styles.disabled : {},
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getIconColor()} />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === "left" && (
            <Ionicons
              name={icon}
              size={size === "sm" ? 16 : 20}
              color={getIconColor()}
              style={styles.leftIcon}
            />
          )}
          <Text
            style={[
              styles.baseText,
              size === "sm" && styles.smText,
              size === "lg" && styles.lgText,
              getTextStyle(),
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={size === "sm" ? 16 : 20}
              color={getIconColor()}
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    baseButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
    },
    contentContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    // Sizes
    smButton: {
      height: 40,
      paddingHorizontal: 16,
    },
    mdButton: {
      height: 56,
      paddingHorizontal: 24,
    },
    lgButton: {
      height: 64,
      paddingHorizontal: 32,
    },
    // Variants
    primaryButton: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: "transparent",
    },
    secondaryButton: {
      backgroundColor: colors.primary + "20", // 20% opacity
      borderWidth: 1,
      borderColor: "transparent",
    },
    outlineButton: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.border,
    },
    ghostButton: {
      backgroundColor: "transparent",
      borderWidth: 0,
    },
    dangerButton: {
      backgroundColor: colors.error,
    },
    googleButton: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    // Text Styles
    baseText: {
      fontWeight: "600",
      fontSize: 16,
    },
    smText: {
      fontSize: 14,
    },
    lgText: {
      fontSize: 18,
    },
    primaryText: {
      color: "white",
    },
    secondaryText: {
      color: colors.primary,
    },
    outlineText: {
      color: colors.text,
    },
    disabled: {
      opacity: 0.6,
    },
    disabledText: {
      color: colors.textSecondary,
    },
    // Icons
    leftIcon: {
      marginRight: 8,
    },
    rightIcon: {
      marginLeft: 8,
    },
  });
