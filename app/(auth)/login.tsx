import { LogoWithBackground } from "@components/LogoWithBackground";
import { Colors } from "@constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useThemeColor";
import { supabase } from "@lib/supabase";
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "721182632268-41uhb3lj14scl6i0de3ickrdp3as7fuh.apps.googleusercontent.com",
      iosClientId:
        "721182632268-5jbumntlanoqemr9ft2qf2undj7c1tor.apps.googleusercontent.com",
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);


  const router = useRouter();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert(t("common.error"), t("auth.fillAll"));
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
        Alert.alert(t("common.success"), t("auth.checkEmail"));
      }
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      console.log('hasPlayServices')
      const userInfo = await GoogleSignin.signIn();
      console.log('userInfo', userInfo)
      if (userInfo.data?.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: userInfo.data.idToken,
        });

        if (error) throw error;
      } else {
        throw new Error("no ID token present!");
      }
    } catch (error: any) {
      console.log('error', error)
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // user cancelled the login flow
            break;
          case statusCodes.IN_PROGRESS:
            // operation (e.g. sign in) is in progress already
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // play services not available or outdated
            Alert.alert(t("common.error"), "Play services not available");
            break;
          default:
            // some other error happened
            Alert.alert(t("common.error"), error.message);
        }
      } else {
        // an error that's not related to google sign in occurred
        Alert.alert(t("common.error"), error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const googleLogout = async () => {
    await GoogleSignin.signOut();
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "android" ? 10 : 0}
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
            <LogoWithBackground style={{ marginBottom: 20 }} />
            <Text style={styles.authTitle}>
              {isLogin ? t("auth.welcomeBack") : t("auth.join")}
            </Text>
            <Text style={styles.authSubtitle}>
              {isLogin ? t("auth.signInSubtitle") : t("auth.signUpSubtitle")}
            </Text>
          </View>

          <View style={styles.authForm}>
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
            >
              <Ionicons
                name="logo-google"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={styles.googleButtonText}>
                {t("auth.continueGoogle")}
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.smallDivider} />
              <Text style={styles.dividerText}>{t("auth.orEmail")}</Text>
              <View style={styles.smallDivider} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("auth.email")}</Text>
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
              <Text style={styles.inputLabel}>{t("auth.password")}</Text>
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
                  {isLogin ? t("auth.signIn") : t("auth.createAccount")}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.toggleText}>
                {isLogin ? t("auth.signUpPrompt") : t("auth.signInPrompt")}
                <Text style={styles.toggleHighlight}>
                  {isLogin ? t("auth.signUpLink") : t("auth.logInLink")}
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestButton}
              onPress={() => router.replace("/(tabs)")}
            >
              <Text style={styles.guestButtonText}>
                {t("auth.continueGuest")}
              </Text>
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
      paddingBottom: 150,
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
      marginLeft: 12,
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
