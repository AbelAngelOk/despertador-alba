import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { countCompletedDays, useMicroActivityStore } from '@/features/despertadores/microActivityStore';
import { computeStreak, countWakeDays, dateKey, DayStatus, useTrackingStore } from '@/store/tracking';

const DAYS_TO_SHOW = 7;
const WEEKDAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

interface DayCell {
  key: string;
  label: string;
  status: DayStatus | 'none';
  isToday: boolean;
}

function buildDays(entries: Record<string, DayStatus>): DayCell[] {
  const days: DayCell[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = DAYS_TO_SHOW - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const key = dateKey(day);
    days.push({
      key,
      label: WEEKDAY_LABELS[day.getDay()],
      status: entries[key] ?? 'none',
      isToday: i === 0,
    });
  }

  return days;
}

function DayPill({ day }: { day: DayCell }) {
  const config = {
    onTime: { backgroundColor: Colors.accent, borderColor: Colors.accent, icon: 'check' as const },
    late: {
      backgroundColor: Colors.accentSecondary,
      borderColor: Colors.accentSecondary,
      icon: 'clock' as const,
    },
    missed: { backgroundColor: 'transparent', borderColor: Colors.danger, icon: 'x' as const },
    none: { backgroundColor: 'transparent', borderColor: Colors.border, icon: null },
  }[day.status];

  const iconColor = day.status === 'missed' || day.status === 'none' ? Colors.textSecondary : Colors.background;

  return (
    <View style={styles.dayColumn}>
      <ThemedText type="small" themeColor="textSecondary">
        {day.label}
      </ThemedText>
      <View
        style={[
          styles.pill,
          { backgroundColor: config.backgroundColor, borderColor: config.borderColor },
          day.isToday && styles.pillToday,
        ]}>
        {config.icon ? <Feather name={config.icon} size={16} color={iconColor} /> : null}
      </View>
    </View>
  );
}

export default function SeguimientoScreen() {
  const entries = useTrackingStore((state) => state.entries);
  const microActivityInstances = useMicroActivityStore((state) => state.instances);
  const days = useMemo(() => buildDays(entries), [entries]);
  const streak = useMemo(() => computeStreak(entries), [entries]);
  const wakeDays = useMemo(() => countWakeDays(entries), [entries]);
  const microActivityDays = useMemo(
    () => countCompletedDays(microActivityInstances),
    [microActivityInstances]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.heading}>
          Seguimiento
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Feather name="zap" size={22} color={Colors.accent} />
            <ThemedText type="title" style={styles.streakNumber}>
              {streak}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {streak === 1 ? 'día seguido' : 'días seguidos'}
            </ThemedText>
          </View>

          <View style={styles.week}>
            {days.map((day) => (
              <DayPill key={day.key} day={day} />
            ))}
          </View>

          <View style={styles.legend}>
            <LegendItem color={Colors.accent} label="Te levantaste" />
            <LegendItem color={Colors.accentSecondary} label="Con retraso" />
            <LegendItem color={Colors.danger} label="No te levantaste" outline />
          </View>
        </ThemedView>

        <View style={styles.statsRow}>
          <StatCard
            icon="sunrise"
            value={wakeDays}
            label={wakeDays === 1 ? 'día que te levantaste' : 'días que te levantaste'}
          />
          <StatCard
            icon="check-circle"
            value={microActivityDays}
            label={microActivityDays === 1 ? 'día con microactividad' : 'días con microactividad'}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Feather.glyphMap;
  value: number;
  label: string;
}) {
  return (
    <ThemedView type="backgroundElement" style={styles.statCard}>
      <Feather name={icon} size={20} color={Colors.accentSecondary} />
      <ThemedText type="title" style={styles.statNumber}>
        {value}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
        {label}
      </ThemedText>
    </ThemedView>
  );
}

function LegendItem({ color, label, outline }: { color: string; label: string; outline?: boolean }) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          outline
            ? { borderColor: color, borderWidth: 2, backgroundColor: 'transparent' }
            : { backgroundColor: color },
        ]}
      />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  heading: {
    fontSize: 28,
    lineHeight: 34,
  },
  streakCard: {
    borderRadius: Radius.large,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  streakNumber: {
    fontSize: 32,
    lineHeight: 36,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  pill: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillToday: {
    borderColor: Colors.text,
  },
  legend: {
    gap: Spacing.two,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: Radius.pill,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  statCard: {
    flex: 1,
    borderRadius: Radius.large,
    padding: Spacing.four,
    gap: Spacing.one,
    alignItems: 'flex-start',
  },
  statNumber: {
    fontSize: 32,
    lineHeight: 36,
  },
  statLabel: {
    lineHeight: 18,
  },
});
