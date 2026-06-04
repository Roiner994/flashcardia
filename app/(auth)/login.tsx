import { LogoWithBackground } from "@components/LogoWithBackground";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
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
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { t } = useTranslation();

  useEffect(() => {
    if (Platform.OS !== "web") {
      GoogleSignin.configure({
        webClientId:
          "721182632268-41uhb3lj14scl6i0de3ickrdp3as7fuh.apps.googleusercontent.com",
        iosClientId:
          "721182632268-5jbumntlanoqemr9ft2qf2undj7c1tor.apps.googleusercontent.com",
        offlineAccess: true,
        forceCodeForRefreshToken: true,
      });
    }
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
    if (Platform.OS === "web") {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) {
        Alert.alert(t("common.error"), error.message);
      }
      return;
    }

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
    if (Platform.OS !== "web") {
      await GoogleSignin.signOut();
    }
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
            <Button
              variant="google"
              title={t("auth.continueGoogle")}
              icon="logo-google"
              onPress={handleGoogleLogin}
              style={{ marginBottom: 24 }}
            />

            <View style={styles.dividerRow}>
              <View style={styles.smallDivider} />
              <Text style={styles.dividerText}>{t("auth.orEmail")}</Text>
              <View style={styles.smallDivider} />
            </View>

            <Input
              label={t("auth.email")}
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              leftIcon="mail-outline"
            />

            <Input
              label={t("auth.password")}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon="lock-closed-outline"
            />

            <Button
              title={isLogin ? t("auth.signIn") : t("auth.createAccount")}
              onPress={handleAuth}
              loading={loading}
              style={{ marginTop: 12 }}
            />

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

            <Button
              variant="ghost"
              title={t("auth.continueGuest")}
              onPress={() => router.replace("/(tabs)")}
              style={{ marginTop: 32 }}
              textStyle={styles.guestButtonText}
            />
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
    guestButtonText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "600",
    },
  });
