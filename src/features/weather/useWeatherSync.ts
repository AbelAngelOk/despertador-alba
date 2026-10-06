import { useEffect } from 'react';

import { fetchCurrentWeather } from '@/lib/weather';
import { useLocationStore } from '@/store/location';
import { useSettingsStore } from '@/store/settings';
import { useWeatherStore } from '@/store/weather';

const REFRESH_INTERVAL_MS = 20 * 60_000;

/**
 * Módulo de Clima (beta) — separado a propósito del cálculo astronómico
 * (sol/luna/estrellas), que es offline y siempre está activo. Este hook solo
 * hace algo si el usuario prendió el switch de clima en Perfil > Ajustes, y solo pisa
 * la caché cuando el fetch a Open-Meteo realmente funciona: sin red, o con
 * el switch apagado, el cielo sigue mostrando lo que ya tenía.
 */
export function useWeatherSync(): void {
  const weatherEnabled = useSettingsStore((state) => state.weatherEnabled);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const setSnapshot = useWeatherStore((state) => state.setSnapshot);

  useEffect(() => {
    if (!weatherEnabled || latitude == null || longitude == null) return;

    let cancelled = false;

    async function refresh() {
      try {
        const snapshot = await fetchCurrentWeather(latitude as number, longitude as number);
        if (!cancelled) setSnapshot(snapshot);
      } catch {
        // Sin red o el servicio falló: se deja la última foto cacheada tal
        // cual, isWeatherFresh() se encarga de invalidarla si ya es vieja.
      }
    }

    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [weatherEnabled, latitude, longitude, setSnapshot]);
}
