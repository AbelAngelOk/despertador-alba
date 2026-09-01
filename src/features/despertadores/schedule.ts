import { useMemo } from 'react';

import { applyOffset, getStageTime, isValidStageTime } from '@/lib/sunTimes';
import { useLocationStore } from '@/store/location';
import { Alarm } from '@/types/alarm';

import { useAlarmsStore } from './store';

const DAYS_TO_LOOK_AHEAD = 8;

export function getAlarmTimeForDate(
  alarm: Alarm,
  date: Date,
  latitude: number,
  longitude: number
): Date | null {
  const stageTime = getStageTime(date, latitude, longitude, alarm.stage);
  if (!isValidStageTime(stageTime)) return null;
  return applyOffset(stageTime, alarm.offsetMinutes);
}

export interface AlarmOccurrence {
  alarm: Alarm;
  date: Date;
}

export function findNextOccurrence(
  alarm: Alarm,
  from: Date,
  latitude: number,
  longitude: number
): AlarmOccurrence | null {
  for (let dayOffset = 0; dayOffset < DAYS_TO_LOOK_AHEAD; dayOffset++) {
    const candidateDate = new Date(from);
    candidateDate.setDate(candidateDate.getDate() + dayOffset);
    if (!alarm.activeDays.includes(candidateDate.getDay())) continue;

    const occurrence = getAlarmTimeForDate(alarm, candidateDate, latitude, longitude);
    if (!occurrence || occurrence.getTime() <= from.getTime()) continue;

    return { alarm, date: occurrence };
  }
  return null;
}

export function getNextAlarmOccurrence(
  alarms: Alarm[],
  from: Date,
  latitude: number,
  longitude: number
): AlarmOccurrence | null {
  const candidates = alarms
    .filter((alarm) => alarm.enabled && alarm.activeDays.length > 0)
    .map((alarm) => findNextOccurrence(alarm, from, latitude, longitude))
    .filter((occurrence): occurrence is AlarmOccurrence => occurrence !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return candidates[0] ?? null;
}

export function useNextAlarm(): AlarmOccurrence | null {
  const alarms = useAlarmsStore((state) => state.alarms);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);

  return useMemo(() => {
    if (latitude == null || longitude == null) return null;
    return getNextAlarmOccurrence(alarms, new Date(), latitude, longitude);
  }, [alarms, latitude, longitude]);
}
