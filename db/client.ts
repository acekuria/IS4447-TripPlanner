import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

export const sqlite = openDatabaseSync('habits.db');

// CREATE TABLE IF NOT EXISTS means this is safe to run every time the app starts
sqlite.execSync(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly')),
    count INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    value INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE (habit_id, date)
  );

  CREATE UNIQUE INDEX IF NOT EXISTS habit_logs_habit_date_idx
  ON habit_logs (habit_id, date);

  CREATE TABLE IF NOT EXISTS targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL UNIQUE,
    weekly_target INTEGER NOT NULL DEFAULT 1,
    period TEXT NOT NULL DEFAULT 'weekly',
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  -- CHECK (id = 1) enforces a single-row table so there's only ever one active session
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
  );
`);

// ALTER TABLE is used to add columns that didn't exist in the original schema
// without wiping existing data — basically a manual migration
const habitColumns = sqlite.getAllSync<{ name: string }>('PRAGMA table_info(habits);');
if (!habitColumns.some((c) => c.name === 'log_type')) {
  sqlite.execSync(`ALTER TABLE habits ADD COLUMN log_type TEXT NOT NULL DEFAULT 'completion';`);
}
if (!habitColumns.some((c) => c.name === 'notes')) {
  sqlite.execSync(`ALTER TABLE habits ADD COLUMN notes TEXT;`);
}

const targetColumns = sqlite.getAllSync<{ name: string }>('PRAGMA table_info(targets);');
if (targetColumns.length > 0 && !targetColumns.some((c) => c.name === 'period')) {
  sqlite.execSync(`ALTER TABLE targets ADD COLUMN period TEXT NOT NULL DEFAULT 'weekly';`);
}

const categoryColumns = sqlite.getAllSync<{ name: string }>('PRAGMA table_info(categories);');

if (!categoryColumns.some((c) => c.name === 'color')) {
  sqlite.execSync(`ALTER TABLE categories ADD COLUMN color TEXT NOT NULL DEFAULT '#64748B';`);
}

if (!categoryColumns.some((c) => c.name === 'user_id')) {
  // Recreate categories with user_id and per-user unique constraint.
  // FK checks are disabled so existing habit references stay intact during the swap.
  sqlite.execSync(`PRAGMA foreign_keys = OFF;`);
  sqlite.execSync(`
    CREATE TABLE categories_new (
      id   INTEGER PRIMARY KEY,
      name TEXT    NOT NULL,
      color TEXT   NOT NULL DEFAULT '#64748B',
      user_id INTEGER REFERENCES users(id),
      UNIQUE(name, user_id)
    );
    INSERT OR IGNORE INTO categories_new (id, name, color)
      SELECT id, name, color FROM categories;
    DROP TABLE categories;
    ALTER TABLE categories_new RENAME TO categories;
  `);
  sqlite.execSync(`PRAGMA foreign_keys = ON;`);
}

if (!habitColumns.some((c) => c.name === 'user_id')) {
  sqlite.execSync(`ALTER TABLE habits ADD COLUMN user_id INTEGER REFERENCES users(id);`);
}

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS notification_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    enabled INTEGER NOT NULL DEFAULT 1,
    hour INTEGER NOT NULL DEFAULT 20,
    minute INTEGER NOT NULL DEFAULT 0
  );
`);

export const db = drizzle(sqlite);
