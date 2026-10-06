# Alarma en segundo plano (Android)

> Reemplaza, en Android, el mecanismo anterior de "notificación programada + sonido dentro de la app". Antes, con la app cerrada solo aparecía una notificación con el sonido corto del sistema, y el cuenco sonaba recién al entrar a la app.

## Cómo funciona ahora
Módulo nativo local `modules/alarm-engine` (Expo Modules API, Kotlin, se autolinkea desde `./modules`; en JS se importa como `@modules/alarm-engine`):

1. **Programación** — `useAlarmScheduler` (`src/features/despertadores/ringing.ts`) llama a `AlarmEngine.scheduleAlarm` con la próxima ocurrencia de cada despertador activo. Usa `AlarmManager.setAlarmClock`, la misma API del Reloj del sistema: dispara exacto aunque el teléfono esté en Doze y muestra el ícono de alarma en la barra de estado. Cada reprogramación hace `cancelAll` + programar de nuevo.
2. **Disparo** — `AlarmReceiver` arranca `AlarmService`, un servicio en primer plano (`mediaPlayback`) que:
   - reproduce el sonido del despertador en loop con `USAGE_ALARM`, o sea por el **volumen de alarma**, no el de multimedia;
   - vibra en loop y pide foco de audio (pausa la música);
   - muestra una notificación de categoría alarma con *full-screen intent* que abre la app;
   - se corta sola a los 15 min (la misma ventana que usa el JS).
3. **Pantalla de alarma** — al abrirse la app, `useAlarmRingWatcher` le pregunta al nativo si hay una alarma sonando (`getRingingAlarm`, más el evento `onRing` si la app ya estaba abierta) y navega a `alarma-sonando`. Esa pantalla no reproduce audio propio si ya suena el servicio; "Apagar" llama a `stopRinging`.
4. **Sobre la pantalla bloqueada** — `AlarmActivityLifecycleListener` marca MainActivity con `setShowWhenLocked`/`setTurnScreenOn` solo mientras hay una alarma sonando.
5. **Reinicio del teléfono** — AlarmManager se vacía al reiniciar. `BootReceiver` reprograma lo guardado en SharedPreferences sin esperar a que se abra la app.

## Sonido
El servicio necesita un archivo real: `resolveAlarmSoundFileUri` (`src/lib/alarmSoundFile.ts`) copia el cuenco elegido a `documents/alarm-sounds/` una sola vez, y el sonido propio del usuario ya vive en documentos. Si falla, el nativo usa el tono de alarma del sistema.

## Permisos
- `USE_EXACT_ALARM` (Android 13+) / `SCHEDULE_EXACT_ALARM` (Android 12), declarados en el manifest del módulo.
- `USE_FULL_SCREEN_INTENT`: en Android 14+ el sistema puede no otorgarlo. En ese caso la alarma **suena igual**, pero no se abre sola sobre el bloqueo. Ajustes muestra un aviso con botón a la pantalla del permiso (`canUseFullScreenIntent`).
- Notificaciones: sin permiso, el servicio suena igual pero la notificación no se ve.

## Respaldo
En iOS y en Expo Go, `AlarmEngine` vale `null` y se mantiene el mecanismo anterior: notificaciones programadas de expo-notifications, más el sonido dentro de la app al abrirla.

## Límites conocidos
- Algunos fabricantes (Xiaomi, Huawei, etc.) matan apps en segundo plano de forma agresiva. `setAlarmClock` es lo más resistente que ofrece Android, pero en esos teléfonos puede hacer falta sacar a Alba de la optimización de batería.
- No hay botón "Apagar" en la notificación: apagar pasa siempre por la pantalla de alarma, porque ahí se registra el seguimiento y arranca la microactividad.
