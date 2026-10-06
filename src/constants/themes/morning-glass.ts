import { AppTheme } from './types';

/**
 * Morning Glass — glassmorphism claro y luminoso, como luz de amanecer
 * atravesando un vidrio translúcido.
 *
 * Mapeo de la paleta a roles funcionales:
 * - surface = "Glass bright" (rgba(255,255,255,0.70)) y surfaceSecondary =
 *   "Glass" (rgba(255,255,255,0.55)), tal cual las da el brief — un color
 *   translúcido funciona directamente como `backgroundColor` en RN. border
 *   usa "Glass border" (rgba(255,255,255,0.75)), también dado.
 * - primary (CTA, "solid" según el brief) = Accent blue #69cde5; secondary =
 *   Accent lavender #9d91e8; accent (detalle chico) = Soft pink #fbe5ee.
 * - success/warning/error/info no existen en la paleta (es puramente
 *   pastel/neutra); se derivan versiones pastel armonizadas, un poco más
 *   saturadas que los tonos decorativos para que seguir siendo legibles
 *   sobre el vidrio blanco.
 *
 * Nota de alcance: esto es glassmorphism "liviano" — superficies
 * translúcidas + sombra muy suave, sin blur real (backdrop-filter no existe
 * en React Native; agregarlo requeriría `expo-blur`, un módulo nativo nuevo
 * y otro build). Se documenta como decisión de diseño, no como limitación
 * oculta.
 */
export const morningGlassTheme: AppTheme = {
  id: 'morning-glass',
  name: 'Morning Glass',
  description: 'Luminosa y liviana — glassmorphism suave con luz de amanecer.',
  colors: {
    background: '#f4f8fc',
    surface: 'rgba(255, 255, 255, 0.70)',
    surfaceSecondary: 'rgba(255, 255, 255, 0.55)',
    textPrimary: '#263746',
    textSecondary: '#718391',
    textMuted: '#9baab5',
    primary: '#69cde5',
    primaryHover: '#4baac4',
    onPrimary: '#263746',
    secondary: '#9d91e8',
    onSecondary: '#ffffff',
    accent: '#fbe5ee',
    onAccent: '#263746',
    border: 'rgba(255, 255, 255, 0.75)',
    success: '#8fd9b6',
    warning: '#e8b85d',
    error: '#e88a93',
    info: '#7fb8d9',
  },
  radius: {
    small: 14,
    medium: 22,
    large: 30,
    pill: 999,
  },
  cardShadow: {
    boxShadow: '0px 8px 24px rgba(38, 55, 70, 0.10)',
  },
  typography: {
    displayFontFamily: 'SpaceMono_700Bold',
    boldWeight: '600',
    labelLetterSpacing: 0,
  },
  isDark: false,
};
