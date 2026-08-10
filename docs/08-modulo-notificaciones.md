# Módulo de notificaciones

> Reemplaza el enfoque anterior de "notificación de advertencia" + "catálogo de consejos" fijo (docs previas) por un único módulo centralizado y configurable. Ver funcionalidad de origen en [02-funcionalidades.md](02-funcionalidades.md), configuración en la UI en [07-vistas-app.md](07-vistas-app.md), y regla de cuenta requerida en [06-modelo-negocio.md](06-modelo-negocio.md).

## Concepto

El usuario habilita, de forma independiente, cada notificación que quiere recibir. Cada notificación tiene un **momento recomendado** propio (calculado en función del ritmo circadiano del usuario, típicamente relativo a la hora estimada de su próximo despertador), y el usuario elige **cuándo** recibir el aviso en relación a ese momento.

## Regla de negocio: requiere cuenta

Habilitar, deshabilitar o configurar cualquier notificación de este módulo requiere que el usuario esté registrado y logueado. El resto de la app (crear y usar despertadores) no lo requiere. Ver flujo completo de cuenta en [06-modelo-negocio.md](06-modelo-negocio.md).

## Timing configurable (aplica a toda notificación del módulo)

Para cada notificación habilitada, el usuario elige cuándo quiere recibirla respecto de su momento recomendado:

- **En el momento exacto** (cuando corresponde la acción)
- **15 minutos antes**
- **1 hora antes**

> El "momento recomendado" es el instante de la acción en sí (ej. la hora sugerida para ir a dormir), no la hora de la notificación. Elegir "15 minutos antes" adelanta el aviso 15 minutos respecto de ese instante.

## Categoría A — Notificaciones de estado del día

Ligadas a eventos solares/circadianos, tanto matutinos (amanecer) como vespertinos (atardecer). Ver definiciones y ángulos en [04-etapas-del-dia.md](04-etapas-del-dia.md).

| Notificación | Evento asociado |
|---|---|
| Comienza el atardecer | Crepúsculo civil vespertino: la luz natural empieza a bajar, señal para bajar el ritmo del día |
| Anochece | Crepúsculo astronómico vespertino: últimas señales de luz natural, se acerca la hora de dormir |
| Faltan Xhs para el amanecer | Aviso configurado en horas antes de la próxima alarma (ej. "en 8hs amanecerá, se recomienda dormir") |

Cada una se activa de forma independiente y admite el timing descripto arriba.

## Categoría B — Notificaciones de hábitos (advertencias de higiene del sueño)

Catálogo de recordatorios de hábitos saludables relacionados al sueño. Cada uno tiene un momento recomendado propio:

| Notificación | Momento recomendado (referencia de cálculo) |
|---|---|
| Dejar de consumir cafeína | Hora fija configurable (ej. 15:00), no depende del amanecer |
| Activar filtro de luz azul | Un par de horas antes de la hora estimada de ir a dormir |
| Dejar de usar pantallas | 1-2 horas antes de la hora estimada de ir a dormir |
| Ir a dormir | Hora estimada de la próxima alarma, menos las horas de sueño recomendadas (ej. 8hs) |

Cada notificación de esta categoría también admite el timing (en el momento / 15 min antes / 1h antes).

## Ejemplo de uso

> El usuario habilita "Ir a dormir" con timing "15 minutos antes". La próxima alarma va a sonar a las 6:30 y el usuario tiene configuradas 8hs de sueño recomendadas, por lo que el momento recomendado de ir a dormir es las 22:30. La notificación llega a las 22:15.

## Dónde se configura

En la vista Perfil/Configuración ([07-vistas-app.md](07-vistas-app.md)): un switch por notificación + un selector de timing (en el momento / 15 min antes / 1h antes) por cada una habilitada.

## Límite en plan gratuito

En plan free, solo 2-3 notificaciones del módulo están disponibles a elección del usuario, sin acceso al resto del catálogo ni a las de estado del día. Detalle de planes en [06-modelo-negocio.md](06-modelo-negocio.md).
