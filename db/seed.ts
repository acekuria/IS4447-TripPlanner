import { db } from './client';
import { categories, habits } from './schema';

const defaultCategories = [
  { id: 1, name: 'Health' },
  { id: 2, name: 'Learning' },
  { id: 3, name: 'Productivity' },
];

const defaultHabits = [
  { name: 'Drink Water', categoryId: 1, frequency: 'daily' as const, count: 0 },
  { name: 'Read for 20 Minutes', categoryId: 2, frequency: 'daily' as const, count: 0 },
  { name: 'Plan the Week', categoryId: 3, frequency: 'weekly' as const, count: 0 },
];

export async function seedHabitsIfEmpty() {
  const existingCategories = await db.select().from(categories);

  if (existingCategories.length === 0) {
    await db.insert(categories).values(defaultCategories);
  }

  const existingHabits = await db.select().from(habits);

  if (existingHabits.length > 0) {
    return;
  }

  await db.insert(habits).values(defaultHabits);
}
