import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        Alert.alert('Success', 'Check your email for confirmation!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Navigation handled by auth listener in layout or store
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoPill}>
          <Ionicons name="sparkles" size={32} color="white" />
        </View>
        <Text style={styles.title}>Magic Deck</Text>
        <Text style={styles.subtitle}>Master any language with AI</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>{isSignUp ? 'Create an Account' : 'Welcome Back'}</Text>
        
        <TouchableOpacity style={styles.googleButton}>
          <Image 
            source="https://e7.pngegg.com/pngimages/114/607/png-clipart-g-suite-pearl-river-middle-school-google-software-suite-email-sign-up-button-text-logo.png" 
            style={styles.googleIcon} 
            contentFit="contain"
          />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.smallDivider} />
          <Text style={styles.dividerText}>or use email</Text>
          <View style={styles.smallDivider} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="hello@example.com"
            placeholderTextColor="#64748b"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="********"
            placeholderTextColor="#64748b"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>{isSignUp ? 'Sign Up' : 'Log In'}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.toggleButton} onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.toggleText}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Text style={styles.toggleHighlight}>{isSignUp ? 'Log In' : 'Sign Up'}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoPill: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
  formCard: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#334155',
  },
  formTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    height: 56,
    borderRadius: 16,
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
    backgroundColor: '#334155',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginHorizontal: 12,
    textTransform: 'uppercase',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    color: 'white',
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  toggleButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  toggleText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  toggleHighlight: {
    color: '#818cf8',
    fontWeight: '700',
  },
});
