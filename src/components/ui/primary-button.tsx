import { useMemo } from 'react';
import { Pressable, PressableProps, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';
import { useTheme } from '@/hooks/use-theme';

interface PrimaryButtonProps extends PressableProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export function PrimaryButton({
  label,
  variant = 'primary',
  style,
  disabled,
  ...rest
}: PrimaryButtonProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const labelColor =
    variant === 'ghost'
      ? 'textPrimary'
      : variant === 'danger'
        ? 'error'
        : variant === 'secondary'
          ? 'onSecondary'
          : 'onPrimary';

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        pressed && styles.pressed,
        disabled && styles.disabled,
        typeof style === 'function' ? undefined : style,
      ]}
      {...rest}>
      <ThemedText type="smallBold" themeColor={disabled ? 'textMuted' : labelColor}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    base: {
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.four,
      borderRadius: theme.radius.medium,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primary: {
      backgroundColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
    },
    ghost: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    danger: {
      backgroundColor: 'transparent',
    },
    pressed: {
      opacity: 0.75,
    },
    disabled: {
      opacity: 0.5,
    },
  });
}
