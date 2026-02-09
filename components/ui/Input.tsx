import { Colors } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useThemeColor";
import React, { useMemo, useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export const Input = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  editable = true,
  onFocus,
  onBlur,
  ...props
}: InputProps) => {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          props.multiline && styles.multilineContainer,
          isFocused && styles.focusedContainer,
          error ? styles.errorContainer : null,
          !editable && styles.disabledContainer,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? colors.error : colors.textSecondary}
            style={[styles.leftIcon, props.multiline && { marginTop: 4 }]}
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            props.multiline && styles.multilineInput,
            !editable && styles.disabledInput,
            style,
          ]}
          placeholderTextColor={colors.textSecondary}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={colors.primary}
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={[styles.rightIcon, props.multiline && { marginTop: 4 }]}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={error ? colors.error : colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textSecondary,
      marginBottom: 8,
      marginLeft: 4,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
    },
    multilineContainer: {
      height: "auto",
      minHeight: 56,
      paddingVertical: 12,
      alignItems: "flex-start",
    },
    focusedContainer: {
      borderColor: colors.primary,
      borderWidth: 1.5,
    },
    errorContainer: {
      borderColor: colors.error,
    },
    disabledContainer: {
      backgroundColor: colors.background,
      opacity: 0.8,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      fontWeight: "500",
      height: "100%",
    },
    multilineInput: {
      height: "auto",
      textAlignVertical: "top",
    },
    disabledInput: {
      color: colors.textSecondary,
    },
    leftIcon: {
      marginRight: 12,
    },
    rightIcon: {
      marginLeft: 12,
    },
    errorText: {
      fontSize: 12,
      color: colors.error,
      marginTop: 4,
      marginLeft: 4,
    },
  });
