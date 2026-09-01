import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { SUN_STAGES } from '@/features/despertadores/constants';
import { SunStageType } from '@/types/alarm';

interface SunStageSelectorProps {
  value: SunStageType;
  onChange: (stage: SunStageType) => void;
}

export function SunStageSelector({ value, onChange }: SunStageSelectorProps) {
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

const styles = StyleSheet.create({
  column: {
    gap: Spacing.two,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Radius.medium,
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionActive: {
    borderColor: Colors.accent,
  },
  optionText: {
    gap: 2,
    flexShrink: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  radioActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent,
  },
});
