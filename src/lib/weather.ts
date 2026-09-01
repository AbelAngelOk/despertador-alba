export type WeatherCondition = 'clear' | 'cloudy' | 'rain';

export const WEATHER_CONDITION_LABELS: Record<WeatherCondition, string> = {
  clear: 'Despejado',
  cloudy: 'Nublado',
  rain: 'Lluvia',
};

export interface WeatherSnapshot {
  cloudCoverPercent: number;
  condition: WeatherCondition;
  fetchedAt: string;
}

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Códigos WMO (weathercode) que devuelve Open-Meteo. Se simplifican a 3
 * baldes: despejado, nublado (incluye niebla) y lluvia (incluye nieve, que
 * en la práctica no aporta mucho distinguirla acá).
 */
function conditionFromWeatherCode(code: number): WeatherCondition {
  if (code === 0) return 'clear';
  if (code === 1 || code === 2 || code === 3 || code === 45 || code === 48) return 'cloudy';
  return 'rain';
}

export async function fetchCurrentWeather(
  latitude: number,
  longitude: number
): Promise<WeatherSnapshot> {
  const url = `${OPEN_METEO_URL}?latitude=${latitude}&longitude=${longitude}&current=cloud_cover,weather_code`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Open-Meteo respondió ${response.status}`);

  const data = await response.json();
  const cloudCoverPercent = Number(data?.current?.cloud_cover ?? 0);
  const weatherCode = Number(data?.current?.weather_code ?? 0);

  return {
    cloudCoverPercent: Number.isFinite(cloudCoverPercent) ? cloudCoverPercent : 0,
    condition: conditionFromWeatherCode(weatherCode),
    fetchedAt: new Date().toISOString(),
  };
}
