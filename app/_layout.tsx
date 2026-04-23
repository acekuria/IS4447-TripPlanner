import { AuthProvider, useAuth } from '@/contexts/auth';
import { ThemeProvider } from '@/contexts/theme';
import { getHabits, getNotificationSettings, HabitRecord } from '@/db/queries';
import { seedHabitsIfEmpty } from '@/db/seed';
import { cancelAllReminders, requestNotificationPermission, scheduleDailyReminder } from '@/utils/notifications';
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

      const granted = await requestNotificationPermission();
      if (granted) {
        const settings = await getNotificationSettings();
        if (settings.enabled) {
          await scheduleDailyReminder(settings.hour, settings.minute);
        } else {
          await cancelAllReminders();
        }
      }
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
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
