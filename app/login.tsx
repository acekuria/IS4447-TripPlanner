import PrimaryButton from '@/components/ui/primary-button';
import FormField from '@/components/ui/form-field';
import { useAuth } from '@/contexts/auth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.success) setError(result.error ?? 'Login failed.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={styles.logo}>✓</Text>
            <Text style={styles.appName}>HabitTracker</Text>
            <Text style={styles.tagline}>Build better habits, one day at a time.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Sign in</Text>

            <FormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <PrimaryButton label={loading ? 'Signing in…' : 'Sign in'} onPress={handleLogin} />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Text style={styles.link} onPress={() => router.push('/register')}>
                Register
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    color: '#FFFFFF',
    fontSize: 28,
    height: 64,
    lineHeight: 64,
    textAlign: 'center',
    width: 64,
    marginBottom: 12,
  },
  appName: {
    color: '#0F172A',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  tagline: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  error: {
    color: '#B91C1C',
    fontSize: 13,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  link: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
});
