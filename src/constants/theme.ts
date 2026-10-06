import { Platform } from 'react-native';

/**
 * Colores, radios y sombras ahora viven en `@/constants/themes` (uno por
 * template) y se leen vía `useTheme()`. Lo que queda acá es lo que NO varía
 * entre templates: la escala de espaciado y las fuentes de sistema.
 */

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
