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
import { useLocationStore } from '@/store/location';

import { findNextOccurrence, getAlarmTimeForDate } from './schedule';
import { useAlarmsStore } from './store';

const RESCHEDULE_INTERVAL_MS = 15 * 60_000;
const CHECK_INTERVAL_MS = 15_000;

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
      if (cancelled || enabledAlarms.length === 0 || latitude == null || longitude == null) return;

      const granted = await ensureNotificationPermissions();
      if (!granted || cancelled) return;
      await configureAndroidChannel();

      const now = new Date();
      for (const alarm of enabledAlarms) {
        const next = findNextOccurrence(alarm, now, latitude, longitude);
        if (next) await scheduleAlarmRings(alarm.id, alarm.name, next.date);
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
  }, [alarms, latitude, longitude]);
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
      router.push({
        pathname: '/alarma-sonando',
        params: { alarmId, occurrence: occurrenceIso },
      });
    }

    function checkNow() {
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
      responseSubscription?.remove();
    };
  }, [alarms, latitude, longitude, router]);
}
