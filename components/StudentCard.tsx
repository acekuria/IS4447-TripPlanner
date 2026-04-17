import { Habit, HabitContext } from '@/app/_layout';
import InfoTag from '@/components/ui/info-tag';
import PrimaryButton from '@/components/ui/primary-button';
import { decrementHabitCount, getHabits, incrementHabitCount, markHabitDoneToday, unmarkHabitDoneToday } from '@/db/queries';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  habit: Habit;
};

export default function HabitCard({ habit }: Props) {
  const router = useRouter();
  const context = useContext(HabitContext);
  const habitSummary = `${habit.name}, ${habit.categoryName}, ${habit.frequency}`;

  const openDetails = () =>
    router.push({ pathname: '/student/[id]', params: { id: habit.id.toString() } });

  const refresh = async () => {
    if (!context) return;
    const rows = await getHabits();
    context.setHabits(rows);
  };

  const toggleToday = async () => {
    if (!context) return;
    if (habit.completedToday) {
      await unmarkHabitDoneToday(habit.id);
    } else {
      await markHabitDoneToday(habit.id);
    }
    await refresh();
  };

  const increment = async () => {
    await incrementHabitCount(habit.id);
    await refresh();
  };

  const decrement = async () => {
    await decrementHabitCount(habit.id);
    await refresh();
  };

  return (
    <View style={styles.card}>
      <Pressable
        onPress={openDetails}
        accessibilityLabel={`${habitSummary}, view details`}
        accessibilityRole="button"
        style={({ pressed }) => [styles.content, pressed ? styles.cardPressed : null]}
      >
        <View>
          <Text style={styles.name}>{habit.name}</Text>
        </View>

        <View style={styles.tags}>
          <InfoTag label="Category" value={habit.categoryName} accentColor={habit.categoryColor} />
          <InfoTag label="Frequency" value={habit.frequency} />
          <InfoTag label="Streak" value={`${habit.currentStreak}`} />
        </View>

        {habit.targetCount !== null && (
          <View style={styles.weeklyProgress}>
            <View style={styles.weeklyProgressRow}>
              <Text style={styles.weeklyProgressText}>
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
      </Pressable>

      {habit.logType === 'count' ? (
        <View style={styles.counter}>
          <Pressable
            onPress={() => { void decrement(); }}
            accessibilityRole="button"
            accessibilityLabel="Decrease count"
            style={styles.counterButton}
          >
            <Text style={styles.counterButtonText}>−</Text>
          </Pressable>
          <Text style={styles.counterValue}>{habit.todayCount} today</Text>
          <Pressable
            onPress={() => { void increment(); }}
            accessibilityRole="button"
            accessibilityLabel="Increase count"
            style={styles.counterButton}
          >
            <Text style={styles.counterButtonText}>+</Text>
          </Pressable>
        </View>
      ) : (
        <PrimaryButton
          compact
          label={habit.completedToday ? 'Done today' : 'Mark as done today'}
          onPress={() => { void toggleToday(); }}
          variant={habit.completedToday ? 'secondary' : 'primary'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  content: {
    borderRadius: 10,
  },
  name: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  cardPressed: {
    opacity: 0.88,
  },
  weeklyProgress: {
    marginTop: 10,
  },
  weeklyProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weeklyProgressText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  targetMet: {
    color: '#16A34A',
    fontSize: 13,
    fontWeight: '600',
  },
  remaining: {
    color: '#6B7280',
    fontSize: 13,
  },
  progressBarTrack: {
    backgroundColor: '#CBD5E1',
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    borderRadius: 999,
    height: 6,
  },
  counter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  counterButton: {
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  counterButtonText: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 26,
  },
  counterValue: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
  },
});
