import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface NotificationPrefsState {
  enabled: Record<string, boolean>;
  setEnabled: (id: string, value: boolean) => void;
}

export const useNotificationPrefsStore = create<NotificationPrefsState>()(
  persist(
    (set) => ({
      enabled: {},
      setEnabled: (id, value) => set((state) => ({ enabled: { ...state.enabled, [id]: value } })),
    }),
    {
      name: 'despertador-notification-prefs',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
