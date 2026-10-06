import { AlarmEngine } from '@modules/alarm-engine';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, StyleSheet, Vibration, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Spacing } from '@/constants/theme';
import {
  DEFAULT_ALARM_SOUND,
  getAlarmWakeMessage,
  getNextSunStage,
  SUN_STAGE_LABELS,
} from '@/features/despertadores/constants';
import { useMicroActivityStore } from '@/features/despertadores/microActivityStore';
import { useAlarmsStore } from '@/features/despertadores/store';
import { resolveDismissStatus, resolveWakeResult } from '@/features/despertadores/wakeResult';
import { resolveAlarmSoundSource } from '@/lib/alarmSound';
import { cancelAlarmRings } from '@/lib/alarmNotifications';
import { formatTime } from '@/lib/format';
import { getSkyColors } from '@/lib/skyGradient';
import { getStageTime, isValidStageTime } from '@/lib/sunTimes';
import { getSunPositionInfo } from '@/lib/sunPosition';
import { useCustomSoundStore } from '@/store/customSound';
import { useLocationStore } from '@/store/location';
import { dateKey, useTrackingStore } from '@/store/tracking';

const SNOOZE_MINUTES = 5;

const VIBRATION_INTERVAL_MS = 1200;
const VIBRATION_DURATION_MS = 600;
// El texto va sobre un gradiente de cielo simulado (no sobre una superficie
// del template), así que se mantiene claro fijo en vez de seguir el theme
// activo — con un template claro el texto seguiría siendo legible sobre un
// cielo nocturno oscuro.
const SKY_TEXT_COLOR = '#F6F1E7';

export default function AlarmaSonandoScreen() {
  const router = useRouter();
  const { alarmId, occurrence: occurrenceParam } = useLocalSearchParams<{
    alarmId: string;
    occurrence: string;
  }>();
  const alarm = useAlarmsStore((state) => state.alarms.find((item) => item.id === alarmId));
  const removeTestAlarm = useAlarmsStore((state) => state.removeTestAlarm);
  const setPostponedUntil = useAlarmsStore((state) => state.setPostponedUntil);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const logResult = useTrackingStore((state) => state.logResult);
  const startMicroActivity = useMicroActivityStore((state) => state.startInstance);
  const customSoundUri = useCustomSoundStore((state) => state.uri);

  // Date.now() solo se usa como fallback si abren esta pantalla sin un occurrence
  // real (no debería pasar en uso normal); se congela al montar para no leer el
  // reloj de nuevo en cada render.
  const [mountedAt] = useState(() => Date.now());
  const occurrence = useMemo(
    () => new Date(occurrenceParam ?? mountedAt),
    [occurrenceParam, mountedAt]
  );
  // Si la alarma la está haciendo sonar el servicio nativo (app abierta desde
  // la notificación, o sonó con la app en primer plano), ya hay sonido y
  // vibración: esta pantalla solo los corta al apagar.
  const [nativeRinging] = useState(() => AlarmEngine?.getRingingAlarm() != null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const dismissedRef = useRef(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    if (nativeRinging) return () => backHandler.remove();

    Vibration.vibrate(VIBRATION_DURATION_MS);
    intervalRef.current = setInterval(
      () => Vibration.vibrate(VIBRATION_DURATION_MS),
      VIBRATION_INTERVAL_MS
    );

    const soundId = alarm?.sound ?? DEFAULT_ALARM_SOUND;
    const source = resolveAlarmSoundSource(soundId, customSoundUri);
    const player = createAudioPlayer(source);
    player.loop = true;
    player.play();
    playerRef.current = player;

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      Vibration.cancel();
      playerRef.current?.remove();
      backHandler.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sunInfo = useMemo(() => {
    if (latitude == null || longitude == null) return null;
    return getSunPositionInfo(new Date(), latitude, longitude);
  }, [latitude, longitude]);
  const [topColor, bottomColor] = useMemo(
    () => getSkyColors(sunInfo?.altitudeDeg ?? 0),
    [sunInfo]
  );

  // "Sonar de nuevo en el {próxima etapa}": solo tiene sentido para despertadores
  // solares que todavía no están en la última etapa (sunrise), y solo si ese
  // horario cae más adelante hoy (evita ofrecerlo si, p. ej., ya pasó).
  const nextStage = alarm && alarm.kind !== 'classic' ? getNextSunStage(alarm.stage) : null;
  const nextStageTime = useMemo(() => {
    if (!nextStage || latitude == null || longitude == null) return null;
    const time = getStageTime(new Date(mountedAt), latitude, longitude, nextStage);
    // mountedAt (congelado al montar, no Date.now() de nuevo) para no leer el
    // reloj durante el render — ver la regla de pureza del React Compiler.
    return isValidStageTime(time) && time.getTime() > mountedAt ? time : null;
  }, [nextStage, latitude, longitude, mountedAt]);

  // Mensaje acorde a qué tan clarito está el cielo en la etapa configurada;
  // para despertadores clásicos (sin etapa solar) queda el genérico de abajo.
  const wakeMessage = alarm ? getAlarmWakeMessage(alarm) : null;

  /** Corta sonido/vibración/servicio nativo — común a apagar y a posponer. */
  function stopRinging() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    Vibration.cancel();
    playerRef.current?.remove();
    playerRef.current = null;
    AlarmEngine?.stopRinging();
    if (alarmId && occurrenceParam) {
      cancelAlarmRings(alarmId, occurrenceParam);
    }
  }

  /** "Sonar de nuevo": no cuenta como despertado (no toca seguimiento ni microactividad). */
  function handlePostpone(target: Date) {
    if (dismissedRef.current || !alarmId) return;
    dismissedRef.current = true;
    stopRinging();
    setPostponedUntil(alarmId, target.toISOString());
    router.replace('/(tabs)');
  }

  function handleDismiss() {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    stopRinging();
    if (alarmId) setPostponedUntil(alarmId, null);

    const dismissStatus = resolveDismissStatus(Date.now() - occurrence.getTime());
    const microActivityConfig = alarm?.microActivity;
    const isTestAlarm = Boolean(alarm?.testRingAt);

    if (alarmId && occurrenceParam && microActivityConfig?.enabled) {
      const instance = startMicroActivity({
        alarmId,
        alarmName: alarm?.name ?? '',
        occurrenceIso: occurrenceParam,
        type: microActivityConfig.type,
        customLabel: microActivityConfig.customLabel,
        completionWindowMinutes: microActivityConfig.completionWindowMinutes,
        dismissStatus,
      });
      if (isTestAlarm && alarmId) removeTestAlarm(alarmId);
      router.replace({ pathname: '/microactividad', params: { key: instance.key } });
      return;
    }

    const result = resolveWakeResult(dismissStatus, 'notConfigured');
    if (result) logResult(dateKey(occurrence), result);

    if (isTestAlarm && alarmId) removeTestAlarm(alarmId);
    router.replace('/(tabs)');
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[topColor, bottomColor]} style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        <ThemedText type="small" style={styles.label}>
          {alarm?.name || 'Despertador'}
        </ThemedText>
        <ThemedText type="title" style={styles.time}>
          {formatTime(occurrence)}
        </ThemedText>
        <ThemedText type="small" style={styles.label}>
          {wakeMessage ?? sunInfo?.phaseLabel ?? 'Es hora de despertar'}
        </ThemedText>

        <View style={styles.buttonWrapper}>
          <PrimaryButton label="Apagar" onPress={handleDismiss} />
          <PrimaryButton
            variant="ghost"
            label={`Sonar de nuevo en ${SNOOZE_MINUTES} minutos`}
            onPress={() => handlePostpone(new Date(Date.now() + SNOOZE_MINUTES * 60_000))}
          />
          {nextStage && nextStageTime ? (
            <PrimaryButton
              variant="ghost"
              label={`Sonar de nuevo en el ${SUN_STAGE_LABELS[nextStage].toLowerCase()}`}
              onPress={() => handlePostpone(nextStageTime)}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.five,
  },
  label: {
    color: 'rgba(246,241,231,0.85)',
  },
  time: {
    color: SKY_TEXT_COLOR,
    fontSize: 64,
    lineHeight: 68,
    marginVertical: Spacing.two,
  },
  buttonWrapper: {
    marginTop: Spacing.six,
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
});
