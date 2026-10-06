import { AppTheme } from './types';

/**
 * Violet Dawn — el primer instante de luz de un amanecer visto contra un
 * cielo todavía casi de noche: negro-azulado profundo con la primera luz
 * dorada asomando entre nubes violeta y rosa.
 *
 * Mapeo de la paleta a roles funcionales:
 * - primary (CTA) = #fbc540 (el brillo dorado del sol asomando) — el único
 *   color realmente cálido/luminoso, así que funciona como acción principal.
 * - secondary = #734a87 (violeta), accent = #cf7171 (rosa polvoriento).
 * - info = #4a5fba, ya en la paleta — encaja con la convención azul=info.
 * - textPrimary/textMuted, y success/warning/error se derivan (la paleta no
 *   trae un blanco ni un verde/rojo de estado) manteniendo la temperatura
 *   fría-violeta del resto para no romper la armonía.
 * - #6e436f queda como violeta auxiliar disponible para futuros usos
 *   decorativos (no tiene un token dedicado).
 */
export const violetDawnTheme: AppTheme = {
  id: 'violet-dawn',
  name: 'Violet Dawn',
  description: 'Oscura y mística — el primer brillo dorado de un amanecer.',
  colors: {
    background: '#0b0a13',
    surface: '#14142e',
    surfaceSecondary: '#1c1a3f',
    textPrimary: '#ede9f7',
    textSecondary: '#869cd9',
    textMuted: '#7a7fa3',
    primary: '#fbc540',
    primaryHover: '#e0a93a',
    onPrimary: '#432339',
    secondary: '#734a87',
    onSecondary: '#ede9f7',
    accent: '#cf7171',
    onAccent: '#0b0a13',
    border: '#3c326e',
    success: '#3f8f73',
    warning: '#e08f3c',
    error: '#b23b4f',
    info: '#4a5fba',
  },
  radius: {
    small: 12,
    medium: 18,
    large: 26,
    pill: 999,
  },
  cardShadow: {
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.45)',
  },
  typography: {
    displayFontFamily: 'Fraunces_600SemiBold',
    boldWeight: '600',
    labelLetterSpacing: 0,
  },
  isDark: true,
};
