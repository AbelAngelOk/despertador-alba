import * as IntentLauncher from 'expo-intent-launcher';
import { Linking, Platform } from 'react-native';

import { isExpoGo } from './alarmNotifications';

const DND_ACCESS_ACTION = 'android.settings.NOTIFICATION_POLICY_ACCESS_SETTINGS';

/** Si tiene sentido pedir/mostrar este permiso: solo Android real (no Expo Go, no iOS). */
export function isDndAccessRelevant(): boolean {
  return Platform.OS === 'android' && !isExpoGo;
}

/**
 * Abre la pantalla del sistema donde el usuario le da (o saca) a Alba el
 * acceso a "No molestar". Devuelve `false` si ningún método logró abrir nada,
 * para que quien llama pueda mostrarle al usuario el camino manual en vez de
 * fallar en silencio.
 *
 * Orden: `Linking.sendIntent` (startActivity simple, el más directo) →
 * `expo-intent-launcher` (startActivityForResult; su promesa queda pendiente
 * hasta que el usuario vuelve, por eso va de respaldo) → Ajustes de la app.
 */
export async function openDndAccessSettings(): Promise<boolean> {
  if (!isDndAccessRelevant()) return false;

  try {
    await Linking.sendIntent(DND_ACCESS_ACTION);
    return true;
  } catch {
    // probar el siguiente método
  }

  try {
    await IntentLauncher.startActivityAsync(DND_ACCESS_ACTION);
    return true;
  } catch {
    // probar el siguiente método
  }

  try {
    await Linking.openSettings();
    return true;
  } catch {
    return false;
  }
}
