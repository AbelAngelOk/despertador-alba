interface SkyKeyframe {
  deg: number;
  top: string;
  bottom: string;
}

const KEYFRAMES: SkyKeyframe[] = [
  { deg: -90, top: '#04050C', bottom: '#0B0C1A' },
  { deg: -18, top: '#0B0C1A', bottom: '#181B3D' },
  { deg: -12, top: '#181B3D', bottom: '#3A2467' },
  { deg: -6, top: '#3A2467', bottom: '#8B4B7A' },
  { deg: 0, top: '#8B4B7A', bottom: '#FF9B54' },
  { deg: 12, top: '#4C86C6', bottom: '#FFCE7A' },
  { deg: 90, top: '#2E6FB8', bottom: '#BEE3FF' },
];

function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const toHex = (channel: number) => Math.round(channel).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function lerpColor(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
}

export function getSkyColors(deg: number): [string, string] {
  const clamped = Math.max(KEYFRAMES[0].deg, Math.min(KEYFRAMES[KEYFRAMES.length - 1].deg, deg));

  let lower = KEYFRAMES[0];
  let upper = KEYFRAMES[KEYFRAMES.length - 1];
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (clamped >= KEYFRAMES[i].deg && clamped <= KEYFRAMES[i + 1].deg) {
      lower = KEYFRAMES[i];
      upper = KEYFRAMES[i + 1];
      break;
    }
  }

  const span = upper.deg - lower.deg;
  const t = span === 0 ? 0 : (clamped - lower.deg) / span;

  return [lerpColor(lower.top, upper.top, t), lerpColor(lower.bottom, upper.bottom, t)];
}
