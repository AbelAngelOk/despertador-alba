import Constants from 'expo-constants';
import type * as NotificationsModule from 'expo-notifications';

import { DayNotificationDefinition } from '@/features/notificaciones/catalog';

import { dateKey } from '../store/tracking';

// Ver la nota en alarmNotifications.ts: expo-notifications no se puede
// importar en Expo Go sin crashear la app.
const isExpoGo = Constants.appOwnership === 'expo';

function getNotifications(): typeof NotificationsModule | null {
  if (isExpoGo) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('expo-notifications');
}

const Notifications = getNotifications();

export const DAY_NOTIFICATION_CHANNEL_ID = 'day-notifications';
const ID_PREFIX = 'day-';

export async function configureDayNotificationChannel(): Promise<void> {
  if (!Notifications) return;
  await Notifications.setNotificationChannelAsync(DAY_NOTIFICATION_CHANNEL_ID, {
    name: 'Notificaciones del día',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250],
  });
}

function notificationIdFor(defId: string, date: Date): string {
  return `${ID_PREFIX}${defId}-${dateKey(date)}`;
}

export async function scheduleDayNotification(
  def: DayNotificationDefinition,
  date: Date
): Promise<void> {
  if (!Notifications) return;
  await Notifications.scheduleNotificationAsync({
    identifier: notificationIdFor(def.id, date),
    content: {
      title: def.title,
      body: def.body,
      data: { dayNotificationId: def.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: DAY_NOTIFICATION_CHANNEL_ID,
    },
  });
}

export async function cancelAllDayNotifications(): Promise<void> {
  if (!Notifications) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const item of scheduled) {
    if (item.identifier.startsWith(ID_PREFIX)) {
      await Notifications.cancelScheduledNotificationAsync(item.identifier);
    }
  }
}
