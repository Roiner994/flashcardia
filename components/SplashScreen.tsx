import { useTheme } from "@hooks/useThemeColor";
import { t } from "i18next";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
  const colors = useTheme();
  return (
    <View style={styles.container}>
      <Image
        source={require("@assets/images/only-icon.png")}
        style={styles.image}
        resizeMode="contain"
      />
      <View>
        <Text style={[{ fontSize: 32, fontWeight: "bold" }]}>
          <Text style={{ color: (colors as any).white }}>
            {t("home.brandPart1")}
          </Text>
          <Text style={{ color: (colors as any).brandCyan }}>
            {t("home.brandPart2")}
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#290F58",
  },
  image: {
    width: 400,
    height: 200,
    // width: "80%", // Responsive width
    // height: "100%", // Allow full height usage if needed
  },
});
