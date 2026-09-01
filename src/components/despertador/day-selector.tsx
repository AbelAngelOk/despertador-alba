import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { DAYS_OF_WEEK } from '@/features/despertadores/constants';

interface DaySelectorProps {
  activeDays: number[];
  onChange: (activeDays: number[]) => void;
}

export function DaySelector({ activeDays, onChange }: DaySelectorProps) {
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
            <ThemedText type="smallBold" themeColor={active ? undefined : 'textSecondary'} style={active && styles.labelActive}>
              {label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  labelActive: {
    color: Colors.background,
  },
});
