import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { generateId } from '@/lib/id';
import { Alarm, AlarmInput } from '@/types/alarm';

import { useMicroActivityStore } from './microActivityStore';

interface AlarmsState {
  alarms: Alarm[];
  addAlarm: (input: AlarmInput) => string;
  updateAlarm: (id: string, input: AlarmInput) => void;
  removeAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
}

export const useAlarmsStore = create<AlarmsState>()(
  persist(
    (set) => ({
      alarms: [],
      addAlarm: (input) => {
        const id = generateId();
        set((state) => ({
          alarms: [...state.alarms, { ...input, id, createdAt: new Date().toISOString() }],
        }));
        return id;
      },
      updateAlarm: (id, input) =>
        set((state) => ({
          alarms: state.alarms.map((alarm) => (alarm.id === id ? { ...alarm, ...input } : alarm)),
        })),
      removeAlarm: (id) => {
        useMicroActivityStore.getState().expireInstancesForAlarm(id);
        set((state) => ({ alarms: state.alarms.filter((alarm) => alarm.id !== id) }));
      },
      toggleAlarm: (id) =>
        set((state) => ({
          alarms: state.alarms.map((alarm) =>
            alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
          ),
        })),
    }),
    {
      name: 'despertador-alarms',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
