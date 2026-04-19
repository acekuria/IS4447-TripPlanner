import { AuthProvider, useAuth } from '@/contexts/auth';
import { getHabits, HabitRecord } from '@/db/queries';
import { seedHabitsIfEmpty } from '@/db/seed';
import { useRouter, useSegments, Stack } from 'expo-router';
import { createContext, useEffect, useState } from 'react';

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

function AppNavigator() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    if (isLoading) return;
    const inTabsGroup = segments[0] === '(tabs)';
    const inAuthScreen = segments[0] === 'login' || segments[0] === 'register';
    if (!user && inTabsGroup) {
      router.replace('/login' as never);
    } else if (user && inAuthScreen) {
      router.replace('/(tabs)' as never);
    }
  }, [user, isLoading, segments]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      await seedHabitsIfEmpty();
      const rows = await getHabits();
      setHabits(rows);
    };
    void load();
  }, [user]);

  if (isLoading) return null;

  return (
    <HabitContext.Provider value={{ habits, setHabits }}>
      <Stack screenOptions={{ headerShown: false }} />
    </HabitContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
