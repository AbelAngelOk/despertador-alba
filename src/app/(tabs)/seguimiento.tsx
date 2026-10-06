import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { SkyScreen } from '@/components/sky/sky-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { NavCard } from '@/components/ui/nav-card';
import { Spacing } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';
import { countCompletedDays, useMicroActivityStore } from '@/features/despertadores/microActivityStore';
import { useTheme } from '@/hooks/use-theme';
import { computeStreak, countWakeDays, dateKey, DayStatus, useTrackingStore } from '@/store/tracking';

const DAYS_TO_SHOW = 7;
const WEEKDAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
// Íconos/textos sobre un relleno de estado (success/warning/error) suelen
// tener contraste suficiente en blanco en los 5 templates, ya que esos tres
// tokens se definieron deliberadamente saturados/oscuros, no pasteles.
const ON_STATUS_COLOR = '#FFFFFF';

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

function DayPill({ day, styles }: { day: DayCell; styles: ReturnType<typeof createStyles> }) {
  const theme = useTheme();

  const config = {
    onTime: { backgroundColor: theme.colors.success, borderColor: theme.colors.success, icon: 'check' as const },
    late: {
      backgroundColor: theme.colors.warning,
      borderColor: theme.colors.warning,
      icon: 'clock' as const,
    },
    missed: { backgroundColor: 'transparent', borderColor: theme.colors.error, icon: 'x' as const },
    none: { backgroundColor: 'transparent', borderColor: theme.colors.border, icon: null },
  }[day.status];

  const iconColor =
    day.status === 'missed' || day.status === 'none' ? theme.colors.textSecondary : ON_STATUS_COLOR;

  return (
    <View style={styles.dayColumn}>
      <ThemedText type="small" themeColor="textSecondary">
        {day.label}
      </ThemedText>
      <View
        style={[
          styles.pill,
          { backgroundColor: config.backgroundColor, borderColor: config.borderColor },
          day.isToday && { borderColor: theme.colors.textPrimary },
        ]}>
        {config.icon ? <Feather name={config.icon} size={16} color={iconColor} /> : null}
      </View>
    </View>
  );
}

export default function SeguimientoScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
    <SkyScreen edges={['top']}>
      <View style={styles.content}>
        <NavCard
          icon="user"
          title="Perfil"
          description="Ajustes, microactividades y más."
          onPress={() => router.push('/perfil')}
        />

        <ThemedText type="title" style={styles.heading}>
          Seguimiento
        </ThemedText>

        <ThemedView type="surface" style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Feather name="zap" size={22} color={theme.colors.primary} />
            <ThemedText type="title" style={styles.streakNumber}>
              {streak}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {streak === 1 ? 'día seguido' : 'días seguidos'}
            </ThemedText>
          </View>

          <View style={styles.week}>
            {days.map((day) => (
              <DayPill key={day.key} day={day} styles={styles} />
            ))}
          </View>

          <View style={styles.legend}>
            <LegendItem color={theme.colors.success} label="Te levantaste" />
            <LegendItem color={theme.colors.warning} label="Con retraso" />
            <LegendItem color={theme.colors.error} label="No te levantaste" outline />
          </View>
        </ThemedView>

        <View style={styles.statsRow}>
          <StatCard
            icon="sunrise"
            value={wakeDays}
            label={wakeDays === 1 ? 'día que te levantaste' : 'días que te levantaste'}
            styles={styles}
          />
          <StatCard
            icon="check-circle"
            value={microActivityDays}
            label={microActivityDays === 1 ? 'día con microactividad' : 'días con microactividad'}
            styles={styles}
          />
        </View>
      </View>
    </SkyScreen>
  );
}

function StatCard({
  icon,
  value,
  label,
  styles,
}: {
  icon: keyof typeof Feather.glyphMap;
  value: number;
  label: string;
  styles: ReturnType<typeof createStyles>;
}) {
  const theme = useTheme();

  return (
    <ThemedView type="surface" style={styles.statCard}>
      <Feather name={icon} size={20} color={theme.colors.accent} />
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
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
});

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    content: {
      padding: Spacing.four,
      gap: Spacing.three,
    },
    heading: {
      fontSize: 28,
      lineHeight: 34,
    },
    streakCard: {
      borderRadius: theme.radius.large,
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
      borderRadius: theme.radius.pill,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    legend: {
      gap: Spacing.two,
    },
    statsRow: {
      flexDirection: 'row',
      gap: Spacing.three,
    },
    statCard: {
      flex: 1,
      borderRadius: theme.radius.large,
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
}
