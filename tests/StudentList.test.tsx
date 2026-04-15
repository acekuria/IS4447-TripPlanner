import { render } from '@testing-library/react-native';
import IndexScreen from '../app/(tabs)/index';
import { HabitContext } from '../app/_layout';

jest.mock('@/db/client', () => ({
  sqlite: {},
}));

jest.mock('expo-drizzle-studio-plugin', () => ({
  useDrizzleStudio: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

const mockHabit = {
  id: 1,
  name: 'Drink Water',
  categoryId: 1,
  categoryName: 'Health',
  categoryColor: '#22C55E',
  frequency: 'daily',
  count: 0,
  completedToday: false,
  currentStreak: 3,
};

describe('IndexScreen', () => {
  it('renders the habit and the add button', () => {
    const { getByText, getAllByText } = render(
      <HabitContext.Provider value={{ habits: [mockHabit], setHabits: jest.fn() }}>
        <IndexScreen />
      </HabitContext.Provider>
    );

    expect(getByText('Drink Water')).toBeTruthy();
    expect(getByText('Add Habit')).toBeTruthy();
    expect(getByText('Mark as done today')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
    expect(getAllByText('Health').length).toBeGreaterThan(0);
  });
});
