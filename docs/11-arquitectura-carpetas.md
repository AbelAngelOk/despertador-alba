# Arquitectura del proyecto y carpetas

> Estructura concreta de carpetas para el stack definido en [10-stack-tecnico.md](10-stack-tecnico.md). `app/` sigue las convenciones de Expo Router: cada archivo ahí adentro es una pantalla/ruta.
>
> **Nota**: este árbol es una propuesta temprana y no refleja 1 a 1 la estructura real final (por ejemplo, la app terminó usando `src/app` en vez de `app/` en la raíz). En particular, todo lo de `login.tsx`, `features/auth/`, `lib/supabase.ts` y sesión quedó descartado — la app no tiene cuenta ni backend, ver [17-sin-cuenta-y-notificaciones.md](17-sin-cuenta-y-notificaciones.md).

## Árbol de carpetas propuesto

```
despertador/
├── docs/                          # documentación de producto (ya existente)
├── app/                           # rutas (Expo Router) — 1 archivo = 1 pantalla
│   ├── (tabs)/                    # bottom bar: los 3 tabs raíz de 07-vistas-app.md
│   │   ├── _layout.tsx            # define el Tab Navigator (íconos, tab activo)
│   │   ├── index.tsx              # Vista "Despertadores" (lista + próxima alarma)
│   │   ├── seguimiento.tsx        # Vista "Seguimiento" (sin cuenta)
│   │   └── perfil.tsx             # Vista "Perfil / Configuración" (sin cuenta)
│   ├── despertador/
│   │   ├── nuevo.tsx              # Vista "Detalle de despertador" — crear
│   │   └── [id].tsx               # Vista "Detalle de despertador" — editar
│   ├── alarma-sonando.tsx         # Pantalla full-screen al disparar la alarma
│   ├── paywall.tsx                # Pantalla de suscripción / downgrade
│   ├── _layout.tsx                # Layout raíz: providers globales (tema, query client)
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
│   │   └── suscripcion/           # estado del trial/plan, integración RevenueCat
│   │
│   ├── lib/                       # integraciones con servicios externos, sin lógica de producto
│   │   ├── sunTimes.ts            # wrapper sobre `suncalc`: expone los 4 tipos de amanecer/atardecer
│   │   ├── notifications.ts       # scheduling con expo-notifications
│   │   └── purchases.ts           # inicialización y helpers de RevenueCat
│   │
│   ├── store/                     # stores de Zustand (estado global de UI)
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

## Gating de acceso a nivel de código: no hay

Ninguna pantalla verifica sesión — no hay sesión que verificar. `seguimiento.tsx` y `perfil.tsx` renderizan directo, igual que `index.tsx` y `despertador/*`. `src/features/suscripcion` (cuando exista) centraliza la pregunta "¿esta función está disponible en el plan actual?", resuelta contra el estado local de RevenueCat, sin cuenta de por medio.

## Esquema de datos: no hay backend

Todo vive en AsyncStorage vía stores de Zustand (`src/store/*.ts`, `src/features/despertadores/*Store.ts`) — despertadores, ubicación, seguimiento, preferencias de notificaciones, estado de microactividad. No hay tablas ni sincronización remota. Ver [17-sin-cuenta-y-notificaciones.md](17-sin-cuenta-y-notificaciones.md).

## Próximo paso sugerido

Este documento y [10-stack-tecnico.md](10-stack-tecnico.md) son la base para iniciar el proyecto Expo (`npx create-expo-app`) y armar el layout de `(tabs)` — no incluido en esta etapa de documentación, queda para cuando se empiece a programar.
