# Decisión: nunca va a haber login ni registro

> Actualiza y reemplaza el "modelo de acceso con registro progresivo" descrito en [06-modelo-negocio.md](06-modelo-negocio.md), [07-vistas-app.md](07-vistas-app.md), [08-modulo-notificaciones.md](08-modulo-notificaciones.md), [09-riesgos-tecnicos.md](09-riesgos-tecnicos.md), [10-stack-tecnico.md](10-stack-tecnico.md) y [11-arquitectura-carpetas.md](11-arquitectura-carpetas.md). Esos documentos quedan como historial de una idea descartada, no como plan vigente — cada sección afectada tiene ahora una nota que apunta acá.

## La decisión

Ninguna función de la app va a requerir crear cuenta, iniciar sesión, ni registrarse — nunca, no solo "por ahora". Esto aplica a **todas** las pantallas, incluidas Seguimiento y Perfil, que en el diseño original (docs 06-11) iban a pedir login con Google/Apple para guardarse.

**Por qué se descartó el modelo anterior:**
- El modelo de "registro progresivo" (usar sin cuenta, pedir cuenta recién al tocar Seguimiento o Notificaciones) agregaba fricción justo en el momento en que el usuario ya estaba enganchado con el producto — el peor lugar para pedir un compromiso.
- Todo el valor de la app (despertador sincronizado con el amanecer, seguimiento del hábito, microactividad, notificaciones) es perfectamente entregable con datos 100% locales. No hay una razón de producto real para forzar una cuenta.
- Elimina de un saque la necesidad de backend (Supabase), Auth, políticas de privacidad de datos de terceros y toda la superficie de riesgo que eso trae.

## Qué cambia en la práctica

- **Seguimiento y Perfil** nunca estuvieron realmente gateados en el código (no existía pantalla de login ni chequeo de sesión), así que no hubo que revertir nada ahí — la corrección fue de documentación, que describía un plan que nunca se llegó a construir.
- **Notificaciones de alarma**: no requieren cuenta. Nunca la requirieron en el código (`src/lib/alarmNotifications.ts`, `src/features/despertadores/ringing.ts` ya funcionaban 100% local); lo que sí hacía falta era habilitarlas de verdad — ver sección siguiente.
- **Perfil** (`src/app/(tabs)/perfil.tsx`) ya no menciona "el login se conecta cuando esté disponible el backend". Ahora dice explícitamente que es una decisión permanente.
- **Monetización futura** (Premium, cuando exista): se va a resolver 100% con el mecanismo nativo de compra de Google Play / App Store (restaurar compras por cuenta de la tienda), sin capa de cuenta propia encima. La "Capa 3: reconciliación al iniciar sesión" descrita en [09-riesgos-tecnicos.md](09-riesgos-tecnicos.md) para prevenir abuso de trial multi-dispositivo queda descartada — sin cuentas propias no hay con qué reconciliar. Las Capas 1 (trial local) y 2 (elegibilidad de la tienda) siguen vigentes tal cual están documentadas.

## Notificaciones: qué faltaba para que funcionen

El código de programación de notificaciones (`scheduleAlarmRings`, `ensureNotificationPermissions`, `configureAndroidChannel` en `src/lib/alarmNotifications.ts`, invocado desde `useAlarmScheduler`/`useAlarmRingWatcher` en `src/features/despertadores/ringing.ts`, montado en `src/app/_layout.tsx`) ya estaba completo desde la sesión en que se agregó. Lo que faltaba era declarar los permisos de Android en `app.json`:

- **`android.permission.POST_NOTIFICATIONS`**: sin este permiso en el manifest, `Notifications.requestPermissionsAsync()` no tiene nada que pedirle al sistema en Android 13+ (API 33+) — la app simplemente nunca podía mostrar notificaciones, sin ningún error visible.
- **`android.permission.USE_EXACT_ALARM`**: en Android 12+ (API 31+) los recordatorios programados con hora exacta necesitan este permiso (o `SCHEDULE_EXACT_ALARM`, que requiere que el usuario lo habilite a mano en Configuración). Se usa `USE_EXACT_ALARM` porque se auto-otorga en la instalación para apps que son genuinamente un despertador — que es exactamente el caso — y no interrumpe con un paso extra de configuración.

Con ambos agregados a `android/permissions` en `app.json` y un rebuild nativo (`expo prebuild` + Gradle), las notificaciones de alarma quedan operativas de punta a punta.

## Seguimiento: activado por defecto + contadores nuevos

- `trackingEnabled` en `src/store/settings.ts` pasó de `false` a `true` por defecto — el tab Seguimiento aparece de entrada, sin que el usuario tenga que ir a buscarlo en Perfil.
- Se agregaron dos contadores nuevos en `src/app/(tabs)/seguimiento.tsx`, debajo de la racha y la semana:
  - **Días que te levantaste**: total histórico (no solo la racha activa) de días marcados `onTime` o `late` — `countWakeDays()` en `src/store/tracking.ts`.
  - **Días con microactividad**: cantidad de días distintos en los que se completó una microactividad (`status: 'completed'`) — `countCompletedDays()` en `src/features/despertadores/microActivityStore.ts`, agrupando por día local vía `dateKey()`.
- Los estados de cada día de la semana ya se marcaban con íconos (Feather `check`/`clock`/`x` para on-time/late/missed en el componente `DayPill`) desde que se construyó la pantalla — no fue necesario agregar nada ahí, ya cumplía con mostrar el estado de forma visual en vez de solo color.
