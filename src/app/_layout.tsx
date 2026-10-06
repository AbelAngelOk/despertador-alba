import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { Inter_600SemiBold } from '@expo-google-fonts/inter';
import { SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import { useFonts } from 'expo-font';
import { NavigationBar } from 'expo-navigation-bar';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DndAccessPromptModal } from '@/components/despertador/dnd-access-prompt-modal';
import { useDndAccessPrompt } from '@/features/despertadores/dndAccessPrompt';
import {
  findResumableMicroActivityKey,
  reconcileMissedDays,
  reconcilePendingMicroActivities,
  reconcileTestAlarms,
} from '@/features/despertadores/reconcile';
import { useAlarmRingWatcher, useAlarmScheduler } from '@/features/despertadores/ringing';
import { useDayNotificationsScheduler } from '@/features/notificaciones/scheduler';
import { useTheme } from '@/hooks/use-theme';
import { useWeatherSync } from '@/features/weather/useWeatherSync';
import { useSyncSkyWidget } from '@/widgets/useSyncSkyWidget';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const theme = useTheme();

  // Una sola fuente display por template (title/subtitle en ThemedText); el
  // resto del texto usa la fuente del sistema para no arriesgar legibilidad.
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    VT323_400Regular,
    SpaceMono_700Bold,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    SplashScreen.hideAsync();
    reconcileMissedDays();
    reconcilePendingMicroActivities();
    reconcileTestAlarms();

    const resumableKey = findResumableMicroActivityKey();
    if (resumableKey) {
      // Diferido: navegar en la misma fase síncrona del commit inicial (antes
      // de que el navegador termine de montarse) puede hacer que expo-router
      // entre en un loop de actualizaciones. Ver la misma nota en ringing.ts.
      setTimeout(() => {
        router.replace({ pathname: '/microactividad', params: { key: resumableKey } });
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsLoaded]);

  useAlarmScheduler();
  useAlarmRingWatcher();
  useDayNotificationsScheduler();
  useSyncSkyWidget();
  useWeatherSync();
  const dndPrompt = useDndAccessPrompt(fontsLoaded);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      {Platform.OS === 'android' ? (
        <NavigationBar style={theme.isDark ? 'light' : 'dark'} />
      ) : null}
      <DndAccessPromptModal
        visible={dndPrompt.visible}
        openFailed={dndPrompt.openFailed}
        onConfigure={dndPrompt.confirm}
        onDecline={dndPrompt.decline}
      />
      <Stack
        screenOptions={{
          // Header transparente: el cielo de fondo (SkyScreen) sigue por
          // detrás; SkyScreen compensa su alto con padding.
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: theme.colors.textPrimary,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="despertador/nuevo" options={{ title: 'Nuevo despertador' }} />
        <Stack.Screen name="despertador/[id]" options={{ title: 'Editar despertador' }} />
        <Stack.Screen name="microactividades" options={{ title: 'Microactividades' }} />
        <Stack.Screen name="perfil" options={{ title: 'Perfil' }} />
        <Stack.Screen name="ajustes" options={{ title: 'Ajustes y configuración' }} />
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
