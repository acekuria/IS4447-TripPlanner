import InfoTag from '@/components/ui/info-tag';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { getHabitProgress, getHabits, markHabitDoneToday, type HabitProgress } from '@/db/queries';
import { habits as habitsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const [progress, setProgress] = useState<HabitProgress>({ currentStreak: 0, recentLogs: [] });

  if (!context) return null;

  const { habits, setHabits } = context;
  const habit = habits.find((item: Habit) => item.id === Number(id));

  useEffect(() => {
    if (!habit) return;

    const loadProgress = async () => {
      const next = await getHabitProgress(habit.id, habit.frequency);
      setProgress(next);
    };

    void loadProgress();
  }, [habit]);

  if (!habit) return null;

  const refreshHabitData = async () => {
    const rows = await getHabits();
    setHabits(rows);
    const next = await getHabitProgress(habit.id, habit.frequency);
    setProgress(next);
  };

  const deleteHabit = async () => {
    await db.delete(habitsTable).where(eq(habitsTable.id, Number(id)));
    const rows = await getHabits();
    setHabits(rows);
    router.back();
  };

  const markDone = async () => {
    await markHabitDoneToday(habit.id);
    await refreshHabitData();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title={habit.name} subtitle="Habit details" />
        <View style={styles.tags}>
          <InfoTag label="Category" value={habit.categoryName} accentColor={habit.categoryColor} />
          <InfoTag label="Frequency" value={habit.frequency} />
          <InfoTag label="Streak" value={`${progress.currentStreak}`} />
        </View>

        <PrimaryButton
          label={habit.completedToday ? 'Done today' : 'Mark as done today'}
          disabled={habit.completedToday}
          onPress={() => {
            void markDone();
          }}
        />

        <View style={styles.buttonSpacing}>
          <PrimaryButton
            label="Edit"
            onPress={() =>
              router.push({
                pathname: '../student/[id]/edit',
                params: { id },
              })
            }
          />
        </View>

        <View style={styles.buttonSpacing}>
          <PrimaryButton
            label="Delete"
            variant="secondary"
            onPress={() => {
              void deleteHabit();
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.sectionSubtitle}>
            Last {progress.recentLogs.length} completion{progress.recentLogs.length === 1 ? '' : 's'}
          </Text>
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

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    padding: 20,
  },
  content: {
    paddingBottom: 32,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  buttonSpacing: {
    marginTop: 10,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 18,
    padding: 16,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 4,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 12,
  },
  logRow: {
    alignItems: 'center',
    borderTopColor: '#E2E8F0',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
  },
  logDate: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
  },
  logValue: {
    color: '#0F766E',
    fontSize: 15,
    fontWeight: '700',
  },
});
