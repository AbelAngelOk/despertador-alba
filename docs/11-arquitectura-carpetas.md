# Arquitectura del proyecto y carpetas

> Estructura concreta de carpetas para el stack definido en [10-stack-tecnico.md](10-stack-tecnico.md). `app/` sigue las convenciones de Expo Router: cada archivo ahí adentro es una pantalla/ruta.

## Árbol de carpetas propuesto

```
despertador/
├── docs/                          # documentación de producto (ya existente)
├── app/                           # rutas (Expo Router) — 1 archivo = 1 pantalla
│   ├── (tabs)/                    # bottom bar: los 3 tabs raíz de 07-vistas-app.md
│   │   ├── _layout.tsx            # define el Tab Navigator (íconos, tab activo)
│   │   ├── index.tsx              # Vista "Despertadores" (lista + próxima alarma)
│   │   ├── seguimiento.tsx        # Vista "Seguimiento" (requiere sesión)
│   │   └── perfil.tsx             # Vista "Perfil / Configuración" (requiere sesión)
│   ├── despertador/
│   │   ├── nuevo.tsx              # Vista "Detalle de despertador" — crear
│   │   └── [id].tsx               # Vista "Detalle de despertador" — editar
│   ├── alarma-sonando.tsx         # Pantalla full-screen al disparar la alarma
│   ├── paywall.tsx                # Pantalla de suscripción / downgrade
│   ├── login.tsx                  # Pantalla de Login/Registro (Google/Apple)
│   ├── _layout.tsx                # Layout raíz: providers globales (tema, query client, auth)
│   └── +not-found.tsx
│
├── src/
│   ├── components/
│   │   ├── ui/                    # componentes genéricos: Button, Card, Switch, GradientBackground
│   │   └── despertador/           # componentes específicos: AlarmCard, SunTypeSelector, DaySelector, SoundPicker
│   │
│   ├── features/                  # lógica de negocio agrupada por dominio
│   │   ├── despertadores/         # crear/editar/listar alarmas, cálculo de horario resultante
│   │   ├── notificaciones/        # catálogo del módulo (08-modulo-notificaciones.md), scheduling
│   │   ├── seguimiento/           # racha, heatmap, estadísticas
│   │   ├── auth/                  # login con Google/Apple, sesión
│   │   └── suscripcion/           # estado del trial/plan, integración RevenueCat
│   │
│   ├── lib/                       # integraciones con servicios externos, sin lógica de producto
│   │   ├── supabase.ts            # cliente de Supabase
│   │   ├── sunTimes.ts            # wrapper sobre `suncalc`: expone los 4 tipos de amanecer/atardecer
│   │   ├── notifications.ts       # scheduling con expo-notifications
│   │   └── purchases.ts           # inicialización y helpers de RevenueCat
│   │
│   ├── store/                     # stores de Zustand (estado global de UI/sesión)
│   ├── hooks/                     # hooks compartidos (ej. useNextAlarm, useSunEvents)
│   ├── types/                     # tipos TypeScript compartidos (Alarm, NotificationPref, etc.)
│   └── constants/                 # paleta de colores, catálogo de notificaciones, textos
│
├── assets/                        # íconos, fuentes, sonidos de alarma predefinidos
├── app.json / app.config.ts
├── eas.json
├── package.json
└── tsconfig.json
```

## Por qué esta separación

- **`app/` solo define rutas y layout**, no lógica: cada archivo importa componentes de `src/` y arma la pantalla. Esto mantiene el árbol de rutas legible y alineado 1 a 1 con las vistas documentadas en [07-vistas-app.md](07-vistas-app.md).
- **`src/features/` agrupa por dominio de producto**, no por tipo de archivo, para que todo lo relacionado a "notificaciones" (tipos, hooks, lógica de scheduling, UI específica si no es genérica) viva junto y sea fácil de ubicar a partir de los documentos funcionales ([02-funcionalidades.md](02-funcionalidades.md), [08-modulo-notificaciones.md](08-modulo-notificaciones.md)).
- **`src/lib/` aísla servicios externos** (Supabase, RevenueCat, suncalc) detrás de una interfaz propia, para poder reemplazar cualquiera de ellos sin tocar el resto de la app.

## Mapeo de gating de acceso a nivel de código

Siguiendo el modelo de acceso de [06-modelo-negocio.md](06-modelo-negocio.md):

- `app/(tabs)/index.tsx` (Despertadores) y `app/despertador/*`: **no** verifican sesión.
- `app/(tabs)/seguimiento.tsx` y `app/(tabs)/perfil.tsx`: verifican sesión al montar (vía `src/features/auth`); si no hay sesión, redirigen a `app/login.tsx` en vez de renderizar contenido — tal como se describe en [07-vistas-app.md](07-vistas-app.md).
- `src/features/suscripcion` centraliza la pregunta "¿esta función está disponible en el plan actual?" (usada tanto en el FAB de Despertadores, como en el selector de tipo de amanecer, como en Seguimiento) para no duplicar esa lógica de plan en cada pantalla.

## Esquema de datos en Supabase (borrador)

Solo lo que requiere cuenta (ver [06-modelo-negocio.md](06-modelo-negocio.md)); los despertadores en sí pueden vivir únicamente en el dispositivo y sincronizarse opcionalmente si hay sesión.

| Tabla | Contenido | Usada por |
|---|---|---|
| `profiles` | datos básicos del usuario, fecha de instalación/inicio de trial, estado de suscripción (sincronizado desde RevenueCat) | Perfil, Paywall |
| `alarms` | copia sincronizada de los despertadores del usuario (opcional, si hay sesión) | Despertadores |
| `notification_prefs` | qué notificaciones del módulo tiene habilitadas cada usuario y con qué timing | Perfil, módulo de notificaciones |
| `tracking_events` | eventos de uso por día (alarma apagada a tiempo / pospuesta / no sonó) | Seguimiento |

Row Level Security en todas las tablas: cada usuario solo puede leer/escribir sus propias filas.

## Próximo paso sugerido

Este documento y [10-stack-tecnico.md](10-stack-tecnico.md) son la base para iniciar el proyecto Expo (`npx create-expo-app`) y armar el layout de `(tabs)` — no incluido en esta etapa de documentación, queda para cuando se empiece a programar.
