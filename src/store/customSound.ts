import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CustomSoundState {
  uri: string | null;
  name: string | null;
  setCustomSound: (uri: string, name: string) => void;
  clearCustomSound: () => void;
}

export const useCustomSoundStore = create<CustomSoundState>()(
  persist(
    (set) => ({
      uri: null,
      name: null,
      setCustomSound: (uri, name) => set({ uri, name }),
      clearCustomSound: () => set({ uri: null, name: null }),
    }),
    {
      name: 'despertador-custom-sound',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
