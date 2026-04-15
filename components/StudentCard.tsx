import InfoTag from '@/components/ui/info-tag';
import PrimaryButton from '@/components/ui/primary-button';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Habit } from '@/app/_layout';

type Props = {
  habit: Habit;
};

export default function HabitCard({ habit }: Props) {
  const router = useRouter();
  const habitSummary = `${habit.name}, ${habit.categoryName}, ${habit.frequency}`;

  const openDetails = () =>
    router.push({ pathname: '/student/[id]', params: { id: habit.id.toString() } });

  return (
    <Pressable
      onPress={openDetails}
      accessibilityLabel={`${habitSummary}, view details`}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
    >
      <View>
        <Text style={styles.name}>{habit.name}</Text>
      </View>

      <View style={styles.tags}>
        <InfoTag label="Category" value={habit.categoryName} />
        <InfoTag label="Frequency" value={habit.frequency} />
      </View>
    </Pressable>
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
