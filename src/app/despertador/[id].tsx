import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { AlarmForm } from '@/components/despertador/alarm-form';
import { TestAlarmModal } from '@/components/despertador/test-alarm-modal';
import { SkyScreen } from '@/components/sky/sky-screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAlarmsStore } from '@/features/despertadores/store';
import { useSettingsStore } from '@/store/settings';
import { AlarmInput } from '@/types/alarm';

export default function EditarDespertadorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const alarm = useAlarmsStore((state) => state.alarms.find((item) => item.id === id));
  const updateAlarm = useAlarmsStore((state) => state.updateAlarm);
  const removeAlarm = useAlarmsStore((state) => state.removeAlarm);
  const addTestAlarm = useAlarmsStore((state) => state.addTestAlarm);
  const testEnabled = useSettingsStore((state) => state.testAlarmEnabled);
  const [testModalVisible, setTestModalVisible] = useState(false);

  if (!alarm) {
    return (
      <SkyScreen style={styles.notFound}>
        <ThemedText>No se encontró este despertador.</ThemedText>
      </SkyScreen>
    );
  }

  function handleSubmit(value: AlarmInput) {
    updateAlarm(id, value);
    router.back();
  }

  function handleTest(value: AlarmInput) {
    addTestAlarm(value);
    setTestModalVisible(true);
  }

  function handleCloseTestModal() {
    setTestModalVisible(false);
    router.back();
  }

  function handleDelete() {
    Alert.alert('Eliminar despertador', '¿Seguro que querés eliminarlo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          removeAlarm(id);
          router.back();
        },
      },
    ]);
  }

  return (
    <SkyScreen>
      <AlarmForm
        initialValue={{
          kind: alarm.kind,
          classicTime: alarm.classicTime,
          name: alarm.name,
          stage: alarm.stage,
          offsetMinutes: alarm.offsetMinutes,
          activeDays: alarm.activeDays,
          enabled: alarm.enabled,
          sound: alarm.sound,
          microActivity: alarm.microActivity,
        }}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        onTest={testEnabled ? handleTest : undefined}
      />
      <TestAlarmModal visible={testModalVisible} onClose={handleCloseTestModal} />
    </SkyScreen>
  );
}

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
});
