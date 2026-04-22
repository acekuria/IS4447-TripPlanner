import EmptyState from '@/components/ui/empty-state';
import ScreenHeader from '@/components/ui/screen-header';
import { midtoneColor } from '@/constants/theme';
import { useTheme } from '@/contexts/theme';
import { getInsightsData, InsightsData } from '@/db/queries';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ChartView = 'Daily' | 'Weekly' | 'Monthly';
const CHART_VIEWS: ChartView[] = ['Daily', 'Weekly', 'Monthly'];

export default function InsightsScreen() {
  const { colors } = useTheme();
  const [data, setData] = useState<InsightsData | null>(null);
  const [chartView, setChartView] = useState<ChartView>('Daily');

  useFocusEffect(
    useCallback(() => {
      void getInsightsData().then(setData);
    }, [])
  );

  const styles = StyleSheet.create({
    safeArea: { backgroundColor: colors.bg, flex: 1, paddingHorizontal: 18, paddingTop: 10 },
    content: { paddingBottom: 32 },
    centered: { alignItems: 'center', flex: 1, justifyContent: 'center' },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20, marginTop: 4 },
    statCard: {
      alignItems: 'center',
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 14,
      borderWidth: 1,
      flex: 1,
      paddingVertical: 14,
    },
    statValue: { color: colors.textStrong, fontSize: 22, fontWeight: '700' },
    statLabel: { color: colors.textSubdued, fontSize: 12, marginTop: 2 },
    statSubValue: { color: colors.textMuted, fontSize: 11, marginTop: 1 },
    sectionTitle: {
      color: colors.textLabel,
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 0.3,
      marginBottom: 10,
      textTransform: 'uppercase',
    },
    chartCard: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 14,
      borderWidth: 1,
      marginBottom: 20,
      padding: 16,
    },
    barsContainer: { flexDirection: 'row', height: 140, alignItems: 'flex-end', gap: 6 },
    barWrapper: { alignItems: 'center', flex: 1 },
    barValue: { color: colors.textLabel, fontSize: 11, fontWeight: '600', marginBottom: 4, height: 16 },
    barTrack: {
      borderRadius: 4,
      height: 100,
      overflow: 'hidden',
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    },
    barFill: { borderRadius: 4, width: '100%' },
    barLabel: { color: colors.textMuted, fontSize: 10, marginTop: 6 },
    barLabelToday: { color: colors.primary, fontWeight: '600' },
    barDateNumber: { color: colors.textMuted, fontSize: 9, marginTop: 2 },
    toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
    toggleChip: { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 7 },
    toggleChipSelected: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
    toggleChipText: { color: colors.text, fontSize: 13, fontWeight: '500' },
    toggleChipTextSelected: { color: colors.primary, fontWeight: '600' },
    breakdownCard: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: 14,
      borderWidth: 1,
      marginBottom: 20,
      padding: 16,
    },
    catRow: { marginBottom: 14 },
    catLabelRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 6 },
    catDot: { borderRadius: 999, height: 10, width: 10, marginRight: 8 },
    catName: { color: colors.textStrong, flex: 1, fontSize: 14, fontWeight: '500' },
    catPct: { color: colors.textSubdued, fontSize: 13, fontWeight: '600' },
    progressTrack: { backgroundColor: colors.divider, borderRadius: 999, height: 12, overflow: 'hidden' },
    progressFill: { borderRadius: 999, height: 12 },
    streakRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
    streakRowBorder: { borderBottomColor: colors.divider, borderBottomWidth: 1 },
    streakLeft: { alignItems: 'center', flexDirection: 'row', gap: 8, flex: 1 },
    streakRank: { color: colors.textMuted, fontSize: 13, fontWeight: '600', width: 28 },
    streakName: { color: colors.textStrong, fontSize: 14, fontWeight: '500', flex: 1 },
    streakBadge: {
      alignItems: 'center',
      backgroundColor: colors.tealLight,
      borderRadius: 8,
      flexDirection: 'row',
      gap: 3,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    streakValue: { color: colors.tealDark, fontSize: 14, fontWeight: '700' },
    streakUnit: { color: colors.teal, fontSize: 11 },
    empty: { color: colors.textMuted, fontSize: 14, paddingVertical: 8, textAlign: 'center' },
  });

  if (!data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Insights" icon="bar-chart-outline" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      </SafeAreaView>
    );
  }

  if (data.totalHabits === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Insights" icon="bar-chart-outline" />
        <EmptyState
          icon="bar-chart-outline"
          title="No data yet"
          subtitle="Add some habits and start logging to see your progress here."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Insights" icon="bar-chart-outline" />

        <View style={styles.statsRow}>
          <StatCard label="Habits" value={String(data.totalHabits)} styles={styles} />
          <StatCard
            label="Completed habits"
            value={`${data.weeklyCompletionRate}%`}
            accent="#22C55E"
            styles={styles}
          />
          <StatCard label="Best streak" value={String(data.bestStreak)} accent="#3B82F6" styles={styles} />
        </View>

        <View style={styles.toggleRow}>
          {CHART_VIEWS.map((v) => (
            <Pressable
              key={v}
              onPress={() => setChartView(v)}
              accessibilityRole="button"
              accessibilityLabel={`${v} view`}
              style={[styles.toggleChip, chartView === v && styles.toggleChipSelected]}
            >
              <Text style={[styles.toggleChipText, chartView === v && styles.toggleChipTextSelected]}>{v}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>
          {chartView === 'Daily'
            ? 'Daily completions — last 7 days'
            : chartView === 'Weekly'
            ? 'Weekly completions — last 4 weeks'
            : 'Monthly completions — last 3 months'}
        </Text>
        <View style={styles.chartCard}>
          <View style={styles.barsContainer}>
            {(() => {
              const bars =
                chartView === 'Daily'
                  ? data.dailyTotals.map((d) => ({ key: d.date, label: d.label, subLabel: d.label !== 'Today' ? String(new Date(d.date).getDate()) : undefined, count: d.count, highlight: d.label === 'Today' }))
                  : chartView === 'Weekly'
                  ? data.weeklyTotals.map((w, i) => ({ key: String(i), label: w.label, subLabel: undefined, count: w.count, highlight: false }))
                  : data.monthlyTotals.map((m, i) => ({ key: String(i), label: m.label, subLabel: undefined, count: m.count, highlight: false }));
              const maxCount = Math.max(...bars.map((b) => b.count), 1);
              return bars.map((bar) => {
                const heightPx = Math.round((bar.count / maxCount) * 100);
                return (
                  <View key={bar.key} style={styles.barWrapper}>
                    <Text style={styles.barValue}>{bar.count > 0 ? bar.count : ''}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { height: heightPx, backgroundColor: bar.highlight ? colors.primary : colors.teal }]} />
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[styles.barLabel, bar.highlight && styles.barLabelToday]}>{bar.label}</Text>
                      {bar.subLabel ? <Text style={styles.barDateNumber}>{bar.subLabel}</Text> : null}
                    </View>
                  </View>
                );
              });
            })()}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Category breakdown — last 28 days</Text>
        <View style={styles.breakdownCard}>
          {(() => {
            const totalCompleted = data.categoryBreakdown.reduce((s, c) => s + c.completed, 0);
            return data.categoryBreakdown.map((cat) => {
              const pct = totalCompleted > 0 ? Math.round((cat.completed / totalCompleted) * 100) : 0;
              const accent = midtoneColor(cat.color);
              return (
                <View key={cat.name} style={styles.catRow}>
                  <View style={styles.catLabelRow}>
                    <View style={[styles.catDot, { backgroundColor: accent }]} />
                    <Text style={styles.catName}>{cat.name}</Text>
                    <Text style={styles.catPct}>{pct}%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: accent }]} />
                  </View>
                </View>
              );
            });
          })()}
        </View>

        <Text style={styles.sectionTitle}>Top streaks</Text>
        <View style={styles.breakdownCard}>
          {data.topStreaks.map((item, i) => (
            <View key={item.name} style={[styles.streakRow, i < data.topStreaks.length - 1 && styles.streakRowBorder]}>
              <View style={styles.streakLeft}>
                <Text style={styles.streakRank}>#{i + 1}</Text>
                <View style={[styles.catDot, { backgroundColor: midtoneColor(item.color) }]} />
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

function StatCard({ label, value, subValue, accent, styles }: { label: string; value: string; subValue?: string; accent?: string; styles: any }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, accent ? { color: accent } : undefined]}>{value}</Text>
      {subValue ? <Text style={styles.statSubValue}>{subValue}</Text> : null}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}
