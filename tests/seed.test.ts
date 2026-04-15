import { db } from '../db/client';
import { seedHabitsIfEmpty } from '../db/seed';

jest.mock('../db/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

const mockDb = db as unknown as { select: jest.Mock; insert: jest.Mock };

describe('seedHabitsIfEmpty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inserts categories and habits when the tables are empty', async () => {
    const mockCategoryInsert = jest.fn().mockResolvedValue(undefined);
    const mockHabitInsert = jest.fn().mockResolvedValue(undefined);
    const mockFrom = jest.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    mockDb.select.mockReturnValue({ from: mockFrom });
    mockDb.insert
      .mockReturnValueOnce({ values: mockCategoryInsert })
      .mockReturnValueOnce({ values: mockHabitInsert });

    await seedHabitsIfEmpty();

    expect(mockCategoryInsert).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: 'Health', color: '#22C55E' })])
    );
    expect(mockHabitInsert).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: 'Drink Water' })])
    );
  });

  it('does not insert habits when habits already exist', async () => {
    const mockFrom = jest
      .fn()
      .mockResolvedValueOnce([{ id: 1, name: 'Health', color: '#22C55E' }])
      .mockResolvedValueOnce([
        { id: 1, name: 'Drink Water', categoryId: 1, frequency: 'daily', count: 0 },
      ]);

    mockDb.select.mockReturnValue({ from: mockFrom });

    await seedHabitsIfEmpty();

    expect(mockDb.insert).not.toHaveBeenCalled();
  });
});
