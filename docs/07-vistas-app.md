# Vistas de la app y sus elementos

> Detalle de pantallas a nivel de elementos de UI. Para dirección visual (paleta, principios generales) ver [05-diseno-ux-ui.md](05-diseno-ux-ui.md). Para las funcionalidades que estas vistas exponen, ver [02-funcionalidades.md](02-funcionalidades.md) y el modelo de planes en [06-modelo-negocio.md](06-modelo-negocio.md).

## Navegación general: Bottom Bar

La app usa una barra de navegación inferior (bottom bar) fija, con 3 secciones. Es la estructura raíz de la app; todo lo demás cuelga de estas 3 vistas o se abre como pantalla apilada encima (ej. detalle de despertador, paywall).

| Tab | Ícono (concepto) | Vista |
|---|---|---|
| Despertadores | sol/curva de amanecer | Lista de despertadores (home) |
| Seguimiento | gráfico/racha | Estadísticas de uso |
| Perfil | silueta simple | Perfil / Configuración |

- Tab activo resaltado con el acento cálido (naranja-dorado) definido en [05-diseno-ux-ui.md](05-diseno-ux-ui.md); tabs inactivos en gris azulado tenue.
- La bottom bar permanece visible en las 3 vistas raíz; se oculta en pantallas apiladas de pantalla completa (detalle de despertador, alarma sonando, paywall).

### Acceso sin cuenta vs. con cuenta

No hace falta registrarse para usar la app: el tab **Despertadores** (crear, editar y usar alarmas) funciona por completo sin login. Los tabs **Seguimiento** y **Perfil** sí requieren cuenta, porque dependen de datos que se guardan asociados al usuario (historial de uso, preferencias de notificaciones). Al tocar cualquiera de esos dos tabs sin estar logueado, se muestra la pantalla de Login/Registro (ver más abajo) en vez del contenido de la vista. Ver el razonamiento completo de este modelo de acceso en [06-modelo-negocio.md](06-modelo-negocio.md).

---

## 1. Vista "Despertadores" (lista)

Vista por defecto al abrir la app.

### Elementos
- **Header superior**: título "Tus despertadores" (o similar) + ícono de acceso rápido a notificaciones/consejos (ver [02-funcionalidades.md](02-funcionalidades.md))
- **Bloque de próxima alarma** (destacado, arriba de la lista): nombre del despertador, countdown hacia la hora estimada de hoy, mini-degradado de cielo representando el tipo de amanecer configurado
- **Lista de despertadores** (una card por despertador), cada card con:
  - Nombre del despertador
  - Tipo de amanecer + offset (ej. "Civil, -20 min")
  - Hora estimada para hoy (recalculada, ej. "6:28")
  - Días activos, abreviados (L M M J V S D) con los días activos resaltados
  - Switch on/off
  - Ícono de sonido asignado (mini indicador)
  - Badge "Premium" si la configuración de esa card usa una función no disponible en el plan actual del usuario (ver reglas de paywall en [06-modelo-negocio.md](06-modelo-negocio.md))
- **Botón flotante (FAB)** "+" para crear un nuevo despertador
  - Si el usuario está en plan free y ya tiene 1 despertador activo (límite del plan gratuito), el FAB muestra un ícono de candado y al tocarlo abre el paywall en vez de la creación
- **Estado vacío** (sin despertadores creados): ilustración + texto corto + CTA que lleva directo a "Crear despertador"

---

## 2. Vista "Detalle de despertador" (crear / editar)

Se abre como pantalla apilada (no forma parte de la bottom bar) desde el FAB o al tocar una card existente.

### Elementos
- **Header**: botón volver, título ("Nuevo despertador" / nombre del despertador si se edita), botón guardar
- **Nombre del despertador**: campo de texto libre (opcional, con placeholder tipo "Despertador")
- **Selector de tipo de amanecer**: 4 opciones visuales sobre una curva de luz día/noche (astronómico, náutico, civil, salida del sol — ver [04-etapas-del-dia.md](04-etapas-del-dia.md)); en plan free, las opciones no disponibles se muestran deshabilitadas con badge Premium
- **Selector de offset**: slider o stepper en minutos, con signo antes/después, y preview en vivo del horario estimado de hoy ("Hoy sonaría aprox. a las 6:28")
- **Selector de días**: 7 toggles circulares (L M M J V S D), multi-selección
- **Selector de horario**: no aplica como hora fija tradicional — en su lugar, este bloque muestra y resume el resultado del tipo de amanecer + offset elegidos arriba, como confirmación visual de "a qué hora equivale hoy" (ver regla de negocio en [02-funcionalidades.md](02-funcionalidades.md): no hay hora fija editable directamente)
- **Selector de sonido**: lista de sonidos predefinidos con reproducción de preview al tocar cada uno (ícono play); opción de sonido propio (archivo del dispositivo) marcada como función Premium
- **Volumen / vibración**: control de volumen de la alarma + toggle de vibración
- **Posponer (snooze)**: toggle on/off + selector de minutos de posposición
- **Acceso rápido a notificaciones**: enlace corto tipo "Configurar avisos de esta rutina" que lleva al módulo de notificaciones (ver [08-modulo-notificaciones.md](08-modulo-notificaciones.md)); si el usuario no está logueado, este enlace abre la pantalla de Login/Registro en vez del módulo, ya que las notificaciones requieren cuenta
- **Eliminar despertador**: acción destructiva al final, solo visible en modo edición, con confirmación

---

## 3. Vista "Seguimiento"

Muestra el historial de uso del despertador para reforzar el hábito (y, comercialmente, el valor que se pierde al bajar a plan free — ver [06-modelo-negocio.md](06-modelo-negocio.md)). **Requiere cuenta** (ver nota de acceso en la sección de Bottom Bar): sin login, esta vista muestra la pantalla de Login/Registro en lugar del contenido.

### Elementos
- **Racha actual**: número grande de días consecutivos despertando según lo configurado, con mensaje motivacional corto
- **Calendario/heatmap**: vista tipo calendario de los últimos días, con color según resultado del día (despertó a tiempo / pospuso / apagó antes de tiempo / no sonó)
- **Gráfico de horarios de amanecer**: línea temporal mostrando cómo varió el horario de amanecer configurado a lo largo de las semanas (estacionalidad), comparado con la hora real en que el usuario apagó la alarma
- **Estadísticas resumen**: promedio de veces que pospone por semana, % de cumplimiento (alarmas apagadas dentro del rango esperado vs. pospuestas)
- **Límite de plan gratuito**: en free, el calendario y las estadísticas solo muestran los últimos 7 días, con el resto de las fechas bloqueadas visualmente (blur o candado) y un CTA a Premium para desbloquear el historial completo

---

## 4. Vista "Perfil / Configuración"

**Requiere cuenta** (ver nota de acceso en la sección de Bottom Bar): esta vista completa —incluyendo la habilitación de notificaciones— necesita login, ya que las preferencias se guardan asociadas al usuario. Sin login, se muestra la pantalla de Login/Registro en lugar del contenido.

### Elementos
- **Estado de la cuenta**: datos básicos del usuario logueado (nombre, email, avatar si viene del proveedor de login), botón de cerrar sesión
- **Estado de suscripción**: plan actual (Free/Premium), fecha de fin del período de prueba (3 meses desde la descarga) o de renovación si ya paga, botón "Mejorar a Premium" o "Gestionar suscripción" (este último deep-link a la gestión nativa de Play Store/App Store)
- **Ubicación**: automática (GPS) o manual, necesaria para calcular los horarios de amanecer (ver [01-vision-producto.md](01-vision-producto.md)) — esto no requiere cuenta en sí, pero vive en esta vista
- **Módulo de notificaciones**: lista de notificaciones agrupadas por categoría (Estado del día / Hábitos), cada una con switch on/off + selector de timing (en el momento / 15 min antes / 1h antes) — ver catálogo completo y lógica en [08-modulo-notificaciones.md](08-modulo-notificaciones.md); en plan free, solo 2-3 notificaciones del catálogo están disponibles
- **Permisos**: acceso directo a permisos de notificaciones del sistema operativo
- **Formato de hora**: 12h / 24h
- **Apariencia**: variantes de acento de color sobre la base oscura (función Premium, ver [05-diseno-ux-ui.md](05-diseno-ux-ui.md))
- **Aprendé más**: sección con contenido resumido de [03-ritmo-circadiano.md](03-ritmo-circadiano.md) y [04-etapas-del-dia.md](04-etapas-del-dia.md), pensada como contenido educativo dentro de la app
- **Soporte / Acerca de**: contacto, versión de la app, términos y privacidad

---

## Pantallas adicionales fuera de la bottom bar

### Pantalla de alarma sonando
Pantalla a pantalla completa, se abre automáticamente al disparar la alarma. Ver diseño visual en [05-diseno-ux-ui.md](05-diseno-ux-ui.md). Elementos: degradado animado de cielo, nombre del despertador, hora actual, botones grandes de apagar/posponer.

### Paywall
Pantalla apilada que se muestra al intentar usar una función Premium sin acceso, o automáticamente al finalizar el período de prueba (reverse trial de 3 meses, ver [06-modelo-negocio.md](06-modelo-negocio.md)). Elementos: resumen de funciones Premium, precio anual con framing mensual ("USD 1,67/mes"), datos de uso/racha del usuario si aplica (downgrade), botón de suscripción, botón cerrar/omitir (si no es obligatorio en ese punto del flujo).

### Login / Registro
Pantalla apilada que aparece contextualmente: al tocar los tabs Seguimiento o Perfil sin estar logueado, al intentar habilitar una notificación, o al querer conservar el progreso antes de que termine el período de prueba. Elementos:
- Mensaje corto contextual (ej. "Creá una cuenta para guardar tu seguimiento" / "Iniciá sesión para configurar tus notificaciones")
- Botón principal **"Continuar con Google"** (Google Sign-In)
- Botón **"Continuar con Apple"** (Sign in with Apple) — obligatorio en iOS si se ofrece Google Sign-In, por lineamientos de la App Store
- Sin formulario de email/contraseña en la primera versión: el objetivo es minimizar fricción, por eso solo se ofrecen métodos de un toque
- Texto legal breve (términos y privacidad) debajo de los botones
- Sin botón de "omitir" en este flujo: si el usuario llegó acá es porque la función que quiere sí requiere cuenta; para seguir sin cuenta simplemente vuelve al tab Despertadores
