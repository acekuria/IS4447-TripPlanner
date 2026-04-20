// Drizzle schema — these definitions mirror the CREATE TABLE statements in client.ts
// and are used for type-safe queries throughout the app
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  userId: integer('user_id').references(() => users.id),
});

export const habits = sqliteTable('habits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id),
  frequency: text('frequency').notNull(),
  logType: text('log_type').notNull().default('completion'),
  notes: text('notes'),
  count: integer('count').notNull().default(0),
  userId: integer('user_id').references(() => users.id),
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

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: text('created_at').notNull(),
});

export const notificationSettings = sqliteTable('notification_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  enabled: integer('enabled').notNull().default(1),
  hour: integer('hour').notNull().default(20),
  minute: integer('minute').notNull().default(0),
});

export const targets = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  habitId: integer('habit_id')
    .notNull()
    .unique() // one target per habit max
    .references(() => habits.id, { onDelete: 'cascade' }),
  targetCount: integer('weekly_target').notNull().default(1),
  period: text('period').notNull().default('weekly'),
});
