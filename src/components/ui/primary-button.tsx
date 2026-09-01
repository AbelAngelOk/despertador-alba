import { Pressable, PressableProps, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';

interface PrimaryButtonProps extends PressableProps {
  label: string;
  variant?: 'primary' | 'ghost' | 'danger';
}

export function PrimaryButton({ label, variant = 'primary', style, ...rest }: PrimaryButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        pressed && styles.pressed,
        typeof style === 'function' ? undefined : style,
      ]}
      {...rest}>
      <ThemedText
        type="smallBold"
        themeColor={variant === 'primary' ? undefined : variant === 'danger' ? 'danger' : 'text'}
        style={variant === 'primary' && styles.primaryLabel}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: Colors.accent,
  },
  primaryLabel: {
    color: Colors.background,
  },
  ghost: {
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  danger: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.75,
  },
});
