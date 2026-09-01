import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { dateKey } from '@/store/tracking';
import { MicroActivityType } from '@/types/alarm';

export type MicroActivityInstanceStatus = 'pending' | 'completed' | 'expired';
export type DismissStatus = 'onTime' | 'late';

export interface MicroActivityInstance {
  key: string;
  alarmId: string;
  alarmName: string;
  occurrenceIso: string;
  type: MicroActivityType;
  customLabel?: string;
  completionWindowMinutes: number;
  dismissStatus: DismissStatus;
  status: MicroActivityInstanceStatus;
  startedAt: string;
  deadline: string;
  completedAt?: string;
}

export function instanceKeyFor(alarmId: string, occurrenceIso: string): string {
  return `${alarmId}::${occurrenceIso}`;
}

export function countCompletedDays(instances: Record<string, MicroActivityInstance>): number {
  const days = new Set<string>();
  for (const instance of Object.values(instances)) {
    if (instance.status === 'completed') {
      days.add(dateKey(new Date(instance.occurrenceIso)));
    }
  }
  return days.size;
}

interface StartInstanceInput {
  alarmId: string;
  alarmName: string;
  occurrenceIso: string;
  type: MicroActivityType;
  customLabel?: string;
  completionWindowMinutes: number;
  dismissStatus: DismissStatus;
}

interface MicroActivityState {
  instances: Record<string, MicroActivityInstance>;
  startInstance: (input: StartInstanceInput) => MicroActivityInstance;
  completeInstance: (key: string) => void;
  expireInstance: (key: string) => void;
  expireInstancesForAlarm: (alarmId: string) => void;
}

export const useMicroActivityStore = create<MicroActivityState>()(
  persist(
    (set, get) => ({
      instances: {},
      startInstance: (input) => {
        const key = instanceKeyFor(input.alarmId, input.occurrenceIso);
        const startedAt = new Date();
        const deadline = new Date(startedAt.getTime() + input.completionWindowMinutes * 60_000);

        const instance: MicroActivityInstance = {
          key,
          alarmId: input.alarmId,
          alarmName: input.alarmName,
          occurrenceIso: input.occurrenceIso,
          type: input.type,
          customLabel: input.customLabel,
          completionWindowMinutes: input.completionWindowMinutes,
          dismissStatus: input.dismissStatus,
          status: 'pending',
          startedAt: startedAt.toISOString(),
          deadline: deadline.toISOString(),
        };

        set((state) => ({ instances: { ...state.instances, [key]: instance } }));
        return instance;
      },
      completeInstance: (key) => {
        const existing = get().instances[key];
        if (!existing || existing.status !== 'pending') return;
        set((state) => ({
          instances: {
            ...state.instances,
            [key]: { ...existing, status: 'completed', completedAt: new Date().toISOString() },
          },
        }));
      },
      expireInstance: (key) => {
        const existing = get().instances[key];
        if (!existing || existing.status !== 'pending') return;
        set((state) => ({
          instances: { ...state.instances, [key]: { ...existing, status: 'expired' } },
        }));
      },
      expireInstancesForAlarm: (alarmId) => {
        set((state) => {
          const instances = { ...state.instances };
          for (const instance of Object.values(instances)) {
            if (instance.alarmId === alarmId && instance.status === 'pending') {
              instances[instance.key] = { ...instance, status: 'expired' };
            }
          }
          return { instances };
        });
      },
    }),
    {
      name: 'despertador-microactivities',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
