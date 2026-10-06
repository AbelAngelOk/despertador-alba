import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';
import { useTheme } from '@/hooks/use-theme';

interface SegmentedSwitchProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedSwitch<T extends string>({ options, value, onChange }: SegmentedSwitchProps<T>) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.track} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.segmentSelected]}>
            <ThemedText
              type="smallBold"
              numberOfLines={1}
              themeColor={selected ? 'onPrimary' : 'textSecondary'}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    track: {
      flexDirection: 'row',
      padding: Spacing.half,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    segment: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderRadius: theme.radius.pill,
    },
    segmentSelected: {
      backgroundColor: theme.colors.primary,
    },
  });
}
