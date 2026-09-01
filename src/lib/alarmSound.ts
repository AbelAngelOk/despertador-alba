import type { AudioSource } from 'expo-audio';

import { ALARM_SOUNDS, CUSTOM_SOUND_ID, DEFAULT_ALARM_SOUND } from '@/features/despertadores/constants';
import { AlarmSoundId } from '@/types/alarm';

/**
 * Resuelve el `AlarmSoundId` guardado en un despertador a algo que
 * `createAudioPlayer` pueda reproducir: el asset embebido (número de
 * `require`) para los sonidos incluidos, o la URI del archivo elegido por el
 * usuario para 'custom'. Si el sonido guardado es 'custom' pero no hay ningún
 * archivo elegido (se borró, o nunca se llegó a elegir uno), cae al default.
 */
export function resolveAlarmSoundSource(
  soundId: AlarmSoundId,
  customSoundUri: string | null
): AudioSource {
  if (soundId === CUSTOM_SOUND_ID && customSoundUri) {
    return customSoundUri;
  }

  const builtIn = ALARM_SOUNDS.find((item) => item.id === soundId);
  if (builtIn) return builtIn.file;

  return ALARM_SOUNDS.find((item) => item.id === DEFAULT_ALARM_SOUND)!.file;
}
