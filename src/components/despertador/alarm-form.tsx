import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { DEFAULT_ACTIVE_DAYS, DEFAULT_ALARM_SOUND } from '@/features/despertadores/constants';
import { AlarmInput, AlarmSoundId, MicroActivityConfig } from '@/types/alarm';

import { DaySelector } from './day-selector';
import { MicroActivitySelector } from './microactivity-selector';
import { OffsetStepper } from './offset-stepper';
import { SoundSelector } from './sound-selector';
import { SunStageSelector } from './sun-stage-selector';

interface AlarmFormProps {
  initialValue?: AlarmInput;
  onSubmit: (value: AlarmInput) => void;
  onDelete?: () => void;
}

const EMPTY_VALUE: AlarmInput = {
  name: '',
  stage: 'sunrise',
  offsetMinutes: 0,
  activeDays: DEFAULT_ACTIVE_DAYS,
  enabled: true,
  sound: DEFAULT_ALARM_SOUND,
};

export function AlarmForm({ initialValue, onSubmit, onDelete }: AlarmFormProps) {
  const [name, setName] = useState(initialValue?.name ?? EMPTY_VALUE.name);
  const [stage, setStage] = useState(initialValue?.stage ?? EMPTY_VALUE.stage);
  const [offsetMinutes, setOffsetMinutes] = useState(
    initialValue?.offsetMinutes ?? EMPTY_VALUE.offsetMinutes
  );
  const [activeDays, setActiveDays] = useState(initialValue?.activeDays ?? EMPTY_VALUE.activeDays);
  const [sound, setSound] = useState<AlarmSoundId>(initialValue?.sound ?? EMPTY_VALUE.sound);
  const [microActivity, setMicroActivity] = useState<MicroActivityConfig | undefined>(
    initialValue?.microActivity
  );

  function handleSubmit() {
    onSubmit({
      name: name.trim(),
      stage,
      offsetMinutes,
      activeDays,
      enabled: initialValue?.enabled ?? true,
      sound,
      microActivity,
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.field}>
        <ThemedText type="smallBold">Nombre</ThemedText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Despertador"
          placeholderTextColor={Colors.textSecondary}
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Tipo de amanecer</ThemedText>
        <SunStageSelector value={stage} onChange={setStage} />
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Desfasaje</ThemedText>
        <OffsetStepper value={offsetMinutes} onChange={setOffsetMinutes} />
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Días activos</ThemedText>
        <DaySelector activeDays={activeDays} onChange={setActiveDays} />
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Sonido</ThemedText>
        <SoundSelector value={sound} onChange={setSound} />
      </View>

      <View style={styles.field}>
        <MicroActivitySelector value={microActivity} onChange={setMicroActivity} />
      </View>

      <PrimaryButton label="Guardar" onPress={handleSubmit} />

      {onDelete ? (
        <PrimaryButton label="Eliminar despertador" variant="danger" onPress={onDelete} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
  field: {
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    color: Colors.text,
    backgroundColor: Colors.backgroundElement,
  },
});
