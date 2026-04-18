import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { useAuth } from '@/contexts/auth';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, logout, deleteAccount } = useAuth();
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

  return (
    <SafeAreaView style={styles.safeArea}>
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
          <Row label="Name" value={user?.name ?? ''} />
          <View style={styles.divider} />
          <Row label="Email" value={user?.email ?? ''} />
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  avatarRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
    marginTop: 8,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 999,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  name: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  email: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowLabel: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '500',
  },
  rowValue: {
    color: '#6B7280',
    fontSize: 15,
    maxWidth: '60%',
    textAlign: 'right',
  },
  divider: {
    backgroundColor: '#F1F5F9',
    height: 1,
  },
  danger: {
    marginTop: 16,
  },
  dangerTitle: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
});
