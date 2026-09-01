import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  weatherEnabled: boolean;
  setWeatherEnabled: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      weatherEnabled: false,
      setWeatherEnabled: (value) => set({ weatherEnabled: value }),
    }),
    {
      name: 'despertador-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
