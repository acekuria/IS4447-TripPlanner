import { sql, eq } from 'drizzle-orm';
import { db } from './client';
import { categories, habits, targets } from './schema';

const defaultCategories = [
  { id: 1, name: 'Health', color: '#22C55E' },
  { id: 2, name: 'Learning', color: '#3B82F6' },
  { id: 3, name: 'Productivity', color: '#F59E0B' },
];

const defaultHabits = [
  { name: 'Drink Water', categoryId: 1, frequency: 'daily' as const, count: 0 },
  { name: 'Read for 20 Minutes', categoryId: 2, frequency: 'daily' as const, count: 0 },
  { name: 'Plan the Week', categoryId: 3, frequency: 'weekly' as const, count: 0 },
];

export async function seedHabitsIfEmpty() {
  const existingCategories = await db.select().from(categories);

  await db
    .insert(categories)
    .values(defaultCategories)
    .onConflictDoUpdate({ target: categories.id, set: { color: sql`excluded.color` } });

  const existingHabits = await db.select().from(habits);

  if (existingHabits.length === 0) {
    await db.insert(habits).values(defaultHabits);
  }

  const weeklyHabits = await db
    .select({ id: habits.id })
    .from(habits)
    .where(eq(habits.frequency, 'weekly'));

  for (const habit of weeklyHabits) {
    await db
      .insert(targets)
      .values({ habitId: habit.id, targetCount: 1, period: 'weekly' })
      .onConflictDoNothing();
  }
}
