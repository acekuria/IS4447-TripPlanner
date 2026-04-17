import { Stack } from 'expo-router';
import { createContext, useEffect, useState } from 'react';
import { seedHabitsIfEmpty } from '@/db/seed';
import { getHabits, HabitRecord } from '@/db/queries';

export type Habit = HabitRecord;

export type Category = {
  id: number;
  name: string;
  color: string;
};

type HabitContextType = {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
};

export const HabitContext = createContext<HabitContextType | null>(null);

export default function RootLayout() {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    const loadHabits = async () => {
      await seedHabitsIfEmpty();
      const rows = await getHabits();
      setHabits(rows);
    };

    void loadHabits();
  }, []);

  return (
    <HabitContext.Provider value={{ habits, setHabits }}>
      <Stack screenOptions={{ headerShown: false }} />
    </HabitContext.Provider>
  );
}
