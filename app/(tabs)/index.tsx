import HabitCard from '@/components/StudentCard';
import EmptyState from '@/components/ui/empty-state';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { useTheme } from '@/contexts/theme';
import { sqlite } from '@/db/client';
import { getHabits } from '@/db/queries';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { useRouter } from 'expo-router';
import { fetchMotivationalQuote, Quote } from '@/utils/quotes';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('All time');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const loadQuote = useCallback(async () => {
    setQuoteLoading(true);
    setQuoteError(null);
    try {
      const q = await fetchMotivationalQuote();
      setQuote(q);
    } catch (e) {
      setQuoteError(String(e));
    } finally {
      setQuoteLoading(false);
    }
  }, []);

  useEffect(() => { void loadQuote(); }, [loadQuote]);

  useDrizzleStudio(sqlite);

  useFocusEffect(
    useCallback(() => {
      if (!context) return;
      void getHabits().then(context.setHabits);
    }, [context])
  );

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

  const styles = StyleSheet.create({
    safeArea: { backgroundColor: colors.bg, flex: 1, paddingHorizontal: 18, paddingTop: 10 },
    searchRow: { alignItems: 'center', flexDirection: 'row', gap: 10, marginTop: 14 },
    searchInput: {
      backgroundColor: colors.inputBg,
      borderColor: colors.border,
      borderRadius: 10,
      borderWidth: 1,
      color: colors.text,
      flex: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    filterBtn: {
      alignItems: 'center',
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 10,
      borderWidth: 1,
      height: 42,
      justifyContent: 'center',
      width: 42,
    },
    filterBtnActive: { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder },
    badge: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 999,
      bottom: 6,
      height: 14,
      justifyContent: 'center',
      position: 'absolute',
      right: 6,
      width: 14,
    },
    badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
    listContent: { paddingBottom: 24, paddingTop: 14 },
    overlay: { backgroundColor: 'rgba(0,0,0,0.5)', flex: 1 },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 32,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    sheetHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    sheetTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
    clearText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
    filterGroup: { marginBottom: 18 },
    filterGroupLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.5,
      marginBottom: 10,
      textTransform: 'uppercase',
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 7,
    },
    chipSelected: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
    chipText: { color: colors.text, fontSize: 13, fontWeight: '500' },
    chipTextSelected: { color: colors.primary, fontWeight: '600' },
    quoteCard: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.primaryBorder,
      borderRadius: 14,
      borderWidth: 1,
      marginBottom: 14,
      padding: 16,
    },
    quoteCardHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    quoteLabel: { color: colors.primary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
    quoteText: { color: colors.textStrong, fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
    quoteAuthor: { color: colors.textMuted, fontSize: 12, marginTop: 8 },
    quoteSkeleton: { backgroundColor: colors.border, borderRadius: 4, height: 14, marginBottom: 6, width: '90%' },
    quoteSkeletonShort: { backgroundColor: colors.border, borderRadius: 4, height: 14, width: '60%' },
    quoteErrorText: { color: colors.textMuted, fontSize: 13 },
    doneBtn: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 12,
      marginTop: 4,
      paddingVertical: 14,
    },
    doneBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Habits" subtitle={`${habits.length} tracked`} />
      <PrimaryButton label="Add Habit" onPress={() => router.push({ pathname: '../add' })} />

      <View style={styles.searchRow}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search habits…"
          placeholderTextColor={colors.textMuted}
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
            color={activeFilterCount > 0 ? colors.primary : colors.textMuted}
          />
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.quoteCard}>
        <View style={styles.quoteCardHeader}>
          <Text style={styles.quoteLabel}>Daily motivation</Text>
          <Pressable onPress={loadQuote} accessibilityRole="button" accessibilityLabel="Refresh quote">
            <Ionicons name="refresh-outline" size={16} color={colors.primary} />
          </Pressable>
        </View>
        {quoteLoading ? (
          <>
            <View style={styles.quoteSkeleton} />
            <View style={styles.quoteSkeletonShort} />
          </>
        ) : quoteError ? (
          <Pressable onPress={loadQuote} accessibilityRole="button">
            <Text style={styles.quoteErrorText}>Could not load quote. Tap to retry.</Text>
          </Pressable>
        ) : (
          <>
            <Text style={styles.quoteText}>"{quote?.quote}"</Text>
            <Text style={styles.quoteAuthor}>— {quote?.author}</Text>
          </>
        )}
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

      <Modal
        visible={sheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setSheetOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filters</Text>
            {activeFilterCount > 0 && (
              <Pressable onPress={clearFilters} accessibilityRole="button" accessibilityLabel="Clear all filters">
                <Text style={styles.clearText}>Clear all</Text>
              </Pressable>
            )}
          </View>

          <FilterGroup label="Category" colors={colors}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {categoryOptions.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => setSelectedCategory(opt)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter ${opt}`}
                  style={[styles.chip, selectedCategory === opt && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, selectedCategory === opt && styles.chipTextSelected]}>{opt}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </FilterGroup>

          <FilterGroup label="Frequency" colors={colors}>
            <View style={styles.chipRow}>
              {frequencyOptions.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => setSelectedFrequency(opt)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter ${opt}`}
                  style={[styles.chip, selectedFrequency === opt && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, selectedFrequency === opt && styles.chipTextSelected]}>{opt}</Text>
                </Pressable>
              ))}
            </View>
          </FilterGroup>

          <FilterGroup label="Activity" colors={colors}>
            <View style={styles.chipRow}>
              {dateRangeOptions.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => setSelectedDateRange(opt)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter ${opt}`}
                  style={[styles.chip, selectedDateRange === opt && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, selectedDateRange === opt && styles.chipTextSelected]}>{opt}</Text>
                </Pressable>
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

function FilterGroup({ label, children, colors }: { label: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' }}>
        {label}
      </Text>
      {children}
    </View>
  );
}
