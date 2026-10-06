import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { generateId } from '@/lib/id';
import { Alarm, AlarmInput } from '@/types/alarm';

import { useMicroActivityStore } from './microActivityStore';

/** Cuánto falta para que suene un despertador de prueba, ver Alarm.testRingAt. */
export const TEST_ALARM_DELAY_MS = 60_000;

interface AlarmsState {
  alarms: Alarm[];
  addAlarm: (input: AlarmInput) => string;
  addTestAlarm: (input: AlarmInput) => string;
  updateAlarm: (id: string, input: AlarmInput) => void;
  removeAlarm: (id: string) => void;
  /**
   * Igual que removeAlarm pero sin expirar microactividades del alarmId: se usa
   * al apagar un despertador de prueba, que puede haber arrancado una
   * microactividad instantes antes que no debe cortarse por la limpieza.
   */
  removeTestAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  /**
   * "Sonar de nuevo" desde la pantalla de alarma: fija (o limpia, con `null`)
   * el próximo horario absoluto en el que va a sonar, por encima del cálculo
   * normal — ver Alarm.postponedUntil y schedule.ts.
   */
  setPostponedUntil: (id: string, untilIso: string | null) => void;
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
      addTestAlarm: (input) => {
        const id = generateId();
        set((state) => ({
          alarms: [
            ...state.alarms,
            {
              ...input,
              // Todos los días habilitados para que los filtros por día no lo
              // descarten; el horario real lo define testRingAt, no activeDays.
              activeDays: [0, 1, 2, 3, 4, 5, 6],
              enabled: true,
              testRingAt: new Date(Date.now() + TEST_ALARM_DELAY_MS).toISOString(),
              id,
              createdAt: new Date().toISOString(),
            },
          ],
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
      removeTestAlarm: (id) =>
        set((state) => ({ alarms: state.alarms.filter((alarm) => alarm.id !== id) })),
      toggleAlarm: (id) =>
        set((state) => ({
          alarms: state.alarms.map((alarm) =>
            alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
          ),
        })),
      setPostponedUntil: (id, untilIso) =>
        set((state) => ({
          alarms: state.alarms.map((alarm) =>
            alarm.id === id ? { ...alarm, postponedUntil: untilIso ?? undefined } : alarm
          ),
        })),
    }),
    {
      name: 'despertador-alarms',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
