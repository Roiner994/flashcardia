import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useThemeColor";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function LoginScreen() {
  const router = useRouter();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        Alert.alert("Success", "Check your email for the confirmation link!");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)")}
              style={styles.backButton}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.authHeader}>
            <View style={styles.logoPill}>
              <Ionicons name="sparkles" size={32} color={colors.primary} />
            </View>
            <Text style={styles.authTitle}>
              {isLogin ? "Welcome Back" : "Join MagicDeck"}
            </Text>
            <Text style={styles.authSubtitle}>
              {isLogin
                ? "Sign in to sync your decks across devices."
                : "Create an account to start your learning journey."}
            </Text>
          </View>

          <View style={styles.authForm}>
            <TouchableOpacity style={styles.googleButton}>
              <Image
                source="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.png/1200px-Google_%22G%22_logo.png"
                style={styles.googleIcon}
                contentFit="contain"
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.smallDivider} />
              <Text style={styles.dividerText}>or continue with email</Text>
              <View style={styles.smallDivider} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.authButton, loading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.authButtonText}>
                  {isLogin ? "Sign In" : "Create Account"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.toggleText}>
                {isLogin
                  ? "Small steps today, big results tomorrow. "
                  : "Join thousands of successful learners. "}
                <Text style={styles.toggleHighlight}>
                  {isLogin ? "Sign Up" : "Log In"}
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestButton}
              onPress={() => router.replace("/(tabs)")}
            >
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
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
    scrollContent: {
      flexGrow: 1,
      padding: 24,
      justifyContent: "center",
    },
    header: {
      alignItems: "flex-end",
      marginBottom: 20,
    },
    backButton: {
      padding: 8,
      backgroundColor: colors.surface,
      borderRadius: 20,
    },
    authHeader: {
      alignItems: "center",
      marginBottom: 40,
    },
    logoPill: {
      width: 64,
      height: 64,
      borderRadius: 24,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    authTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    authSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
      paddingHorizontal: 20,
    },
    authForm: {
      width: "100%",
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textSecondary,
      marginBottom: 8,
      marginLeft: 4,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      fontWeight: "500",
    },
    googleButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      height: 56,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 24,
    },
    googleIcon: {
      width: 20,
      height: 20,
      marginRight: 12,
    },
    googleButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },
    smallDivider: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
      marginHorizontal: 12,
      textTransform: "uppercase",
    },
    authButton: {
      backgroundColor: colors.primary,
      height: 56,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 12,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    authButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "700",
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    toggleButton: {
      marginTop: 24,
      alignItems: "center",
    },
    toggleText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
    },
    toggleHighlight: {
      color: colors.primary,
      fontWeight: "700",
    },
    guestButton: {
      marginTop: 32,
      alignItems: "center",
      padding: 12,
    },
    guestButtonText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "600",
    },
  });
