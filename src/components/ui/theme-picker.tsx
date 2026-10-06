import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { AppTheme, ThemeId, THEME_LIST } from '@/constants/themes';
import { useTheme } from '@/hooks/use-theme';
import { useThemeStore } from '@/store/theme';

/** Selector de identidad visual: cada opción se previsualiza con sus propios colores, no con los del theme activo. */
export function ThemePicker() {
  const theme = useTheme();
  const themeId = useThemeStore((state) => state.themeId);
  const setThemeId = useThemeStore((state) => state.setThemeId);
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.list}>
      {THEME_LIST.map((option) => {
        const active = option.id === themeId;
        return (
          <Pressable
            key={option.id}
            onPress={() => setThemeId(option.id as ThemeId)}
            style={[
              styles.option,
              {
                backgroundColor: active ? option.colors.surfaceSecondary : option.colors.surface,
                borderColor: active ? option.colors.primary : option.colors.border,
                borderWidth: active ? 2 : 1,
              },
            ]}>
            <View style={styles.swatchRow}>
              {[option.colors.background, option.colors.primary, option.colors.secondary, option.colors.accent].map(
                (color, index) => (
                  <View
                    key={index}
                    style={[styles.swatch, { backgroundColor: color, borderColor: option.colors.border }]}
                  />
                )
              )}
            </View>
            <View style={styles.textGroup}>
              <ThemedText type="smallBold" style={{ color: option.colors.textPrimary }}>
                {option.name}
              </ThemedText>
              <ThemedText type="small" style={{ color: option.colors.textSecondary }}>
                {option.description}
              </ThemedText>
            </View>
            {active ? <Feather name="check-circle" size={20} color={option.colors.primary} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    list: {
      gap: Spacing.two,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      borderRadius: theme.radius.medium,
      padding: Spacing.three,
    },
    swatchRow: {
      flexDirection: 'row',
    },
    swatch: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1,
      marginLeft: -6,
    },
    textGroup: {
      flex: 1,
      gap: Spacing.half,
    },
  });
}
