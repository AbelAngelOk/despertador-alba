# App sin backend

> **Actualizado** — esto ya no es "mientras no haya Supabase": es la arquitectura permanente. La app no va a tener cuenta, login ni backend propio, para ninguna función. Ver la decisión completa en [17-sin-cuenta-y-notificaciones.md](17-sin-cuenta-y-notificaciones.md). Las menciones a Supabase/Auth en [10-stack-tecnico.md](10-stack-tecnico.md) y [11-arquitectura-carpetas.md](11-arquitectura-carpetas.md) quedaron descartadas junto con esto.

## Por qué

Como ya estaba definido en [06-modelo-negocio.md](06-modelo-negocio.md), crear y usar despertadores **nunca dependió de cuenta ni de backend** — esa fue una decisión de producto desde el principio. Lo que cambió es que Seguimiento, Perfil y notificaciones, que en el diseño original iban a requerir cuenta más adelante, también se decidieron sin cuenta, para siempre.

## Qué funciona hoy

Casi todo sigue siendo 100% local/offline — la única excepción explícita es el módulo de Clima, que es opt-in y apagado por defecto (ver más abajo).

- **Crear, editar y eliminar despertadores**: tipo de amanecer (astronómico/náutico/civil/salida del sol), offset en minutos, días activos — tal como en [02-funcionalidades.md](02-funcionalidades.md).
- **Cálculo de horario real**, offline, con `suncalc` ([09-riesgos-tecnicos.md](09-riesgos-tecnicos.md)) — `src/lib/sunTimes.ts`.
- **Ubicación por GPS** vía `expo-location` (`src/lib/deviceLocation.ts`), guardada localmente.
- **Bottom bar de 5 secciones — Inicio, Despertadores, Seguimiento, Notificaciones, Perfil**, siempre visibles, sin forma de ocultar ninguna, con íconos de línea minimalistas (Feather vía `@expo/vector-icons`) y la bottom bar nativa de Android pintada de negro (`app.json` → `androidNavigationBar`) — ver [07-vistas-app.md](07-vistas-app.md).
- **Vista Inicio**: reloj de cielo a pantalla completa (`src/components/despertador/sky-clock.tsx`), con degradado, sol y luna calculados en base a la posición astronómica real (`src/lib/sunPosition.ts`, `src/lib/moonPosition.ts`, `src/lib/skyGradient.ts`) más estrellas decorativas de noche (`src/lib/stars.ts`), actualizado cada 30s, más la próxima alarma con countdown. Opcionalmente, nubes y lluvia según el clima real ([15-cielo-astronomico-y-clima.md](15-cielo-astronomico-y-clima.md), módulo **Clima (beta)**, con switch propio en Perfil, apagado por defecto — es la única parte de la app que depende de red).
- **Widget de Android** ("Reloj de cielo"), en la pantalla de inicio del sistema — mismo cálculo de sol, sin luna/estrellas/clima todavía ([14-widget-android.md](14-widget-android.md)).
- **Vista Despertadores**: solo lista + botón flotante para crear, sin distracciones.
- **Alarma que realmente suena**: al llegar la hora, la app vibra en loop y muestra una pantalla de alarma a pantalla completa hasta que se apaga; si no se apaga, hay hasta 2 reintentos programados (notificaciones locales con sonido, cada 5 minutos) — implementado con `expo-notifications` (`src/lib/alarmNotifications.ts`, `src/features/despertadores/ringing.ts`, `src/app/alarma-sonando.tsx`). Ver limitaciones reales de esto en Expo Go en [09-riesgos-tecnicos.md](09-riesgos-tecnicos.md).
- **Seguimiento con racha estilo Duolingo**: cada día que hubo una alarma activa queda en 3 estados posibles (se levantó / con retraso / no se levantó), persistido localmente (`src/store/tracking.ts`), con reconciliación automática de días pasados sin registro como "no se levantó" (`src/features/despertadores/reconcile.ts`). Activado por defecto, con contadores de "días que te levantaste" y "días con microactividad cumplida" además de la racha.
- **Microactividad opcional por despertador** ([13-microactividad.md](13-microactividad.md)): tarea breve a confirmar después de apagar la alarma para que el despertar cuente en la racha — `src/features/despertadores/microActivityStore.ts`, `src/features/despertadores/wakeResult.ts`, `src/app/microactividad.tsx`.
- **Notificaciones del día** ([18-notificaciones-del-dia.md](18-notificaciones-del-dia.md)): catálogo de avisos ligados a etapas del día y a la próxima alarma, cada uno con su propio on/off, con tab propio en la bottom bar. Todos desactivados por defecto.
- **Backup y restauración** ([19-backup-y-restauracion.md](19-backup-y-restauracion.md)): exportar/importar un `.json` con todos los datos locales, desde Perfil.
- **Persistencia local** de despertadores, ubicación, ajustes, seguimiento, microactividades, preferencias de notificaciones y clima cacheado con `zustand` + `AsyncStorage` (sobrevive a cerrar la app).
- Tema oscuro "crepúsculo" aplicado (`src/constants/theme.ts`).

## Qué queda pendiente (sin relación a cuenta ni backend — nunca la va a tener)

- **Login con Google/Apple**: descartado permanentemente, no es un pendiente. Ver [17-sin-cuenta-y-notificaciones.md](17-sin-cuenta-y-notificaciones.md).
- **Notificaciones de alarma y del día**: implementadas y habilitadas — ver [17-sin-cuenta-y-notificaciones.md](17-sin-cuenta-y-notificaciones.md) y [18-notificaciones-del-dia.md](18-notificaciones-del-dia.md). Lo único que sigue sin implementar del diseño original ([08-modulo-notificaciones.md](08-modulo-notificaciones.md)) es el timing configurable por notificación y el catálogo de hábitos de higiene del sueño (cafeína, luz azul, pantallas).
- **Suscripción / paywall / RevenueCat**: no implementado — no hay nada que vender todavía sin plan Premium real. Cuando exista, el estado de suscripción se resuelve contra la tienda (Play Billing / StoreKit vía RevenueCat), no contra una cuenta propia.
- **Sincronización de despertadores y racha entre dispositivos**: no hay sincronización automática — el backup manual ([19-backup-y-restauracion.md](19-backup-y-restauracion.md)) cubre el caso de cambiar de dispositivo a mano.

## Qué falta además, sin relación al backend

Ver [09-riesgos-tecnicos.md](09-riesgos-tecnicos.md), "Riesgo 3": dentro de Expo Go, la alarma no puede dibujarse a pantalla completa sobre el lockscreen si el teléfono está bloqueado y la app no está abierta — en ese caso el usuario recibe una notificación con sonido, no la pantalla de alarma vibrando. Resolverlo del todo requiere un development build (`expo-dev-client` + EAS), no Supabase.

## Cómo correr el proyecto

```
npm install
npx expo start
```

Desde ahí, `a` para Android, `i` para iOS (requiere macOS), `w` para web.

## Qué falta para completar el producto (sin backend)

1. Sumar el catálogo de hábitos de higiene del sueño y el timing configurable del diseño original ([08-modulo-notificaciones.md](08-modulo-notificaciones.md)), si se decide que valen la pena sobre lo ya implementado en [18-notificaciones-del-dia.md](18-notificaciones-del-dia.md).
2. Sumar RevenueCat para el trial/paywall ([06-modelo-negocio.md](06-modelo-negocio.md), [09-riesgos-tecnicos.md](09-riesgos-tecnicos.md)) — resuelto contra la tienda, sin backend propio.

Nada de lo construido hasta ahora se descarta al sumar esto — se agrega sobre la misma base local.
