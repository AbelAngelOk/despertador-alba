# Cielo astronómico (luna + estrellas) y Clima (beta)

> Dos extensiones del Reloj de Cielo, deliberadamente separadas en dos módulos con filosofías distintas: una siempre activa y offline, la otra opt-in y dependiente de red. Ver el componente base en [07-vistas-app.md](07-vistas-app.md) y las limitaciones de red ya documentadas en [09-riesgos-tecnicos.md](09-riesgos-tecnicos.md).

## Bug encontrado y corregido de paso

Al investigar las funciones de luna de `suncalc` se detectó que `src/lib/sunPosition.ts` convertía la altitud del sol como si `SunCalc.getPosition().altitude` viniera en radianes — en la versión instalada (`suncalc@2.0.1`) **ya viene en grados** (confirmado con los tipos de la librería y de forma empírica). El resultado real terminaba fuera de rango y se recortaba casi siempre a los extremos de `skyGradient.ts` (día pleno o noche cerrada), sin las transiciones graduales. Se sacó la conversión de más — afecta tanto a la vista Inicio como al widget de Android, ambos ya corregidos.

## Módulo 1 — Cielo astronómico (luna + estrellas)

**Siempre activo, sin switch, 100% offline.** Reutiliza `suncalc` (ya instalado, sin dependencias nuevas) exactamente como ya se hacía con el sol.

- `src/lib/moonPosition.ts` — altitud y fase lunar (`SunCalc.getMoonPosition` / `getMoonIllumination`), mismo patrón que `sunPosition.ts`. La luna solo se dibuja si está sobre el horizonte y el sol no está muy alto (`isMoonVisible`), para no competir con el sol en pleno día.
- `src/lib/stars.ts` — no es un catálogo estelar real (sería desproporcionado): posiciones fijas decorativas, con opacidad que aumenta gradualmente cuanto más entrada la noche (`getStarsOpacity`, en función de la altitud del sol).
- Color de la luna interpolado según `illuminatedFraction` (más pálida/brillante cuanto más llena) — se exportó `lerpColor` desde `skyGradient.ts` para no reimplementar el mismo interpolador una tercera vez.

## Módulo 2 — Clima (beta)

**Apagado por defecto, con switch propio en Perfil ("Clima (beta)").** Es la primera vez que el proyecto depende de red para algo — se trató como una capa que se puede sacar en cualquier momento sin romper nada de lo de arriba.

- **Proveedor**: [Open-Meteo](https://open-meteo.com) — sin API key, gratis, ~10.000 llamadas/día en uso no comercial. Encaja mucho mejor que alternativas con key porque el proyecto hoy no tiene ningún manejo de secrets.
- `src/lib/weather.ts` — fetch a `cloud_cover` + `weather_code` (código WMO), simplificado a 3 estados: `clear` | `cloudy` | `rain`.
- `src/store/weather.ts` — cachea la última respuesta con timestamp (zustand + AsyncStorage, mismo patrón que el resto de la app). `isWeatherFresh` invalida datos de más de 3 horas.
- `src/features/weather/useWeatherSync.ts` — solo hace algo si `weatherEnabled` está prendido y hay ubicación. Refresca cada 20 minutos. Si el fetch falla (sin red), no borra la caché — simplemente no la actualiza.
- **Regla central**: `sky-clock.tsx` solo pinta nubes/lluvia si `weatherEnabled && isWeatherFresh(snapshot)`. Sin conexión, con el switch apagado, o con datos viejos, el cielo se ve exactamente igual que sin este módulo — nunca puede dejar la pantalla rota o en blanco.

### Qué se ve

- Nubes: velo blanco semitransparente sobre todo el degradado, opacidad proporcional a `cloud_cover` (tope 40%, para que module el color en vez de taparlo).
- Lluvia: 6 franjas finas cayendo en loop (`Animated`, mismo mecanismo que ya movía al sol y ahora también a la luna), solo cuando `condition === 'rain'`.
- El texto de fase (`"Crepúsculo civil · 4°"`) suma la condición al final cuando el módulo está activo: `"Crepúsculo civil · 4° · Nublado"`.

### Por qué el widget de Android queda afuera de esta pasada

El widget (`src/widgets/sky-clock-widget.tsx`) no se tocó para luna/estrellas/clima. Agregar clima ahí en particular exigiría que el widget lea el snapshot cacheado (nunca haga su propio fetch, por la misma razón que ya se documentó para las notificaciones: un handler "headless" no tiene garantías de red confiables en cada tick). Queda como extensión futura, ya con la caché (`useWeatherStore`) lista para que el widget la lea sin agregar nada nuevo del lado de datos.

## Archivos nuevos

- `src/lib/moonPosition.ts`, `src/lib/stars.ts`, `src/lib/weather.ts`
- `src/store/weather.ts`
- `src/features/weather/useWeatherSync.ts`

## Archivos modificados

- `src/lib/sunPosition.ts` — fix del bug de unidades.
- `src/lib/skyGradient.ts` — `lerpColor` exportado.
- `src/components/despertador/sky-clock.tsx` — luna, estrellas y capa de clima.
- `src/store/settings.ts` — `weatherEnabled` / `setWeatherEnabled`.
- `src/app/(tabs)/perfil.tsx` — switch "Clima (beta)".
- `src/app/_layout.tsx` — `useWeatherSync()`.
