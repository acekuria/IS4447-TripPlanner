import HabitCard from '@/components/StudentCard';
import EmptyState from '@/components/ui/empty-state';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { Colors } from '@/constants/theme';
import { sqlite } from '@/db/client';
import { Ionicons } from '@expo/vector-icons';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { useRouter } from 'expo-router';
import { useContext, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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
  const [sheetOpen, setSheetOpen] = useState(false);

  useDrizzleStudio(sqlite);

  if (!context) return null;

  const { habits } = context;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const categoryOptions = useMemo(
    () => ['All', ...Array.from(new Set(habits.map((h) => h.categoryName))).sort()],
    [habits]
  );
  const [selectedCategory, setSelectedCategory] = useState('All');

  const activeFilterCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedFrequency !== 'All' ? 1 : 0) +
    (selectedDateRange !== 'All time' ? 1 : 0);

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedFrequency('All');
    setSelectedDateRange('All time');
  };

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

      {/* Search + Filter row */}
      <View style={styles.searchRow}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search habits…"
          placeholderTextColor={Colors.muted}
          style={styles.searchInput}
        />
        <Pressable
          onPress={() => setSheetOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Open filters"
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={activeFilterCount > 0 ? Colors.primary : Colors.muted}
          />
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Habit list */}
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

      {/* Filter bottom sheet */}
      <Modal
        visible={sheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setSheetOpen(false)} />
        <View style={styles.sheet}>
          {/* Sheet header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filters</Text>
            {activeFilterCount > 0 && (
              <Pressable onPress={clearFilters} accessibilityRole="button" accessibilityLabel="Clear all filters">
                <Text style={styles.clearText}>Clear all</Text>
              </Pressable>
            )}
          </View>

          <FilterGroup label="Category">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {categoryOptions.map((opt) => (
                <FilterChip
                  key={opt}
                  label={opt}
                  selected={selectedCategory === opt}
                  onPress={() => setSelectedCategory(opt)}
                />
              ))}
            </ScrollView>
          </FilterGroup>

          <FilterGroup label="Frequency">
            <View style={styles.chipRow}>
              {frequencyOptions.map((opt) => (
                <FilterChip
                  key={opt}
                  label={opt}
                  selected={selectedFrequency === opt}
                  onPress={() => setSelectedFrequency(opt)}
                />
              ))}
            </View>
          </FilterGroup>

          <FilterGroup label="Activity">
            <View style={styles.chipRow}>
              {dateRangeOptions.map((opt) => (
                <FilterChip
                  key={opt}
                  label={opt}
                  selected={selectedDateRange === opt}
                  onPress={() => setSelectedDateRange(opt)}
                />
              ))}
            </View>
          </FilterGroup>

          <Pressable
            style={styles.doneBtn}
            onPress={() => setSheetOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Done"
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterGroupLabel}>{label}</Text>
      {children}
    </View>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Filter ${label}`}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.surface,
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  searchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  searchInput: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: Colors.text,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterBtn: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  filterBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryBorder,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 999,
    bottom: 6,
    height: 14,
    justifyContent: 'center',
    position: 'absolute',
    right: 6,
    width: 14,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 14,
  },
  // Bottom sheet
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sheetTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  clearText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  filterGroup: {
    marginBottom: 18,
  },
  filterGroupLabel: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  doneBtn: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    marginTop: 4,
    paddingVertical: 14,
  },
  doneBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
