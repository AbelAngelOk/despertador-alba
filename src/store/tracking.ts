import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type DayStatus = 'onTime' | 'late' | 'missed';

interface TrackingState {
  entries: Record<string, DayStatus>;
  logResult: (dateKey: string, status: DayStatus) => void;
  markMissed: (dateKeys: string[]) => void;
}

export const useTrackingStore = create<TrackingState>()(
  persist(
    (set) => ({
      entries: {},
      logResult: (dateKey, status) =>
        set((state) => ({ entries: { ...state.entries, [dateKey]: status } })),
      markMissed: (dateKeys) =>
        set((state) => {
          const entries = { ...state.entries };
          for (const key of dateKeys) {
            if (!entries[key]) entries[key] = 'missed';
          }
          return { entries };
        }),
    }),
    {
      name: 'despertador-tracking',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function countWakeDays(entries: Record<string, DayStatus>): number {
  return Object.values(entries).filter((status) => status === 'onTime' || status === 'late').length;
}

export function computeStreak(entries: Record<string, DayStatus>): number {
  let streak = 0;
  const day = new Date();
  day.setHours(0, 0, 0, 0);

  if (!entries[dateKey(day)]) {
    day.setDate(day.getDate() - 1);
  }

  while (true) {
    const status = entries[dateKey(day)];
    if (status === 'onTime' || status === 'late') {
      streak++;
      day.setDate(day.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
