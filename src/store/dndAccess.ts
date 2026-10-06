import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface DndAccessState {
  /** true = el usuario eligió explícitamente no configurar el acceso a "No molestar"; no volver a ofrecérselo al abrir la app. */
  declined: boolean;
  setDeclined: (value: boolean) => void;
}

export const useDndAccessStore = create<DndAccessState>()(
  persist(
    (set) => ({
      declined: false,
      setDeclined: (value) => set({ declined: value }),
    }),
    {
      name: 'despertador-dnd-access',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
