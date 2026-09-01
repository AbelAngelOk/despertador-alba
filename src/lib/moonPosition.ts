import * as SunCalc from 'suncalc';

export interface MoonPositionInfo {
  altitudeDeg: number;
  /** 0 = luna nueva, 0.25 = cuarto creciente, 0.5 = llena, 0.75 = cuarto menguante. */
  phase: number;
  /** Fracción del disco iluminada, 0 (nueva) → 1 (llena). */
  illuminatedFraction: number;
}

export function getMoonPositionInfo(
  date: Date,
  latitude: number,
  longitude: number
): MoonPositionInfo {
  const position = SunCalc.getMoonPosition(date, latitude, longitude);
  const illumination = SunCalc.getMoonIllumination(date);

  // Igual que con el sol: esta versión de suncalc ya devuelve grados, no radianes.
  return {
    altitudeDeg: position.altitude,
    phase: illumination.phase,
    illuminatedFraction: illumination.fraction,
  };
}

/**
 * La luna solo se muestra si está sobre el horizonte y el sol no está tan
 * alto como para que no tenga sentido visualmente (pleno día).
 */
export function isMoonVisible(moonAltitudeDeg: number, sunAltitudeDeg: number): boolean {
  return moonAltitudeDeg > 0 && sunAltitudeDeg < 10;
}
