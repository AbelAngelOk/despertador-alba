# Funcionalidades

## 1. Crear despertador

La funcionalidad central de la app. A diferencia de un despertador tradicional, **no se elige una fecha/hora exacta**: se elige una referencia relativa al amanecer, que la app recalcula todos los días.

No requiere cuenta ni registro: cualquier persona que se descarga la app puede crear y usar despertadores de inmediato. Ninguna función de la app lo requiere — ver [17-sin-cuenta-y-notificaciones.md](17-sin-cuenta-y-notificaciones.md).

### Opciones de configuración

- **Al amanecer**: la alarma suena exactamente en el horario calculado de salida del sol (sunrise) para la ubicación del usuario.
- **Offset en minutos antes y/o después**: el usuario define un desfasaje, por ejemplo:
  - "30 minutos antes del amanecer" (para tener tiempo de prepararse con luz ya presente)
  - "15 minutos después del amanecer"
  - Se debe poder combinar un rango si se desea (ej. ventana de aviso + hora final de alarma), a definir en diseño de UX ([05-diseno-ux-ui.md](05-diseno-ux-ui.md))
- **Tipo de amanecer** como referencia en lugar de la salida del sol visual. Ver definiciones completas en [04-etapas-del-dia.md](04-etapas-del-dia.md):
  - Crepúsculo astronómico
  - Crepúsculo náutico
  - Crepúsculo civil
  - Salida del sol (sunrise)

### Regla de negocio clave

No existe la opción de programar una alarma en una fecha y hora fija (ej. "12/08 a las 07:00"). Toda alarma se define en función de un evento solar + offset. Esto es intencional: el producto se posiciona como una herramienta de ritmo circadiano, no como un despertador genérico.

### Ejemplo de configuración

> Despertador "Rutina laboral": tipo de amanecer = *civil*, offset = -20 minutos, días activos = lunes a viernes.
> Resultado: si el crepúsculo civil de un martes es a las 6:48, la alarma suena a las 6:28 ese día. El miércoles, si el crepúsculo civil es a las 6:45, la alarma se recalcula automáticamente a las 6:25.

### Microactividad (opcional)

Cada despertador puede tener, opcionalmente, una [Microactividad](13-microactividad.md) asociada: una tarea breve (tomar agua, ver luz natural, respirar, estirarse, caminar) que hay que confirmar después de apagar la alarma para que ese despertar cuente en la racha de [Seguimiento](07-vistas-app.md). Sin microactividad configurada, apagar la alarma sigue siendo suficiente, como siempre.

## 2. Notificaciones (estado del día + antes del despertador)

Implementado — catálogo de avisos ligados a las etapas del día (amanecer astronómico/náutico/civil, salida del sol, mediodía solar, atardecer y sus tres crepúsculos vespertinos) más dos avisos relativos a la próxima alarma ("hora de ir a dormir" y "en 1 hora es mejor ir a dormir", ambos para llegar a 8hs de sueño). Cada notificación se activa de forma independiente, todas desactivadas por defecto.

No requiere cuenta — igual que crear un despertador, se configura y guarda 100% local (ver [17-sin-cuenta-y-notificaciones.md](17-sin-cuenta-y-notificaciones.md)). Distinto de las notificaciones de "está sonando la alarma", que son otra cosa (ver [16-sonidos-de-alarma.md](16-sonidos-de-alarma.md)).

Detalle completo del catálogo implementado y cómo se programa en [18-notificaciones-del-dia.md](18-notificaciones-del-dia.md). El diseño original, más elaborado (timing configurable, catálogo de hábitos de higiene del sueño), quedó en [08-modulo-notificaciones.md](08-modulo-notificaciones.md) como propuesta no construida todavía.
