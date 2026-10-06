import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { AlarmForm } from '@/components/despertador/alarm-form';
import { TestAlarmModal } from '@/components/despertador/test-alarm-modal';
import { SkyScreen } from '@/components/sky/sky-screen';
import { useAlarmsStore } from '@/features/despertadores/store';
import { useSettingsStore } from '@/store/settings';
import { AlarmInput } from '@/types/alarm';

export default function NuevoDespertadorScreen() {
  const router = useRouter();
  const { tipo } = useLocalSearchParams<{ tipo?: string }>();
  const kind = tipo === 'clasico' ? 'classic' : 'solar';
  const addAlarm = useAlarmsStore((state) => state.addAlarm);
  const addTestAlarm = useAlarmsStore((state) => state.addTestAlarm);
  const testEnabled = useSettingsStore((state) => state.testAlarmEnabled);
  const [testModalVisible, setTestModalVisible] = useState(false);

  function handleSubmit(value: AlarmInput) {
    addAlarm(value);
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

  return (
    <SkyScreen>
      <Stack.Screen
        options={{ title: kind === 'classic' ? 'Nuevo despertador clásico' : 'Nuevo despertador' }}
      />
      <AlarmForm kind={kind} onSubmit={handleSubmit} onTest={testEnabled ? handleTest : undefined} />
      <TestAlarmModal visible={testModalVisible} onClose={handleCloseTestModal} />
    </SkyScreen>
  );
}
