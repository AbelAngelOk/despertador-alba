import Constants from 'expo-constants';
import type * as NotificationsModule from 'expo-notifications';
import { AppState, Platform } from 'react-native';

export const SNOOZE_INTERVAL_MIN = 5;
export const MAX_RINGS = 3;
export const ALARM_CHANNEL_ID = 'alarms';

/**
 * expo-notifications ejecuta un módulo de auto-registro de push tokens apenas
 * se importa. Desde que Expo Go dejó de soportar push (SDK 53), ese módulo
 * lanza un error en vez de solo avisar, y como es una importación estática
 * eso rompería toda la app al abrirla en Expo Go. Por eso el require es
 * condicional y perezoso: en Expo Go directamente no se carga el paquete.
 */
const isExpoGo = Constants.appOwnership === 'expo';

function getNotifications(): typeof NotificationsModule | null {
  if (isExpoGo) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('expo-notifications');
}

const Notifications = getNotifications();

Notifications?.setNotificationHandler({
  handleNotification: async () => {
    // Con la app en primer plano, alarma-sonando.tsx ya vibra y muestra el
    // aviso a pantalla completa — mostrar además la notificación del sistema
    // (importancia máxima) duplica la alerta y se siente invasivo. Solo hace
    // falta cuando la app está en segundo plano.
    const appIsForeground = AppState.currentState === 'active';
    return {
      shouldShowBanner: !appIsForeground,
      shouldShowList: !appIsForeground,
      shouldPlaySound: !appIsForeground,
      shouldSetBadge: false,
    };
  },
});

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (!Notifications) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function configureAndroidChannel(): Promise<void> {
  if (!Notifications || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
    name: 'Despertadores',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    vibrationPattern: [0, 500, 250, 500],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

function notificationIdFor(alarmId: string, occurrenceIso: string, ringIndex: number): string {
  return `alarm-${alarmId}-${occurrenceIso}-${ringIndex}`;
}

export async function scheduleAlarmRings(
  alarmId: string,
  alarmName: string,
  occurrence: Date
): Promise<void> {
  if (!Notifications) return;
  const occurrenceIso = occurrence.toISOString();

  for (let ringIndex = 0; ringIndex < MAX_RINGS; ringIndex++) {
    const triggerDate = new Date(occurrence.getTime() + ringIndex * SNOOZE_INTERVAL_MIN * 60_000);
    if (triggerDate.getTime() <= Date.now()) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: notificationIdFor(alarmId, occurrenceIso, ringIndex),
      content: {
        title: alarmName || 'Despertador',
        body: ringIndex === 0 ? 'Es hora de despertar' : 'Seguís sin apagar la alarma',
        sound: 'default',
        data: { alarmId, occurrenceIso },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: ALARM_CHANNEL_ID,
      },
    });
  }
}

export async function cancelAlarmRings(alarmId: string, occurrenceIso: string): Promise<void> {
  if (!Notifications) return;
  for (let ringIndex = 0; ringIndex < MAX_RINGS; ringIndex++) {
    await Notifications.cancelScheduledNotificationAsync(
      notificationIdFor(alarmId, occurrenceIso, ringIndex)
    );
  }
}

export async function cancelAllScheduledRings(): Promise<void> {
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
