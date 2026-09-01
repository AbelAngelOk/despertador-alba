import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { useMicroActivityCatalogStore } from '@/features/despertadores/microActivityCatalogStore';
import { useMicroActivityStore } from '@/features/despertadores/microActivityStore';
import { useAlarmsStore } from '@/features/despertadores/store';
import { useLocationStore } from '@/store/location';
import { useNotificationPrefsStore } from '@/store/notificationPrefs';
import { useSettingsStore } from '@/store/settings';
import { dateKey, useTrackingStore } from '@/store/tracking';
import { useWeatherStore } from '@/store/weather';

const BACKUP_VERSION = 1;

const STORES = [
  { key: 'despertador-alarms', store: useAlarmsStore },
  { key: 'despertador-location', store: useLocationStore },
  { key: 'despertador-settings', store: useSettingsStore },
  { key: 'despertador-tracking', store: useTrackingStore },
  { key: 'despertador-weather', store: useWeatherStore },
  { key: 'despertador-microactivities', store: useMicroActivityStore },
  { key: 'despertador-microactivity-catalog', store: useMicroActivityCatalogStore },
  { key: 'despertador-notification-prefs', store: useNotificationPrefsStore },
] as const;

export async function exportBackup(): Promise<void> {
  const data: Record<string, unknown> = {};
  for (const { key } of STORES) {
    const raw = await AsyncStorage.getItem(key);
    if (raw != null) data[key] = JSON.parse(raw);
  }

  const payload = JSON.stringify(
    { version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data },
    null,
    2
  );

  const file = new File(Paths.cache, `despertador-backup-${dateKey(new Date())}.json`);
  if (file.exists) file.delete();
  file.create();
  file.write(payload);

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Guardar backup de Despertador',
    });
  }
}

export async function importBackup(): Promise<'imported' | 'canceled'> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.[0]) return 'canceled';

  const file = new File(result.assets[0].uri);
  const raw = await file.text();
  const parsed = JSON.parse(raw);

  if (!parsed || typeof parsed !== 'object' || typeof parsed.data !== 'object') {
    throw new Error('El archivo no tiene el formato esperado de un backup de Despertador.');
  }

  for (const { key, store } of STORES) {
    const value = parsed.data[key];
    if (value !== undefined) {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      await store.persist.rehydrate();
    }
  }

  return 'imported';
}
