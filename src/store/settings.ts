import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  weatherEnabled: boolean;
  setWeatherEnabled: (value: boolean) => void;
  /** Cielo en vivo como fondo de todas las pantallas (no solo Inicio). */
  skyBackgroundEnabled: boolean;
  setSkyBackgroundEnabled: (value: boolean) => void;
  /** Habilita crear despertadores de prueba que suenan en 1 minuto. */
  testAlarmEnabled: boolean;
  setTestAlarmEnabled: (value: boolean) => void;
  /** Habilita crear despertadores clásicos (hora fija) además de los solares. */
  classicAlarmsEnabled: boolean;
  setClassicAlarmsEnabled: (value: boolean) => void;
}

// persist hace un merge superficial del estado guardado sobre este inicial,
// así que los campos nuevos toman su default en instalaciones existentes.
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      weatherEnabled: false,
      setWeatherEnabled: (value) => set({ weatherEnabled: value }),
      skyBackgroundEnabled: true,
      setSkyBackgroundEnabled: (value) => set({ skyBackgroundEnabled: value }),
      testAlarmEnabled: false,
      setTestAlarmEnabled: (value) => set({ testAlarmEnabled: value }),
      classicAlarmsEnabled: false,
      setClassicAlarmsEnabled: (value) => set({ classicAlarmsEnabled: value }),
    }),
    {
      name: 'despertador-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
