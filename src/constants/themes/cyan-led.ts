import { AppTheme } from './types';

/**
 * Cyan LED — digital retro, tecnológica, nocturna: el clásico reloj LED de
 * mesa, cambiando el tradicional LED rojo por uno celeste.
 *
 * Mapeo de la paleta a roles funcionales:
 * - primary (CTA) = #5ddcff (LED celeste), primaryHover = #35bfe8 (LED
 *   soft) — ambos ya venían dados, no hizo falta derivar el hover.
 * - accent = #9beaff (LED bright, el brillo más intenso, para detalles
 *   pequeños); secondary se deriva como un cyan apagado (#2e4a54) ya que la
 *   paleta es casi monocromática (solo tiene la familia celeste + neutros).
 * - El brief pide explícitamente NO usar rojo. Para error/warning se derivan
 *   dos naranjas/ámbar distinguibles entre sí (más saturado vs. más dorado)
 *   en vez de un rojo — es la única desviación de la paleta dada, necesaria
 *   para que los estados sigan siendo legibles en una herramienta que debe
 *   sentirse precisa.
 * - `displayGlow` es la seña de identidad del template: un halo celeste muy
 *   sutil alrededor de la hora, como si emergiera del fondo oscuro.
 */
export const cyanLedTheme: AppTheme = {
  id: 'cyan-led',
  name: 'Cyan LED',
  description: 'Retro digital y nocturna — el brillo celeste de un reloj LED clásico.',
  colors: {
    // Negro puro a propósito: un fondo azulado a pantalla completa se percibe
    // como un filtro. El celeste tiene que emerger como luz LED sobre negro.
    background: '#000000',
    surface: '#11191d',
    surfaceSecondary: '#182228',
    textPrimary: '#ddf8ff',
    textSecondary: '#7899a3',
    textMuted: '#4f6870',
    primary: '#5ddcff',
    primaryHover: '#35bfe8',
    onPrimary: '#06151a',
    secondary: '#2e4a54',
    onSecondary: '#ddf8ff',
    accent: '#9beaff',
    onAccent: '#06151a',
    border: '#26363c',
    success: '#3fbf8f',
    warning: '#c9a227',
    error: '#e0703a',
    info: '#9beaff',
  },
  radius: {
    small: 6,
    medium: 10,
    large: 16,
    pill: 999,
  },
  cardShadow: null,
  typography: {
    displayFontFamily: 'VT323_400Regular',
    boldWeight: '700',
    labelLetterSpacing: 0.6,
    displayGlow: {
      color: 'rgba(93, 220, 255, 0.55)',
      radius: 10,
    },
  },
  isDark: true,
};
