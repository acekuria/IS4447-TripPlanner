import { and, desc, eq } from 'drizzle-orm';
import { db } from './client';
import { categories, habitLogs, habits, targets } from './schema';

export type HabitRecord = {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  frequency: string;
  logType: 'completion' | 'count';
  count: number;
  completedToday: boolean;
  todayCount: number;
  currentStreak: number;
  targetCount: number | null;
  targetPeriod: 'weekly' | 'monthly' | null;
  targetProgress: number;
  targetMet: boolean;
};

export type HabitProgress = {
  currentStreak: number;
  recentLogs: Array<{
    id: number;
    date: string;
    value: number;
  }>;
};

export function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateString(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateString(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function getWeekStart(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function calculateDailyStreak(logDates: string[]) {
  const logSet = new Set(logDates);
  let streak = 0;
  let current = parseDateString(getTodayDateString());

  while (logSet.has(formatDateString(current))) {
    streak += 1;
    current = addDays(current, -1);
  }

  return streak;
}

function calculateWeeklyStreak(logDates: string[]) {
  const weekSet = new Set(logDates.map((date) => formatDateString(getWeekStart(parseDateString(date)))));
  let streak = 0;
  let currentWeek = getWeekStart(parseDateString(getTodayDateString()));

  while (weekSet.has(formatDateString(currentWeek))) {
    streak += 1;
    currentWeek = addDays(currentWeek, -7);
  }

  return streak;
}

function calculateStreak(logDates: string[], frequency: string) {
  return frequency === 'weekly' ? calculateWeeklyStreak(logDates) : calculateDailyStreak(logDates);
}

export async function getHabits(): Promise<HabitRecord[]> {
  const rows = await db
    .select({
      id: habits.id,
      name: habits.name,
      categoryId: habits.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
      frequency: habits.frequency,
      logType: habits.logType,
      count: habits.count,
    })
    .from(habits)
    .innerJoin(categories, eq(habits.categoryId, categories.id));

  const logs = await db
    .select({
      habitId: habitLogs.habitId,
      date: habitLogs.date,
      value: habitLogs.value,
    })
    .from(habitLogs);

  const targetsRows = await db.select().from(targets);

  const today = getTodayDateString();
  const weekStart = formatDateString(getWeekStart(parseDateString(today)));
  const weekEnd = formatDateString(addDays(parseDateString(weekStart), 6));
  const currentMonth = today.slice(0, 7);

  const logsByHabit = new Map<number, Array<{ date: string; value: number }>>();
  for (const log of logs) {
    const arr = logsByHabit.get(log.habitId) ?? [];
    arr.push({ date: log.date, value: log.value });
    logsByHabit.set(log.habitId, arr);
  }

  const targetByHabit = new Map(targetsRows.map((t) => [t.habitId, t]));

  return rows.map((habit) => {
    const habitLogEntries = logsByHabit.get(habit.id) ?? [];
    const logDates = habitLogEntries.map((l) => l.date);
    const logType = (habit.logType ?? 'completion') as 'completion' | 'count';

    const todayEntry = habitLogEntries.find((l) => l.date === today);
    const todayCount = todayEntry?.value ?? 0;

    const targetRow = targetByHabit.get(habit.id) ?? null;
    const targetCount = targetRow?.targetCount ?? null;
    const targetPeriod = (targetRow?.period ?? null) as 'weekly' | 'monthly' | null;

    let targetProgress = 0;
    if (targetPeriod === 'weekly') {
      const periodEntries = habitLogEntries.filter((l) => l.date >= weekStart && l.date <= weekEnd);
      targetProgress = logType === 'count'
        ? periodEntries.reduce((sum, l) => sum + l.value, 0)
        : periodEntries.length;
    } else if (targetPeriod === 'monthly') {
      const periodEntries = habitLogEntries.filter((l) => l.date.startsWith(currentMonth));
      targetProgress = logType === 'count'
        ? periodEntries.reduce((sum, l) => sum + l.value, 0)
        : periodEntries.length;
    }

    return {
      ...habit,
      logType,
      completedToday: todayCount > 0,
      todayCount,
      currentStreak: calculateStreak(logDates, habit.frequency),
      targetCount,
      targetPeriod,
      targetProgress,
      targetMet: targetCount !== null && targetProgress >= targetCount,
    };
  });
}

export async function getCategories() {
  return db.select().from(categories);
}

export async function markHabitDoneToday(habitId: number) {
  const today = getTodayDateString();
  const existingLog = await db
    .select({ id: habitLogs.id })
    .from(habitLogs)
    .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, today)));

  if (existingLog.length > 0) {
    return false;
  }

  await db.insert(habitLogs).values({
    habitId,
    date: today,
    value: 1,
  });

  return true;
}

export async function unmarkHabitDoneToday(habitId: number) {
  const today = getTodayDateString();

  await db
    .delete(habitLogs)
    .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, today)));
}

export async function setHabitTarget(habitId: number, targetCount: number, period: 'weekly' | 'monthly') {
  await db
    .insert(targets)
    .values({ habitId, targetCount, period })
    .onConflictDoUpdate({ target: targets.habitId, set: { targetCount, period } });
}

export async function deleteHabitTarget(habitId: number) {
  await db.delete(targets).where(eq(targets.habitId, habitId));
}

export async function incrementHabitCount(habitId: number) {
  const today = getTodayDateString();
  const existing = await db
    .select({ id: habitLogs.id, value: habitLogs.value })
    .from(habitLogs)
    .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, today)));

  if (existing.length > 0) {
    await db
      .update(habitLogs)
      .set({ value: existing[0].value + 1 })
      .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, today)));
  } else {
    await db.insert(habitLogs).values({ habitId, date: today, value: 1 });
  }
}

export async function decrementHabitCount(habitId: number) {
  const today = getTodayDateString();
  const existing = await db
    .select({ id: habitLogs.id, value: habitLogs.value })
    .from(habitLogs)
    .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, today)));

  if (existing.length === 0) return;

  if (existing[0].value <= 1) {
    await db
      .delete(habitLogs)
      .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, today)));
  } else {
    await db
      .update(habitLogs)
      .set({ value: existing[0].value - 1 })
      .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, today)));
  }
}

export async function getHabitProgress(habitId: number, frequency: string): Promise<HabitProgress> {
  const logs = await db
    .select({
      id: habitLogs.id,
      date: habitLogs.date,
      value: habitLogs.value,
    })
    .from(habitLogs)
    .where(eq(habitLogs.habitId, habitId))
    .orderBy(desc(habitLogs.date));

  const logDates = logs.map((log) => log.date);
  const currentStreak = calculateStreak(logDates, frequency);

  return {
    currentStreak,
    recentLogs: logs.slice(0, 7),
  };
}
