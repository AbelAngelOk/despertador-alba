import Constants from 'expo-constants';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

import { useAlarmsStore } from '@/features/despertadores/store';
import { useLocationStore } from '@/store/location';

import { SkyClockWidget } from './sky-clock-widget';
import { computeSkyWidgetData } from './widgetData';

// El widget nativo no está presente en Expo Go (necesita un dev/standalone
// build, igual que expo-notifications) — nunca se importa la librería ahí.
const isExpoGo = Constants.appOwnership === 'expo';
const REFRESH_INTERVAL_MS = 15 * 60_000;

async function pushWidgetUpdate() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { requestWidgetUpdate } = require('react-native-android-widget');
  const data = await computeSkyWidgetData();
  requestWidgetUpdate({
    widgetName: 'SkyClock',
    renderWidget: () => <SkyClockWidget data={data} />,
  });
}

/**
 * Empuja contenido nuevo al widget cada vez que cambian las alarmas o la
 * ubicación, y además cada 15min mientras la app está abierta (el sistema
 * operativo ya lo actualiza solo cada 30min como piso vía updatePeriodMillis,
 * esto es solo para que se sienta más al día mientras se usa el teléfono).
 */
export function useSyncSkyWidget(): void {
  const alarms = useAlarmsStore((state) => state.alarms);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);

  useEffect(() => {
    if (isExpoGo || Platform.OS !== 'android') return;

    pushWidgetUpdate();
    const interval = setInterval(pushWidgetUpdate, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [alarms, latitude, longitude]);
}
