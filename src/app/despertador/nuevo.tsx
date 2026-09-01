import { useRouter } from 'expo-router';

import { AlarmForm } from '@/components/despertador/alarm-form';
import { useAlarmsStore } from '@/features/despertadores/store';
import { AlarmInput } from '@/types/alarm';

export default function NuevoDespertadorScreen() {
  const router = useRouter();
  const addAlarm = useAlarmsStore((state) => state.addAlarm);

  function handleSubmit(value: AlarmInput) {
    addAlarm(value);
    router.back();
  }

  return <AlarmForm onSubmit={handleSubmit} />;
}
