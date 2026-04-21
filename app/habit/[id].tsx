import InfoTag from '@/components/ui/info-tag';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { useTheme } from '@/contexts/theme';
import { sqlite } from '@/db/client';
import { getHabitProgress, getHabits, markHabitDoneToday, type HabitProgress, unmarkHabitDoneToday } from '@/db/queries';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Habit, HabitContext } from '../_layout';

function formatLogDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(HabitContext);
  const { colors } = useTheme();
  const [progress, setProgress] = useState<HabitProgress>({ currentStreak: 0, recentLogs: [] });

  if (!context) return null;

  const { habits, setHabits } = context;
  const habit = habits.find((item: Habit) => item.id === Number(id));

  useEffect(() => {
    if (!habit) return;
    void getHabitProgress(habit.id, habit.frequency).then(setProgress);
  }, [habit]);

  if (!habit) return null;

  const refreshHabitData = async () => {
    const rows = await getHabits();
    setHabits(rows);
    const next = await getHabitProgress(habit.id, habit.frequency);
    setProgress(next);
  };

  const deleteHabit = () => {
    Alert.alert('Delete habit', `Delete "${habit.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          router.back();
          sqlite.execSync(`DELETE FROM habit_logs WHERE habit_id = ${Number(id)}`);
          sqlite.execSync(`DELETE FROM targets WHERE habit_id = ${Number(id)}`);
          sqlite.execSync(`DELETE FROM habits WHERE id = ${Number(id)}`);
          void getHabits().then(setHabits);
        },
      },
    ]);
  };

  const toggleToday = async () => {
    if (habit.completedToday) {
      await unmarkHabitDoneToday(habit.id);
    } else {
      await markHabitDoneToday(habit.id);
    }
    await refreshHabitData();
  };

  const styles = StyleSheet.create({
    safeArea: { backgroundColor: colors.bg, flex: 1, padding: 20 },
    content: { paddingBottom: 32 },
    tags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 },
    notesSection: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 14,
      borderWidth: 1,
      marginBottom: 16,
      padding: 14,
    },
    notesSectionTitle: {
      color: colors.textSubdued,
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 4,
      textTransform: 'uppercase',
    },
    notesText: { color: colors.textLabel, fontSize: 14, lineHeight: 20 },
    buttonSpacing: { marginTop: 10 },
    goalSection: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 14,
      borderWidth: 1,
      marginBottom: 16,
      padding: 14,
    },
    goalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    goalText: { color: colors.textLabel, fontSize: 14, fontWeight: '600' },
    targetMet: { color: '#16A34A', fontSize: 14, fontWeight: '600' },
    remaining: { color: colors.textSubdued, fontSize: 14 },
    progressBarTrack: { backgroundColor: colors.inputBorder, borderRadius: 999, height: 8, overflow: 'hidden' },
    progressBarFill: { borderRadius: 999, height: 6 },
    section: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 16,
      borderWidth: 1,
      marginTop: 18,
      padding: 16,
    },
    sectionTitle: { color: colors.textStrong, fontSize: 18, fontWeight: '700' },
    sectionSubtitle: { color: colors.textSubdued, fontSize: 14, marginTop: 4 },
    emptyText: { color: colors.textSubdued, fontSize: 14, marginTop: 12 },
    logRow: {
      alignItems: 'center',
      borderTopColor: colors.border,
      borderTopWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
      paddingTop: 12,
    },
    logDate: { color: colors.textStrong, fontSize: 15, fontWeight: '600' },
    logValue: { color: colors.teal, fontSize: 15, fontWeight: '700' },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title={habit.name} onBack={() => router.back()} />
        <View style={styles.tags}>
          <InfoTag label="Category" value={habit.categoryName} accentColor={habit.categoryColor} />
          <InfoTag label="Frequency" value={habit.frequency} />
          <InfoTag
            label="Streak"
            value={`${progress.currentStreak} ${habit.frequency === 'weekly' ? 'week' : 'day'}${progress.currentStreak !== 1 ? 's' : ''}`}
          />
        </View>

        {habit.notes ? (
          <View style={styles.notesSection}>
            <Text style={styles.notesSectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{habit.notes}</Text>
          </View>
        ) : null}

        {habit.targetCount !== null && (
          <View style={styles.goalSection}>
            <View style={styles.goalRow}>
              <Text style={styles.goalText}>
                {habit.targetProgress}/{habit.targetCount} this {habit.targetPeriod === 'weekly' ? 'week' : 'month'}
              </Text>
              {habit.targetMet ? (
                <Text style={styles.targetMet}>Target met</Text>
              ) : (
                <Text style={styles.remaining}>
                  {habit.targetCount - habit.targetProgress} remaining
                </Text>
              )}
            </View>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min((habit.targetProgress / habit.targetCount) * 100, 100)}%`,
                    backgroundColor: habit.targetMet ? '#22C55E' : '#3B82F6',
                  },
                ]}
              />
            </View>
          </View>
        )}

        <PrimaryButton
          label={habit.completedToday ? 'Done today' : 'Mark as done today'}
          variant={habit.completedToday ? 'secondary' : 'primary'}
          onPress={() => { void toggleToday(); }}
        />

        <View style={styles.buttonSpacing}>
          <PrimaryButton
            label="Edit"
            onPress={() => router.push({ pathname: '../habit/[id]/edit', params: { id } })}
          />
        </View>

        <View style={styles.buttonSpacing}>
          <PrimaryButton label="Delete" variant="danger" onPress={() => { void deleteHabit(); }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.sectionSubtitle}>Most recent completions</Text>
          {progress.recentLogs.length === 0 ? (
            <Text style={styles.emptyText}>No completions logged yet.</Text>
          ) : (
            progress.recentLogs.map((log) => (
              <View key={log.id} style={styles.logRow}>
                <Text style={styles.logDate}>{formatLogDate(log.date)}</Text>
                <Text style={styles.logValue}>+{log.value}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
