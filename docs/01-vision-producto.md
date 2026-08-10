# Visión de producto — Despertador al Amanecer

## Objetivo

Una app mobile de despertador que **no se configura con una hora fija**, sino que se sincroniza con el amanecer real del lugar donde está el usuario. La app sabe a qué hora va a amanecer cada día (ese horario cambia constantemente a lo largo del año) y despierta a la persona en ese momento, o con un desfasaje (offset) de minutos antes y/o después, según lo que el usuario elija.

## El problema

Los despertadores tradicionales usan una hora fija (ej. "7:00 AM todos los días"), sin importar si ese horario coincide con luz solar, oscuridad total, o un punto intermedio. Esto ignora el **ritmo circadiano**: nuestro reloj biológico interno, que usa la luz natural (especialmente la luz del amanecer) como principal señal para regular el ciclo sueño-vigilia. Ver [03-ritmo-circadiano.md](03-ritmo-circadiano.md).

Consecuencias de despertar desalineado con la luz natural:
- Sensación de cansancio aunque se haya dormido "suficientes horas"
- Despertares abruptos en la fase de sueño profundo
- Peor ajuste del reloj biológico a lo largo de las estaciones (los horarios de amanecer cambian varios minutos por semana)

## La solución

Un despertador que se ajusta día a día al horario real de amanecer del lugar del usuario (usando geolocalización + cálculo astronómico de posición solar), permitiendo:
- Despertar exactamente al amanecer
- Despertar X minutos antes o después del amanecer
- Elegir un **tipo de amanecer** (crepúsculo astronómico, náutico, civil, o salida del sol) como referencia, en vez de un instante único — ver [04-etapas-del-dia.md](04-etapas-del-dia.md)
- Recibir notificaciones de estado del día y de hábitos de higiene del sueño en el camino — ver [08-modulo-notificaciones.md](08-modulo-notificaciones.md)

Explícitamente **no** se permite programar la alarma en una fecha/hora exacta fija: ese es el diferencial de la app frente a un despertador convencional.

Usar el despertador no requiere crear una cuenta; el registro se pide más adelante, solo cuando el usuario quiere seguimiento o configurar notificaciones. Ver el modelo de acceso completo en [06-modelo-negocio.md](06-modelo-negocio.md).

## Público objetivo

- Personas interesadas en optimizar su descanso y energía (biohacking, hábitos saludables)
- Personas con rutinas flexibles (freelancers, trabajo remoto) que pueden adaptar su horario de despertar a la luz natural
- Personas con dificultad para despertarse con alarmas convencionales (grogginess / inercia del sueño)

Ver propuesta de valor diferencial y monetización en [06-modelo-negocio.md](06-modelo-negocio.md).

## Notas técnicas de alto nivel

(Sin detalle de implementación — solo para dimensionar el producto)

- **Geolocalización**: la app necesita la ubicación del usuario (o que la ingrese manualmente) para calcular el horario de amanecer correcto.
- **Cálculo de horarios solares**: existen algoritmos y APIs astronómicas estándar (tipo sunrise-sunset) que devuelven, para una latitud/longitud y fecha dadas, los horarios de cada tipo de crepúsculo y de la salida del sol. Este cálculo se recalcula todos los días, ya que el amanecer se corre unos minutos cada jornada.
- **Notificaciones locales dinámicas**: a diferencia de una alarma de hora fija, esta app debe reprogramar la alarma del día siguiente automáticamente cada vez que cambia el horario de amanecer calculado (idealmente al final del día o al abrir la app).
- **Funcionamiento sin conexión**: el cálculo de horarios solares es matemático (no depende de una API externa en tiempo real) por lo que puede funcionar offline una vez que se tiene la ubicación. Detalle de por qué y qué librerías offline existen para esto en [09-riesgos-tecnicos.md](09-riesgos-tecnicos.md).
