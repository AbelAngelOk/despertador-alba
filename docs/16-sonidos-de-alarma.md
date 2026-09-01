# Sonidos de alarma

> **Actualizado** — los 4 sonidos sintetizados por código de la primera versión se reemplazaron por grabaciones reales de cuenco tibetano, provistas por el usuario. Sigue habiendo 4 opciones incluidas, más la posibilidad de elegir un archivo propio del dispositivo (ver más abajo) — lo único marcado como pendiente en la versión anterior de este documento.

## Catálogo

| Sonido | Archivo | Default |
|---|---|---|
| Cuenco tibetano A | `assets/sounds/cuenco_tibetano_a.mp3` | |
| Cuenco tibetano B | `assets/sounds/cuenco_tibetano_b.mp3` | ✓ |
| Cuenco tibetano C | `assets/sounds/cuenco_tibetano_c.mp3` | |
| Cuenco tibetano D | `assets/sounds/cuenco_tibetano_d.mp3` | |

`DEFAULT_ALARM_SOUND` en `src/features/despertadores/constants.ts` apunta a `cuenco_b`. Los 4 archivos son mp3 (no wav como los sintetizados anteriores) — Metro los empaqueta igual, sin configuración adicional.

## Sonido propio (nuevo)

Además del catálogo fijo, se puede elegir cualquier archivo de audio del dispositivo como sonido de alarma:

- **Elegir archivo**: en `sound-selector.tsx`, un botón "Mi sonido: elegir un archivo de audio" abre el selector nativo de documentos (`expo-document-picker`, filtrado a `audio/*`). Al elegir uno, queda seleccionado automáticamente como sonido del despertador que se está editando.
- **Por qué se copia el archivo** (`src/lib/customSound.ts`): el picker solo da acceso temporal al archivo original (o una copia en el caché del sistema, que Android puede borrar para liberar espacio). Para que el sonido elegido siga sonando en la próxima alarma, aunque sea días después, se copia a una carpeta propia de la app en el directorio de documentos (`Paths.document` de `expo-file-system`) apenas se elige — ahí sí es responsabilidad de la app, no del sistema, y no se borra solo.
- **Un solo archivo a la vez**: elegir un sonido propio nuevo reemplaza al anterior (se borra el archivo viejo de la carpeta antes de copiar el nuevo) — es una única ranura "Mi sonido" compartida entre todos los despertadores que la tengan seleccionada, no una biblioteca de archivos subidos.
- **Guardado**: `src/store/customSound.ts` (zustand + AsyncStorage, `despertador-custom-sound`) guarda la URI del archivo copiado y el nombre original, para mostrarlo en el selector y resolverlo al sonar.
- **Cómo se resuelve al reproducir**: `src/lib/alarmSound.ts#resolveAlarmSoundSource(soundId, customSoundUri)` centraliza la lógica — si el despertador tiene `sound: 'custom'` y hay una URI guardada, reproduce esa URI; si no, busca el sonido incluido correspondiente; si ninguno de los dos aplica, cae al default. La usan tanto el preview en `sound-selector.tsx` como la reproducción real en `alarma-sonando.tsx`, para no duplicar esa lógica en dos lugares.
- **No viaja en el backup** ([19-backup-y-restauracion.md](19-backup-y-restauracion.md)): a propósito. El archivo de audio en sí no se serializa dentro del `.json` de backup (sería pesado y no es el propósito del backup); incluir solo la referencia (URI) sin el archivo real dejaría, después de restaurar en otro dispositivo o tras una reinstalación, un despertador "configurado" con un sonido propio que en realidad no existe y fallaría en silencio. Mejor no restaurar esa preferencia puntual que restaurarla rota.

## Cómo se usan

- **Elegir sonido**: cada despertador tiene su propio `sound` (`src/types/alarm.ts`), elegido en el formulario con `src/components/despertador/sound-selector.tsx` — lista con botón play/stop por opción para escuchar antes de guardar, más la opción de sonido propio.
- **Preview: uno solo a la vez**: hay un único `AudioPlayer` compartido entre todas las filas (`playerRef`), no uno por fila. Tocar play en un sonido corta el que estuviera sonando (si había otro) y arranca el nuevo siempre desde el principio. El ícono de la fila que está sonando cambia a un cuadrado (stop) — tocarlo la detiene sin reiniciarla; tocar play en cualquier otra fila también la corta. Es imposible tener dos sonando a la vez, incluida la misma fila dos veces.
- **Sonar de verdad**: `src/app/alarma-sonando.tsx` reproduce el sonido elegido en loop (`player.loop = true`) desde que se abre la pantalla hasta que se apaga, junto con la vibración que ya existía.
- **Librería**: `expo-audio` (`createAudioPlayer`, no el hook `useAudioPlayer`, porque tanto en el preview como en la pantalla de alarma el player se crea/destruye de forma imperativa, no atado al ciclo de vida normal de un componente). Funciona dentro de Expo Go sin necesidad de development build, a diferencia de `expo-notifications` y el widget.

## Compatibilidad

`sound` es un campo requerido en el tipo `Alarm`, pero las alarmas creadas antes de este cambio no lo tienen guardado, o apuntan a un `AlarmSoundId` que ya no existe (`classic`/`gentle`/`urgent`/`bell`, reemplazados). En los dos lugares que lo leen (`alarm-form.tsx` al inicializar el selector, `resolveAlarmSoundSource` al elegir qué reproducir) se cae a `DEFAULT_ALARM_SOUND` como respaldo cuando el id guardado no matchea ningún sonido conocido — mismo criterio que ya se usaba para `microActivity`.

## Qué falta

- Control de volumen específico de la alarma (hoy usa el volumen de medios del sistema).
- Snooze / posponer.

## Descartado: Spotify / YouTube Music

Se evaluó buscar y usar una canción específica de Spotify o YouTube Music como sonido de alarma. Se descartó:

- **YouTube Music**: no tiene API pública para reproducir audio desde una app de terceros. La única forma sería violar sus Términos de Servicio (extracción de audio) o embeber su reproductor de video, que se pausa en segundo plano — inútil para una alarma.
- **Spotify**: desde noviembre de 2024 su Web API dejó de dar `preview_url` (el clip de 30s) a apps nuevas, así que el camino liviano ya no existe. El único camino real es el App Remote SDK, que **requiere Spotify Premium** — se decidió no implementarlo porque dejaría afuera a cualquier usuario sin cuenta paga, además de depender de que la app de Spotify esté disponible en background en el momento exacto de la alarma (un punto de falla extra en la función más crítica de la app). El sonido propio (arriba) cubre el mismo caso de uso —"quiero MI canción como alarma"— sin depender de ningún servicio de terceros.
