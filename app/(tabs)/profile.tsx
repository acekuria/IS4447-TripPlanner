import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { useAuth } from '@/contexts/auth';
import { useTheme } from '@/contexts/theme';
import { getExportData, getNotificationSettings, saveNotificationSettings } from '@/db/queries';
import { cancelAllReminders, formatTime, requestNotificationPermission, scheduleDailyReminder, sendTestNotification } from '@/utils/notifications';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TIME_PRESETS = [
  { label: 'Morning', hour: 8,  minute: 0 },
  { label: 'Noon',    hour: 12, minute: 0 },
  { label: 'Evening', hour: 18, minute: 0 },
  { label: 'Night',   hour: 21, minute: 0 },
];

export default function ProfileScreen() {
  const { user, logout, deleteAccount } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifHour, setNotifHour] = useState(20);
  const [notifMinute, setNotifMinute] = useState(0);
  const [savingNotif, setSavingNotif] = useState(false);
  const [testingSend, setTestingSend] = useState(false);

  useEffect(() => {
    getNotificationSettings().then((s) => {
      setNotifEnabled(s.enabled);
      setNotifHour(s.hour);
      setNotifMinute(s.minute);
    });
  }, []);

  const handleToggleNotif = useCallback(async (value: boolean) => {
    setNotifEnabled(value);
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setNotifEnabled(false);
        Alert.alert('Permission required', 'Please enable notifications in your device settings.');
        return;
      }
    }
  }, []);

  const handleSaveReminder = async () => {
    setSavingNotif(true);
    try {
      await saveNotificationSettings(notifEnabled, notifHour, notifMinute);
      if (notifEnabled) {
        const granted = await requestNotificationPermission();
        if (granted) {
          await scheduleDailyReminder(notifHour, notifMinute);
          Alert.alert('Reminder set', `You'll be reminded daily at ${formatTime(notifHour, notifMinute)}.`);
        }
      } else {
        await cancelAllReminders();
        Alert.alert('Reminders off', 'All scheduled reminders have been cancelled.');
      }
    } finally {
      setSavingNotif(false);
    }
  };

  const handleTestNotification = async () => {
    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert('Permission required', 'Please enable notifications in your device settings.');
      return;
    }
    setTestingSend(true);
    await sendTestNotification();
    setTestingSend(false);
    Alert.alert('On its way', 'A test notification will arrive in about 5 seconds. Background the app to see it.');
  };

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const rows = await getExportData();
      if (rows.length === 0) {
        Alert.alert('Nothing to export', 'No habit logs found for your account.');
        return;
      }
      const header = 'Habit,Category,Frequency,Log Type,Date,Value\n';
      const body = rows
        .map((r) => `"${r.habit}","${r.category}","${r.frequency}","${r.logType}","${r.date}",${r.value}`)
        .join('\n');
      const csv = header + body;
      const fileName = `habits-export-${new Date().toISOString().slice(0, 10)}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: 'utf8' });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export habit data' });
      } else {
        Alert.alert('Saved', `CSV saved to:\n${fileUri}`);
      }
    } catch (e) {
      Alert.alert('Export failed', String(e));
    } finally {
      setExporting(false);
    }
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
    presetRow: { flexDirection: 'row', gap: 8, paddingBottom: 14 },
    presetChip: {
      alignItems: 'center',
      borderColor: colors.border,
      borderRadius: 20,
      borderWidth: 1,
      flex: 1,
      paddingVertical: 8,
    },
    presetChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    presetChipText: { color: colors.textLabel, fontSize: 12, fontWeight: '600' },
    presetChipTextSelected: { color: '#FFFFFF' },
    presetTimeText: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
    presetTimeTextSelected: { color: 'rgba(255,255,255,0.8)' },
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

  const selectedPreset = TIME_PRESETS.find((p) => p.hour === notifHour && p.minute === notifMinute);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Profile" icon="person-circle-outline" />

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
                thumbColor="#FFFFFF"
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminders</Text>
          <View style={styles.card}>
            <Pressable onPress={() => handleToggleNotif(!notifEnabled)} accessibilityRole="switch" accessibilityLabel="Toggle daily reminder" style={styles.themeRow}>
              <View style={styles.themeLeft}>
                <Ionicons name="notifications-outline" size={18} color={colors.primary} />
                <Text style={styles.themeLabel}>Daily reminder</Text>
              </View>
              <Switch
                value={notifEnabled}
                onValueChange={handleToggleNotif}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </Pressable>

            {notifEnabled && (
              <>
                <View style={styles.divider} />
                <View style={[styles.row, { flexDirection: 'column', alignItems: 'flex-start', gap: 10 }]}>
                  <Text style={styles.rowLabel}>Reminder time</Text>
                  <View style={styles.presetRow}>
                    {TIME_PRESETS.map((preset) => {
                      const isSelected = preset.hour === notifHour && preset.minute === notifMinute;
                      return (
                        <Pressable
                          key={preset.label}
                          style={[styles.presetChip, isSelected && styles.presetChipSelected]}
                          onPress={() => { setNotifHour(preset.hour); setNotifMinute(preset.minute); }}
                          accessibilityRole="button"
                          accessibilityLabel={`Set reminder to ${preset.label}`}
                        >
                          <Text style={[styles.presetChipText, isSelected && styles.presetChipTextSelected]}>
                            {preset.label}
                          </Text>
                          <Text style={[styles.presetTimeText, isSelected && styles.presetTimeTextSelected]}>
                            {formatTime(preset.hour, preset.minute)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </>
            )}
          </View>
          <View style={{ marginTop: 10 }}>
            <PrimaryButton
              label={savingNotif ? 'Saving…' : 'Save reminder'}
              onPress={handleSaveReminder}
            />
          </View>
          <View style={{ marginTop: 8 }}>
            <PrimaryButton
              label={testingSend ? 'Sending…' : 'Send test notification'}
              variant="secondary"
              onPress={handleTestNotification}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <PrimaryButton
            label={exporting ? 'Exporting…' : 'Export to CSV'}
            variant="secondary"
            onPress={handleExport}
          />
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
      </ScrollView>
    </SafeAreaView>
  );
}
