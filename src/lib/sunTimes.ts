import * as SunCalc from 'suncalc';

import { SunStageType } from '@/types/alarm';

export interface DayStages {
  astronomicalDawn: Date | null;
  nauticalDawn: Date | null;
  civilDawn: Date | null;
  sunrise: Date | null;
  solarNoon: Date | null;
  sunset: Date | null;
  civilDusk: Date | null;
  nauticalDusk: Date | null;
  astronomicalDusk: Date | null;
}

const STAGE_FIELD: Record<SunStageType, keyof DayStages> = {
  astronomical: 'astronomicalDawn',
  nautical: 'nauticalDawn',
  civil: 'civilDawn',
  sunrise: 'sunrise',
};

export function getDayStages(date: Date, latitude: number, longitude: number): DayStages {
  const times = SunCalc.getTimes(date, latitude, longitude);
  return {
    astronomicalDawn: times.nightEnd,
    nauticalDawn: times.nauticalDawn,
    civilDawn: times.dawn,
    sunrise: times.sunrise,
    solarNoon: times.solarNoon,
    sunset: times.sunset,
    civilDusk: times.dusk,
    nauticalDusk: times.nauticalDusk,
    astronomicalDusk: times.night,
  };
}

export function getStageTime(
  date: Date,
  latitude: number,
  longitude: number,
  stage: SunStageType
): Date | null {
  const stages = getDayStages(date, latitude, longitude);
  return stages[STAGE_FIELD[stage]];
}

export function applyOffset(date: Date, offsetMinutes: number): Date {
  return new Date(date.getTime() + offsetMinutes * 60_000);
}

export function isValidStageTime(date: Date | null): date is Date {
  return date !== null && !Number.isNaN(date.getTime());
}
