import { getNextAlarmOccurrence } from '@/features/despertadores/schedule';
import { useAlarmsStore } from '@/features/despertadores/store';
import { formatCountdown, formatTime } from '@/lib/format';
import { getSkyColors } from '@/lib/skyGradient';
import { getSunPositionInfo } from '@/lib/sunPosition';
import { useLocationStore } from '@/store/location';

export interface SkyWidgetData {
  hasLocation: boolean;
  phaseLabel: string;
  degrees: number;
  topColor: string;
  bottomColor: string;
  nextAlarmTime: string | null;
  nextAlarmCountdown: string | null;
}

const NO_LOCATION_DATA: SkyWidgetData = {
  hasLocation: false,
  phaseLabel: '',
  degrees: 0,
  topColor: '#0B0C1A',
  bottomColor: '#181B3D',
  nextAlarmTime: null,
  nextAlarmCountdown: null,
};

/**
 * Un update de widget puede correr en un motor de JS "headless" recién
 * arrancado (la app principal no está necesariamente abierta), donde los
 * stores persistidos todavía no terminaron de hidratarse desde AsyncStorage.
 * Por eso se espera la rehidratación antes de leer el estado — pero solo si
 * hace falta: forzar rehydrate() cuando la app ya está corriendo en primer
 * plano reemplaza `alarms`/`latitude`/`longitude` por arrays/objetos nuevos
 * (mismo contenido, otra referencia), lo que retrigguea cualquier efecto que
 * dependa de esos valores — incluido este mismo hook — y entra en loop
 * infinito ("Maximum update depth exceeded").
 */
export async function computeSkyWidgetData(): Promise<SkyWidgetData> {
  await Promise.all([
    useAlarmsStore.persist.hasHydrated() ? Promise.resolve() : useAlarmsStore.persist.rehydrate(),
    useLocationStore.persist.hasHydrated()
      ? Promise.resolve()
      : useLocationStore.persist.rehydrate(),
  ]);

  const { latitude, longitude } = useLocationStore.getState();
  if (latitude == null || longitude == null) return NO_LOCATION_DATA;

  const now = new Date();
  const sunInfo = getSunPositionInfo(now, latitude, longitude);
  const [topColor, bottomColor] = getSkyColors(sunInfo.altitudeDeg);

  const alarms = useAlarmsStore.getState().alarms;
  const next = getNextAlarmOccurrence(alarms, now, latitude, longitude);

  return {
    hasLocation: true,
    phaseLabel: sunInfo.phaseLabel,
    degrees: Math.round(sunInfo.altitudeDeg),
    topColor,
    bottomColor,
    nextAlarmTime: next ? formatTime(next.date) : null,
    nextAlarmCountdown: next ? formatCountdown(next.date, now) : null,
  };
}
