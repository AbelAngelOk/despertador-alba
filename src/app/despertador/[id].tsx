import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { AlarmForm } from '@/components/despertador/alarm-form';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAlarmsStore } from '@/features/despertadores/store';
import { AlarmInput } from '@/types/alarm';

export default function EditarDespertadorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const alarm = useAlarmsStore((state) => state.alarms.find((item) => item.id === id));
  const updateAlarm = useAlarmsStore((state) => state.updateAlarm);
  const removeAlarm = useAlarmsStore((state) => state.removeAlarm);

  if (!alarm) {
    return (
      <View style={styles.notFound}>
        <ThemedText>No se encontró este despertador.</ThemedText>
      </View>
    );
  }

  function handleSubmit(value: AlarmInput) {
    updateAlarm(id, value);
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
    <AlarmForm
      initialValue={{
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
    />
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
