import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { midtoneColor } from '@/constants/theme';
import { useAuth } from '@/contexts/auth';
import { useTheme } from '@/contexts/theme';
import { db } from '@/db/client';
import { getCategories, getHabits, setHabitTarget } from '@/db/queries';
import { habits as habitsTable } from '@/db/schema';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Category, HabitContext } from './_layout';

const frequencyOptions = ['daily', 'weekly'] as const;
const logTypeOptions = ['completion', 'count'] as const;
const periodOptions = ['weekly', 'monthly'] as const;

export default function AddHabit() {
  const router = useRouter();
  const context = useContext(HabitContext);
  const { colors } = useTheme();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [logType, setLogType] = useState<'completion' | 'count'>('completion');
  const [notes, setNotes] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalPeriod, setGoalPeriod] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    const loadCategories = async () => {
      const rows = await getCategories();
      setCategories(rows);
      if (rows.length > 0) setSelectedCategoryId(rows[0].id);
    };
    void loadCategories();
  }, []);

  if (!context) return null;

  const { setHabits } = context;

  const saveHabit = async () => {
    if (!name.trim() || selectedCategoryId === null) return;

    const [inserted] = await db
      .insert(habitsTable)
      .values({ name: name.trim(), categoryId: selectedCategoryId, frequency, logType, notes: notes.trim() || null, count: 0, userId: user?.id ?? null })
      .returning({ id: habitsTable.id });

    const parsedTarget = parseInt(goalTarget, 10);
    if (!isNaN(parsedTarget) && parsedTarget > 0) {
      await setHabitTarget(inserted.id, parsedTarget, goalPeriod);
    }

    const rows = await getHabits();
    setHabits(rows);
    router.back();
  };

  const styles = StyleSheet.create({
    safeArea: { backgroundColor: colors.bg, flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    form: { marginBottom: 6 },
    sectionHeader: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
      marginBottom: 12,
      marginTop: 20,
      textTransform: 'uppercase',
    },
    label: { color: colors.textLabel, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 4 },
    optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    optionButton: {
      alignItems: 'center',
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 10,
      borderWidth: 1,
      flexDirection: 'row',
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    categoryOptionSelected: { borderColor: 'transparent' },
    frequencyOptionSelected: { backgroundColor: colors.selectedBg, borderColor: colors.selectedBg },
    optionButtonText: { color: colors.text, fontSize: 14, fontWeight: '500' },
    optionButtonTextSelected: { color: colors.selectedText },
    colorSwatch: { borderRadius: 999, height: 10, marginRight: 8, width: 10 },
    backButton: { marginTop: 10 },
    input: {
      backgroundColor: colors.inputBg,
      borderColor: colors.inputBorder,
      borderRadius: 10,
      borderWidth: 1,
      color: colors.text,
      fontSize: 15,
      marginBottom: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Add Habit" subtitle="Create a new habit to track." onBack={() => router.back()} />
        <View style={styles.form}>
          <FormField label="Habit Name" value={name} onChangeText={setName} />

          <Text style={styles.sectionHeader}>Organisation</Text>

          <Text style={styles.label}>Category</Text>
          <View style={styles.optionRow}>
            {categories.map((category) => {
              const isSelected = selectedCategoryId === category.id;
              const accent = midtoneColor(category.color);
              return (
                <Pressable
                  key={category.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Select category ${category.name}`}
                  onPress={() => setSelectedCategoryId(category.id)}
                  style={[
                    styles.optionButton,
                    { borderColor: accent },
                    isSelected && [styles.categoryOptionSelected, { backgroundColor: accent }],
                  ]}
                >
                  <View style={[styles.colorSwatch, { backgroundColor: accent }]} />
                  <Text style={[styles.optionButtonText, isSelected && { color: '#fff' }]}>
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

          <Text style={styles.sectionHeader}>Tracking</Text>

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
            placeholderTextColor={colors.textMuted}
            value={goalTarget}
            onChangeText={setGoalTarget}
            style={styles.input}
          />

          <Text style={styles.sectionHeader}>Details</Text>

          <FormField label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="e.g. tips, reminders, context" />
        </View>
        <PrimaryButton label="Save Habit" onPress={saveHabit} />
        <View style={styles.backButton}>
          <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
