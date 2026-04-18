import EmptyState from '@/components/ui/empty-state';
import ScreenHeader from '@/components/ui/screen-header';
import { getInsightsData, InsightsData } from '@/db/queries';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InsightsScreen() {
  const [data, setData] = useState<InsightsData | null>(null);

  useFocusEffect(
    useCallback(() => {
      void getInsightsData().then(setData);
    }, [])
  );

  if (!data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Insights" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0F766E" />
        </View>
      </SafeAreaView>
    );
  }

  if (data.totalHabits === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Insights" />
        <EmptyState
          icon="bar-chart-outline"
          title="No data yet"
          subtitle="Add some habits and start logging to see your progress here."
        />
      </SafeAreaView>
    );
  }

  const maxDailyCount = Math.max(...data.dailyTotals.map((d) => d.count), 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Insights" />

        {/* ── Summary cards ── */}
        <View style={styles.statsRow}>
          <StatCard label="Habits" value={String(data.totalHabits)} />
          <StatCard label="This week" value={`${data.weeklyCompletionRate}%`} accent="#22C55E" />
          <StatCard label="Best streak" value={String(data.bestStreak)} accent="#3B82F6" />
        </View>

        {/* ── Daily bar chart ── */}
        <SectionTitle>Daily completions — last 7 days</SectionTitle>
        <View style={styles.chartCard}>
          <View style={styles.barsContainer}>
            {data.dailyTotals.map((day) => {
              const heightPx = Math.round((day.count / maxDailyCount) * 100);
              return (
                <View key={day.date} style={styles.barWrapper}>
                  <Text style={styles.barValue}>{day.count > 0 ? day.count : ''}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: heightPx, backgroundColor: day.label === 'Today' ? '#F47B4F' : '#1D9E75' },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, day.label === 'Today' && styles.barLabelToday]}>
                    {day.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Category breakdown ── */}
        <SectionTitle>Category breakdown — last 28 days</SectionTitle>
        <View style={styles.breakdownCard}>
          {data.categoryBreakdown.map((cat) => {
            const pct = cat.possible > 0 ? Math.min(cat.completed / cat.possible, 1) : 0;
            const label = Math.round(pct * 100);
            return (
              <View key={cat.name} style={styles.catRow}>
                <View style={styles.catLabelRow}>
                  <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={styles.catPct}>{label}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${label}%` as any, backgroundColor: cat.color }]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* ── Top streaks ── */}
        <SectionTitle>Top streaks</SectionTitle>
        <View style={styles.breakdownCard}>
          {data.topStreaks.map((item, i) => (
            <View key={item.name} style={[styles.streakRow, i < data.topStreaks.length - 1 && styles.streakRowBorder]}>
              <View style={styles.streakLeft}>
                <Text style={styles.streakRank}>#{i + 1}</Text>
                <View style={[styles.catDot, { backgroundColor: item.color }]} />
                <Text style={styles.streakName}>{item.name}</Text>
              </View>
              <View style={styles.streakBadge}>
                <Text style={styles.streakValue}>{item.streak}</Text>
                <Text style={styles.streakUnit}>{item.streak === 1 ? 'day' : 'days'}</Text>
              </View>
            </View>
          ))}
          {data.topStreaks.length === 0 && (
            <Text style={styles.empty}>No streaks yet — start logging habits!</Text>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, accent ? { color: accent } : undefined]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F7F5F2',
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  content: {
    paddingBottom: 32,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    marginTop: 4,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 14,
  },
  statValue: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    padding: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    height: 140,
    alignItems: 'flex-end',
    gap: 6,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    color: '#374151',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    height: 16,
  },
  barTrack: {
    borderRadius: 4,
    height: 100,
    overflow: 'hidden',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  barFill: {
    borderRadius: 4,
    width: '100%',
  },
  barLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 6,
  },
  barLabelToday: {
    color: '#F47B4F',
    fontWeight: '600',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    padding: 16,
  },
  catRow: {
    marginBottom: 14,
  },
  catLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 6,
  },
  catDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
    marginRight: 8,
  },
  catName: {
    color: '#111827',
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  catPct: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  progressTrack: {
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
    height: 8,
  },
  streakRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  streakRowBorder: {
    borderBottomColor: '#F1F5F9',
    borderBottomWidth: 1,
  },
  streakLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  streakRank: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    width: 28,
  },
  streakName: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  streakBadge: {
    alignItems: 'center',
    backgroundColor: '#E1F5EE',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakValue: {
    color: '#085041',
    fontSize: 14,
    fontWeight: '700',
  },
  streakUnit: {
    color: '#1D9E75',
    fontSize: 11,
  },
  empty: {
    color: '#94A3B8',
    fontSize: 14,
    paddingVertical: 8,
    textAlign: 'center',
  },
});
