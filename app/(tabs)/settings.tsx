import { useStore } from "@/store/useStore";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const router = useRouter();
  const { session, signOut, checkSession, dailyNewLimit, setDailyLimit } =
    useStore();
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const SettingItem = ({
    icon,
    label,
    value,
    color = "#64748b",
    onPress,
    isDestructive = false,
  }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View
        style={[
          styles.settingIconContainer,
          { backgroundColor: isDestructive ? "#fef2f2" : "#f1f5f9" },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isDestructive ? "#ef4444" : color}
        />
      </View>
      <Text
        style={[styles.settingLabel, isDestructive && { color: "#ef4444" }]}
      >
        {label}
      </Text>
      {value ? (
        <Text style={styles.settingValue}>{value}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
      )}
    </TouchableOpacity>
  );

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
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
                color="#64748b"
              />
            </View>
            <View style={styles.guestInfo}>
              <Text style={styles.guestTitle}>Guest Mode</Text>
              <Text style={styles.guestSubtitle}>
                Sign in to sync your progress across devices.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Common Settings for Guests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.card}>
              <SettingItem
                icon="notifications-outline"
                label="Notifications"
                color="#3b82f6"
              />
              <View style={styles.divider} />
              <SettingItem
                icon="moon-outline"
                label="Dark Mode"
                value="System"
                color="#6366f1"
              />
              <View style={styles.divider} />
              <SettingItem
                icon="language-outline"
                label="Language"
                value="English"
                color="#f59e0b"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.card}>
              <SettingItem
                icon="help-circle-outline"
                label="Help Center"
                color="#64748b"
              />
              <View style={styles.divider} />
              <SettingItem
                icon="star-outline"
                label="Rate MagicDeck"
                color="#f59e0b"
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.versionText}>version 1.2.4 (Build 42)</Text>
            <Text style={styles.madeWith}>Made with ✨ by MagicDeck AI</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?u=" + session.user.id }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Premium Member</Text>
            <Text style={styles.profileEmail}>{session.user.email}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={16} color="#10b981" />
          </TouchableOpacity>
        </View>

        {/* Settings Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Rules</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View
                style={[
                  styles.settingIconContainer,
                  { backgroundColor: "#eff6ff" },
                ]}
              >
                <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.settingLabel}>Daily New Limit</Text>
              <View style={styles.limitControls}>
                <TouchableOpacity
                  onPress={() => setDailyLimit(Math.max(1, dailyNewLimit - 1))}
                  style={styles.controlButton}
                >
                  <Ionicons name="remove" size={20} color="#64748b" />
                </TouchableOpacity>
                <Text style={styles.limitValue}>{dailyNewLimit}</Text>
                <TouchableOpacity
                  onPress={() => setDailyLimit(dailyNewLimit + 1)}
                  style={styles.controlButton}
                >
                  <Ionicons name="add" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <SettingItem
              icon="notifications-outline"
              label="Notifications"
              color="#3b82f6"
            />
            <View style={styles.divider} />
            <SettingItem
              icon="moon-outline"
              label="Dark Mode"
              value="System"
              color="#6366f1"
            />
            <View style={styles.divider} />
            <SettingItem
              icon="language-outline"
              label="Language"
              value="English"
              color="#f59e0b"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sync & Security</Text>
          <View style={styles.card}>
            <SettingItem
              icon="cloud-upload-outline"
              label="Automatic Sync"
              value="ON"
              color="#10b981"
            />
            <View style={styles.divider} />
            <SettingItem
              icon="lock-closed-outline"
              label="Change Password"
              color="#64748b"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <SettingItem
              icon="help-circle-outline"
              label="Help Center"
              color="#64748b"
            />
            <View style={styles.divider} />
            <SettingItem
              icon="star-outline"
              label="Rate MagicDeck"
              color="#f59e0b"
            />
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <View style={styles.card}>
            <SettingItem
              icon="log-out-outline"
              label="Sign Out"
              onPress={() => signOut()}
              isDestructive={true}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>version 1.2.4 (Build 42)</Text>
          <Text style={styles.madeWith}>Made with ✨ by MagicDeck AI</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  scrollView: {
    flex: 1,
  },
  // Guest Card Styles
  guestCard: {
    backgroundColor: "white",
    margin: 20,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#f1f5f9",
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
    backgroundColor: "#f1f5f9",
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
    color: "#0f172a",
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  signInButton: {
    backgroundColor: "#10b981",
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
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#f1f5f9",
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
    backgroundColor: "#f1f5f9",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#64748b",
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ecfdf5",
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
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 8,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
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
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
  },
  settingValue: {
    fontSize: 14,
    color: "#94a3b8",
    marginRight: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginLeft: 72,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingBottom: 48,
  },
  versionText: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
  },
  madeWith: {
    fontSize: 12,
    color: "#cbd5e1",
    fontWeight: "500",
  },
  limitControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 4,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "white",
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
    color: "#0f172a",
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: "center",
  },
});
