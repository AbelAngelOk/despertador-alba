import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';
import { useTheme } from '@/hooks/use-theme';
import { ClassicTime } from '@/types/alarm';

interface TimeFieldProps {
  value: ClassicTime;
  onChange: (value: ClassicTime) => void;
}

function toDate({ hour, minute }: ClassicTime): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

/**
 * Hora fija del despertador clásico. En Android el picker es un diálogo que
 * se abre al tocar la hora; en iOS va inline (spinner), que es el patrón nativo.
 */
export function TimeField({ value, onChange }: TimeFieldProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [open, setOpen] = useState(false);

  function handleChange(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') setOpen(false);
    if (event.type !== 'set' || !date) return;
    onChange({ hour: date.getHours(), minute: date.getMinutes() });
  }

  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={toDate(value)}
        mode="time"
        display="spinner"
        onChange={handleChange}
        textColor={theme.colors.textPrimary}
      />
    );
  }

  return (
    <>
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <ThemedText type="title" style={styles.time}>
          {pad(value.hour)}:{pad(value.minute)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Tocá para cambiar la hora
        </ThemedText>
      </Pressable>
      {open ? (
        <DateTimePicker value={toDate(value)} mode="time" is24Hour onChange={handleChange} />
      ) : null}
    </>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    field: {
      alignItems: 'center',
      gap: Spacing.half,
      paddingVertical: Spacing.three,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.medium,
      backgroundColor: theme.colors.surface,
    },
    time: {
      fontSize: 44,
      lineHeight: 50,
    },
  });
}
