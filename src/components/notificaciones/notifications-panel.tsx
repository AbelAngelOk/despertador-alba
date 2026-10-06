import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { DAY_NOTIFICATIONS, DayNotificationDefinition } from '@/features/notificaciones/catalog';
import { useTheme } from '@/hooks/use-theme';
import { useNotificationPrefsStore } from '@/store/notificationPrefs';

const SUN_STAGE_NOTIFICATIONS = DAY_NOTIFICATIONS.filter((def) => def.trigger.kind === 'sunStage');
const ALARM_RELATIVE_NOTIFICATIONS = DAY_NOTIFICATIONS.filter(
  (def) => def.trigger.kind === 'beforeAlarm'
);

/** Vista "Notificaciones" de la tab Despertadores (ver el switch del header). */
export function NotificationsPanel() {
  const theme = useTheme();
  const enabledMap = useNotificationPrefsStore((state) => state.enabled);
  const setEnabled = useNotificationPrefsStore((state) => state.setEnabled);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="small" themeColor="textSecondary">
        Avisos ligados al ritmo del día, calculados con tu ubicación — no dependen de cuenta ni
        de conexión. Están todos desactivados por defecto: activá solo los que quieras recibir.
      </ThemedText>

      <ThemedText type="smallBold" style={styles.sectionTitle}>
        Antes del despertador
      </ThemedText>
      <ThemedView type="surface" style={[styles.card, { borderRadius: theme.radius.large }]}>
        {ALARM_RELATIVE_NOTIFICATIONS.map((def, index) => (
          <NotificationRow
            key={def.id}
            def={def}
            value={enabledMap[def.id] ?? false}
            onChange={(value) => setEnabled(def.id, value)}
            divider={index < ALARM_RELATIVE_NOTIFICATIONS.length - 1}
          />
        ))}
      </ThemedView>
      <ThemedText type="small" themeColor="textSecondary">
        Estas dos necesitan al menos un despertador activo para calcularse — se basan en la hora
        estimada de tu próxima alarma.
      </ThemedText>

      <ThemedText type="smallBold" style={styles.sectionTitle}>
        Etapas del día
      </ThemedText>
      <ThemedView type="surface" style={[styles.card, { borderRadius: theme.radius.large }]}>
        {SUN_STAGE_NOTIFICATIONS.map((def, index) => (
          <NotificationRow
            key={def.id}
            def={def}
            value={enabledMap[def.id] ?? false}
            onChange={(value) => setEnabled(def.id, value)}
            divider={index < SUN_STAGE_NOTIFICATIONS.length - 1}
          />
        ))}
      </ThemedView>
    </ScrollView>
  );
}

function NotificationRow({
  def,
  value,
  onChange,
  divider,
}: {
  def: DayNotificationDefinition;
  value: boolean;
  onChange: (value: boolean) => void;
  divider: boolean;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.row,
        divider && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
      ]}>
      <View style={styles.rowText}>
        <ThemedText type="default">{def.title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {def.body}
        </ThemedText>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor={theme.colors.onPrimary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  sectionTitle: {
    marginTop: Spacing.two,
  },
  card: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  rowText: {
    flex: 1,
    gap: Spacing.half,
  },
});
