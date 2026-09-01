import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { AlarmOccurrence } from '@/features/despertadores/schedule';
import { formatCountdown, formatTime } from '@/lib/format';
import { getMoonPositionInfo, isMoonVisible } from '@/lib/moonPosition';
import { getSkyColors, lerpColor } from '@/lib/skyGradient';
import { getStarsOpacity, STARS } from '@/lib/stars';
import { getSunPositionInfo } from '@/lib/sunPosition';
import { WEATHER_CONDITION_LABELS } from '@/lib/weather';
import { useSettingsStore } from '@/store/settings';
import { isWeatherFresh, useWeatherStore } from '@/store/weather';

const UPDATE_INTERVAL_MS = 30_000;
const VISIBLE_MIN_DEG = -18;
const VISIBLE_MAX_DEG = 45;
const SUN_SIZE = 26;
const MOON_SIZE = 16;
const MOON_DIM_COLOR = '#8A8A9A';
const MOON_BRIGHT_COLOR = '#F5F3E7';
const RAIN_STREAK_COUNT = 6;
const RAIN_STREAK_LEFT_PERCENTS = [8, 24, 40, 56, 72, 88];

interface SkyClockProps {
  latitude: number;
  longitude: number;
  nextAlarm: AlarmOccurrence | null;
}

function normalizeAltitude(deg: number) {
  const clamped = Math.max(VISIBLE_MIN_DEG, Math.min(VISIBLE_MAX_DEG, deg));
  return 1 - (clamped - VISIBLE_MIN_DEG) / (VISIBLE_MAX_DEG - VISIBLE_MIN_DEG);
}

export function SkyClock({ latitude, longitude, nextAlarm }: SkyClockProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // --- Cielo astronómico (sol, luna, estrellas): siempre activo, offline ---
  const sunInfo = useMemo(
    () => getSunPositionInfo(now, latitude, longitude),
    [now, latitude, longitude]
  );
  const [topColor, bottomColor] = useMemo(
    () => getSkyColors(sunInfo.altitudeDeg),
    [sunInfo.altitudeDeg]
  );

  const sunPosition = useRef(new Animated.Value(normalizeAltitude(sunInfo.altitudeDeg))).current;

  useEffect(() => {
    Animated.timing(sunPosition, {
      toValue: normalizeAltitude(sunInfo.altitudeDeg),
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [sunInfo.altitudeDeg, sunPosition]);

  const sunTop = sunPosition.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const horizonTop = `${normalizeAltitude(0) * 100}%` as `${number}%`;

  const moonInfo = useMemo(
    () => getMoonPositionInfo(now, latitude, longitude),
    [now, latitude, longitude]
  );
  const moonVisible = isMoonVisible(moonInfo.altitudeDeg, sunInfo.altitudeDeg);
  const moonColor = lerpColor(MOON_DIM_COLOR, MOON_BRIGHT_COLOR, moonInfo.illuminatedFraction);

  const moonPosition = useRef(new Animated.Value(normalizeAltitude(moonInfo.altitudeDeg))).current;

  useEffect(() => {
    Animated.timing(moonPosition, {
      toValue: normalizeAltitude(moonInfo.altitudeDeg),
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [moonInfo.altitudeDeg, moonPosition]);

  const moonTop = moonPosition.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const starsOpacity = getStarsOpacity(sunInfo.altitudeDeg);

  // --- Módulo Clima (beta): opt-in, depende de red, nunca bloquea lo de arriba ---
  const weatherEnabled = useSettingsStore((state) => state.weatherEnabled);
  const weatherSnapshot = useWeatherStore((state) => state.snapshot);
  const weatherActive = weatherEnabled && isWeatherFresh(weatherSnapshot);
  const cloudOpacity = weatherActive
    ? Math.min(0.4, ((weatherSnapshot?.cloudCoverPercent ?? 0) / 100) * 0.4)
    : 0;
  const isRaining = weatherActive && weatherSnapshot?.condition === 'rain';

  const rainFall = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!isRaining) return;
    rainFall.setValue(0);
    const loop = Animated.loop(
      Animated.timing(rainFall, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [isRaining, rainFall]);
  const rainTop = rainFall.interpolate({ inputRange: [0, 1], outputRange: ['-10%', '110%'] });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[topColor, bottomColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.starsLayer, { opacity: starsOpacity }]} pointerEvents="none">
        {STARS.map((star, index) => (
          <View
            key={index}
            style={[
              styles.star,
              {
                left: `${star.leftPercent}%`,
                top: `${star.topPercent}%`,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
              },
            ]}
          />
        ))}
      </View>

      <View style={[styles.horizon, { top: horizonTop }]} />

      {moonVisible ? (
        <Animated.View
          style={[
            styles.moon,
            { top: moonTop, marginTop: -MOON_SIZE / 2, backgroundColor: moonColor },
          ]}
        />
      ) : null}

      <Animated.View style={[styles.sunGlow, { top: sunTop, marginTop: -SUN_SIZE }]} />
      <Animated.View style={[styles.sun, { top: sunTop, marginTop: -SUN_SIZE / 2 }]} />

      {weatherActive ? (
        <View style={[styles.cloudTint, { opacity: cloudOpacity }]} pointerEvents="none" />
      ) : null}

      {isRaining
        ? RAIN_STREAK_LEFT_PERCENTS.slice(0, RAIN_STREAK_COUNT).map((left, index) => (
            <Animated.View
              key={index}
              style={[styles.rainStreak, { left: `${left}%`, top: rainTop }]}
              pointerEvents="none"
            />
          ))
        : null}

      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
        style={styles.scrim}
        pointerEvents="none"
      />

      <View style={styles.overlay}>
        <ThemedText type="smallBold" style={styles.phase}>
          {sunInfo.phaseLabel} · {Math.round(sunInfo.altitudeDeg)}°
          {weatherActive ? ` · ${WEATHER_CONDITION_LABELS[weatherSnapshot!.condition]}` : ''}
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
  starsLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  horizon: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  moon: {
    position: 'absolute',
    left: '20%',
    width: MOON_SIZE,
    height: MOON_SIZE,
    borderRadius: MOON_SIZE / 2,
  },
  sunGlow: {
    position: 'absolute',
    left: '50%',
    marginLeft: -SUN_SIZE,
    width: SUN_SIZE * 2,
    height: SUN_SIZE * 2,
    borderRadius: SUN_SIZE,
    backgroundColor: 'rgba(255,206,122,0.35)',
  },
  sun: {
    position: 'absolute',
    left: '50%',
    marginLeft: -SUN_SIZE / 2,
    width: SUN_SIZE,
    height: SUN_SIZE,
    borderRadius: SUN_SIZE / 2,
    backgroundColor: '#FFE8B0',
  },
  cloudTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E7E9EE',
  },
  rainStreak: {
    position: 'absolute',
    width: 2,
    height: 14,
    borderRadius: 1,
    backgroundColor: 'rgba(200,220,255,0.55)',
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
    color: Colors.text,
    marginBottom: Spacing.two,
  },
  subtle: {
    color: 'rgba(246,241,231,0.8)',
  },
  time: {
    color: Colors.text,
    fontSize: 44,
    lineHeight: 48,
  },
});
