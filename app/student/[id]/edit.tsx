import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { deleteHabitTarget, getCategories, getHabits, setHabitTarget } from '@/db/queries';
import { habits as habitsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Category, Habit, HabitContext } from '../../_layout';

const frequencyOptions = ['daily', 'weekly'] as const;
const logTypeOptions = ['completion', 'count'] as const;
const periodOptions = ['weekly', 'monthly'] as const;

export default function EditHabit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(HabitContext);
  const [name, setName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [logType, setLogType] = useState<'completion' | 'count'>('completion');
  const [notes, setNotes] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalPeriod, setGoalPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const habit = context?.habits.find((item: Habit) => item.id === Number(id));

  useEffect(() => {
    const loadCategories = async () => {
      const rows = await getCategories();
      setCategories(rows);
    };

    void loadCategories();
  }, []);

  useEffect(() => {
    if (!habit) return;
    setName(habit.name);
    setSelectedCategoryId(habit.categoryId);
    setFrequency(habit.frequency as 'daily' | 'weekly');
    setLogType((habit.logType as 'completion' | 'count') ?? 'completion');
    setNotes(habit.notes ?? '');
    setGoalTarget(habit.targetCount !== null ? String(habit.targetCount) : '');
    setGoalPeriod((habit.targetPeriod as 'weekly' | 'monthly') ?? 'weekly');
  }, [habit]);

  if (!context || !habit) return null;

  const { setHabits } = context;

  const saveChanges = async () => {
    if (!name.trim() || selectedCategoryId === null) {
      return;
    }

    await db
      .update(habitsTable)
      .set({ name: name.trim(), categoryId: selectedCategoryId, frequency, logType, notes: notes.trim() || null })
      .where(eq(habitsTable.id, Number(id)));

    const parsedTarget = parseInt(goalTarget, 10);
    if (!isNaN(parsedTarget) && parsedTarget > 0) {
      await setHabitTarget(Number(id), parsedTarget, goalPeriod);
    } else {
      await deleteHabitTarget(Number(id));
    }

    const rows = await getHabits();
    setHabits(rows);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Edit Habit" subtitle={`Update ${habit.name}`} onBack={() => router.back()} />
      <View style={styles.form}>
        <FormField label="Habit Name" value={name} onChangeText={setName} />

        <Text style={styles.label}>Category</Text>
        <View style={styles.optionRow}>
          {categories.map((category) => {
            const isSelected = selectedCategoryId === category.id;
            return (
              <Pressable
                key={category.id}
                accessibilityRole="button"
                accessibilityLabel={`Select category ${category.name}`}
                onPress={() => setSelectedCategoryId(category.id)}
                style={[
                  styles.optionButton,
                  { borderColor: category.color },
                  isSelected && [styles.categoryOptionSelected, { backgroundColor: category.color }],
                ]}
              >
                <View style={[styles.colorSwatch, { backgroundColor: category.color }]} />
                <Text style={[styles.optionButtonText, isSelected && styles.optionButtonTextSelected]}>
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Frequency</Text>
        <View style={styles.optionRow}>
          {frequencyOptions.map((option) => {
            const isSelected = frequency === option;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityLabel={`Select frequency ${option}`}
                onPress={() => setFrequency(option)}
                style={[styles.optionButton, isSelected && styles.frequencyOptionSelected]}
              >
                <Text style={[styles.optionButtonText, isSelected && styles.optionButtonTextSelected]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FormField label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="e.g. tips, reminders, context" />

        <Text style={styles.label}>Logging</Text>
        <View style={styles.optionRow}>
          {logTypeOptions.map((option) => {
            const isSelected = logType === option;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityLabel={`Select log type ${option}`}
                onPress={() => setLogType(option)}
                style={[styles.optionButton, isSelected && styles.frequencyOptionSelected]}
              >
                <Text style={[styles.optionButtonText, isSelected && styles.optionButtonTextSelected]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Goal (optional)</Text>
        <View style={styles.optionRow}>
          {periodOptions.map((option) => {
            const isSelected = goalPeriod === option;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityLabel={`Select goal period ${option}`}
                onPress={() => setGoalPeriod(option)}
                style={[styles.optionButton, isSelected && styles.frequencyOptionSelected]}
              >
                <Text style={[styles.optionButtonText, isSelected && styles.optionButtonTextSelected]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          accessibilityLabel="Goal target, enter number"
          keyboardType="numeric"
          placeholder="Times per period (e.g. 5)"
          value={goalTarget}
          onChangeText={setGoalTarget}
          style={styles.input}
        />
      </View>

      <PrimaryButton label="Save Changes" onPress={saveChanges} />
      <View style={styles.buttonSpacing}>
        <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    padding: 20,
  },
  form: {
    marginBottom: 6,
  },
  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 4,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  optionButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  categoryOptionSelected: {
    borderColor: 'transparent',
  },
  frequencyOptionSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  optionButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    color: '#FFFFFF',
  },
  colorSwatch: {
    borderRadius: 999,
    height: 10,
    marginRight: 8,
    width: 10,
  },
  buttonSpacing: {
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
