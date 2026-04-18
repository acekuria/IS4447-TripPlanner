/**
 * Unit tests for seedHabitsIfEmpty.
 * All DB interactions are mocked — no real SQLite is involved.
 */

jest.mock('../db/client', () => ({
  db: { select: jest.fn(), insert: jest.fn() },
  sqlite: { execSync: jest.fn(), getAllSync: jest.fn(() => []) },
}));

jest.mock('drizzle-orm', () => ({
  ...jest.requireActual('drizzle-orm'),
  sql: jest.fn(() => 'excluded.color'),
  eq: jest.fn(),
}));

// Access the already-created mock fns after jest.mock is hoisted
const { db: mockDb } = jest.requireMock('../db/client') as {
  db: { select: jest.Mock; insert: jest.Mock };
};

import { seedHabitsIfEmpty } from '../db/seed';

const makeInsertChain = () => ({
  values: jest.fn().mockReturnThis(),
  onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
  onConflictDoNothing: jest.fn().mockResolvedValue(undefined),
});

describe('seedHabitsIfEmpty', () => {
  let insertChain: ReturnType<typeof makeInsertChain>;

  beforeEach(() => {
    jest.clearAllMocks();
    insertChain = makeInsertChain();
    mockDb.insert.mockReturnValue(insertChain);
  });

  it('runs without throwing when the habits table is empty', async () => {
    mockDb.select.mockReturnValue({ from: jest.fn().mockResolvedValue([]) });
    await expect(seedHabitsIfEmpty()).resolves.toBeUndefined();
  });

  it('calls db.insert for categories on every run (upsert)', async () => {
    mockDb.select.mockReturnValue({ from: jest.fn().mockResolvedValue([]) });
    await seedHabitsIfEmpty();
    expect(mockDb.insert).toHaveBeenCalled();
    expect(insertChain.onConflictDoUpdate).toHaveBeenCalled();
  });

  it('seeds all three default categories', async () => {
    mockDb.select.mockReturnValue({ from: jest.fn().mockResolvedValue([]) });
    await seedHabitsIfEmpty();

    const firstValues = insertChain.values.mock.calls[0]?.[0];
    expect(Array.isArray(firstValues)).toBe(true);
    const names = (firstValues as Array<{ name: string }>).map((c) => c.name);
    expect(names).toEqual(expect.arrayContaining(['Health', 'Learning', 'Productivity']));
  });

  it('inserts default habits when the table is empty', async () => {
    mockDb.select.mockReturnValue({ from: jest.fn().mockResolvedValue([]) });
    await seedHabitsIfEmpty();

    const allArgs = insertChain.values.mock.calls.flat(1).filter(Array.isArray).flat() as Array<{ name?: string; frequency?: string }>;
    const habitNames = allArgs.map((h) => h?.name).filter(Boolean);
    expect(habitNames).toContain('Drink Water');
    expect(habitNames).toContain('Morning Run');
  });

  it('skips inserting habits when rows already exist', async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockResolvedValue([{ id: 1, name: 'Drink Water' }]),
    });
    await seedHabitsIfEmpty();

    // No habit rows should be inserted (only the category upsert fires)
    const habitInserts = insertChain.values.mock.calls.filter((args) => {
      const first = args[0];
      return Array.isArray(first) && (first as Array<{ frequency?: string }>).some((h) => h.frequency);
    });
    expect(habitInserts.length).toBe(0);
  });
});
