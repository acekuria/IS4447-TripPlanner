import PrimaryButton from '@/components/ui/primary-button';
import FormField from '@/components/ui/form-field';
import ScreenHeader from '@/components/ui/screen-header';
import { useAuth } from '@/contexts/auth';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Please enter a valid email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    const result = await register(name.trim(), email.trim(), password);
    setLoading(false);
    if (!result.success) setError(result.error ?? 'Registration failed.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logoRow}>
            <Image
              source={require('@/assets/images/logo.svg')}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
          <ScreenHeader title="Create account" onBack={() => router.back()} />

          <View style={styles.card}>
            <FormField label="Name" value={name} onChangeText={setName} />
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
            <FormField
              label="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <PrimaryButton
              label={loading ? 'Creating account…' : 'Create account'}
              onPress={handleRegister}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F7F5F2',
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  content: {
    paddingBottom: 32,
  },
  logoRow: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  logo: {
    height: 56,
    width: 200,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8E6E1',
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginTop: 8,
  },
  error: {
    color: '#B91C1C',
    fontSize: 13,
    marginBottom: 12,
  },
});
