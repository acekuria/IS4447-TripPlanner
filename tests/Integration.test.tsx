/**
 * Integration test: IndexScreen filter behaviour.
 * The screen is rendered with a pre-populated HabitContext so no DB is touched.
 */

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// ─── Module mocks ─────────────────────────────────────────────────────────────

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSegments: () => ['(tabs)'],
  Stack: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('expo-drizzle-studio-plugin', () => ({
  useDrizzleStudio: jest.fn(),
}));

jest.mock('@/db/client', () => ({
  sqlite: { execSync: jest.fn(), getAllSync: jest.fn(() => []) },
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

// ─── Fixture data ─────────────────────────────────────────────────────────────

import { HabitContext } from '../app/_layout';
import type { Habit } from '../app/_layout';
import IndexScreen from '../app/(tabs)/index';

const makeHabit = (overrides: Partial<Habit>): Habit => ({
  id: 1,
  name: 'Default Habit',
  categoryId: 1,
  categoryName: 'Health',
  categoryColor: '#22C55E',
  frequency: 'daily',
  logType: 'completion',
  notes: null,
  count: 0,
  completedToday: false,
  todayCount: 0,
  currentStreak: 0,
  targetCount: null,
  targetPeriod: null,
  targetProgress: 0,
  targetMet: false,
  hasLogThisWeek: false,
  hasLogThisMonth: false,
  ...overrides,
});

const mockHabits: Habit[] = [
  makeHabit({ id: 1, name: 'Morning Run', categoryName: 'Health', frequency: 'daily' }),
  makeHabit({ id: 2, name: 'Read',        categoryName: 'Learning', frequency: 'daily' }),
  makeHabit({ id: 3, name: 'Plan Week',   categoryName: 'Productivity', frequency: 'weekly' }),
];

function renderWithContext(habits: Habit[]) {
  return render(
    <HabitContext.Provider value={{ habits, setHabits: jest.fn() }}>
      <IndexScreen />
    </HabitContext.Provider>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('IndexScreen — habit list filters', () => {
  it('renders all habits when no filter is applied', () => {
    const { getByText } = renderWithContext(mockHabits);
    expect(getByText('Morning Run')).toBeTruthy();
    expect(getByText('Read')).toBeTruthy();
    expect(getByText('Plan Week')).toBeTruthy();
  });

  it('filters habits by search query', () => {
    const { getByPlaceholderText, getByText, queryByText } = renderWithContext(mockHabits);
    fireEvent.changeText(getByPlaceholderText('Search by habit or category'), 'run');
    expect(getByText('Morning Run')).toBeTruthy();
    expect(queryByText('Read')).toBeNull();
    expect(queryByText('Plan Week')).toBeNull();
  });

  it('filters habits by category name in search', () => {
    const { getByPlaceholderText, getByText, queryByText } = renderWithContext(mockHabits);
    fireEvent.changeText(getByPlaceholderText('Search by habit or category'), 'learning');
    expect(getByText('Read')).toBeTruthy();
    expect(queryByText('Morning Run')).toBeNull();
  });

  it('filters habits by frequency', () => {
    const { getAllByText, getByText, queryByText } = renderWithContext(mockHabits);
    // 'weekly' appears in both the filter pill and habit frequency tags — press the first one
    fireEvent.press(getAllByText('weekly')[0]);
    expect(getByText('Plan Week')).toBeTruthy();
    expect(queryByText('Morning Run')).toBeNull();
    expect(queryByText('Read')).toBeNull();
  });

  it('shows empty state message when no habits match', () => {
    const { getByPlaceholderText, getByText } = renderWithContext(mockHabits);
    fireEvent.changeText(getByPlaceholderText('Search by habit or category'), 'zzznomatch');
    expect(getByText('No habits match your filters')).toBeTruthy();
  });
});
