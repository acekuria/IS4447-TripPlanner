import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

export const sqlite = openDatabaseSync('habits.db');

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
`);

const categoryColumns = sqlite.getAllSync<{ name: string }>('PRAGMA table_info(categories);');
const hasColorColumn = categoryColumns.some((column) => column.name === 'color');

if (!hasColorColumn) {
  sqlite.execSync(`ALTER TABLE categories ADD COLUMN color TEXT NOT NULL DEFAULT '#64748B';`);
}

export const db = drizzle(sqlite);
