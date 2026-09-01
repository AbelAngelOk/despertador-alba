import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';

const CUSTOM_SOUND_DIR = new Directory(Paths.document, 'custom-sound');
const CUSTOM_SOUND_BASENAME = 'alarma';

export interface PickedCustomSound {
  uri: string;
  name: string;
}

/**
 * expo-document-picker solo da acceso temporal al archivo original (o una
 * copia en caché que el sistema puede borrar). Para que el sonido elegido
 * siga disponible en la próxima alarma, incluso días después, se copia a una
 * carpeta propia de la app en el directorio de documentos.
 */
export async function pickCustomSound(): Promise<PickedCustomSound | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'audio/*',
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.[0]) return null;

  const picked = result.assets[0];
  const extension = picked.name.includes('.')
    ? picked.name.slice(picked.name.lastIndexOf('.'))
    : '';

  if (!CUSTOM_SOUND_DIR.exists) {
    CUSTOM_SOUND_DIR.create({ intermediates: true });
  } else {
    for (const entry of CUSTOM_SOUND_DIR.list()) {
      entry.delete();
    }
  }

  const destination = new File(CUSTOM_SOUND_DIR, `${CUSTOM_SOUND_BASENAME}${extension}`);
  new File(picked.uri).copy(destination);

  return { uri: destination.uri, name: picked.name };
}
