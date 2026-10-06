import { AlarmEngine } from '@modules/alarm-engine';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import {
  cancelAllScheduledRings,
  configureAndroidChannel,
  ensureNotificationPermissions,
  MAX_RINGS,
  scheduleAlarmRings,
  SNOOZE_INTERVAL_MIN,
} from '@/lib/alarmNotifications';
import { resolveAlarmSoundFileUri } from '@/lib/alarmSoundFile';
import { useCustomSoundStore } from '@/store/customSound';
import { useLocationStore } from '@/store/location';

import { getAlarmWakeMessage } from './constants';
import { findNextOccurrence, getAlarmTimeForDate } from './schedule';
import { useAlarmsStore } from './store';

const RESCHEDULE_INTERVAL_MS = 15 * 60_000;
const CHECK_INTERVAL_MS = 15_000;
// Igual a MAX_RINGS * SNOOZE_INTERVAL_MIN de alarmNotifications.ts, con
// margen. Si el nativo reporta una alarma "sonando" más vieja que esto, algo
// quedó mal cerrado (el servicio murió sin avisar) — se ignora en vez de
// redirigir a la pantalla de alarma en cada apertura de la app.
const STALE_RINGING_MS = 16 * 60_000;

// Ver la nota en alarmNotifications.ts: en Expo Go, expo-notifications no se
// puede importar en absoluto sin crashear la app.
const isExpoGo = Constants.appOwnership === 'expo';
function getNotifications() {
  if (isExpoGo) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('expo-notifications') as typeof import('expo-notifications');
}

export function useAlarmScheduler(): void {
  const alarms = useAlarmsStore((state) => state.alarms);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const customSoundUri = useCustomSoundStore((state) => state.uri);
  const runningRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function reschedule() {
      if (runningRef.current) return;
      runningRef.current = true;
      try {
        await runReschedule();
      } finally {
        runningRef.current = false;
      }
    }

    async function runReschedule() {
      const enabledAlarms = alarms.filter((alarm) => alarm.enabled && alarm.activeDays.length > 0);
      await cancelAllScheduledRings();
      AlarmEngine?.cancelAll();
      if (cancelled || enabledAlarms.length === 0 || latitude == null || longitude == null) return;

      const granted = await ensureNotificationPermissions();
      if (!granted || cancelled) return;
      await configureAndroidChannel();

      const now = new Date();
      for (const alarm of enabledAlarms) {
        const next = findNextOccurrence(alarm, now, latitude, longitude);
        if (!next) continue;

        const wakeMessage = getAlarmWakeMessage(alarm);

        if (AlarmEngine) {
          // Android nativo: AlarmManager + servicio que suena con la app
          // cerrada. Reemplaza a las notificaciones de "ring" (no se programan
          // ambas, sonarían dos veces).
          const soundUri = await resolveAlarmSoundFileUri(alarm.sound, customSoundUri);
          if (cancelled) return;
          AlarmEngine.scheduleAlarm(
            alarm.id,
            next.date.getTime(),
            alarm.name || 'Despertador',
            wakeMessage,
            soundUri,
            alarm.id,
            next.date.toISOString()
          );
        } else {
          await scheduleAlarmRings(alarm.id, alarm.name, next.date, wakeMessage);
        }
      }
    }

    reschedule();
    const interval = setInterval(reschedule, RESCHEDULE_INTERVAL_MS);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') reschedule();
    });

    return () => {
      cancelled = true;
      clearInterval(interval);
      subscription.remove();
    };
  }, [alarms, latitude, longitude, customSoundUri]);
}

export function useAlarmRingWatcher(): void {
  const router = useRouter();
  const alarms = useAlarmsStore((state) => state.alarms);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const shownRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    function openRingingScreen(alarmId: string, occurrenceIso: string) {
      const key = `${alarmId}-${occurrenceIso}`;
      if (shownRef.current.has(key)) return;
      shownRef.current.add(key);
      // Diferido al próximo tick: cuando la app arranca en frío con una alarma
      // ya sonando, este efecto corre durante el commit inicial de layout
      // effects de toda la app — navegar ahí mismo, antes de que el navegador
      // termine de montarse, hace que expo-router entre en un loop de
      // actualizaciones ("Maximum update depth exceeded") y la app queda
      // trabada. setTimeout(0) lo saca de esa fase síncrona.
      setTimeout(() => {
        router.push({
          pathname: '/alarma-sonando',
          params: { alarmId, occurrence: occurrenceIso },
        });
      }, 0);
    }

    function checkNative() {
      const ringing = AlarmEngine?.getRingingAlarm();
      if (!ringing) return;

      const occurrenceMs = new Date(ringing.occurrenceIso).getTime();
      if (Number.isNaN(occurrenceMs) || Date.now() - occurrenceMs > STALE_RINGING_MS) {
        AlarmEngine?.stopRinging();
        return;
      }
      openRingingScreen(ringing.alarmId, ringing.occurrenceIso);
    }

    function checkNow() {
      // Con el motor nativo, la única fuente de verdad es el servicio que está
      // sonando: abrir la pantalla por horario además podría adelantarse al
      // servicio y hacer sonar el audio de la app encima del nativo.
      if (AlarmEngine) {
        checkNative();
        return;
      }
      if (latitude == null || longitude == null) return;
      const now = new Date();

      for (const alarm of alarms) {
        if (!alarm.enabled || !alarm.activeDays.includes(now.getDay())) continue;

        const occurrence = getAlarmTimeForDate(alarm, now, latitude, longitude);
        if (!occurrence) continue;

        const windowEnd = occurrence.getTime() + MAX_RINGS * SNOOZE_INTERVAL_MIN * 60_000;
        if (now.getTime() < occurrence.getTime() || now.getTime() >= windowEnd) continue;

        openRingingScreen(alarm.id, occurrence.toISOString());
        break;
      }
    }

    checkNow();
    const interval = setInterval(checkNow, CHECK_INTERVAL_MS);
    const ringSubscription = AlarmEngine?.addListener('onRing', (event) =>
      openRingingScreen(event.alarmId, event.occurrenceIso)
    );
    // Al volver a la app (p. ej. desde la notificación de la alarma) no hay que
    // esperar al próximo tick del intervalo.
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkNow();
    });

    const Notifications = getNotifications();
    const responseSubscription = Notifications?.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as
          | { alarmId?: string; occurrenceIso?: string }
          | undefined;
        if (data?.alarmId && data?.occurrenceIso) {
          openRingingScreen(data.alarmId, data.occurrenceIso);
        }
      }
    );

    Notifications?.getLastNotificationResponseAsync().then((response) => {
      const data = response?.notification.request.content.data as
        | { alarmId?: string; occurrenceIso?: string }
        | undefined;
      if (data?.alarmId && data?.occurrenceIso) {
        openRingingScreen(data.alarmId, data.occurrenceIso);
      }
    });

    return () => {
      clearInterval(interval);
      ringSubscription?.remove();
      appStateSubscription.remove();
      responseSubscription?.remove();
    };
  }, [alarms, latitude, longitude, router]);
}
