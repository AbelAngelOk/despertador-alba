# Notificaciones del día — implementado

> Reemplaza el diseño original de [08-modulo-notificaciones.md](08-modulo-notificaciones.md) (que incluía timing configurable de 3 niveles por notificación y requería cuenta) por una versión más simple, ya construida: catálogo fijo, cada notificación con un único on/off, sin cuenta. Ver la decisión de "sin cuenta" en [17-sin-cuenta-y-notificaciones.md](17-sin-cuenta-y-notificaciones.md).

## Qué es

Avisos locales ligados a momentos del día — astronómicos (etapas del amanecer/atardecer) y relativos a la próxima alarma. Se configuran desde el tab **Notificaciones** de la bottom bar (`src/app/(tabs)/notificaciones.tsx`), cada uno con su propio switch, agrupados en dos secciones.

## Catálogo (`src/features/notificaciones/catalog.ts`)

### Antes del despertador (relativas a la próxima alarma activa)

Va primero en la pantalla — son las dos que más directamente le importan al propósito de la app.

| Notificación | Momento |
|---|---|
| Hora de ir a dormir | 8hs antes de la próxima alarma |
| En 1 hora es mejor ir a dormir | 9hs antes de la próxima alarma (1h antes de la anterior) |

Estas dos solo se programan si hay al menos un despertador activo — sin eso no hay "próxima alarma" contra la cual calcular.

### Etapas del día (calculadas con `suncalc` sobre la ubicación del usuario)

| Notificación | Momento |
|---|---|
| Empieza a clarear | Amanecer astronómico |
| Amanecer náutico | Amanecer náutico |
| Amanecer civil | Amanecer civil |
| Salió el sol | Salida del sol |
| Es mediodía | Mediodía solar (punto más alto del sol, no las 12:00 del reloj) |
| Se puso el sol | Puesta del sol |
| Empieza el atardecer | Crepúsculo civil vespertino |
| Sigue bajando la luz | Crepúsculo náutico vespertino |
| Acaba de oscurecer | Crepúsculo astronómico vespertino |

## Todas desactivadas por defecto

Es una función nueva y potencialmente ruidosa (hasta 11 notificaciones por día si se activan todas) — arranca sin ninguna activada, el usuario elige cuáles quiere.

## Cómo se programan

Mismo patrón que las notificaciones de alarma ([17-sin-cuenta-y-notificaciones.md](17-sin-cuenta-y-notificaciones.md)):

- `src/lib/dayNotifications.ts`: scheduling primitivo con `expo-notifications` (mismo guard de Expo Go que `alarmNotifications.ts`), canal Android propio (`day-notifications`, importancia `DEFAULT` — a diferencia del canal de alarmas que es `MAX`, esto es informativo, no debe interrumpir como una alarma).
- `src/features/notificaciones/scheduler.ts` (`useDayNotificationsScheduler`, montado en `src/app/_layout.tsx`): para cada notificación activada, calcula la próxima ocurrencia (hoy si todavía no pasó, si no mañana) y la programa. Se recalcula cada 15 minutos y cada vez que la app vuelve a primer plano — mismo intervalo que `useAlarmScheduler`.
- Los identificadores de notificación llevan el prefijo `day-`, para poder cancelarlas y reprogramarlas sin tocar las notificaciones de alarma (que usan sus propios IDs `alarm-*`) — `cancelAllDayNotifications()` filtra por ese prefijo antes de reprogramar.
- `reschedule()` está protegido con un ref (`runningRef`) para que no se solapen dos corridas: si `AppState` pasa a `active` (por ejemplo, al cerrarse el diálogo nativo de permiso) mientras una reprogramación anterior todavía está esperando ese mismo permiso, la nueva llamada se ignora en vez de disparar un segundo cancelar+reprogramar en paralelo contra la misma API nativa. Mismo fix aplicado en `useAlarmScheduler` (`ringing.ts`). Este guard es defensivo (evita async duplicado), no es lo que resolvió el "Maximum update depth exceeded" reportado en su momento — la causa real era otra, ver "Riesgo 4" en [09-riesgos-tecnicos.md](09-riesgos-tecnicos.md).

## Preferencias (`src/store/notificationPrefs.ts`)

Un solo mapa `{ [notificationId]: boolean }`, persistido local (`despertador-notification-prefs`). Sin cuenta, igual que el resto de la app.
