import { midtoneColor, pastelTextColor } from '@/constants/theme';
import { useTheme } from '@/contexts/theme';
import { Habit, HabitContext } from '@/app/_layout';
import { Ionicons } from '@expo/vector-icons';
import { decrementHabitCount, getHabits, incrementHabitCount, markHabitDoneToday, unmarkHabitDoneToday } from '@/db/queries';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  habit: Habit;
};

function Chip({ label, color, textColor: explicitTextColor }: { label: string; color: string; textColor?: string }) {
  const textColor = explicitTextColor ?? pastelTextColor(color);
  return (
    <View style={[chipStyles.chip, { backgroundColor: color }]}>
      <Text style={[chipStyles.chipText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  chipText: { fontSize: 11, fontWeight: '600' },
});

export default function HabitCard({ habit }: Props) {
  const router = useRouter();
  const context = useContext(HabitContext);
  const { colors } = useTheme();

  const openDetails = () =>
    router.push({ pathname: '/habit/[id]', params: { id: habit.id.toString() } });

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

  const streakLabel = `${habit.currentStreak} ${habit.frequency === 'weekly' ? 'wk' : 'day'}${habit.currentStreak !== 1 ? 's' : ''}`;

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 14,
      borderWidth: 1,
      marginBottom: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    nameArea: { flex: 1, marginRight: 10 },
    pressed: { opacity: 0.7 },
    name: { color: colors.text, fontSize: 16, fontWeight: '700' },
    checkBtn: {
      alignItems: 'center',
      borderColor: colors.border,
      borderRadius: 20,
      borderWidth: 1.5,
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
    countControl: { alignItems: 'center', flexDirection: 'row', gap: 6 },
    countBtn: {
      alignItems: 'center',
      backgroundColor: colors.bg,
      borderRadius: 8,
      height: 32,
      justifyContent: 'center',
      width: 32,
    },
    countBtnText: { color: colors.text, fontSize: 18, fontWeight: '500', lineHeight: 22 },
    countValue: { color: colors.text, fontSize: 14, fontWeight: '700', minWidth: 24, textAlign: 'center' },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    progressSection: { marginTop: 10 },
    progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    progressLabel: { color: colors.textMuted, fontSize: 11 },
    targetMet: { color: colors.teal, fontSize: 11, fontWeight: '600' },
    remaining: { color: colors.textMuted, fontSize: 11 },
    progressTrack: { backgroundColor: colors.border, borderRadius: 999, height: 4, overflow: 'hidden' },
    progressFill: { backgroundColor: colors.teal, borderRadius: 999, height: 4 },
  });

  return (
    <View style={styles.card}>
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
              color={habit.completedToday ? '#FFFFFF' : colors.textMuted}
            />
          </Pressable>
        )}
      </View>

      <View style={styles.chipsRow}>
        <Chip label={habit.categoryName} color={habit.categoryColor} />
        <Chip label={habit.frequency} color={colors.tealLight} textColor={colors.tealDark} />
        {habit.currentStreak > 0 && (
          <Chip label={`🔥 ${streakLabel}`} color="#FEF3C7" />
        )}
      </View>

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
