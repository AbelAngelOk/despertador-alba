# Riesgos técnicos y soluciones propuestas

> Notas de investigación sobre dos riesgos identificados: abuso del período de prueba y dependencia de conexión para el cálculo de las etapas del día. Complementa [06-modelo-negocio.md](06-modelo-negocio.md) (trial) y [01-vision-producto.md](01-vision-producto.md) (funcionamiento offline).

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
3. **Reconciliación al iniciar sesión**: cuando el usuario se registra con Google/Apple Sign-In para usar Seguimiento o Notificaciones (ver [06-modelo-negocio.md](06-modelo-negocio.md)), el backend cruza esa identidad de cuenta contra un registro propio de trials otorgados. Si esa cuenta (o ese email normalizado) ya tuvo un trial en otro dispositivo, el sistema no reinicia el contador: hereda la fecha de fin real. Esto es, en esencia, la idea que se planteó: el trial "sigue el hilo" de la cuenta y no del dispositivo en cuanto existe una cuenta a la cual atarlo.

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

## Sources
- [Fight fraud and abuse | Play Billing — Android Developers](https://developer.android.com/google/play/billing/security)
- [About subscriptions | Play Billing — Android Developers](https://developer.android.com/google/play/billing/subscriptions)
- [Implementing introductory offers in your app — Apple Developer](https://developer.apple.com/documentation/storekit/implementing-introductory-offers-in-your-app)
- [Subscription Introductory Offers — Apple Developer](https://developer.apple.com/documentation/appstoreconnectapi/subscription-introductory-offers)
- [SunCalc](https://suncalc.net/)
- [commons-suncalc](https://commons.shredzone.org/suncalc/index.html)
- [GitHub — drewhamilton/Skylight](https://github.com/drewhamilton/Skylight)
