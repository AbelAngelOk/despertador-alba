import { AppTheme, getTheme } from '@/constants/themes';
import { useThemeStore } from '@/store/theme';

export function useTheme(): AppTheme {
  const themeId = useThemeStore((state) => state.themeId);
  return getTheme(themeId);
}
