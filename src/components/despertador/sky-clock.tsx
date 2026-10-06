import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { SkyScene, useActiveWeather, useSkyNow } from '@/components/sky/sky-scene';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { AlarmOccurrence } from '@/features/despertadores/schedule';
import { formatCountdown, formatTime } from '@/lib/format';
import { getSunPositionInfo } from '@/lib/sunPosition';
import { WEATHER_CONDITION_LABELS } from '@/lib/weather';

// El overlay de texto va sobre un scrim oscuro fijo (no sobre una superficie
// del template), así que se mantiene claro independiente del theme activo.
const SKY_TEXT_COLOR = '#F6F1E7';

interface SkyClockProps {
  latitude: number;
  longitude: number;
  nextAlarm: AlarmOccurrence | null;
}

/** Inicio: el cielo a pleno (sin atenuar) con la próxima alarma encima. */
export function SkyClock({ latitude, longitude, nextAlarm }: SkyClockProps) {
  const now = useSkyNow();
  const sunInfo = useMemo(
    () => getSunPositionInfo(now, latitude, longitude),
    [now, latitude, longitude]
  );
  const weather = useActiveWeather();

  return (
    <View style={styles.container}>
      <SkyScene latitude={latitude} longitude={longitude} now={now} />

      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
        style={styles.scrim}
        pointerEvents="none"
      />

      <View style={styles.overlay}>
        <ThemedText type="smallBold" style={styles.phase}>
          {sunInfo.phaseLabel} · {Math.round(sunInfo.altitudeDeg)}°
          {weather ? ` · ${WEATHER_CONDITION_LABELS[weather.condition]}` : ''}
        </ThemedText>

        {nextAlarm ? (
          <>
            <ThemedText type="small" style={styles.subtle}>
              Próxima alarma · {nextAlarm.alarm.name || 'Despertador'}
            </ThemedText>
            <ThemedText type="title" style={styles.time}>
              {formatTime(nextAlarm.date)}
            </ThemedText>
            <ThemedText type="smallBold" style={styles.subtle}>
              {formatCountdown(nextAlarm.date, now)}
            </ThemedText>
          </>
        ) : (
          <ThemedText type="small" style={styles.subtle}>
            No tenés despertadores activos
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 160,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.four,
    gap: Spacing.half,
  },
  phase: {
    color: SKY_TEXT_COLOR,
    marginBottom: Spacing.two,
  },
  subtle: {
    color: 'rgba(246,241,231,0.8)',
  },
  time: {
    color: SKY_TEXT_COLOR,
    fontSize: 44,
    lineHeight: 48,
  },
});
