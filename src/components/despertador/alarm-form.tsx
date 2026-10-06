import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Spacing } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';
import { createDefaultAlarmInput, DEFAULT_CLASSIC_TIME } from '@/features/despertadores/constants';
import { useTheme } from '@/hooks/use-theme';
import { AlarmInput, AlarmKind, AlarmSoundId, ClassicTime, MicroActivityConfig } from '@/types/alarm';

import { DaySelector } from './day-selector';
import { MicroActivitySelector } from './microactivity-selector';
import { OffsetStepper } from './offset-stepper';
import { SoundSelector } from './sound-selector';
import { SunStageSelector } from './sun-stage-selector';
import { TimeField } from './time-field';

interface AlarmFormProps {
  /** Tipo para un despertador nuevo; al editar manda el de initialValue. */
  kind?: AlarmKind;
  initialValue?: AlarmInput;
  onSubmit: (value: AlarmInput) => void;
  onDelete?: () => void;
  /** Crea un despertador de prueba que suena en 1 minuto con estos mismos datos. */
  onTest?: (value: AlarmInput) => void;
}

export function AlarmForm({ kind: newKind = 'solar', initialValue, onSubmit, onDelete, onTest }: AlarmFormProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [defaults] = useState(() => initialValue ?? createDefaultAlarmInput(newKind));
  const kind: AlarmKind = defaults.kind ?? 'solar';
  const [name, setName] = useState(defaults.name);
  const [stage, setStage] = useState(defaults.stage);
  const [offsetMinutes, setOffsetMinutes] = useState(defaults.offsetMinutes);
  const [classicTime, setClassicTime] = useState<ClassicTime>(
    defaults.classicTime ?? DEFAULT_CLASSIC_TIME
  );
  const [activeDays, setActiveDays] = useState(defaults.activeDays);
  const [sound, setSound] = useState<AlarmSoundId>(defaults.sound);
  const [microActivity, setMicroActivity] = useState<MicroActivityConfig | undefined>(
    defaults.microActivity
  );

  function buildValue(): AlarmInput {
    return {
      kind,
      ...(kind === 'classic' ? { classicTime } : {}),
      name: name.trim(),
      stage,
      offsetMinutes,
      activeDays,
      enabled: initialValue?.enabled ?? true,
      sound,
      microActivity,
    };
  }

  function handleSubmit() {
    onSubmit(buildValue());
  }

  function handleTest() {
    onTest?.(buildValue());
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.field}>
        <ThemedText type="smallBold">Nombre</ThemedText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Despertador"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
        />
      </View>

      {kind === 'classic' ? (
        <View style={styles.field}>
          <ThemedText type="smallBold">Hora</ThemedText>
          <TimeField value={classicTime} onChange={setClassicTime} />
        </View>
      ) : (
        <>
          <View style={styles.field}>
            <ThemedText type="smallBold">Tipo de amanecer</ThemedText>
            <SunStageSelector value={stage} onChange={setStage} />
          </View>

          <View style={styles.field}>
            <ThemedText type="smallBold">Desfasaje</ThemedText>
            <OffsetStepper value={offsetMinutes} onChange={setOffsetMinutes} />
          </View>
        </>
      )}

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

      {onTest ? (
        <PrimaryButton label="Probar en 1 minuto" variant="ghost" onPress={handleTest} />
      ) : null}

      {onDelete ? (
        <PrimaryButton label="Eliminar despertador" variant="danger" onPress={onDelete} />
      ) : null}
    </ScrollView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
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
      borderColor: theme.colors.border,
      borderRadius: theme.radius.medium,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.three,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surface,
    },
  });
}
