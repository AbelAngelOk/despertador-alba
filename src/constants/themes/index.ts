import { cyanLedTheme } from './cyan-led';
import { functionalMinimalismTheme } from './functional-minimalism';
import { morningGlassTheme } from './morning-glass';
import { violetDawnTheme } from './violet-dawn';
import { AppTheme } from './types';

export type { AppTheme, ColorTokens, RadiusTokens, ThemeTypography } from './types';

export const THEMES = {
  'violet-dawn': violetDawnTheme,
  'functional-minimalism': functionalMinimalismTheme,
  'cyan-led': cyanLedTheme,
  'morning-glass': morningGlassTheme,
} as const satisfies Record<string, AppTheme>;

export type ThemeId = keyof typeof THEMES;

export const THEME_LIST: AppTheme[] = Object.values(THEMES);

export const DEFAULT_THEME_ID: ThemeId = violetDawnTheme.id as ThemeId;

export function getTheme(id: string): AppTheme {
  return (THEMES as Record<string, AppTheme>)[id] ?? THEMES[DEFAULT_THEME_ID];
}
