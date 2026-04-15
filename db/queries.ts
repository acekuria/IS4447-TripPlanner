import { eq } from 'drizzle-orm';
import { db } from './client';
import { categories, habits } from './schema';

export type HabitRecord = {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  frequency: string;
  count: number;
};

export async function getHabits(): Promise<HabitRecord[]> {
  const rows = await db
    .select({
      id: habits.id,
      name: habits.name,
      categoryId: habits.categoryId,
      categoryName: categories.name,
      frequency: habits.frequency,
      count: habits.count,
    })
    .from(habits)
    .innerJoin(categories, eq(habits.categoryId, categories.id));

  return rows;
}

export async function getCategories() {
  return db.select().from(categories);
}
