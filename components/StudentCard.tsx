import { Colors, midtoneColor, pastelTextColor } from '@/constants/theme';
import { Habit, HabitContext } from '@/app/_layout';
import { Ionicons } from '@expo/vector-icons';
import { decrementHabitCount, getHabits, incrementHabitCount, markHabitDoneToday, unmarkHabitDoneToday } from '@/db/queries';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  habit: Habit;
};

function Chip({ label, color }: { label: string; color: string }) {
  const textColor = pastelTextColor(color);
  return (
    <View style={[styles.chip, { backgroundColor: color }]}>
      <Text style={[styles.chipText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export default function HabitCard({ habit }: Props) {
  const router = useRouter();
  const context = useContext(HabitContext);

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

  const increment = async () => { await incrementHabitCount(habit.id); await refresh(); };
  const decrement = async () => { await decrementHabitCount(habit.id); await refresh(); };

  // "3 days" for daily habits, "3 wks" for weekly
  const streakLabel = `${habit.currentStreak} ${habit.frequency === 'weekly' ? 'wk' : 'day'}${habit.currentStreak !== 1 ? 's' : ''}`;

  return (
    <View style={styles.card}>
      {/* Top row: name + action button */}
      <View style={styles.topRow}>
        <Pressable
          onPress={openDetails}
          accessibilityLabel={`${habit.name}, view details`}
          accessibilityRole="button"
          style={({ pressed }) => [styles.nameArea, pressed && styles.pressed]}
        >
          <Text style={styles.name} numberOfLines={1}>{habit.name}</Text>
        </Pressable>

        {habit.logType === 'count' ? (
          <View style={styles.countControl}>
            <Pressable onPress={() => { void decrement(); }} style={styles.countBtn} accessibilityLabel="Decrease count" accessibilityRole="button">
              <Text style={styles.countBtnText}>−</Text>
            </Pressable>
            <Text style={styles.countValue}>{habit.todayCount}</Text>
            <Pressable onPress={() => { void increment(); }} style={styles.countBtn} accessibilityLabel="Increase count" accessibilityRole="button">
              <Text style={styles.countBtnText}>+</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => { void toggleToday(); }}
            accessibilityRole="button"
            accessibilityLabel={habit.completedToday ? 'Unmark done today' : 'Mark as done today'}
            style={[
              styles.checkBtn,
              habit.completedToday && {
                backgroundColor: midtoneColor(habit.categoryColor),
                borderColor: midtoneColor(habit.categoryColor),
              },
            ]}
          >
            <Ionicons
              name={habit.completedToday ? 'checkmark' : 'checkmark-outline'}
              size={20}
              color={habit.completedToday ? Colors.white : Colors.muted}
            />
          </Pressable>
        )}
      </View>

      {/* Chips row */}
      <View style={styles.chipsRow}>
        <Chip label={habit.categoryName} color={habit.categoryColor} />
        <Chip label={habit.frequency} color={Colors.tealLight} />
        {habit.currentStreak > 0 && (
          <Chip label={`🔥 ${streakLabel}`} color="#FEF3C7" />
        )}
      </View>

      {/* Progress bar */}
      {habit.targetCount !== null && (
        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>
              {habit.targetProgress}/{habit.targetCount} this {habit.targetPeriod === 'weekly' ? 'week' : 'month'}
            </Text>
            {habit.targetMet
              ? <Text style={styles.targetMet}>✓ met</Text>
              : <Text style={styles.remaining}>{habit.targetCount - habit.targetProgress} left</Text>
            }
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((habit.targetProgress / habit.targetCount) * 100, 100)}%`,
                  backgroundColor: midtoneColor(habit.categoryColor),
                },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nameArea: {
    flex: 1,
    marginRight: 10,
  },
  pressed: {
    opacity: 0.7,
  },
  name: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  // Circular checkmark button
  checkBtn: {
    alignItems: 'center',
    borderColor: Colors.border,
    borderRadius: 20,
    borderWidth: 1.5,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  // Count control (for count-type habits)
  countControl: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  countBtn: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  countBtnText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 22,
  },
  countValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  // Chips
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Progress
  progressSection: {
    marginTop: 10,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    color: Colors.muted,
    fontSize: 11,
  },
  targetMet: {
    color: Colors.teal,
    fontSize: 11,
    fontWeight: '600',
  },
  remaining: {
    color: Colors.muted,
    fontSize: 11,
  },
  progressTrack: {
    backgroundColor: Colors.border,
    borderRadius: 999,
    height: 4,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: Colors.teal,
    borderRadius: 999,
    height: 4,
  },
});
