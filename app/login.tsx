import { Colors } from '@/constants/theme';
import PrimaryButton from '@/components/ui/primary-button';
import FormField from '@/components/ui/form-field';
import { useAuth } from '@/contexts/auth';
import { Image } from 'expo-image';
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
    // basic regex to catch obviously invalid emails before hitting the database
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
      {/* KeyboardAvoidingView pushes the form up on iOS so the keyboard doesn't cover the inputs */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Image
              source={require('@/assets/images/logo.svg')}
              style={styles.logo}
              contentFit="contain"
            />
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
    backgroundColor: Colors.surface,
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
    height: 56,
    width: 200,
    marginBottom: 12,
  },
  tagline: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 6,
  },
  card: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },
  title: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  error: {
    color: Colors.danger,
    fontSize: 13,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: Colors.muted,
    fontSize: 14,
  },
  link: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
