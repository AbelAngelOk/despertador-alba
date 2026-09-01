# Riesgos técnicos y soluciones propuestas

> Notas de investigación sobre riesgos identificados: abuso del período de prueba, dependencia de conexión para el cálculo de las etapas del día, y confiabilidad de la alarma en segundo plano. Complementa [06-modelo-negocio.md](06-modelo-negocio.md) (trial) y [01-vision-producto.md](01-vision-producto.md) (funcionamiento offline).

## Riesgo 1 — Abuso del trial de 3 meses atado a dispositivo

### El problema

Si el período de prueba (ver [06-modelo-negocio.md](06-modelo-negocio.md)) se controla solo con un flag guardado localmente en el dispositivo, alcanza con desinstalar y reinstalar la app (o borrar sus datos) para reiniciar el contador indefinidamente, sin límite.

### Solución recomendada: apoyarse en el sistema de elegibilidad de las tiendas, no inventar uno propio

Tanto Google Play como Apple ya resuelven exactamente este problema para ofertas de prueba/introductorias, atándolas a la **cuenta de la tienda** (Google/Apple ID) en vez de al dispositivo:

- **Google Play Billing**: los planes de suscripción permiten configurar una oferta de prueba con criterios de elegibilidad ("nunca tuvo esta suscripción" / "nunca tuvo ninguna suscripción") evaluados sobre la cuenta de Google, no sobre el dispositivo — reinstalar la app no resetea la elegibilidad. Además, Play ofrece un **Obfuscated Account ID** para detectar patrones de abuso entre múltiples dispositivos de una misma cuenta. ([Fight fraud and abuse — Android Developers](https://developer.android.com/google/play/billing/security))
- **Apple App Store**: cada Apple ID tiene derecho a **una sola oferta introductoria por grupo de suscripción**; el sistema además detecta y bloquea el patrón de "desuscribirse y volver a suscribirse rápido" para recuperar la oferta. ([Implementing introductory offers — Apple Developer](https://developer.apple.com/documentation/storekit/implementing-introductory-offers-in-your-app))

**Implicancia para el diseño**: en vez de que la app decida por su cuenta "te doy 3 meses gratis" con un flag local, conviene modelar el trial como una oferta real de precio $0 configurada sobre el producto de suscripción Premium en Play Console / App Store Connect. Cuando la tienda otorga el beneficio, es el propio sistema de elegibilidad de la cuenta de tienda el que impide reusarlo — no hace falta reconstruir esa lógica a mano.

### Tensión con el requisito de "cero fricción al descargar"

Activar una oferta $0 vía Play Billing / StoreKit requiere un toque nativo del usuario (aunque sea sin tarjeta) — no se puede otorgar en absoluto silencio en el instante de la instalación. Esto choca parcialmente con la idea original de "premium automático desde la descarga". Propuesta de balance en dos capas:

1. **Capa de bienvenida (fricción cero)**: al abrir la app por primera vez, se desbloquean las funciones Premium de inmediato vía un flag local, para no perder el efecto "wow" inicial ni pedir ninguna acción.
2. **Capa de confirmación (abuso-resistente)**: en algún punto temprano no bloqueante (ej. al crear el primer despertador, o dentro de las primeras 24-48hs), se le pide al usuario un solo toque nativo tipo "Activar 3 meses gratis" a través de Play Billing / StoreKit, que es donde se aplica la elegibilidad real de la cuenta de tienda. Si la cuenta ya usó el beneficio antes, la tienda simplemente no vuelve a ofrecerlo y el trial local de la capa 1 se corta ahí.

> ~~3. Reconciliación al iniciar sesión~~ — descartada: la app no va a tener cuentas propias ni backend para cruzar identidades (ver [17-sin-cuenta-y-notificaciones.md](17-sin-cuenta-y-notificaciones.md)). La protección contra abuso queda limitada a las Capas 1 y 2, es decir, a lo que la elegibilidad nativa de la tienda ya cubre por sí sola.

### Qué queda sin resolver del todo

Nada de esto elimina el abuso al 100% (alguien puede crear cuentas de Google nuevas), pero sí lo eleva del nivel "gratis con un toque" al nivel "hay que crear una cuenta de tienda nueva por cada intento", que es el estándar de la industria y el mismo límite que aceptan apps como Netflix, Spotify o Duolingo.

---

## Riesgo 2 — Dependencia de conexión para calcular las etapas del día

### La pregunta de origen

Se recalcula por día, ¿pero qué trae exactamente: la de hoy, la semana, el mes?

### Respuesta clave: no es una consulta a una base de datos, es una fórmula

A diferencia del clima, el horario de salida/puesta del sol y de cada tipo de crepúsculo ([04-etapas-del-dia.md](04-etapas-del-dia.md)) **no depende de ningún dato en vivo**: es el resultado de una fórmula astronómica determinística que solo necesita como entrada **latitud, longitud, fecha y huso horario**. No hay nada que "traiga" un servidor porque no hay nada que consultar — el mismo cálculo que da el resultado de hoy puede dar el de cualquier fecha pasada o futura, instantáneamente y en el dispositivo.

Esto está confirmado por implementaciones abiertas y ampliamente usadas:
- **SunCalc** (Vladimir Agafonkin, basada en las fórmulas de Astronomy Answers): calcula posición solar, salida/puesta del sol y las fases de luz (dawn/dusk) de forma completamente local. ([SunCalc](https://suncalc.net/))
- **commons-suncalc** (Java, compatible con Android API 26+, sin dependencias de red): calcula exactamente los crepúsculos civil/náutico/astronómico y salida del sol con precisión de ~1 minuto, pensada para apps móviles. ([commons-suncalc](https://commons.shredzone.org/suncalc/index.html))
- **Skylight** (Kotlin/JVM, Maven Central): interfaz Kotlin para lo mismo. ([GitHub — drewhamilton/Skylight](https://github.com/drewhamilton/Skylight))
- Las ecuaciones solares estándar de NOAA son la base de la mayoría de estas implementaciones y son las mismas que usan calculadoras online, solo que corriendo en el dispositivo en vez de en un servidor.

### Implicancia práctica para la app

- **No usar una API externa de terceros** (tipo sunrise-sunset.org) como dependencia dura para esta funcionalidad — eso sí introduciría el riesgo de conexión que se quiere evitar. En su lugar, implementar el cálculo con una librería offline (commons-suncalc del lado Android, un puerto de las mismas fórmulas NOAA/Astronomy Answers del lado iOS, o una única implementación compartida si la app es cross-platform).
- Como el cálculo es barato (CPU, no red), no hace falta elegir entre "traer el día" o "traer el mes": se puede calcular **cualquier rango bajo demanda** (hoy, la semana, el año completo) en milisegundos, cada vez que se necesite, sin necesidad de precachear nada — aunque igualmente conviene guardar localmente el resultado del día actual para no recalcular en cada render de pantalla.
- El único momento en que la app realmente depende de la red es para **resolver la ubicación por primera vez** si el usuario la ingresa como texto (ej. buscar "Buenos Aires" y convertirlo a coordenadas vía geocoding) — el GPS en sí no necesita internet. Una vez resuelta, la coordenada se guarda localmente y el cálculo de etapas del día funciona sin conexión para siempre, incluyendo en modo avión.

### Caso borde a documentar

En latitudes muy altas (cerca de los polos), durante ciertas épocas del año algunas etapas de crepúsculo (o incluso la salida del sol) pueden no ocurrir en absoluto en un día dado (sol de medianoche / noche polar). La UI debería contemplar este caso (ej. "hoy no hay salida del sol en tu ubicación") en vez de asumir que siempre hay un horario válido — ver [07-vistas-app.md](07-vistas-app.md).

---

## Riesgo 3 — Confiabilidad de la alarma en segundo plano (limitación real de Expo Go)

### El problema

Un despertador tiene que sonar aunque el teléfono esté bloqueado o la app cerrada. Eso, en Android/iOS modernos, requiere funciones nativas específicas (alarma exacta con `AlarmManager` + pantalla completa sobre el lockscreen en Android, `Critical Alerts`/interrupciones especiales en iOS) que **no se pueden configurar dentro de Expo Go**: Expo Go es un binario ya compilado por Expo, no reconstruye la app con configuración nativa propia. Para tener eso hace falta un **development build** (`expo-dev-client` + `eas build`), que sí permite agregar esos plugins nativos.

### Qué se implementó en esta etapa (dentro de las posibilidades de Expo Go)

- **Notificaciones locales programadas** con `expo-notifications`: para cada despertador activo se agendan hasta 3 avisos (al horario calculado, +5min, +10min), con sonido del sistema. Estas SÍ se disparan aunque la app esté en segundo plano o cerrada, porque las programa el sistema operativo, no nuestro código corriendo.
- **Vibración repetida + pantalla de alarma a pantalla completa** cuando la app está abierta o se abre (por uso directo o al tocar la notificación): vibra en loop hasta que se toca "Apagar", con el botón de volver de Android bloqueado mientras tanto.
- **Reintento**: si no se apaga, el segundo y tercer aviso programado vuelven a notificar 5 y 10 minutos después.

### Qué no está garantizado todavía

- Si el teléfono está bloqueado y la app no está abierta, lo que el usuario recibe es una **notificación con sonido**, no la pantalla de alarma a pantalla completa vibrando — el sistema no deja que una app en background se dibuje sobre el lockscreen sin los permisos nativos mencionados arriba.
- Esto es una limitación conocida y aceptada para esta etapa (validar el producto en Expo Go, sin pagar aún un build nativo). El camino documentado para resolverlo del todo es migrar a un development build cuando el producto esté validado.

### Notas
- Esto no depende de tener o no Supabase — es una limitación de plataforma/herramienta, no de backend. Ver [12-mvp-sin-backend.md](12-mvp-sin-backend.md).

---

## Riesgo 4 — "Maximum update depth exceeded" disparado por el widget del cielo

### El síntoma

Al usar la app (crear un despertador, tocar cualquier acción que modifique la lista de alarmas) aparecía, de forma intermitente, un error de React `Maximum update depth exceeded`, acompañado en el log nativo de cientos de warnings `StatusBarModule: Ignored status bar change` disparándose cada ~100-150ms durante varios segundos. No había forma de reproducirlo bajo demanda — solo pasaba "a veces", lo que lo hizo muy difícil de diagnosticar a partir de una descripción de usuario sola.

### Causa raíz

`computeSkyWidgetData()` ([`src/widgets/widgetData.ts`](../src/widgets/widgetData.ts)) hace `await store.persist.rehydrate()` sobre `useAlarmsStore` y `useLocationStore` en cada llamada. La intención era legítima: un update de widget de Android puede correr en un motor de JS "headless" recién arrancado, sin la app principal abierta, donde el store persistido todavía no leyó AsyncStorage. El problema es que esta misma función también se llama desde `useSyncSkyWidget` — un hook montado en `_layout.tsx` que corre dentro de la app en primer plano, donde los stores **ya están hidratados**.

`rehydrate()` no es un no-op cuando el store ya está hidratado: siempre re-lee AsyncStorage, hace `JSON.parse` y reemplaza el estado entero con objetos/arrays nuevos — mismo contenido, otra referencia. Como `useSyncSkyWidget` depende de `[alarms, latitude, longitude]`, ese cambio de referencia (aunque el contenido sea idéntico) dispara el efecto de nuevo, que vuelve a llamar `computeSkyWidgetData()`, que vuelve a hacer `rehydrate()`, que vuelve a cambiar la referencia — loop infinito. Cada vuelta hace trabajo real (renderizar el widget nativo vía `react-native-android-widget`), de ahí el ritmo de ~100-150ms por iteración en vez de un loop instantáneo, y de ahí que React terminara logueando el error de profundidad máxima en vez de trabar la app de entrada.

Se disparaba solo "a veces" porque hacía falta la combinación exacta de: el hook re-ejecutándose (por ejemplo al agregar o tocar una alarma) + estar en una plataforma/build donde `react-native-android-widget` está activo (no en Expo Go).

### Fix

`computeSkyWidgetData()` ahora chequea `store.persist.hasHydrated()` antes de rehidratar, y solo llama `rehydrate()` si hace falta:

```ts
await Promise.all([
  useAlarmsStore.persist.hasHydrated() ? Promise.resolve() : useAlarmsStore.persist.rehydrate(),
  useLocationStore.persist.hasHydrated() ? Promise.resolve() : useLocationStore.persist.rehydrate(),
]);
```

Mantiene el comportamiento correcto para el motor headless (primera llamada real, `hasHydrated()` es `false`, sí rehidrata) sin volver a pisar el estado — y por lo tanto sin retriggear el efecto — cuando la app ya está corriendo en primer plano.

### Cómo se encontró

No se pudo reproducir intentando repetir literalmente los pasos que describió el usuario. Se encontró forzando la reproducción con más volumen de interacción (crear varias alarmas seguidas) mientras se miraba `adb logcat` en vivo filtrado por `ReactNativeJS`/`StatusBarModule`: el patrón de warnings repetidos ubicó el momento exacto (justo después de que `alarms` cambiara), lo que redujo la búsqueda a los hooks que dependen de `alarms` en `_layout.tsx`. De esos, `useSyncSkyWidget` era el único que hace I/O async no idempotente (`rehydrate()`) dentro del efecto.

---

## Sources
- [Fight fraud and abuse | Play Billing — Android Developers](https://developer.android.com/google/play/billing/security)
- [About subscriptions | Play Billing — Android Developers](https://developer.android.com/google/play/billing/subscriptions)
- [Implementing introductory offers in your app — Apple Developer](https://developer.apple.com/documentation/storekit/implementing-introductory-offers-in-your-app)
- [Subscription Introductory Offers — Apple Developer](https://developer.apple.com/documentation/appstoreconnectapi/subscription-introductory-offers)
- [SunCalc](https://suncalc.net/)
- [commons-suncalc](https://commons.shredzone.org/suncalc/index.html)
- [GitHub — drewhamilton/Skylight](https://github.com/drewhamilton/Skylight)
