import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { AlarmCard } from '@/components/despertador/alarm-card';
import { NewAlarmFab } from '@/components/despertador/new-alarm-fab';
import { NotificationsPanel } from '@/components/notificaciones/notifications-panel';
import { SkyScreen } from '@/components/sky/sky-screen';
import { ThemedText } from '@/components/themed-text';
import { SegmentedSwitch } from '@/components/ui/segmented-switch';
import { Spacing } from '@/constants/theme';
import { useAlarmsStore } from '@/features/despertadores/store';

type SegmentView = 'despertadores' | 'notificaciones';

const VIEW_OPTIONS: { value: SegmentView; label: string }[] = [
  { value: 'despertadores', label: 'Despertadores' },
  { value: 'notificaciones', label: 'Notificaciones' },
];

/** Despertadores y Notificaciones comparten tab: el switch del header alterna la vista. */
export default function DespertadoresScreen() {
  const alarms = useAlarmsStore((state) => state.alarms);
  const { vista } = useLocalSearchParams<{ vista?: string }>();
  const [view, setView] = useState<SegmentView>(
    vista === 'notificaciones' ? 'notificaciones' : 'despertadores'
  );

  return (
    <SkyScreen edges={['top']}>
      <View style={styles.header}>
        <SegmentedSwitch options={VIEW_OPTIONS} value={view} onChange={setView} />
      </View>

      {view === 'despertadores' ? (
        <>
          <FlatList
            data={alarms}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => <AlarmCard alarm={item} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <ThemedText type="smallBold">Todavía no tenés despertadores</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.emptyCopy}>
                  Creá el primero para despertar con la luz del amanecer.
                </ThemedText>
              </View>
            }
          />
          <NewAlarmFab />
        </>
      ) : (
        <NotificationsPanel />
      )}
    </SkyScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  list: {
    padding: Spacing.four,
    // Deja lugar al "+" para que no tape la última tarjeta.
    paddingBottom: Spacing.six + 56,
    gap: Spacing.three,
    flexGrow: 1,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.one,
  },
  emptyCopy: {
    textAlign: 'center',
  },
});
