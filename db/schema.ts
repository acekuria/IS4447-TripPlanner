import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color').notNull(),
});

export const habits = sqliteTable('habits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id),
  frequency: text('frequency').notNull(),
  count: integer('count').notNull().default(0),
});

export const habitLogs = sqliteTable(
  'habit_logs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    habitId: integer('habit_id')
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' }),
    date: text('date').notNull(),
    value: integer('value').notNull().default(1),
  },
  (table) => ({
    habitDateUnique: uniqueIndex('habit_logs_habit_date_idx').on(table.habitId, table.date),
  })
);

export const targets = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  habitId: integer('habit_id')
    .notNull()
    .unique()
    .references(() => habits.id, { onDelete: 'cascade' }),
  targetCount: integer('weekly_target').notNull().default(1),
  period: text('period').notNull().default('weekly'),
});
