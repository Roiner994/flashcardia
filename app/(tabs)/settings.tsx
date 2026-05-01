import { LanguageModal } from "@components/modals/LanguageModal";
import { Colors } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useThemeColor";
import { changeLanguage } from "@i18n";
import { useStore } from "@store/useStore";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  color?: string;
  onPress?: () => void;
  isDestructive?: boolean;
  colors: typeof Colors.light;
  styles: ReturnType<typeof createStyles>;
}

const SettingItem = React.memo(({ icon, label, value, color, onPress, isDestructive = false, colors, styles }: SettingItemProps) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View
      style={[
        styles.settingIconContainer,
        {
          backgroundColor: isDestructive
            ? colors.error + "20"
            : colors.background,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={isDestructive ? colors.error : (color || colors.textSecondary)}
      />
    </View>
    <Text
      style={[styles.settingLabel, isDestructive && { color: colors.error }]}
    >
      {label}
    </Text>
    {value ? (
      <Text style={styles.settingValue}>{value}</Text>
    ) : (
      <Ionicons name="chevron-forward" size={18} color={colors.icon} />
    )}
  </TouchableOpacity>
));

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    session,
    signOut,
    checkSession,
    dailyNewLimit,
    setDailyLimit,
    themeMode,
    setThemeMode,
  } = useStore();

  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  useEffect(() => {
    checkSession();
  }, [checkSession]);


  if (!session) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("settings.title")}</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Guest Header */}
          <View style={styles.guestCard}>
            <View style={styles.guestIconBg}>
              <Ionicons
                name="cloud-offline-outline"
                size={32}
                color={colors.textSecondary}
              />
            </View>
            <View style={styles.guestInfo}>
              <Text style={styles.guestTitle}>{t("settings.guestMode")}</Text>
              <Text style={styles.guestSubtitle}>
                {t("settings.guestSubtitle")}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.signInButtonText}>
                {t("settings.signIn")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Common Settings for Guests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("settings.preferences")}</Text>
            <View style={styles.card}>
              <SettingItem
                icon="moon-outline"
                label={t("settings.darkMode")}
                value={themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
                color="#6366f1"
                colors={colors}
                styles={styles}
                onPress={() => {
                  const modes: ("system" | "light" | "dark")[] = [
                    "system",
                    "light",
                    "dark",
                  ];
                  const next =
                    modes[(modes.indexOf(themeMode) + 1) % modes.length];
                  setThemeMode(next);
                }}
              />
              <View style={styles.divider} />
              <SettingItem
                icon="language-outline"
                label={t("settings.language")}
                value={i18n.language.startsWith("es") ? "Español" : "English"}
                color={colors.warning}
                colors={colors}
                styles={styles}
                onPress={() => setLanguageModalVisible(true)}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("settings.support")}</Text>
            <View style={styles.card}>
              <SettingItem
                icon="help-circle-outline"
                label={t("settings.helpCenter")}
                color={colors.textSecondary}
                colors={colors}
                styles={styles}
                onPress={() => Linking.openURL('mailto:team.flashcardia@gmail.com?subject=MagicDeck%20Support')}
              />
              <View style={styles.divider} />
              <SettingItem
                icon="star-outline"
                label={t("settings.rateApp")}
                color={colors.warning}
                colors={colors}
                styles={styles}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.versionText}>
              {t("settings.version")} 1.2.4 (Build 42)
            </Text>
            <Text style={styles.madeWith}>{t("settings.madeWith")}</Text>
          </View>
        </ScrollView>
        <LanguageModal
          visible={languageModalVisible}
          onClose={() => setLanguageModalVisible(false)}
          onSelectLanguage={changeLanguage}
          currentLanguage={i18n.language}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("settings.title")}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri:
                session?.user?.user_metadata?.avatar_url ||
                "https://i.pravatar.cc/150?u=" + session.user.id,
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {session?.user?.user_metadata?.full_name || t("community.premiumMember")}
            </Text>
            <Text style={styles.profileEmail}>{session.user.email}</Text>
          </View>
          <Link href="/edit-profile" asChild>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={16} color={colors.primary} />
            </TouchableOpacity>
          </Link>
        </View>

        {/* Settings Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.learningRules")}</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View
                style={[
                  styles.settingIconContainer,
                  { backgroundColor: colors.info + "20" },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.info}
                />
              </View>
              <Text style={styles.settingLabel}>
                {t("settings.dailyNewLimit")}
              </Text>
              <View style={styles.limitControls}>
                <TouchableOpacity
                  onPress={() => setDailyLimit(Math.max(1, dailyNewLimit - 1))}
                  style={styles.controlButton}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                <Text style={styles.limitValue}>{dailyNewLimit}</Text>
                <TouchableOpacity
                  onPress={() => setDailyLimit(dailyNewLimit + 1)}
                  style={styles.controlButton}
                >
                  <Ionicons name="add" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.preferences")}</Text>
          <View style={styles.card}>
            <SettingItem
              icon="moon-outline"
              label={t("settings.darkMode")}
              value={
                themeMode.charAt(0).toUpperCase() +
                themeMode.slice(1)
              }
              color="#6366f1"
              colors={colors}
              styles={styles}
              onPress={() => {
                const modes: ("system" | "light" | "dark")[] = [
                  "system",
                  "light",
                  "dark",
                ];
                const next = modes[(modes.indexOf(themeMode) + 1) % modes.length];
                setThemeMode(next);
              }}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="language-outline"
              label={t("settings.language")}
              value={i18n.language.startsWith("es") ? "Español" : "English"}
              color={colors.warning}
              colors={colors}
              styles={styles}
              onPress={() => setLanguageModalVisible(true)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.syncSecurity")}</Text>
          <View style={styles.card}>
            <SettingItem
              icon="cloud-upload-outline"
              label={t("settings.automaticSync")}
              value="ON"
              color={colors.success}
              colors={colors}
              styles={styles}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="lock-closed-outline"
              label={t("settings.changePassword")}
              color={colors.textSecondary}
              colors={colors}
              styles={styles}
              onPress={() => router.push("/change-password")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.support")}</Text>
          <View style={styles.card}>
            <SettingItem
              icon="help-circle-outline"
              label={t("settings.helpCenter")}
              color={colors.textSecondary}
              colors={colors}
              styles={styles}
              onPress={() => Linking.openURL('mailto:team.flashcardia@gmail.com?subject=MagicDeck%20Support')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="star-outline"
              label={t("settings.rateApp")}
              color={colors.warning}
              colors={colors}
              styles={styles}
            />
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <View style={styles.card}>
            <SettingItem
              icon="log-out-outline"
              label={t("settings.signOut")}
              onPress={() => signOut()}
              isDestructive={true}
              colors={colors}
              styles={styles}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>
            {t("settings.version")} 1.2.4 (Build 42)
          </Text>
          <Text style={styles.madeWith}>{t("settings.madeWith")}</Text>
        </View>
      </ScrollView>
      <LanguageModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
        onSelectLanguage={changeLanguage}
        currentLanguage={i18n.language}
      />
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
      // Removed background/border for cleaner look
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.text,
    },
    scrollView: {
      flex: 1,
    },
    // Guest Card Styles
    guestCard: {
      backgroundColor: colors.surface,
      margin: 20,
      padding: 24,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
    },
    guestIconBg: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    guestInfo: {
      alignItems: "center",
      marginBottom: 20,
    },
    guestTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 8,
    },
    guestSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    signInButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: 12,
      width: "100%",
      alignItems: "center",
    },
    signInButtonText: {
      color: "white",
      fontWeight: "700",
      fontSize: 16,
    },
    // Profile Card
    profileCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      margin: 20,
      padding: 20,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    profileImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.background,
    },
    profileInfo: {
      flex: 1,
      marginLeft: 16,
    },
    profileName: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    editButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    section: {
      marginBottom: 24,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginLeft: 8,
      marginBottom: 8,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
    },
    settingIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    settingLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    settingValue: {
      fontSize: 14,
      color: colors.textSecondary,
      marginRight: 4,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 72,
    },
    footer: {
      alignItems: "center",
      paddingVertical: 32,
      paddingBottom: 48,
    },
    versionText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    madeWith: {
      fontSize: 12,
      color: colors.icon,
      fontWeight: "500",
    },
    limitControls: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 4,
    },
    controlButton: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    limitValue: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginHorizontal: 16,
      minWidth: 24,
      textAlign: "center",
    },
  });
