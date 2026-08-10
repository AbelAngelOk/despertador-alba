# Stack técnico

> Propuesta de tecnologías concretas para implementar lo definido en los documentos anteriores. La arquitectura de carpetas basada en este stack está en [11-arquitectura-carpetas.md](11-arquitectura-carpetas.md).

## Punto de partida: consistencia con tu otro proyecto mobile

Ya tenés un proyecto (`training-app`) construido con **Expo + React Native + TypeScript**, usando Expo Router (rutas por carpetas, con un grupo `(tabs)` para la barra inferior), Supabase como backend, React Query, Zustand y EAS Build para compilar y publicar en Android. Esta propuesta reutiliza el mismo stack para `despertador` en vez de introducir uno nuevo: menos curva de aprendizaje, código y configuración reutilizable (cliente de Supabase, patrones de auth, scripts de build), y ambas apps quedan mantenibles de la misma forma.

Si preferís otra base (Flutter, nativo por plataforma), avisá y se ajusta este documento — todo lo que sigue asume Expo/React Native.

## Frontend (mobile)

| Capa | Elección | Por qué |
|---|---|---|
| Framework | **Expo (React Native) + TypeScript** | Un solo código para Android/iOS, mismo stack que `training-app`, tooling maduro (EAS Build/Submit) |
| Navegación | **Expo Router** | Rutas basadas en archivos; el grupo `(tabs)` mapea 1 a 1 con la bottom bar de 3 tabs de [07-vistas-app.md](07-vistas-app.md) |
| Estilos / tema oscuro | **NativeWind** (Tailwind para RN) o `StyleSheet` + tokens de color propios | Necesario un sistema de tokens de color consistente para la paleta de [05-diseno-ux-ui.md](05-diseno-ux-ui.md) (fondo, superficies, acento cálido, acento violeta) en modo claro/oscuro |
| Animaciones (degradados de cielo, transiciones) | **react-native-reanimated** + `expo-linear-gradient` | Ya se usa en `training-app`; permite las transiciones suaves tipo cielo pedidas en el diseño |
| Estado local/UI | **Zustand** | Mismo patrón que `training-app` (ej. estado del despertador en edición, tema) |
| Estado remoto/cache | **TanStack Query (React Query)** | Sincronizar datos de Supabase (seguimiento, notificaciones, suscripción) con cache y reintentos |
| Formularios | **React Hook Form + Zod** | Consistente con `training-app`, útil para el formulario de "Detalle de despertador" ([07-vistas-app.md](07-vistas-app.md)) |
| Almacenamiento local | **AsyncStorage** (preferencias no sensibles, cache de horarios solares) + **expo-secure-store** (tokens de sesión) | El cálculo de amanecer debe funcionar offline (ver [09-riesgos-tecnicos.md](09-riesgos-tecnicos.md)); se cachea localmente por si no hay red |

## Cálculo de etapas del día

- **`suncalc`** (paquete npm, puerto JS de la librería usada como referencia en [09-riesgos-tecnicos.md](09-riesgos-tecnicos.md)): calcula salida/puesta del sol y las fases de crepúsculo a partir de lat/long/fecha, 100% local, sin llamadas de red.
- Se envuelve en un módulo propio (`lib/sunTimes.ts`) que traduce la salida de `suncalc` a los 4 tipos de amanecer/atardecer usados en la app (astronómico, náutico, civil, salida del sol — ver [04-etapas-del-dia.md](04-etapas-del-dia.md)), para no acoplar el resto del código a la librería específica.

## Notificaciones locales

- **`expo-notifications`**: programa las notificaciones locales (alarma, avisos de estado del día, avisos de hábitos del módulo de notificaciones).
- Como los horarios cambian día a día (el amanecer se corre), la app debe **reprogramar las notificaciones de los próximos días** cada vez que se abre (y opcionalmente con una tarea en segundo plano tipo `expo-background-task`) — ver la nota de "notificaciones locales dinámicas" en [01-vision-producto.md](01-vision-producto.md).

## Autenticación

- **Supabase Auth** con proveedores **Google** y **Apple** (Sign in with Apple obligatorio en iOS si se ofrece Google, ver [06-modelo-negocio.md](06-modelo-negocio.md) y [07-vistas-app.md](07-vistas-app.md)).
- El uso del despertador (tab Despertadores) no pasa por Supabase Auth en absoluto; recién se inicializa sesión cuando el usuario entra a Seguimiento o Perfil por primera vez.

## Backend / datos

- **Supabase** (Postgres administrado + Auth + Row Level Security): mismo proveedor que `training-app`, evita mantener infraestructura propia.
- Uso principal: persistir lo que requiere cuenta (seguimiento, preferencias de notificaciones, estado de suscripción) — ver esquema de tablas en [11-arquitectura-carpetas.md](11-arquitectura-carpetas.md). Los despertadores en sí pueden vivir solo en el dispositivo (AsyncStorage) ya que no requieren cuenta; opcionalmente se sincronizan a Supabase si el usuario se loguea, para no perderlos al cambiar de dispositivo.

## Pagos y suscripción

- **RevenueCat** por encima de Google Play Billing / StoreKit, en vez de integrar cada uno a mano. Resuelve en una sola capa:
  - Los productos de suscripción de ambas tiendas con una sola API
  - La elegibilidad de trial/oferta introductoria por cuenta de tienda (la base de la solución al riesgo de abuso de [09-riesgos-tecnicos.md](09-riesgos-tecnicos.md))
  - Webhooks para sincronizar el estado de la suscripción (activa/vencida/en trial) hacia Supabase, así el backend sabe qué plan tiene cada usuario sin reimplementar la lógica de recibos de cada tienda

## Build y distribución

- **EAS Build** (Android e iOS) + **EAS Submit**, mismo flujo que `training-app` (`eas build --platform android --profile production`, etc.)

## Resumen de dependencias nuevas respecto a `training-app`

- `suncalc` (cálculo solar)
- `expo-notifications` (+ `expo-background-task` si se implementa reprogramación en segundo plano)
- `expo-linear-gradient` (fondos degradados de cielo)
- `react-native-purchases` (SDK de RevenueCat)
- Proveedor Google/Apple habilitado en el proyecto de Supabase Auth (configuración, no dependencia de código)
