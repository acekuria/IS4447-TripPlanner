import { and, desc, eq } from 'drizzle-orm';
import { db } from './client';
import { categories, habitLogs, habits } from './schema';

export type HabitRecord = {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  frequency: string;
  count: number;
  completedToday: boolean;
  currentStreak: number;
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
      count: habits.count,
    })
    .from(habits)
    .innerJoin(categories, eq(habits.categoryId, categories.id));

  const logs = await db
    .select({
      habitId: habitLogs.habitId,
      date: habitLogs.date,
    })
    .from(habitLogs);

  const today = getTodayDateString();
  const logDatesByHabit = new Map<number, string[]>();

  for (const log of logs) {
    const dates = logDatesByHabit.get(log.habitId) ?? [];
    dates.push(log.date);
    logDatesByHabit.set(log.habitId, dates);
  }

  return rows.map((habit) => {
    const logDates = logDatesByHabit.get(habit.id) ?? [];

    return {
      ...habit,
      completedToday: logDates.includes(today),
      currentStreak: calculateStreak(logDates, habit.frequency),
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
