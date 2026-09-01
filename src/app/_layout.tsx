import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import {
  findResumableMicroActivityKey,
  reconcileMissedDays,
  reconcilePendingMicroActivities,
} from '@/features/despertadores/reconcile';
import { useAlarmRingWatcher, useAlarmScheduler } from '@/features/despertadores/ringing';
import { useDayNotificationsScheduler } from '@/features/notificaciones/scheduler';
import { useWeatherSync } from '@/features/weather/useWeatherSync';
import { useSyncSkyWidget } from '@/widgets/useSyncSkyWidget';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    SplashScreen.hideAsync();
    reconcileMissedDays();
    reconcilePendingMicroActivities();

    const resumableKey = findResumableMicroActivityKey();
    if (resumableKey) {
      router.replace({ pathname: '/microactividad', params: { key: resumableKey } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useAlarmScheduler();
  useAlarmRingWatcher();
  useDayNotificationsScheduler();
  useSyncSkyWidget();
  useWeatherSync();

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="despertador/nuevo" options={{ title: 'Nuevo despertador' }} />
        <Stack.Screen name="despertador/[id]" options={{ title: 'Editar despertador' }} />
        <Stack.Screen name="microactividades" options={{ title: 'Microactividades' }} />
        <Stack.Screen
          name="alarma-sonando"
          options={{ headerShown: false, presentation: 'modal', gestureEnabled: false }}
        />
        <Stack.Screen
          name="microactividad"
          options={{ headerShown: false, presentation: 'modal', gestureEnabled: false }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
