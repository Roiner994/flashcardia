import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export const Header = () => {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        {/* Placeholder Avatar - in real app, fetch from auth */}
        <View style={styles.avatarContainer}>
          <Image
            source="https://api.dicebear.com/7.x/avataaars/png?seed=Felix"
            style={styles.avatar}
          />
        </View>
      </View>
      <TouchableOpacity style={styles.settingsButton}>
        <Ionicons name="settings-outline" size={20} color={colors.icon} />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    avatarContainer: {
      width: 40,
      height: 40,
      backgroundColor: colors.primary + "20",
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primary + "40",
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    settingsButton: {
      padding: 8,
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
