import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { WeatherSnapshot } from '@/lib/weather';

const STALE_AFTER_MS = 3 * 60 * 60_000;

interface WeatherState {
  snapshot: WeatherSnapshot | null;
  setSnapshot: (snapshot: WeatherSnapshot) => void;
}

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set) => ({
      snapshot: null,
      setSnapshot: (snapshot) => set({ snapshot }),
    }),
    {
      name: 'despertador-weather',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function isWeatherFresh(snapshot: WeatherSnapshot | null): boolean {
  if (!snapshot) return false;
  return Date.now() - new Date(snapshot.fetchedAt).getTime() < STALE_AFTER_MS;
}
