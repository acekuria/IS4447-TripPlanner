import { Habit, HabitContext } from '@/app/_layout';
import InfoTag from '@/components/ui/info-tag';
import PrimaryButton from '@/components/ui/primary-button';
import { getHabits, markHabitDoneToday } from '@/db/queries';
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

  const markDone = async () => {
    if (!context || habit.completedToday) {
      return;
    }

    await markHabitDoneToday(habit.id);
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
      </Pressable>

      <PrimaryButton
        compact
        disabled={habit.completedToday}
        label={habit.completedToday ? 'Done today' : 'Mark as done today'}
        onPress={() => {
          void markDone();
        }}
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
});
