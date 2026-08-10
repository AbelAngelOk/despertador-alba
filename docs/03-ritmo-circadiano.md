# Ritmo circadiano (documento educativo)

> Este documento es material de consulta para entender el fundamento del producto antes de tomar decisiones de diseño. Es información general, **no es consejo médico**.

## Qué es el ritmo circadiano

El ritmo circadiano es un ciclo biológico de aproximadamente 24 horas que regula procesos físicos, mentales y de comportamiento en casi todos los seres vivos, incluyendo el ciclo sueño-vigilia, la temperatura corporal, la liberación de hormonas y el metabolismo.

Este ciclo está gobernado por un "reloj biológico maestro" ubicado en el **núcleo supraquiasmático (NSQ)**, una pequeña región del hipotálamo, en el cerebro. El NSQ recibe información directa de la luz que entra por los ojos y usa esa señal para sincronizar (o "poner en hora") el reloj interno del cuerpo con el ciclo día/noche real del entorno.

## El rol de la luz, especialmente la del amanecer

La luz es la señal externa más potente para el reloj circadiano (se la llama *zeitgeber*, "dador de tiempo" en alemán). En particular:

- La exposición a luz brillante por la mañana **adelanta** el reloj interno: ayuda a despertar antes y a sentir sueño más temprano por la noche.
- La luz del amanecer tiene una progresión gradual de intensidad y temperatura de color (de tonos rojizos/tenues a luz blanca plena), lo que —a diferencia de una luz artificial que se enciende de golpe o un sonido abrupto— permite una transición más suave del sueño a la vigilia.
- La falta de exposición a luz natural por la mañana (por ejemplo, en invierno o en interiores) puede desalinear el reloj circadiano, contribuyendo a sensación de cansancio, peor ánimo y dificultad para dormirse a la noche.

Esta es la base conceptual del producto: en lugar de despertar con una alarma sorda a una hora arbitraria, la app usa el evento de luz natural (amanecer) como disparador, alineado con cómo el cuerpo humano está diseñado para despertar.

## Hormonas clave

### Melatonina (hormona del sueño)
- Se produce en la glándula pineal, principalmente en oscuridad.
- Sus niveles suben por la noche (favoreciendo el sueño) y bajan con la exposición a la luz, especialmente luz brillante o azul.
- La luz del amanecer ayuda a frenar la producción de melatonina de forma progresiva, facilitando un despertar natural.

### Cortisol (hormona relacionada con el estado de alerta)
- Sigue un patrón diario llamado *Cortisol Awakening Response* (CAR): sus niveles suben marcadamente en los primeros 30-45 minutos después de despertar.
- La exposición a luz natural temprano en el día está asociada con una respuesta de cortisol más saludable y mayor sensación de alerta durante la mañana.

## Despertar abrupto vs. despertar gradual/sincronizado con la luz

- Un despertador convencional puede interrumpir el sueño en cualquier fase (incluida sueño profundo), generando **inercia del sueño**: sensación de aturdimiento, cansancio y baja concentración durante los primeros minutos (a veces hasta una hora) después de despertar.
- Despertar en sincronía con el aumento gradual de luz natural (o con dispositivos que simulan ese amanecer) se asocia, en estudios de sueño, con menor inercia del sueño y mejor estado de ánimo al despertar, ya que acompaña el proceso hormonal natural en vez de interrumpirlo abruptamente.

## Conceptos relacionados para seguir investigando

- Cronotipos (personas "matutinas" vs. "vespertinas") y cómo afectan la hora ideal de despertar
- Luz azul y su efecto específico sobre la melatonina (relevante también para las notificaciones de consejos, ver [02-funcionalidades.md](02-funcionalidades.md))
- "Light therapy" / lámparas de luz para despertar (simulación de amanecer, producto de referencia conceptual aunque no geolocalizado)
- Higiene del sueño en general (sleep hygiene)
- Desincronización circadiana estacional (los días se acortan/alargan y el reloj biológico debe reajustarse)

## Relación con el diseño de la app

Estos conceptos justifican:
- Que el despertador se ancle al amanecer real y no a una hora fija (alineación con la luz natural)
- Que existan tipos de amanecer configurables como proxy de "cuánta luz ya hay" en el momento de despertar (ver [04-etapas-del-dia.md](04-etapas-del-dia.md))
- Que existan notificaciones de consejos de higiene del sueño (cafeína, luz azul, horarios consistentes) como complemento del despertador en sí
