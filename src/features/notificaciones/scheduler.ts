import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { useAlarmsStore } from '@/features/despertadores/store';
import { ensureNotificationPermissions } from '@/lib/alarmNotifications';
import {
  cancelAllDayNotifications,
  configureDayNotificationChannel,
  scheduleDayNotification,
} from '@/lib/dayNotifications';
import { DayStages, getDayStages, isValidStageTime } from '@/lib/sunTimes';
import { useLocationStore } from '@/store/location';
import { useNotificationPrefsStore } from '@/store/notificationPrefs';

import { getNextAlarmOccurrence } from '../despertadores/schedule';
import { DAY_NOTIFICATIONS, DayNotificationDefinition } from './catalog';

const RESCHEDULE_INTERVAL_MS = 15 * 60_000;

function nextSunStageOccurrence(
  stage: keyof DayStages,
  now: Date,
  latitude: number,
  longitude: number
): Date | null {
  const today = getDayStages(now, latitude, longitude)[stage];
  if (isValidStageTime(today) && today.getTime() > now.getTime()) return today;

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const next = getDayStages(tomorrow, latitude, longitude)[stage];
  return isValidStageTime(next) ? next : null;
}

function computeOccurrence(
  def: DayNotificationDefinition,
  now: Date,
  latitude: number,
  longitude: number,
  nextAlarmDate: Date | null
): Date | null {
  if (def.trigger.kind === 'sunStage') {
    return nextSunStageOccurrence(def.trigger.stage, now, latitude, longitude);
  }

  if (!nextAlarmDate) return null;
  const target = new Date(nextAlarmDate.getTime() - def.trigger.hoursBefore * 3600_000);
  return target.getTime() > now.getTime() ? target : null;
}

export function useDayNotificationsScheduler(): void {
  const enabledMap = useNotificationPrefsStore((state) => state.enabled);
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
      await cancelAllDayNotifications();
      if (cancelled || latitude == null || longitude == null) return;

      const enabledDefs = DAY_NOTIFICATIONS.filter((def) => enabledMap[def.id]);
      if (enabledDefs.length === 0) return;

      const granted = await ensureNotificationPermissions();
      if (!granted || cancelled) return;
      await configureDayNotificationChannel();

      const now = new Date();
      const nextAlarm = getNextAlarmOccurrence(alarms, now, latitude, longitude);

      for (const def of enabledDefs) {
        const occurrence = computeOccurrence(
          def,
          now,
          latitude,
          longitude,
          nextAlarm?.date ?? null
        );
        if (occurrence) await scheduleDayNotification(def, occurrence);
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
  }, [enabledMap, alarms, latitude, longitude]);
}
