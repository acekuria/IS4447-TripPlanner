import HabitCard from '@/components/StudentCard';
import EmptyState from '@/components/ui/empty-state';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { Colors } from '@/constants/theme';
import { sqlite } from '@/db/client';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { useRouter } from 'expo-router';
import { useContext, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Habit, HabitContext } from '../_layout';

const frequencyOptions = ['All', 'daily', 'weekly'];
const dateRangeOptions = ['All time', 'Today', 'This week', 'This month'];

export default function IndexScreen() {
  const router = useRouter();
  const context = useContext(HabitContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('All time');

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
    const matchesDateRange =
      selectedDateRange === 'All time' ||
      (selectedDateRange === 'Today' && habit.completedToday) ||
      (selectedDateRange === 'This week' && habit.hasLogThisWeek) ||
      (selectedDateRange === 'This month' && habit.hasLogThisMonth);

    return matchesSearch && matchesFrequency && matchesCategory && matchesDateRange;
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

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Activity</Text>
        <View style={styles.filterRow}>
          {dateRangeOptions.map((range) => {
            const isSelected = selectedDateRange === range;
            return (
              <Pressable
                key={range}
                accessibilityLabel={`Filter by activity ${range}`}
                accessibilityRole="button"
                onPress={() => setSelectedDateRange(range)}
                style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
              >
                <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextSelected]}>
                  {range}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {habits.length === 0 ? (
          <EmptyState
            icon="checkmark-circle-outline"
            title="No habits yet"
            subtitle="Start building your routine by adding your first habit."
            actionLabel="Add Habit"
            onAction={() => router.push({ pathname: '../add' })}
          />
        ) : filteredHabits.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No matches"
            subtitle="Try adjusting your search or filters."
          />
        ) : (
          filteredHabits.map((habit: Habit) => <HabitCard key={habit.id} habit={habit} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.surface,
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 14,
  },
  searchInput: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: Colors.text,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterSection: {
    marginTop: 10,
  },
  filterLabel: {
    color: Colors.muted,
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
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButtonSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
