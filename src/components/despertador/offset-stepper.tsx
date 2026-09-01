import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatOffset } from '@/lib/format';

interface OffsetStepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
}

export function OffsetStepper({ value, onChange, step = 5 }: OffsetStepperProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => onChange(value - step)}>
          <ThemedText type="title" style={styles.buttonLabel}>
            −
          </ThemedText>
        </Pressable>
        <ThemedText type="subtitle">{value === 0 ? '0' : value > 0 ? `+${value}` : value}</ThemedText>
        <Pressable style={styles.button} onPress={() => onChange(value + step)}>
          <ThemedText type="title" style={styles.buttonLabel}>
            +
          </ThemedText>
        </Pressable>
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {formatOffset(value)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.five,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: 28,
    lineHeight: 30,
  },
});
