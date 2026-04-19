import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { useAuth } from '@/contexts/auth';
import { useTheme } from '@/contexts/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, logout, deleteAccount } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account. Your habit data will remain on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            await deleteAccount();
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    safeArea: { backgroundColor: colors.bg, flex: 1, paddingHorizontal: 18, paddingTop: 10 },
    headerRow: { alignItems: 'flex-start', marginBottom: 8 },
    headerLogo: { height: 28, width: 120 },
    avatarRow: { alignItems: 'center', flexDirection: 'row', gap: 16, marginBottom: 28, marginTop: 8 },
    avatar: {
      alignItems: 'center',
      backgroundColor: colors.avatarBg,
      borderRadius: 999,
      height: 56,
      justifyContent: 'center',
      width: 56,
    },
    avatarText: { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
    name: { color: colors.textStrong, fontSize: 18, fontWeight: '700' },
    email: { color: colors.textSubdued, fontSize: 13, marginTop: 2 },
    section: { marginBottom: 16 },
    sectionTitle: {
      color: colors.textLabel,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.5,
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 16,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 },
    rowLabel: { color: colors.textLabel, fontSize: 15, fontWeight: '500' },
    rowValue: { color: colors.textSubdued, fontSize: 15, maxWidth: '60%', textAlign: 'right' },
    divider: { backgroundColor: colors.divider, height: 1 },
    themeRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 14,
    },
    themeLeft: { alignItems: 'center', flexDirection: 'row', gap: 10 },
    themeLabel: { color: colors.textLabel, fontSize: 15, fontWeight: '500' },
    danger: { marginTop: 16 },
    dangerTitle: {
      color: colors.danger,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.5,
      marginBottom: 8,
      textTransform: 'uppercase',
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <Image
          source={isDark ? require('@/assets/images/logo-dark.svg') : require('@/assets/images/logo.svg')}
          style={styles.headerLogo}
          contentFit="contain"
        />
      </View>
      <ScreenHeader title="Profile" />

      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Name</Text>
            <Text style={styles.rowValue}>{user?.name ?? ''}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{user?.email ?? ''}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.card}>
          <Pressable onPress={toggleTheme} accessibilityRole="switch" accessibilityLabel="Toggle dark mode" style={styles.themeRow}>
            <View style={styles.themeLeft}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={colors.primary} />
              <Text style={styles.themeLabel}>{isDark ? 'Dark mode' : 'Light mode'}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <PrimaryButton label="Sign out" variant="secondary" onPress={handleLogout} />
      </View>

      <View style={styles.danger}>
        <Text style={styles.dangerTitle}>Danger zone</Text>
        <PrimaryButton
          label={deleting ? 'Deleting…' : 'Delete account'}
          variant="danger"
          onPress={handleDelete}
        />
      </View>
    </SafeAreaView>
  );
}
