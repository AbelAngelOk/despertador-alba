# Índice de documentación

> Punto de entrada a `docs/`. Cada línea dice qué resuelve el documento para abrir solo el que hace falta. Los marcados **(histórico)** describen ideas descartadas o reemplazadas: no son el plan vigente.

## Producto
- [01-vision-producto.md](01-vision-producto.md) — qué es la app: despertador anclado al amanecer real, no a una hora fija.
- [02-funcionalidades.md](02-funcionalidades.md) — funcionalidades principales (crear despertador, etapas, desfasaje).
- [06-modelo-negocio.md](06-modelo-negocio.md) — propuesta de negocio **(parcialmente histórico: el login quedó descartado)**.
- [20-nombre-y-busqueda.md](20-nombre-y-busqueda.md) — por qué "Despertador Alba"; qué identificadores no se tocan (`slug`, `android.package`).

## Contenido educativo
- [03-ritmo-circadiano.md](03-ritmo-circadiano.md) — fundamento del producto.
- [04-etapas-del-dia.md](04-etapas-del-dia.md) — etapas astronómicas/náutica/civil/amanecer.

## Diseño y vistas
- [05-diseno-ux-ui.md](05-diseno-ux-ui.md) — dirección visual general.
- [07-vistas-app.md](07-vistas-app.md) — pantallas y elementos **(la navegación actual está en [21](21-cielo-de-fondo-y-despertadores.md))**.
- [21-cielo-de-fondo-y-despertadores.md](21-cielo-de-fondo-y-despertadores.md) — cielo en vivo como fondo de toda la app, tab Despertadores/Notificaciones unificada, despertador clásico y de prueba.

## Módulos implementados
- [22-alarma-en-segundo-plano.md](22-alarma-en-segundo-plano.md) — motor nativo Android: la alarma suena con la app cerrada (AlarmManager + servicio).
- [13-microactividad.md](13-microactividad.md) — tarea post-alarma que cuenta para la racha.
- [14-widget-android.md](14-widget-android.md) — widget "Reloj de cielo".
- [15-cielo-astronomico-y-clima.md](15-cielo-astronomico-y-clima.md) — luna, estrellas y clima (beta).
- [16-sonidos-de-alarma.md](16-sonidos-de-alarma.md) — catálogo de sonidos y sonido propio.
- [18-notificaciones-del-dia.md](18-notificaciones-del-dia.md) — notificaciones del día (versión real).
- [19-backup-y-restauracion.md](19-backup-y-restauracion.md) — backup manual por archivo.

## Arquitectura y decisiones
- [17-sin-cuenta-y-notificaciones.md](17-sin-cuenta-y-notificaciones.md) — decisión permanente: sin login ni backend propio.
- [12-mvp-sin-backend.md](12-mvp-sin-backend.md) — todo local (AsyncStorage + zustand).
- [09-riesgos-tecnicos.md](09-riesgos-tecnicos.md) — confiabilidad de la alarma en background, offline.
- [10-stack-tecnico.md](10-stack-tecnico.md) — stack **(parcialmente histórico: Supabase descartado)**.
- [11-arquitectura-carpetas.md](11-arquitectura-carpetas.md) — carpetas **(histórico: ver el mapa real en `CLAUDE.md`)**.
- [08-modulo-notificaciones.md](08-modulo-notificaciones.md) — propuesta original de notificaciones **(histórico, ver 18)**.
