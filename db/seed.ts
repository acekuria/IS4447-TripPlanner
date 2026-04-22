import { eq, inArray } from 'drizzle-orm';
import { db, sqlite } from './client';
import { categories, habitLogs, habits, targets } from './schema';

// ─── helpers ─────────────────────────────────────────────────────────────────

function dateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildDates(
  totalDays: number,
  include: (dayIndex: number, dayOfWeek: number) => boolean
): string[] {
  const dates: string[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (include(i, d.getDay())) dates.push(dateStr(d));
  }
  return dates;
}

// ─── categories ──────────────────────────────────────────────────────────────

const defaultCategories = [
  { name: 'Health', color: '#C8F7DC' },
  { name: 'Learning', color: '#C4DEF6' },
  { name: 'Productivity', color: '#FFD9C4' },
];

// ─── habits ──────────────────────────────────────────────────────────────────

const defaultHabits = [
  {
    name: 'Drink Water',
    category: 'Health',
    frequency: 'daily' as const,
    logType: 'count' as const,
    notes: 'Aim for 8 glasses a day',
    count: 0,
  },
  {
    name: 'Morning Run',
    category: 'Health',
    frequency: 'daily' as const,
    logType: 'completion' as const,
    notes: '20–30 minutes at a comfortable pace',
    count: 0,
  },
  {
    name: 'Meditate',
    category: 'Health',
    frequency: 'daily' as const,
    logType: 'completion' as const,
    notes: null,
    count: 0,
  },
  {
    name: 'Read',
    category: 'Learning',
    frequency: 'daily' as const,
    logType: 'completion' as const,
    notes: 'At least 20 pages',
    count: 0,
  },
  {
    name: 'Online Course',
    category: 'Learning',
    frequency: 'weekly' as const,
    logType: 'completion' as const,
    notes: null,
    count: 0,
  },
  {
    name: 'Plan the Week',
    category: 'Productivity',
    frequency: 'weekly' as const,
    logType: 'completion' as const,
    notes: 'Sunday evenings — review goals and schedule',
    count: 0,
  },
  {
    name: 'Deep Work',
    category: 'Productivity',
    frequency: 'daily' as const,
    logType: 'completion' as const,
    notes: '2-hour blocks, no distractions',
    count: 0,
  },
];

// ─── targets (weekly) ────────────────────────────────────────────────────────

const habitTargets: Record<string, { targetCount: number; period: 'weekly' | 'monthly' }> = {
  'Drink Water':   { targetCount: 56, period: 'weekly' },   // 8 glasses × 7 days
  'Morning Run':   { targetCount: 4,  period: 'weekly' },
  'Meditate':      { targetCount: 6,  period: 'weekly' },
  'Read':          { targetCount: 5,  period: 'weekly' },
  'Online Course': { targetCount: 2,  period: 'weekly' },
  'Plan the Week': { targetCount: 1,  period: 'weekly' },
  'Deep Work':     { targetCount: 5,  period: 'weekly' },
};

// ─── log patterns (56 days = 8 weeks) ────────────────────────────────────────

type LogEntry = { date: string; value: number };

function buildLogs(name: string): LogEntry[] {
  const DAYS = 56;

  switch (name) {
    case 'Drink Water':
      // Count-based: 5–9 glasses, skips one day per week
      return buildDates(DAYS, (i) => i % 8 !== 4).map((date, idx) => ({
        date,
        value: 5 + (idx % 5),
      }));

    case 'Morning Run':
      // Mon, Wed, Fri, Sat — misses a few weeks
      return buildDates(DAYS, (i, dow) => [1, 3, 5, 6].includes(dow) && i % 21 !== 0).map((date) => ({
        date,
        value: 1,
      }));

    case 'Meditate':
      // Almost daily — skips Sundays and every 9th day
      return buildDates(DAYS, (i, dow) => dow !== 0 && i % 9 !== 0).map((date) => ({
        date,
        value: 1,
      }));

    case 'Read':
      // Weekdays only, misses one Friday in four
      return buildDates(DAYS, (i, dow) => [1, 2, 3, 4, 5].includes(dow) && !(dow === 5 && i % 28 < 7)).map((date) => ({
        date,
        value: 1,
      }));

    case 'Online Course':
      // Tuesdays and Thursdays
      return buildDates(DAYS, (_, dow) => [2, 4].includes(dow)).map((date) => ({
        date,
        value: 1,
      }));

    case 'Plan the Week':
      // Every Sunday
      return buildDates(DAYS, (_, dow) => dow === 0).map((date) => ({
        date,
        value: 1,
      }));

    case 'Deep Work':
      // Mon–Fri, misses Wednesdays every other week
      return buildDates(DAYS, (i, dow) => {
        if (![1, 2, 3, 4, 5].includes(dow)) return false;
        if (dow === 3 && Math.floor(i / 7) % 2 === 0) return false;
        return true;
      }).map((date) => ({ date, value: 1 }));

    default:
      return [];
  }
}

// Exported for unit testing — allows tests to verify data integrity without a live DB
export { defaultCategories as SEED_CATEGORIES, defaultHabits as SEED_HABITS, habitTargets as SEED_HABIT_TARGETS, buildLogs as buildSeedLogs };

// ─── main seed function ───────────────────────────────────────────────────────

export async function seedHabitsIfEmpty() {
  const rows = sqlite.getAllSync<{ user_id: number }>('SELECT user_id FROM sessions WHERE id = 1');
  const userId = rows[0]?.user_id ?? null;
  if (!userId) return;

  // upsert this user's default categories — UNIQUE(name, user_id) prevents duplicates
  await db
    .insert(categories)
    .values(defaultCategories.map((c) => ({ ...c, userId })))
    .onConflictDoNothing();

  // Build name → id map from this user's categories
  const userCategories = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.userId, userId));
  const categoryIdByName = Object.fromEntries(userCategories.map((c) => [c.name, c.id]));
  const userCategoryIds = new Set(userCategories.map((c) => c.id));

  // Remap any existing habits that point to categories not owned by this user.
  // This happens when old categories were migrated with user_id = NULL while habits
  // keep their original category IDs.
  const existingHabits = await db
    .select({ id: habits.id, categoryId: habits.categoryId })
    .from(habits)
    .where(eq(habits.userId, userId));

  const orphaned = existingHabits.filter((h) => !userCategoryIds.has(h.categoryId));
  if (orphaned.length > 0) {
    const oldCatIds = [...new Set(orphaned.map((h) => h.categoryId))];
    const oldCats = await db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(inArray(categories.id, oldCatIds));
    const oldCatNameById = Object.fromEntries(oldCats.map((c) => [c.id, c.name]));
    for (const habit of orphaned) {
      const newCatId = categoryIdByName[oldCatNameById[habit.categoryId]];
      if (newCatId) {
        await db.update(habits).set({ categoryId: newCatId }).where(eq(habits.id, habit.id));
      }
    }
  }

  // skip if this user already has habits — don't seed twice for the same account
  if (existingHabits.length > 0) {
    await seedTargets(userId);
    return;
  }

  await db.insert(habits).values(
    defaultHabits.map(({ category, ...h }) => ({
      ...h,
      categoryId: categoryIdByName[category],
      userId,
    }))
  );
  await seedTargets(userId);
  await seedLogs(userId);
}

async function seedTargets(userId: number) {
  const allHabits = await db.select({ id: habits.id, name: habits.name }).from(habits).where(eq(habits.userId, userId));
  for (const habit of allHabits) {
    const target = habitTargets[habit.name];
    if (!target) continue;
    await db
      .insert(targets)
      .values({ habitId: habit.id, targetCount: target.targetCount, period: target.period })
      .onConflictDoNothing();
  }
}

async function seedLogs(userId: number) {
  const allHabits = await db.select({ id: habits.id, name: habits.name }).from(habits).where(eq(habits.userId, userId));
  for (const habit of allHabits) {
    const logs = buildLogs(habit.name);
    if (logs.length === 0) continue;
    await db
      .insert(habitLogs)
      .values(logs.map((l) => ({ habitId: habit.id, date: l.date, value: l.value })))
      .onConflictDoNothing();
  }
}
