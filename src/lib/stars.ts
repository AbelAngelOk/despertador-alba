export interface Star {
  leftPercent: number;
  topPercent: number;
  size: number;
}

// Posiciones fijas (no es un catálogo estelar real, es decoración) en la
// franja superior del cielo, por encima de donde cae la línea de horizonte.
export const STARS: Star[] = [
  { leftPercent: 8, topPercent: 10, size: 2 },
  { leftPercent: 18, topPercent: 28, size: 1.5 },
  { leftPercent: 27, topPercent: 8, size: 2 },
  { leftPercent: 35, topPercent: 22, size: 1.5 },
  { leftPercent: 42, topPercent: 40, size: 2 },
  { leftPercent: 12, topPercent: 45, size: 1.5 },
  { leftPercent: 52, topPercent: 12, size: 1.5 },
  { leftPercent: 60, topPercent: 30, size: 2 },
  { leftPercent: 67, topPercent: 6, size: 1.5 },
  { leftPercent: 73, topPercent: 45, size: 2 },
  { leftPercent: 80, topPercent: 18, size: 1.5 },
  { leftPercent: 88, topPercent: 35, size: 2 },
  { leftPercent: 92, topPercent: 8, size: 1.5 },
  { leftPercent: 5, topPercent: 58, size: 1.5 },
  { leftPercent: 22, topPercent: 60, size: 1.5 },
  { leftPercent: 47, topPercent: 55, size: 1.5 },
  { leftPercent: 63, topPercent: 58, size: 1.5 },
  { leftPercent: 85, topPercent: 55, size: 1.5 },
  { leftPercent: 15, topPercent: 15, size: 1 },
  { leftPercent: 38, topPercent: 5, size: 1 },
  { leftPercent: 57, topPercent: 48, size: 1 },
  { leftPercent: 78, topPercent: 28, size: 1 },
  { leftPercent: 30, topPercent: 50, size: 1 },
  { leftPercent: 95, topPercent: 42, size: 1 },
];

const FADE_RANGE_DEG = 18;

/**
 * 0 cuando el sol está en o sobre el horizonte, 1 en crepúsculo astronómico
 * (-18°) o más oscuro. Transición gradual a través del atardecer/amanecer.
 */
export function getStarsOpacity(sunAltitudeDeg: number): number {
  if (sunAltitudeDeg >= 0) return 0;
  return Math.min(1, -sunAltitudeDeg / FADE_RANGE_DEG);
}
