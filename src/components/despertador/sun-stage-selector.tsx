import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';
import { SUN_STAGES } from '@/features/despertadores/constants';
import { useTheme } from '@/hooks/use-theme';
import { SunStageType } from '@/types/alarm';

interface SunStageSelectorProps {
  value: SunStageType;
  onChange: (stage: SunStageType) => void;
}

export function SunStageSelector({ value, onChange }: SunStageSelectorProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.column}>
      {SUN_STAGES.map((stage) => {
        const active = stage.type === value;
        return (
          <Pressable
            key={stage.type}
            onPress={() => onChange(stage.type)}
            style={[styles.option, active && styles.optionActive]}>
            <View style={styles.optionText}>
              <ThemedText type="smallBold">{stage.label}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {stage.description}
              </ThemedText>
            </View>
            <View style={[styles.radio, active && styles.radioActive]} />
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    column: {
      gap: Spacing.two,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Spacing.three,
      borderRadius: theme.radius.medium,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    optionActive: {
      borderColor: theme.colors.primary,
    },
    optionText: {
      gap: 2,
      flexShrink: 1,
    },
    radio: {
      width: 20,
      height: 20,
      borderRadius: theme.radius.pill,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    radioActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
  });
}
