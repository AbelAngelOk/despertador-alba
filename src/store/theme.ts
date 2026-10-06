import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_THEME_ID, ThemeId } from '@/constants/themes';

interface ThemeState {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeId: DEFAULT_THEME_ID,
      setThemeId: (id) => set({ themeId: id }),
    }),
    {
      name: 'despertador-theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
