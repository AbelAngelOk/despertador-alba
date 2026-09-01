import { Platform } from 'react-native';

export const Colors = {
  background: '#0B0C1A',
  backgroundElement: '#151833',
  backgroundSelected: '#232A57',
  border: '#2A2F55',
  text: '#F6F1E7',
  textSecondary: '#A6ACC9',
  accent: '#FF9B54',
  accentSecondary: '#B9A6FF',
  danger: '#FF6B6B',
} as const;

export type ThemeColor = keyof typeof Colors;

export const Gradients = {
  sky: ['#0B0C1A', '#3A2467', '#FF9B54'] as [string, string, string],
  accent: ['#FF9B54', '#FFCE7A'] as [string, string],
} as const;

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

export const Radius = {
  small: 8,
  medium: 16,
  large: 24,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
