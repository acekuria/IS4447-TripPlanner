import { Habit, HabitContext } from '@/app/_layout';
import InfoTag from '@/components/ui/info-tag';
import PrimaryButton from '@/components/ui/primary-button';
import { getHabits, markHabitDoneToday, unmarkHabitDoneToday } from '@/db/queries';
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

  const toggleToday = async () => {
    if (!context) {
      return;
    }

    if (habit.completedToday) {
      await unmarkHabitDoneToday(habit.id);
    } else {
      await markHabitDoneToday(habit.id);
    }

    const rows = await getHabits();
    context.setHabits(rows);
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
                {habit.targetProgress}/{habit.targetCount} this {habit.targetPeriod}
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

      <PrimaryButton
        compact
        label={habit.completedToday ? 'Done today' : 'Mark as done today'}
        onPress={() => {
          void toggleToday();
        }}
        variant={habit.completedToday ? 'secondary' : 'primary'}
      />
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
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    height: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    borderRadius: 999,
    height: 6,
  },
});
