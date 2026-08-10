# Funcionalidades

## 1. Crear despertador

La funcionalidad central de la app. A diferencia de un despertador tradicional, **no se elige una fecha/hora exacta**: se elige una referencia relativa al amanecer, que la app recalcula todos los días.

No requiere cuenta ni registro: cualquier persona que se descarga la app puede crear y usar despertadores de inmediato. Ver flujo de acceso completo en [06-modelo-negocio.md](06-modelo-negocio.md).

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

## 2. Notificaciones (estado del día + hábitos)

Las notificaciones de advertencia (ej. "en 8hs amanecerá, se recomienda dormir") y las de consejos de higiene del sueño (ej. cafeína, filtro de luz azul, pantallas) se agrupan en un único **módulo de notificaciones**, configurable por el usuario: cada notificación se habilita de forma independiente y admite elegir cuándo recibirla (en el momento recomendado, 15 minutos antes, o 1 hora antes).

Requiere cuenta: a diferencia de crear un despertador, configurar notificaciones sí requiere que el usuario esté registrado (ver [06-modelo-negocio.md](06-modelo-negocio.md)).

Detalle completo de categorías, catálogo y lógica de timing en [08-modulo-notificaciones.md](08-modulo-notificaciones.md).
