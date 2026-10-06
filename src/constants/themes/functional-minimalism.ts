import { AppTheme } from './types';

/**
 * Functional Minimalism — precisión, confianza, eficiencia (estilo Swiss/SaaS).
 * Casi toda la paleta es neutra; el Slate Blue es el único toque de
 * identidad, usado con moderación (secondary, accent, info). El primary
 * (botones) es el propio charcoal — funcional, sin depender de un color
 * fuerte. Sin sombras: la separación de superficies se apoya en `border`.
 * success/warning/error no existen en la paleta (es 100% neutra); acá sí se
 * introducen tonos convencionales pero desaturados, porque en una
 * herramienta funcional/SaaS esos estados necesitan leerse de forma
 * inequívoca — desaturarlos hasta el gris los volvería indistinguibles.
 */
export const functionalMinimalismTheme: AppTheme = {
  id: 'functional-minimalism',
  name: 'Functional Minimalism',
  description: 'Técnica, racional y limpia — Swiss design aplicado a producto.',
  colors: {
    background: '#e1e3e7',
    surface: '#f6f7f8',
    surfaceSecondary: '#a7a4a2',
    textPrimary: '#30353e',
    textSecondary: '#605f61',
    textMuted: '#81848a',
    primary: '#30353e',
    primaryHover: '#424952',
    onPrimary: '#f5f6f7',
    secondary: '#54647c',
    onSecondary: '#f5f6f7',
    accent: '#7c8ca3',
    onAccent: '#30353e',
    border: '#adafb5',
    success: '#3e7a52',
    warning: '#b8863a',
    error: '#b23b3b',
    info: '#54647c',
  },
  radius: {
    small: 4,
    medium: 8,
    large: 12,
    pill: 999,
  },
  cardShadow: null,
  typography: {
    displayFontFamily: 'Inter_600SemiBold',
    boldWeight: '600',
    labelLetterSpacing: 0.4,
  },
  isDark: false,
};
