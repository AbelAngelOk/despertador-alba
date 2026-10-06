import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';
import { DAYS_OF_WEEK, SUN_STAGE_LABELS } from '@/features/despertadores/constants';
import { getAlarmTimeForDate } from '@/features/despertadores/schedule';
import { useAlarmsStore } from '@/features/despertadores/store';
import { useTheme } from '@/hooks/use-theme';
import { formatOffset, formatTime } from '@/lib/format';
import { useLocationStore } from '@/store/location';
import { Alarm } from '@/types/alarm';

interface AlarmCardProps {
  alarm: Alarm;
}

export function AlarmCard({ alarm }: AlarmCardProps) {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toggleAlarm = useAlarmsStore((state) => state.toggleAlarm);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);

  const todayTime =
    latitude != null && longitude != null
      ? getAlarmTimeForDate(alarm, new Date(), latitude, longitude)
      : null;

  return (
    <Pressable onPress={() => router.push(`/despertador/${alarm.id}`)}>
      <ThemedView type="surface" style={styles.card}>
        <View style={styles.header}>
          <ThemedText type="smallBold" numberOfLines={1} style={styles.name}>
            {alarm.name || 'Despertador'}
            {alarm.testRingAt ? ' · PRUEBA' : ''}
          </ThemedText>
          <Switch
            value={alarm.enabled}
            onValueChange={() => toggleAlarm(alarm.id)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={theme.colors.onPrimary}
          />
        </View>

        <ThemedText type="title" style={styles.time}>
          {todayTime ? formatTime(todayTime) : '--:--'}
        </ThemedText>

        <View style={styles.subtitleRow}>
          <ThemedText type="small" themeColor="textSecondary">
            {alarm.kind === 'classic'
              ? 'Clásico · hora fija'
              : `${SUN_STAGE_LABELS[alarm.stage]} · ${formatOffset(alarm.offsetMinutes)}`}
          </ThemedText>
          {alarm.microActivity?.enabled ? (
            <Feather name="activity" size={14} color={theme.colors.accent} />
          ) : null}
        </View>

        <View style={styles.days}>
          {DAYS_OF_WEEK.map(({ jsDay, label, key }) => {
            const active = alarm.activeDays.includes(jsDay);
            return (
              <ThemedText
                key={key}
                type="small"
                themeColor={active ? 'primary' : 'textSecondary'}
                style={active ? styles.dayActive : undefined}>
                {label}
              </ThemedText>
            );
          })}
        </View>
      </ThemedView>
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      borderRadius: theme.radius.large,
      padding: Spacing.four,
      gap: Spacing.one,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    name: {
      flexShrink: 1,
    },
    subtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.one,
    },
    time: {
      fontSize: 40,
      lineHeight: 44,
    },
    days: {
      flexDirection: 'row',
      gap: Spacing.two,
      marginTop: Spacing.two,
    },
    dayActive: {
      fontWeight: '700',
    },
  });
}
