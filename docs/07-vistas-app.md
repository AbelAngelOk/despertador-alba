# Vistas de la app y sus elementos

> Detalle de pantallas a nivel de elementos de UI. Para dirección visual (paleta, principios generales) ver [05-diseno-ux-ui.md](05-diseno-ux-ui.md). Para las funcionalidades que estas vistas exponen, ver [02-funcionalidades.md](02-funcionalidades.md) y el modelo de planes en [06-modelo-negocio.md](06-modelo-negocio.md).

## Navegación general: Bottom Bar

La app usa una barra de navegación inferior (bottom bar) fija. Es la estructura raíz de la app; todo lo demás cuelga de estas vistas o se abre como pantalla apilada encima (ej. detalle de despertador, paywall). La app **inicia siempre en el tab Inicio**.

| Tab | Ícono (minimalista, sin relleno) | Vista | Visible por defecto |
|---|---|---|---|
| Inicio | casa (outline) | Reloj de cielo a pantalla completa | Sí — tab inicial |
| Despertadores | amanecer (outline) | Lista de despertadores | Sí |
| Seguimiento | gráfico de tendencia (outline) | Racha de uso | Sí — siempre, sin opción de ocultarlo |
| Notificaciones | campana (outline) | Catálogo de notificaciones del día | Sí |
| Perfil | persona (outline) | Perfil / Configuración | Sí — siempre al final |

- Los íconos son de línea (outline), sin fondo ni relleno — actualmente el set Feather vía `@expo/vector-icons`. Tab activo resaltado con el acento cálido (naranja-dorado) definido en [05-diseno-ux-ui.md](05-diseno-ux-ui.md); tabs inactivos en gris azulado tenue.
- La bottom bar de la app permanece visible en las vistas raíz; se oculta en pantallas apiladas de pantalla completa (detalle de despertador, alarma sonando, paywall).
- La bottom bar **nativa** del sistema (Android) se respeta —no se oculta ni se pone en modo inmersivo— pero se pinta de negro (`androidNavigationBar.backgroundColor` en `app.json`), para que no rompa la estética oscura de la app. La status bar nativa también se mantiene visible en todo momento.

### Seguimiento siempre está activo

> **Actualizado** — se sacó el switch para desactivar Seguimiento que existía en Perfil. Siempre se lleva registro; no hay forma de ocultar el tab.

El tab **Seguimiento** se muestra siempre, desde el primer uso.

### Sin cuenta, en toda la app

Ninguna vista requiere registrarse ni iniciar sesión — ni siquiera Seguimiento o Perfil, que en un diseño anterior iban a pedir login. Es una decisión permanente, ver [17-sin-cuenta-y-notificaciones.md](17-sin-cuenta-y-notificaciones.md). Todos los datos (despertadores, ubicación, historial de seguimiento, preferencias) se guardan 100% locales al dispositivo.

---

## 1. Vista "Inicio"

Vista por defecto al abrir la app (tab inicial de la bottom bar).

### Elementos
- **Reloj de cielo a pantalla completa**: ocupa toda la pantalla, con la única excepción de la bottom bar de la app, la bottom bar nativa y la status bar nativa (ambas se respetan, no es un modo inmersivo). Degradado animado que representa el estado real del cielo ahora mismo, calculado con la posición solar actual — altitud en grados sobre/bajo el horizonte, no una franja fija. Un marcador de sol se desplaza dentro del degradado según esa altitud, con una transición suave cada vez que se actualiza (cada ~30s).
- Muestra superpuesto: fase actual del cielo + grados (ej. "Crepúsculo civil (amaneciendo) · 9°"), y el nombre, hora y countdown de la próxima alarma a sonar (o un mensaje si no hay ninguna activa).
- Si falta la ubicación, esta vista se reemplaza por un banner para habilitarla — es el único lugar de la app donde se pide la ubicación por primera vez.

---

## 2. Vista "Despertadores" (lista)

### Elementos
- **Header superior**: título "Tus despertadores" (o similar)
- **Lista de despertadores** (una card por despertador), cada card con:
  - Nombre del despertador
  - Tipo de amanecer + offset (ej. "Civil, -20 min")
  - Hora estimada para hoy (recalculada, ej. "6:28")
  - Días activos, abreviados (L M M J V S D) con los días activos resaltados
  - Switch on/off
  - Ícono de sonido asignado (mini indicador)
  - Ícono indicador si la alarma tiene [Microactividad](13-microactividad.md) configurada
  - Badge "Premium" si la configuración de esa card usa una función no disponible en el plan actual del usuario (ver reglas de paywall en [06-modelo-negocio.md](06-modelo-negocio.md))
- **Botón flotante (FAB)** "+" para crear un nuevo despertador
  - Si el usuario está en plan free y ya tiene 1 despertador activo (límite del plan gratuito), el FAB muestra un ícono de candado y al tocarlo abre el paywall en vez de la creación
- **Estado vacío** (sin despertadores creados): ilustración + texto corto + CTA que lleva directo a "Crear despertador"

---

## 3. Vista "Detalle de despertador" (crear / editar)

Se abre como pantalla apilada (no forma parte de la bottom bar) desde el FAB o al tocar una card existente.

### Elementos
- **Header**: botón volver, título ("Nuevo despertador" / nombre del despertador si se edita), botón guardar
- **Nombre del despertador**: campo de texto libre (opcional, con placeholder tipo "Despertador")
- **Selector de tipo de amanecer**: 4 opciones ("Amanecer astronómico", "Amanecer náutico", "Amanecer civil", "Amanecer" para la salida del sol — nombradas así a propósito, aunque sea algo redundante, para que quede claro que todas son variantes de "amanecer"), cada una con una descripción corta y amigable (ver [04-etapas-del-dia.md](04-etapas-del-dia.md)); en plan free, las opciones no disponibles se muestran deshabilitadas con badge Premium
- **Selector de offset**: slider o stepper en minutos, con signo antes/después, y preview en vivo del horario estimado de hoy ("Hoy sonaría aprox. a las 6:28")
- **Selector de días**: 7 toggles circulares (L M M J V S D), multi-selección
- **Selector de horario**: no aplica como hora fija tradicional — en su lugar, este bloque muestra y resume el resultado del tipo de amanecer + offset elegidos arriba, como confirmación visual de "a qué hora equivale hoy" (ver regla de negocio en [02-funcionalidades.md](02-funcionalidades.md): no hay hora fija editable directamente)
- **Microactividad** (ver [13-microactividad.md](13-microactividad.md)): switch para activarla + selector de tipo (agua, luz solar, respiración, estiramiento, caminar) + stepper de minutos para la ventana de cumplimiento (5–120min, default 30). Apagada por defecto — sin tocarla, el despertador se comporta como siempre (apagar la alarma alcanza).
- **Selector de sonido**: 4 sonidos incluidos (Clásico, Suave, Urgente, Campana — sintetizados, ver [16-sonidos-de-alarma.md](16-sonidos-de-alarma.md)), cada uno con botón de play/pause para escuchar un preview antes de elegir. Sonido propio (archivo del dispositivo) queda para más adelante, no implementado todavía.
- **Volumen / vibración**: control de volumen de la alarma + toggle de vibración — no implementado todavía, hoy la alarma siempre vibra y suena al volumen de medios del dispositivo
- **Posponer (snooze)**: toggle on/off + selector de minutos de posposición — no implementado todavía
- **Acceso rápido a notificaciones**: enlace corto tipo "Configurar avisos de esta rutina" que lleva al módulo de notificaciones (ver [08-modulo-notificaciones.md](08-modulo-notificaciones.md))
- **Eliminar despertador**: acción destructiva al final, solo visible en modo edición, con confirmación

---

## 4. Vista "Seguimiento"

Muestra el historial de uso del despertador para reforzar el hábito (y, comercialmente, el valor que se pierde al bajar a plan free — ver [06-modelo-negocio.md](06-modelo-negocio.md)). **Viene activada por defecto** — el usuario puede desactivarla desde Perfil (ver más abajo) si no la quiere. No requiere cuenta (ver [17-sin-cuenta-y-notificaciones.md](17-sin-cuenta-y-notificaciones.md)).

### Racha estilo Duolingo — 3 estados por día
El elemento central es una tira de los últimos 7 días (como la racha semanal de Duolingo), donde cada día tiene exactamente uno de 3 estados:
- **Se levantó** (a tiempo): círculo relleno con el acento cálido y un ícono de check.
- **Se levantó con retraso**: círculo relleno con el acento secundario (violeta) y un ícono de reloj — pasó al menos un reintento de la alarma antes de apagarla.
- **No se levantó**: círculo vacío (solo borde), en rojo — el día tenía una alarma activa y nunca se apagó.

Arriba de la tira, un número grande con la **racha actual** (días consecutivos con "se levantó" o "se levantó con retraso" — cualquiera de los dos mantiene la racha, solo "no se levantó" la corta). Debajo, una referencia de colores.

### Elementos
- **Racha actual**: número grande + tira semanal de 7 días (arriba), cada día con ícono según su estado (check / reloj / X, no solo color)
- **Referencia de colores**: qué significa cada estado
- **Contador "Días que te levantaste"**: total histórico (no solo la racha activa) de días con estado "a tiempo" o "con retraso"
- **Contador "Días con microactividad"**: cantidad de días distintos en los que se confirmó la microactividad del despertador (ver [13-microactividad.md](13-microactividad.md))
- **Límite de plan gratuito**: en free, el historial visible se recorta a los últimos 7 días (ver [06-modelo-negocio.md](06-modelo-negocio.md))

---

## 5. Vista "Perfil / Configuración"

No requiere cuenta — ver [17-sin-cuenta-y-notificaciones.md](17-sin-cuenta-y-notificaciones.md).

### Elementos (implementados hoy)
- **Ubicación**: coordenadas guardadas + botón "Actualizar ubicación"
- **Clima (beta)**: switch on/off, apagado por defecto — ver [15-cielo-astronomico-y-clima.md](15-cielo-astronomico-y-clima.md)
- **Backup**: una sola tarjeta que explica por qué existe (la app no tiene cuenta ni backend — ver [17-sin-cuenta-y-notificaciones.md](17-sin-cuenta-y-notificaciones.md) — así que los datos viven solo en el dispositivo y se pierden si se pierde o desinstala) y los botones "Exportar backup" / "Importar backup" — ver [19-backup-y-restauracion.md](19-backup-y-restauracion.md)

El catálogo de notificaciones del día ya no vive acá — tiene su propio tab en la bottom bar (ver arriba y [18-notificaciones-del-dia.md](18-notificaciones-del-dia.md)).

### Elementos propuestos, no implementados todavía
- **Estado de suscripción**: plan actual (Free/Premium), fecha de fin del período de prueba (3 meses desde la descarga) o de renovación si ya paga, botón "Mejorar a Premium" o "Gestionar suscripción" (este último deep-link a la gestión nativa de Play Store/App Store, sin cuenta propia de por medio)
- **Formato de hora**: 12h / 24h
- **Apariencia**: variantes de acento de color sobre la base oscura (función Premium, ver [05-diseno-ux-ui.md](05-diseno-ux-ui.md))
- **Aprendé más**: sección con contenido resumido de [03-ritmo-circadiano.md](03-ritmo-circadiano.md) y [04-etapas-del-dia.md](04-etapas-del-dia.md), pensada como contenido educativo dentro de la app
- **Soporte / Acerca de**: contacto, versión de la app, términos y privacidad

---

## 6. Vista "Notificaciones" (`src/app/(tabs)/notificaciones.tsx`)

Tab propio en la bottom bar (ícono campana). No requiere cuenta. Dos secciones con switch por fila: "Etapas del día" (9 momentos solares, de amanecer astronómico a anochecer astronómico) y "Antes del despertador" (2 avisos relativos a la próxima alarma). Ver catálogo completo en [18-notificaciones-del-dia.md](18-notificaciones-del-dia.md).

---

## Pantallas adicionales fuera de la bottom bar

### Pantalla de alarma sonando
Pantalla a pantalla completa (modal, sin gesto para deslizar y cerrarla, botón físico de volver bloqueado en Android), se abre automáticamente cuando corresponde. Ver diseño visual en [05-diseno-ux-ui.md](05-diseno-ux-ui.md). Elementos: degradado de cielo según la posición solar actual, nombre del despertador, hora, botón grande "Apagar".

**Comportamiento tipo alarma real**, según [09-riesgos-tecnicos.md](09-riesgos-tecnicos.md):
- Al llegar la hora, la alarma vibra y reproduce en loop el sonido elegido ([16-sonidos-de-alarma.md](16-sonidos-de-alarma.md)) hasta que se toca "Apagar" — no para sola.
- Si no se apaga, vuelve a sonar: se programan hasta 3 avisos espaciados 5 minutos entre sí (notificaciones locales con sonido, además de la vibración y el sonido propio si la app está abierta). Con la app en primer plano, la notificación del sistema no se muestra — ya está la pantalla propia y sonando, mostrarla también duplicaría la alerta.
- Al apagar, si la alarma **no** tiene microactividad configurada, se registra el resultado en Seguimiento ahí mismo: "a tiempo" si fue dentro de los primeros 5 minutos, "con retraso" si fue después. Si **sí** tiene microactividad, en vez de volver a los tabs se navega a la pantalla de Microactividad — ver [13-microactividad.md](13-microactividad.md).

### Pantalla de Microactividad
Pantalla apilada (modal, sin gesto de cierre) a la que se llega únicamente después de apagar una alarma que tiene microactividad configurada. Elementos: ícono + nombre de la tarea (ej. "Tomar un vaso de agua"), texto explicando que hace falta confirmarla para que cuente el despertar, cuenta regresiva hasta el vencimiento de la ventana, botón "Confirmar". Si la ventana vence mientras la pantalla está abierta, cambia a un estado de "se venció el tiempo". Si el usuario cierra la app con esto pendiente, al reabrirla se navega automáticamente de vuelta acá (mientras el plazo no haya vencido) — ver detalle completo en [13-microactividad.md](13-microactividad.md).

### Paywall
Pantalla apilada que se muestra al intentar usar una función Premium sin acceso, o automáticamente al finalizar el período de prueba (reverse trial de 3 meses, ver [06-modelo-negocio.md](06-modelo-negocio.md)). Elementos: resumen de funciones Premium, precio anual con framing mensual ("USD 1,67/mes"), datos de uso/racha del usuario si aplica (downgrade), botón de suscripción, botón cerrar/omitir (si no es obligatorio en ese punto del flujo).

### Login / Registro — descartada

> Esta pantalla se había planteado para gatear Seguimiento, Perfil y notificaciones detrás de una cuenta. Se descartó: la app no pide login en ningún punto. Ver [17-sin-cuenta-y-notificaciones.md](17-sin-cuenta-y-notificaciones.md). Sección dejada como registro histórico, no como plan vigente.
