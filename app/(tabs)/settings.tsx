import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { session, signOut, checkSession, dailyNewLimit, setDailyLimit } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
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
        Alert.alert('Success', 'Check your email for the confirmation link!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  const SettingItem = ({ icon, label, value, color = '#64748b', onPress, isDestructive = false }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={[styles.settingIconContainer, { backgroundColor: isDestructive ? '#fef2f2' : '#f1f5f9' }]}>
        <Ionicons name={icon} size={20} color={isDestructive ? '#ef4444' : color} />
      </View>
      <Text style={[styles.settingLabel, isDestructive && { color: '#ef4444' }]}>{label}</Text>
      {value ? (
        <Text style={styles.settingValue}>{value}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
      )}
    </TouchableOpacity>
  );

  if (session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View style={styles.profileCard}>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/150?u=' + session.user.id }} 
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
                <View style={[styles.settingIconContainer, { backgroundColor: '#eff6ff' }]}>
                  <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
                </View>
                <Text style={styles.settingLabel}>Daily New Limit</Text>
                <View style={styles.limitControls}>
                    <TouchableOpacity 
                        onPress={() => setDailyLimit(Math.max(1, dailyNewLimit - 5))}
                        style={styles.controlButton}
                    >
                        <Ionicons name="remove" size={20} color="#64748b" />
                    </TouchableOpacity>
                    <Text style={styles.limitValue}>{dailyNewLimit}</Text>
                    <TouchableOpacity 
                        onPress={() => setDailyLimit(dailyNewLimit + 5)}
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
              <SettingItem icon="notifications-outline" label="Notifications" color="#3b82f6" />
              <View style={styles.divider} />
              <SettingItem icon="moon-outline" label="Dark Mode" value="System" color="#6366f1" />
              <View style={styles.divider} />
              <SettingItem icon="language-outline" label="Language" value="English" color="#f59e0b" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sync & Security</Text>
            <View style={styles.card}>
              <SettingItem icon="cloud-upload-outline" label="Automatic Sync" value="ON" color="#10b981" />
              <View style={styles.divider} />
              <SettingItem icon="lock-closed-outline" label="Change Password" color="#64748b" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.card}>
              <SettingItem icon="help-circle-outline" label="Help Center" color="#64748b" />
              <View style={styles.divider} />
              <SettingItem icon="star-outline" label="Rate MagicDeck" color="#f59e0b" />
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.authContainer}>
        <View style={styles.authHeader}>
          <View style={styles.logoPill}>
            <Ionicons name="sparkles" size={24} color="#10b981" />
          </View>
          <Text style={styles.authTitle}>
            {isLogin ? 'Welcome Back' : 'Join MagicDeck'}
          </Text>
          <Text style={styles.authSubtitle}>
            {isLogin ? 'Sign in to sync your decks across devices.' : 'Create an account to start your learning journey.'}
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
              <Ionicons name="mail-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor="#94a3b8"
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
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
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
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.toggleText}>
              {isLogin ? "Small steps today, big results tomorrow. " : "Join thousands of successful learners. "}
              <Text style={styles.toggleHighlight}>
                {isLogin ? 'Sign Up' : 'Log In'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f5f9',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 8,
    marginBottom: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  settingValue: {
    fontSize: 14,
    color: '#94a3b8',
    marginRight: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 72,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingBottom: 48,
  },
  versionText: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  madeWith: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '500',
  },

  // Auth Styles
  authContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPill: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  authForm: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    color: '#0f172a',
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  smallDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginHorizontal: 12,
    textTransform: 'uppercase',
  },
  authButton: {
    backgroundColor: '#10b981',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  toggleButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  toggleHighlight: {
    color: '#10b981',
    fontWeight: '700',
  },
  limitControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  limitValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
});
