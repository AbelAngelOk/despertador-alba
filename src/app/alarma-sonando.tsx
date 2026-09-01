import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { BackHandler, StyleSheet, Vibration, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Colors, Spacing } from '@/constants/theme';
import { DEFAULT_ALARM_SOUND } from '@/features/despertadores/constants';
import { useMicroActivityStore } from '@/features/despertadores/microActivityStore';
import { useAlarmsStore } from '@/features/despertadores/store';
import { resolveDismissStatus, resolveWakeResult } from '@/features/despertadores/wakeResult';
import { resolveAlarmSoundSource } from '@/lib/alarmSound';
import { cancelAlarmRings } from '@/lib/alarmNotifications';
import { formatTime } from '@/lib/format';
import { getSkyColors } from '@/lib/skyGradient';
import { getSunPositionInfo } from '@/lib/sunPosition';
import { useCustomSoundStore } from '@/store/customSound';
import { useLocationStore } from '@/store/location';
import { dateKey, useTrackingStore } from '@/store/tracking';

const VIBRATION_INTERVAL_MS = 1200;
const VIBRATION_DURATION_MS = 600;

export default function AlarmaSonandoScreen() {
  const router = useRouter();
  const { alarmId, occurrence: occurrenceParam } = useLocalSearchParams<{
    alarmId: string;
    occurrence: string;
  }>();
  const alarm = useAlarmsStore((state) => state.alarms.find((item) => item.id === alarmId));
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const logResult = useTrackingStore((state) => state.logResult);
  const startMicroActivity = useMicroActivityStore((state) => state.startInstance);
  const customSoundUri = useCustomSoundStore((state) => state.uri);

  const occurrence = useMemo(() => new Date(occurrenceParam ?? Date.now()), [occurrenceParam]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const dismissedRef = useRef(false);

  useEffect(() => {
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

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);

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

  function handleDismiss() {
    if (dismissedRef.current) return;
    dismissedRef.current = true;

    if (intervalRef.current) clearInterval(intervalRef.current);
    Vibration.cancel();
    playerRef.current?.remove();
    playerRef.current = null;

    if (alarmId && occurrenceParam) {
      cancelAlarmRings(alarmId, occurrenceParam);
    }

    const dismissStatus = resolveDismissStatus(Date.now() - occurrence.getTime());
    const microActivityConfig = alarm?.microActivity;

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
      router.replace({ pathname: '/microactividad', params: { key: instance.key } });
      return;
    }

    const result = resolveWakeResult(dismissStatus, 'notConfigured');
    if (result) logResult(dateKey(occurrence), result);

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
          {sunInfo?.phaseLabel ?? 'Es hora de despertar'}
        </ThemedText>

        <View style={styles.buttonWrapper}>
          <PrimaryButton label="Apagar" onPress={handleDismiss} />
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
    color: Colors.text,
    fontSize: 64,
    lineHeight: 68,
    marginVertical: Spacing.two,
  },
  buttonWrapper: {
    marginTop: Spacing.six,
    alignSelf: 'stretch',
  },
});
