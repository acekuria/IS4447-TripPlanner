import { and, desc, eq } from 'drizzle-orm';
import { db, sqlite } from './client';
import { categories, habitLogs, habits, targets, users } from './schema';

export type HabitRecord = {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  frequency: string;
  logType: 'completion' | 'count';
  notes: string | null;
  count: number;
  completedToday: boolean;
  todayCount: number;
  currentStreak: number;
  targetCount: number | null;
  targetPeriod: 'weekly' | 'monthly' | null;
  targetProgress: number;
  targetMet: boolean;
  hasLogThisWeek: boolean;
  hasLogThisMonth: boolean;
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
  // walk backwards from today, counting consecutive days with a log
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
      notes: habits.notes,
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

  // group all logs by habit id so we don't have to filter the full array repeatedly below
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

    const hasLogThisWeek = habitLogEntries.some((l) => l.date >= weekStart && l.date <= weekEnd);
    const hasLogThisMonth = habitLogEntries.some((l) => l.date.startsWith(currentMonth));

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
      hasLogThisWeek,
      hasLogThisMonth,
    };
  });
}

export async function getCategories() {
  return db.select().from(categories);
}

export async function getCategoriesWithCount() {
  const cats = await db.select().from(categories);
  const habitRows = await db.select({ categoryId: habits.categoryId }).from(habits);

  const countMap = new Map<number, number>();
  for (const h of habitRows) {
    countMap.set(h.categoryId, (countMap.get(h.categoryId) ?? 0) + 1);
  }

  return cats.map((cat) => ({ ...cat, habitCount: countMap.get(cat.id) ?? 0 }));
}

export async function createCategory(name: string, color: string) {
  await db.insert(categories).values({ name, color });
}

export async function updateCategory(id: number, name: string, color: string) {
  await db.update(categories).set({ name, color }).where(eq(categories.id, id));
}

export async function deleteCategory(id: number): Promise<{ success: boolean; reason?: string }> {
  const linked = await db.select({ id: habits.id }).from(habits).where(eq(habits.categoryId, id));
  if (linked.length > 0) {
    return { success: false, reason: `${linked.length} habit${linked.length === 1 ? '' : 's'} still use this category` };
  }
  await db.delete(categories).where(eq(categories.id, id));
  return { success: true };
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

export type InsightsData = {
  totalHabits: number;
  weeklyCompletionRate: number;
  bestStreak: number;
  dailyTotals: Array<{ date: string; label: string; count: number }>;
  categoryBreakdown: Array<{
    name: string;
    color: string;
    completed: number;
    possible: number;
  }>;
  topStreaks: Array<{ name: string; streak: number; color: string }>;
};

export async function getInsightsData(): Promise<InsightsData> {
  const habitRows = await db
    .select({
      id: habits.id,
      name: habits.name,
      frequency: habits.frequency,
      categoryId: habits.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(habits)
    .innerJoin(categories, eq(habits.categoryId, categories.id));

  const allLogs = await db
    .select({ habitId: habitLogs.habitId, date: habitLogs.date, value: habitLogs.value })
    .from(habitLogs);

  const today = parseDateString(getTodayDateString());

  // Build last-7-days date list
  const days: Array<{ date: string; label: string }> = [];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({ date: formatDateString(d), label: i === 0 ? 'Today' : dayLabels[d.getDay()] });
  }

  const logsByHabit = new Map<number, string[]>();
  const logsByDate = new Map<string, number>();
  for (const log of allLogs) {
    const arr = logsByHabit.get(log.habitId) ?? [];
    arr.push(log.date);
    logsByHabit.set(log.habitId, arr);
    if (days.some((d) => d.date === log.date)) {
      logsByDate.set(log.date, (logsByDate.get(log.date) ?? 0) + 1);
    }
  }

  const dailyTotals = days.map((d) => ({
    date: d.date,
    label: d.label,
    count: logsByDate.get(d.date) ?? 0,
  }));

  // Weekly completion rate: logged habits / (habits × 7 days) for daily habits this week
  const weekDates = new Set(days.map((d) => d.date));
  const dailyHabits = habitRows.filter((h) => h.frequency === 'daily');
  const possible = dailyHabits.length * 7;
  const completed = allLogs.filter(
    (l) => weekDates.has(l.date) && dailyHabits.some((h) => h.id === l.habitId)
  ).length;
  const weeklyCompletionRate = possible > 0 ? Math.round((completed / possible) * 100) : 0;

  // Best streak across all habits
  const streaks = habitRows.map((h) => {
    const dates = logsByHabit.get(h.id) ?? [];
    return calculateStreak(dates, h.frequency);
  });
  const bestStreak = streaks.length > 0 ? Math.max(...streaks) : 0;

  // Category breakdown: completion days in last 28 days
  const past28 = new Set<string>();
  for (let i = 0; i < 28; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    past28.add(formatDateString(d));
  }
  const catMap = new Map<
    number,
    { name: string; color: string; completed: number; possible: number }
  >();
  for (const h of habitRows) {
    if (!catMap.has(h.categoryId)) {
      catMap.set(h.categoryId, { name: h.categoryName, color: h.categoryColor, completed: 0, possible: 0 });
    }
    const entry = catMap.get(h.categoryId)!;
    const habitDates = logsByHabit.get(h.id) ?? [];
    const daysInPeriod = h.frequency === 'daily' ? 28 : 4;
    entry.possible += daysInPeriod;
    entry.completed += habitDates.filter((d) => past28.has(d)).length;
  }
  const categoryBreakdown = Array.from(catMap.values());

  // Top streaks
  const topStreaks = habitRows
    .map((h, i) => ({ name: h.name, streak: streaks[i], color: h.categoryColor }))
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 5);

  return {
    totalHabits: habitRows.length,
    weeklyCompletionRate,
    bestStreak,
    dailyTotals,
    categoryBreakdown,
    topStreaks,
  };
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

// ─── Auth ─────────────────────────────────────────────────────────────────────
// passwords are stored as plain text here — in a real app you'd hash them with bcrypt

export type AuthUser = { id: number; name: string; email: string };

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ success: true; user: AuthUser } | { success: false; error: string }> {
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email.toLowerCase()));
  if (existing.length > 0) return { success: false, error: 'An account with that email already exists.' };

  const now = getTodayDateString();
  const result = await db
    .insert(users)
    .values({ name: name.trim(), email: email.toLowerCase().trim(), password, createdAt: now })
    .returning({ id: users.id, name: users.name, email: users.email });

  const user = result[0];
  sqlite.execSync(`INSERT OR REPLACE INTO sessions (id, user_id) VALUES (1, ${user.id})`);
  return { success: true, user };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: true; user: AuthUser } | { success: false; error: string }> {
  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email, password: users.password })
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()));

  if (rows.length === 0) return { success: false, error: 'No account found with that email.' };
  if (rows[0].password !== password) return { success: false, error: 'Incorrect password.' };

  const user = { id: rows[0].id, name: rows[0].name, email: rows[0].email };
  sqlite.execSync(`INSERT OR REPLACE INTO sessions (id, user_id) VALUES (1, ${user.id})`);
  return { success: true, user };
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const rows = sqlite.getAllSync<{ user_id: number }>(
    'SELECT user_id FROM sessions WHERE id = 1'
  );
  if (rows.length === 0) return null;

  const userRows = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, rows[0].user_id));

  return userRows[0] ?? null;
}

export function logoutUser() {
  sqlite.execSync('DELETE FROM sessions WHERE id = 1');
}

export async function deleteUser(id: number) {
  logoutUser();
  await db.delete(users).where(eq(users.id, id));
}
