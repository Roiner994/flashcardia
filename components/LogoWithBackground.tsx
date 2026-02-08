import { Colors } from "@constants/Colors";
import { useTheme } from "@hooks/useThemeColor";
import { Image } from "expo-image";
import React, { useMemo } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface LogoWithBackgroundProps {
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function LogoWithBackground({
  width = 64,
  height = 64,
  style,
}: LogoWithBackgroundProps) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      style={[
        styles.logoPill,
        {
          width: width*1.33,
          height: height*1.33,
          borderRadius: width * 0.375, // Maintain the existing ratio (24/64 ≈ 0.375)
        },
        style,
      ]}
    >
      <Image
        source={require("@assets/images/only-icon.png")}
        style={{
          width: width,
          height: height,
        }}
        contentFit="contain"
      />
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    logoPill: {
      backgroundColor: colors.brandPurple,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
  });
