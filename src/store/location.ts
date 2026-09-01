import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  label: string | null;
  setLocation: (latitude: number, longitude: number, label?: string) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      latitude: null,
      longitude: null,
      label: null,
      setLocation: (latitude, longitude, label) => set({ latitude, longitude, label: label ?? null }),
      clearLocation: () => set({ latitude: null, longitude: null, label: null }),
    }),
    {
      name: 'despertador-location',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
