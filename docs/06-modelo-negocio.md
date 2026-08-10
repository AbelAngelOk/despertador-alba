# Modelo de negocio (propuesta)

## Propuesta de valor diferencial

Frente a despertadores tradicionales (hora fija) y apps de sueño genéricas (tracking de fases de sueño, sonidos ambiente), esta app se diferencia por anclar la alarma a un evento astronómico real y recalculado día a día, combinando eso con educación y hábitos de higiene del sueño. No compite en "sonidos de alarma" sino en "cuándo despertar" de forma alineada al ritmo circadiano.

## Público objetivo (resumen)

Ver detalle en [01-vision-producto.md](01-vision-producto.md): personas con interés en bienestar/hábitos saludables, rutinas flexibles, y quienes ya tienen dificultad despertando con alarmas convencionales.

## Precio

- Plan Premium: **USD 20 / año** (equivalente a ~USD 1,67/mes), pago único anual. Sin plan mensual en la primera versión: simplifica la decisión de compra y evita la fricción de un cobro recurrente mensual visible.
- Facturación: lo más probable es usar el sistema de suscripciones nativo de cada tienda (Google Play Billing en Android / In-App Purchase de App Store en iOS) en vez de un procesador propio (Stripe, etc.), ya que ambas tiendas lo exigen para este tipo de compra dentro de la app y resuelven altas, bajas, reembolsos y gestión de la suscripción. La elección final de proveedor/API queda pendiente y fuera del alcance de este documento.

## Estrategia de onboarding: "Reverse Trial"

En vez de un freemium clásico (funciones limitadas desde el día 1), la app da acceso completo a **todas las funciones Premium desde la descarga, durante 3 meses**, sin pedir tarjeta ni pago. El período arranca automáticamente al instalar la app (asociado al dispositivo, no requiere cuenta para empezar). Al cumplirse los 3 meses, la cuenta baja automáticamente al plan gratuito, y para recuperar las funciones que ya usó, el usuario debe suscribirse.

### Por qué esta estrategia
- El usuario prueba el valor real del producto (varios tipos de amanecer, estadísticas de seguimiento, catálogo completo de notificaciones) antes de decidir pagar, sin la fricción de una compra a ciegas.
- Al bajar a free entra en juego la **aversión a la pérdida** (loss aversion): perder algo que ya se tenía y usaba genera más motivación de conversión que nunca haberlo tenido. Es la misma lógica del "reverse trial" que usan apps como Duolingo o Headspace, una de las tácticas de conversión más efectivas en apps freemium.
- 3 meses es tiempo suficiente para atravesar cambios notables en el horario de amanecer (el usuario ve a la app "seguir el ritmo" de las estaciones), lo que refuerza el valor percibido del producto frente a un despertador de hora fija.
- Para cuando llega el corte, el usuario ya formó el hábito (usó el despertador varias semanas seguidas), lo que refuerza la percepción de "esto ya es parte de mi rutina" en el momento de pedirle que pague.

## Modelo de acceso: uso sin cuenta + registro progresivo

El objetivo es que la retención nunca se pierda por fricción de registro. Por eso el acceso a la app tiene dos ejes independientes:

1. **Uso del despertador (tab Despertadores)**: no requiere cuenta ni login en ningún momento. Cualquiera que se descarga la app puede crear y usar despertadores de inmediato, con todas las funciones Premium disponibles durante los 3 meses de prueba.
2. **Seguimiento y Perfil/Configuración**: si requieren cuenta, porque dependen de datos asociados al usuario — el seguimiento necesita persistir el historial, y la configuración necesita guardar qué notificaciones tiene habilitadas (ver [08-modulo-notificaciones.md](08-modulo-notificaciones.md)). El registro se pide recién en el momento en que el usuario intenta usar alguna de estas dos secciones, nunca antes.

El registro se resuelve con métodos de un solo toque — **Google Sign-In** como principal, y **Sign in with Apple** en iOS (requerido por las guías de la App Store si se ofrece Google como alternativa) — sin formulario de email/contraseña, para no introducir fricción en el momento en que el usuario recién decidió comprometerse más con la app. Detalle de la pantalla en [07-vistas-app.md](07-vistas-app.md).

### Flujo esperado del usuario
1. Se descarga la app y empieza a usarla de inmediato (crea despertadores), sin registrarse.
2. Se registra —con Google/Apple, en segundos— cuando quiere usar Seguimiento o configurar notificaciones.
3. A los 3 meses de la descarga, sus funciones Premium se limitan al plan gratuito; ahí llega el momento en que necesita pasar a Premium para recuperarlas (ver tácticas de conversión más abajo).

Este orden es intencional: primero se engancha con el producto sin fricción, después se lo invita a comprometerse (cuenta) para desbloquear valor adicional, y recién al final se le pide pagar — nunca al revés.

## Planes

### Plan gratuito (post período de prueba)
- Un despertador activo
- Tipo de amanecer: solo "salida del sol"
- Offset simple (antes o después, sin combinaciones)
- Acceso limitado al módulo de notificaciones (2-3 notificaciones a elección, ver [08-modulo-notificaciones.md](08-modulo-notificaciones.md))
- Seguimiento limitado a los últimos 7 días (ver [07-vistas-app.md](07-vistas-app.md))

### Plan Premium — USD 20/año
- Despertadores múltiples e ilimitados
- Los 4 tipos de amanecer (astronómico, náutico, civil, salida del sol)
- Catálogo completo del módulo de notificaciones (estado del día + hábitos), con timing configurable por notificación
- Seguimiento con historial completo: horarios de amanecer, cumplimiento de la rutina, tendencia estacional
- Sonidos de alarma adicionales / posibilidad de sonido propio
- Personalización visual (temas de color adicionales sobre la base oscura)

## 3 propuestas para atraer al comprador (buenas prácticas de marketing)

### 1. Anclaje de precio: fraccionar el costo, no mostrar el total desnudo
En vez de mostrar solo "USD 20/año", mostrar siempre junto el equivalente mensual o diario: **"USD 1,67/mes"** o **"menos que un café al mes"**. El cerebro percibe montos chicos y recurrentes como menos costosos que un pago único grande, aunque sea matemáticamente igual (efecto de anclaje de precio). Usar este framing tanto en la pantalla de paywall como en el momento del downgrade.

### 2. Oferta de urgencia justo en el momento de la pérdida
Cuando termina el período de prueba y la cuenta baja a free, mostrar en ese preciso momento (no antes, no en frío) una oferta con **descuento por tiempo limitado** (ej. 20-30% off, válida 48-72hs) para reactivar Premium. Es el momento de mayor sensibilidad del usuario (la aversión a la pérdida está en su punto más alto) y la urgencia de una ventana corta empuja a decidir ahí en vez de posponer indefinidamente, que en la práctica suele significar perder la conversión para siempre.

### 3. Reforzar el hábito ya construido (consistencia + prueba social del propio usuario)
En esa misma pantalla de downgrade, mostrar datos reales de uso acumulados durante el período Premium: **"Llevás 12 días despertando con el sol. No pierdas tu racha."**, junto con la racha o estadísticas de seguimiento que se van a perder si no continúa. Apela al principio de consistencia (el usuario ya se comprometió con el hábito): se vende "no perder lo que ya construiste", no "comprar una función nueva".

## Notas
- El monto (USD 20/año) y la duración del período de prueba (3 meses) son un punto de partida; conviene validarlos con usuarios reales antes de fijarlos definitivamente.
- El riesgo de abuso del trial atado a dispositivo (reinstalar para renovarlo) y la solución propuesta —apoyarse en la elegibilidad nativa de Google Play / Apple más una reconciliación al iniciar sesión— están detallados en [09-riesgos-tecnicos.md](09-riesgos-tecnicos.md).
- Este documento es una propuesta de partida para discusión, no una decisión final de negocio.
