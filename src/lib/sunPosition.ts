import * as SunCalc from 'suncalc';

export interface SunPositionInfo {
  altitudeDeg: number;
  isRising: boolean;
  phaseLabel: string;
}

export function getSunPositionInfo(date: Date, latitude: number, longitude: number): SunPositionInfo {
  const position = SunCalc.getPosition(date, latitude, longitude);
  // SunCalc.getPosition().altitude ya viene en grados en esta versión de la
  // librería (suncalc@2.x) — no son radianes, no hace falta convertir.
  const altitudeDeg = position.altitude;
  const times = SunCalc.getTimes(date, latitude, longitude);
  const isRising = times.solarNoon ? date.getTime() < times.solarNoon.getTime() : true;

  return { altitudeDeg, isRising, phaseLabel: getPhaseLabel(altitudeDeg, isRising) };
}

function getPhaseLabel(deg: number, isRising: boolean): string {
  const direction = isRising ? 'amaneciendo' : 'atardeciendo';
  if (deg >= 6) return 'Día';
  if (deg >= 0) return isRising ? 'Saliendo el sol' : 'El sol se está poniendo';
  if (deg >= -6) return `Crepúsculo civil (${direction})`;
  if (deg >= -12) return `Crepúsculo náutico (${direction})`;
  if (deg >= -18) return `Crepúsculo astronómico (${direction})`;
  return 'Noche';
}
