import HabitCard from '@/components/StudentCard';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { sqlite } from '@/db/client';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { useRouter } from 'expo-router';
import { useContext, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Habit, HabitContext } from '../_layout';

const frequencyOptions = ['All', 'daily', 'weekly'];

export default function IndexScreen() {
  const router = useRouter();
  const context = useContext(HabitContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('All');

  useDrizzleStudio(sqlite);

  if (!context) return null;

  const { habits } = context;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const categoryOptions = useMemo(
    () => ['All', ...Array.from(new Set(habits.map((habit) => habit.categoryName))).sort()],
    [habits]
  );
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredHabits = habits.filter((habit: Habit) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      habit.name.toLowerCase().includes(normalizedQuery) ||
      habit.categoryName.toLowerCase().includes(normalizedQuery);
    const matchesFrequency =
      selectedFrequency === 'All' || habit.frequency === selectedFrequency;
    const matchesCategory =
      selectedCategory === 'All' || habit.categoryName === selectedCategory;

    return matchesSearch && matchesFrequency && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Habits" subtitle={`${habits.length} tracked`} />
      <PrimaryButton label="Add Habit" onPress={() => router.push({ pathname: '../add' })} />
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by habit or category"
        style={styles.searchInput}
      />

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Category</Text>
        <View style={styles.filterRow}>
          {categoryOptions.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <Pressable
                key={category}
                accessibilityLabel={`Filter by category ${category}`}
                accessibilityRole="button"
                onPress={() => setSelectedCategory(category)}
                style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
              >
                <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextSelected]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Frequency</Text>
        <View style={styles.filterRow}>
          {frequencyOptions.map((frequency) => {
            const isSelected = selectedFrequency === frequency;
            return (
              <Pressable
                key={frequency}
                accessibilityLabel={`Filter by frequency ${frequency}`}
                accessibilityRole="button"
                onPress={() => setSelectedFrequency(frequency)}
                style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
              >
                <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextSelected]}>
                  {frequency}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredHabits.length === 0 ? (
          <Text style={styles.emptyText}>No habits match your filters</Text>
        ) : (
          filteredHabits.map((habit: Habit) => <HabitCard key={habit.id} habit={habit} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 14,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#94A3B8',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterSection: {
    marginTop: 10,
  },
  filterLabel: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#94A3B8',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButtonSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextSelected: {
    color: '#FFFFFF',
  },
  emptyText: {
    color: '#475569',
    fontSize: 16,
    paddingTop: 8,
    textAlign: 'center',
  },
});
