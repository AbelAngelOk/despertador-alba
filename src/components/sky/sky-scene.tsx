import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { getMoonPositionInfo, isMoonVisible } from '@/lib/moonPosition';
import { getSkyColors, lerpColor } from '@/lib/skyGradient';
import { getStarsOpacity, STARS } from '@/lib/stars';
import { getSunPositionInfo } from '@/lib/sunPosition';
import { useSettingsStore } from '@/store/settings';
import { isWeatherFresh, useWeatherStore } from '@/store/weather';

const UPDATE_INTERVAL_MS = 30_000;
const VISIBLE_MIN_DEG = -18;
const VISIBLE_MAX_DEG = 45;
const SUN_SIZE = 26;
const MOON_SIZE = 16;
const MOON_DIM_COLOR = '#8A8A9A';
const MOON_BRIGHT_COLOR = '#F5F3E7';
const RAIN_STREAK_LEFT_PERCENTS = [8, 24, 40, 56, 72, 88];

/** Hora actual refrescada cada 30 s: el cielo cambia lento, no hace falta más. */
export function useSkyNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);
  return now;
}

/** true si el módulo Clima (beta) está activo y con datos frescos. */
export function useActiveWeather() {
  const weatherEnabled = useSettingsStore((state) => state.weatherEnabled);
  const snapshot = useWeatherStore((state) => state.snapshot);
  return weatherEnabled && isWeatherFresh(snapshot) ? snapshot : null;
}

function normalizeAltitude(deg: number) {
  const clamped = Math.max(VISIBLE_MIN_DEG, Math.min(VISIBLE_MAX_DEG, deg));
  return 1 - (clamped - VISIBLE_MIN_DEG) / (VISIBLE_MAX_DEG - VISIBLE_MIN_DEG);
}

function useAnimatedAltitude(altitudeDeg: number) {
  const [value] = useState(() => new Animated.Value(normalizeAltitude(altitudeDeg)));
  useEffect(() => {
    Animated.timing(value, {
      toValue: normalizeAltitude(altitudeDeg),
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [altitudeDeg, value]);
  return value.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
}

interface SkySceneProps {
  latitude: number;
  longitude: number;
  now: Date;
}

/**
 * El cielo real del lugar y la hora: gradiente según la altura del sol,
 * estrellas, luna, sol y (opt-in) nubes/lluvia. Ocupa todo su contenedor
 * (absoluteFill) y no recibe toques — es la base visual de toda la app: a
 * pleno en Inicio (SkyClock) y como fondo atenuado en el resto (SkyBackdrop).
 */
export function SkyScene({ latitude, longitude, now }: SkySceneProps) {
  const sunInfo = useMemo(
    () => getSunPositionInfo(now, latitude, longitude),
    [now, latitude, longitude]
  );
  const moonInfo = useMemo(
    () => getMoonPositionInfo(now, latitude, longitude),
    [now, latitude, longitude]
  );
  const [topColor, bottomColor] = useMemo(
    () => getSkyColors(sunInfo.altitudeDeg),
    [sunInfo.altitudeDeg]
  );

  const sunTop = useAnimatedAltitude(sunInfo.altitudeDeg);
  const moonTop = useAnimatedAltitude(moonInfo.altitudeDeg);
  const horizonTop = `${normalizeAltitude(0) * 100}%` as `${number}%`;
  const moonVisible = isMoonVisible(moonInfo.altitudeDeg, sunInfo.altitudeDeg);
  const moonColor = lerpColor(MOON_DIM_COLOR, MOON_BRIGHT_COLOR, moonInfo.illuminatedFraction);
  const starsOpacity = getStarsOpacity(sunInfo.altitudeDeg);

  // Módulo Clima (beta): opt-in, depende de red, nunca bloquea lo de arriba.
  const weather = useActiveWeather();
  const cloudOpacity = weather ? Math.min(0.4, (weather.cloudCoverPercent / 100) * 0.4) : 0;
  const isRaining = weather?.condition === 'rain';

  const [rainFall] = useState(() => new Animated.Value(0));
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
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[topColor, bottomColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[StyleSheet.absoluteFill, { opacity: starsOpacity }]}>
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
          style={[styles.moon, { top: moonTop, marginTop: -MOON_SIZE / 2, backgroundColor: moonColor }]}
        />
      ) : null}

      <Animated.View style={[styles.sunGlow, { top: sunTop, marginTop: -SUN_SIZE }]} />
      <Animated.View style={[styles.sun, { top: sunTop, marginTop: -SUN_SIZE / 2 }]} />

      {weather ? <View style={[styles.cloudTint, { opacity: cloudOpacity }]} /> : null}

      {isRaining
        ? RAIN_STREAK_LEFT_PERCENTS.map((left, index) => (
            <Animated.View key={index} style={[styles.rainStreak, { left: `${left}%`, top: rainTop }]} />
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#E7E9EE',
  },
  rainStreak: {
    position: 'absolute',
    width: 2,
    height: 14,
    borderRadius: 1,
    backgroundColor: 'rgba(200,220,255,0.55)',
  },
});
