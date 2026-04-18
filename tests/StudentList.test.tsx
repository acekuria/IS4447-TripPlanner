import { render } from '@testing-library/react-native';
import React from 'react';
import IndexScreen from '../app/(tabs)/index';
import { HabitContext } from '../app/_layout';
import type { Habit } from '../app/_layout';

jest.mock('@/db/client', () => ({
  sqlite: { execSync: jest.fn(), getAllSync: jest.fn(() => []) },
}));

jest.mock('expo-drizzle-studio-plugin', () => ({
  useDrizzleStudio: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useSegments: () => ['(tabs)'],
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('@/contexts/auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    user: { id: 1, name: 'Test User', email: 'test@test.com' },
    isLoading: false,
    logout: jest.fn(),
  }),
}));

const mockHabit: Habit = {
  id: 1,
  name: 'Drink Water',
  categoryId: 1,
  categoryName: 'Health',
  categoryColor: '#22C55E',
  frequency: 'daily',
  logType: 'completion',
  notes: null,
  count: 0,
  completedToday: false,
  todayCount: 0,
  currentStreak: 3,
  targetCount: null,
  targetPeriod: null,
  targetProgress: 0,
  targetMet: false,
  hasLogThisWeek: true,
  hasLogThisMonth: true,
};

describe('IndexScreen', () => {
  it('renders the habit, add button, and streak', () => {
    const { getByText, getAllByText } = render(
      <HabitContext.Provider value={{ habits: [mockHabit], setHabits: jest.fn() }}>
        <IndexScreen />
      </HabitContext.Provider>
    );

    expect(getByText('Drink Water')).toBeTruthy();
    expect(getByText('Add Habit')).toBeTruthy();
    expect(getByText('Mark as done today')).toBeTruthy();
    // Streak renders as "3 days" via the InfoTag
    expect(getByText('3 days')).toBeTruthy();
    expect(getAllByText('Health').length).toBeGreaterThan(0);
  });
});
