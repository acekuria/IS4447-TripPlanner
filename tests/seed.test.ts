/**
 * Unit test: verify seedHabitsIfEmpty correctly inserts sample data into all
 * core tables (categories, habits, targets, habit_logs) without duplication.
 * All DB interactions are mocked — no real SQLite is involved.
 */

// ─── Module mocks (must be before any imports) ────────────────────────────────

jest.mock('../db/client', () => ({
  db: { select: jest.fn(), insert: jest.fn(), update: jest.fn() },
  // Return a valid session so seedHabitsIfEmpty does not exit early
  sqlite: { execSync: jest.fn(), getAllSync: jest.fn(() => [{ user_id: 1 }]) },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
  inArray: jest.fn(),
  and: jest.fn(),
  desc: jest.fn(),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const { db: mockDb } = jest.requireMock('../db/client') as {
  db: { select: jest.Mock; insert: jest.Mock; update: jest.Mock };
};

const MOCK_CATEGORIES = [
  { id: 1, name: 'Health' },
  { id: 2, name: 'Learning' },
  { id: 3, name: 'Productivity' },
];

const MOCK_HABITS = [
  { id: 1, name: 'Drink Water' },
  { id: 2, name: 'Morning Run' },
  { id: 3, name: 'Meditate' },
  { id: 4, name: 'Read' },
  { id: 5, name: 'Online Course' },
  { id: 6, name: 'Plan the Week' },
  { id: 7, name: 'Deep Work' },
];

const makeSelectChain = (result: unknown[]) => ({
  from: jest.fn().mockReturnValue({
    where: jest.fn().mockResolvedValue(result),
  }),
});

const makeInsertChain = () => {
  const chain = {
    values: jest.fn(),
    onConflictDoNothing: jest.fn().mockResolvedValue(undefined),
  };
  chain.values.mockReturnValue(chain);
  return chain;
};

const makeUpdateChain = () => ({
  set: jest.fn().mockReturnValue({
    where: jest.fn().mockResolvedValue(undefined),
  }),
});

import { seedHabitsIfEmpty } from '../db/seed';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('seedHabitsIfEmpty', () => {
  let insertChain: ReturnType<typeof makeInsertChain>;

  beforeEach(() => {
    jest.clearAllMocks();
    insertChain = makeInsertChain();
    mockDb.insert.mockReturnValue(insertChain);
    mockDb.update.mockReturnValue(makeUpdateChain());
  });

  it('runs without throwing when the habits table is empty', async () => {
    mockDb.select
      .mockReturnValueOnce(makeSelectChain(MOCK_CATEGORIES))  // user categories
      .mockReturnValueOnce(makeSelectChain([]))                // existing habits (empty)
      .mockReturnValue(makeSelectChain(MOCK_HABITS));          // habits for targets + logs

    await expect(seedHabitsIfEmpty()).resolves.toBeUndefined();
  });

  it('calls db.insert for the categories table on every run', async () => {
    mockDb.select
      .mockReturnValueOnce(makeSelectChain(MOCK_CATEGORIES))
      .mockReturnValueOnce(makeSelectChain([]))
      .mockReturnValue(makeSelectChain(MOCK_HABITS));

    await seedHabitsIfEmpty();

    expect(mockDb.insert).toHaveBeenCalled();
    expect(insertChain.onConflictDoNothing).toHaveBeenCalled();
  });

  it('seeds all three default categories with correct names', async () => {
    mockDb.select
      .mockReturnValueOnce(makeSelectChain(MOCK_CATEGORIES))
      .mockReturnValueOnce(makeSelectChain([]))
      .mockReturnValue(makeSelectChain(MOCK_HABITS));

    await seedHabitsIfEmpty();

    const firstValues = insertChain.values.mock.calls[0]?.[0];
    expect(Array.isArray(firstValues)).toBe(true);
    const names = (firstValues as Array<{ name: string }>).map((c) => c.name);
    expect(names).toEqual(expect.arrayContaining(['Health', 'Learning', 'Productivity']));
  });

  it('inserts habits into the habits table when it is empty', async () => {
    mockDb.select
      .mockReturnValueOnce(makeSelectChain(MOCK_CATEGORIES))
      .mockReturnValueOnce(makeSelectChain([]))               // no existing habits → seed them
      .mockReturnValue(makeSelectChain(MOCK_HABITS));

    await seedHabitsIfEmpty();

    // Flatten all .values() call arguments and look for habit rows
    const allInserted = insertChain.values.mock.calls
      .flat(1)
      .filter(Array.isArray)
      .flat() as Array<{ name?: string; frequency?: string }>;

    const habitNames = allInserted.map((h) => h?.name).filter(Boolean);
    expect(habitNames).toContain('Drink Water');
    expect(habitNames).toContain('Morning Run');
  });

  it('inserts targets for seeded habits', async () => {
    mockDb.select
      .mockReturnValueOnce(makeSelectChain(MOCK_CATEGORIES))
      .mockReturnValueOnce(makeSelectChain([]))
      .mockReturnValue(makeSelectChain(MOCK_HABITS));

    await seedHabitsIfEmpty();

    // insert is called multiple times: categories, habits, targets, logs
    expect(mockDb.insert.mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  it('does not insert habits again when they already exist (no duplication)', async () => {
    const existingHabits = [{ id: 1, categoryId: 1 }];
    mockDb.select
      .mockReturnValueOnce(makeSelectChain(MOCK_CATEGORIES))
      .mockReturnValueOnce(makeSelectChain(existingHabits))   // habits already seeded
      .mockReturnValue(makeSelectChain(MOCK_HABITS));

    await seedHabitsIfEmpty();

    // Only the category upsert and target inserts should fire — no habit rows
    const habitInserts = insertChain.values.mock.calls.filter((args) => {
      const rows = args[0];
      return (
        Array.isArray(rows) &&
        (rows as Array<{ frequency?: string }>).some((h) => h.frequency)
      );
    });
    expect(habitInserts.length).toBe(0);
  });
});
