import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { DAY_NOTIFICATIONS, DayNotificationDefinition } from '@/features/notificaciones/catalog';
import { useNotificationPrefsStore } from '@/store/notificationPrefs';

const SUN_STAGE_NOTIFICATIONS = DAY_NOTIFICATIONS.filter((def) => def.trigger.kind === 'sunStage');
const ALARM_RELATIVE_NOTIFICATIONS = DAY_NOTIFICATIONS.filter(
  (def) => def.trigger.kind === 'beforeAlarm'
);

export default function NotificacionesScreen() {
  const enabledMap = useNotificationPrefsStore((state) => state.enabled);
  const setEnabled = useNotificationPrefsStore((state) => state.setEnabled);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.heading}>
          Notificaciones
        </ThemedText>

        <ThemedText type="small" themeColor="textSecondary">
          Avisos ligados al ritmo del día, calculados con tu ubicación — no dependen de cuenta ni
          de conexión. Están todos desactivados por defecto: activá solo los que quieras recibir.
        </ThemedText>

        <ThemedText type="smallBold" style={styles.sectionTitle}>
          Antes del despertador
        </ThemedText>
        <ThemedView type="backgroundElement" style={styles.card}>
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
        <ThemedView type="backgroundElement" style={styles.card}>
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
    </SafeAreaView>
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
  return (
    <View style={[styles.row, divider && styles.rowDivider]}>
      <View style={styles.rowText}>
        <ThemedText type="default">{def.title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {def.body}
        </ThemedText>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.border, true: Colors.accent }}
        thumbColor={Colors.text}
      />
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
    paddingTop: Spacing.five,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  heading: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    marginTop: Spacing.two,
  },
  card: {
    borderRadius: Radius.large,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowText: {
    flex: 1,
    gap: Spacing.half,
  },
});
