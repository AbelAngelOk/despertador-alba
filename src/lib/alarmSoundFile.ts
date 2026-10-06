import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';

import { ALARM_SOUNDS, CUSTOM_SOUND_ID, DEFAULT_ALARM_SOUND } from '@/features/despertadores/constants';
import { AlarmSoundId } from '@/types/alarm';

const SOUNDS_DIR = new Directory(Paths.document, 'alarm-sounds');

/**
 * El motor nativo de alarmas reproduce el sonido con la app cerrada, así que
 * necesita un archivo real en disco (no un `require` del bundle). Los cuencos
 * incluidos se copian una vez a documentos — no a caché, que el sistema puede
 * vaciar entre que se programa la alarma y que suena. `null` = que el nativo
 * use el tono de alarma del sistema.
 */
export async function resolveAlarmSoundFileUri(
  soundId: AlarmSoundId,
  customSoundUri: string | null
): Promise<string | null> {
  if (soundId === CUSTOM_SOUND_ID && customSoundUri) return customSoundUri;

  const sound =
    ALARM_SOUNDS.find((item) => item.id === soundId) ??
    ALARM_SOUNDS.find((item) => item.id === DEFAULT_ALARM_SOUND)!;

  try {
    const destination = new File(SOUNDS_DIR, `${sound.id}.mp3`);
    if (destination.exists) return destination.uri;

    const asset = Asset.fromModule(sound.file);
    await asset.downloadAsync();
    if (!asset.localUri) return null;

    if (!SOUNDS_DIR.exists) SOUNDS_DIR.create({ intermediates: true });
    new File(asset.localUri).copy(destination);
    return destination.uri;
  } catch {
    return null;
  }
}
