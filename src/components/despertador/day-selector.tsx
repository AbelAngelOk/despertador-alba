import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';
import { DAYS_OF_WEEK } from '@/features/despertadores/constants';
import { useTheme } from '@/hooks/use-theme';

interface DaySelectorProps {
  activeDays: number[];
  onChange: (activeDays: number[]) => void;
}

export function DaySelector({ activeDays, onChange }: DaySelectorProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  function toggleDay(jsDay: number) {
    const isActive = activeDays.includes(jsDay);
    onChange(isActive ? activeDays.filter((d) => d !== jsDay) : [...activeDays, jsDay]);
  }

  return (
    <View style={styles.row}>
      {DAYS_OF_WEEK.map(({ jsDay, label, key }) => {
        const active = activeDays.includes(jsDay);
        return (
          <Pressable
            key={key}
            onPress={() => toggleDay(jsDay)}
            style={[styles.dot, active && styles.dotActive]}>
            <ThemedText
              type="smallBold"
              themeColor={active ? 'onPrimary' : 'textSecondary'}>
              {label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: Spacing.two,
    },
    dot: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    dotActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
  });
}
