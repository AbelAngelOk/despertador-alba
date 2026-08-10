# Etapas del día / tipos de amanecer (documento educativo)

> Este documento explica los términos astronómicos que la app usa como opciones de "tipo de amanecer" en la creación de un despertador (ver [02-funcionalidades.md](02-funcionalidades.md)).

## Por qué importa el "tipo" de amanecer

El amanecer no es un instante único: es un proceso gradual de aumento de luz que dura más de una hora en total, dividido por convención astronómica en etapas según el ángulo del sol respecto al horizonte (el sol está debajo del horizonte durante toda esta secuencia, hasta la salida del sol). Cada etapa corresponde a un nivel distinto de luminosidad ambiente, lo cual es relevante para elegir en qué momento exacto se quiere despertar.

## Las etapas, de más oscuro a más claro

### 1. Crepúsculo astronómico
- **Ángulo solar**: el sol está entre 18° y 12° debajo del horizonte.
- **Luminosidad**: prácticamente no hay luz solar perceptible; el cielo empieza a diferenciarse muy levemente del negro de la noche. Es el límite en el que, en un cielo despejado sin contaminación lumínica, dejan de verse las estrellas más débiles.
- **Uso en la app**: opción para usuarios que quieren empezar a despertar muy temprano, apenas hay el primer indicio de cambio en el cielo.

### 2. Crepúsculo náutico
- **Ángulo solar**: el sol está entre 12° y 6° debajo del horizonte.
- **Luminosidad**: el horizonte empieza a ser distinguible con claridad (históricamente, el momento en que los navegantes podían usar el horizonte del mar como referencia junto con las estrellas). El cielo se ve azul oscuro, con luz ambiental leve.
- **Uso en la app**: punto intermedio, más luz que el astronómico pero todavía muy tenue.

### 3. Crepúsculo civil
- **Ángulo solar**: el sol está entre 6° y 0° debajo del horizonte (justo antes de asomarse).
- **Luminosidad**: hay suficiente luz natural para distinguir objetos y actividades al aire libre sin luz artificial; es el momento que solemos percibir como "ya casi amanece" o el equivalente inverso al atardecer civil. El cielo muestra colores (naranjas, rosados, violetas).
- **Uso en la app**: probablemente la opción más popular para "despertar con luz ya presente pero sin sol directo".

### 4. Salida del sol (sunrise)
- **Ángulo solar**: 0°, el borde superior del sol cruza el horizonte.
- **Luminosidad**: luz solar directa, el momento que coloquialmente se llama "amanecer".
- **Uso en la app**: opción por defecto / la más literal de "despertador al amanecer".

### (Contexto opcional) Golden hour
- Franja de aproximadamente 1 hora **después** de la salida del sol (y también antes del atardecer), con luz cálida y de ángulo bajo, muy usada en fotografía.
- No es un evento de "amanecer" en sí, pero puede mencionarse como referencia visual/estética para el diseño de la app (paleta de colores), ver [05-diseno-ux-ui.md](05-diseno-ux-ui.md).

## Duración aproximada

La duración de cada etapa varía según la latitud y la época del año (en latitudes altas y cerca de los equinoccios el proceso completo puede tardar bien más de una hora; cerca del ecuador es más corto y constante todo el año). Como referencia general en latitudes medias:
- Astronómico → náutico: ~20-30 minutos
- Náutico → civil: ~20-30 minutos
- Civil → salida del sol: ~20-30 minutos

Esto significa que, para un usuario en latitud media, elegir "crepúsculo civil" en vez de "salida del sol" puede implicar despertar entre 20 y 30 minutos antes, aproximadamente — pero la app siempre debe calcularlo de forma exacta con la ubicación y fecha real, no con este promedio.

## Mapeo con la funcionalidad de la app

En "Crear despertador" ([02-funcionalidades.md](02-funcionalidades.md)), el campo "tipo de amanecer" ofrece estas 4 opciones (astronómico, náutico, civil, salida del sol), cada una con su horario calculado día a día según la ubicación del usuario, sobre el cual luego se aplica el offset en minutos que el usuario configure.

## Las mismas etapas, en versión vespertina (atardecer)

Los mismos ángulos solares aplican de forma simétrica al final del día, en orden inverso: puesta del sol (0°) → crepúsculo civil vespertino (0° a -6°) → crepúsculo náutico vespertino (-6° a -12°) → crepúsculo astronómico vespertino (-12° a -18°, a partir de acá es noche cerrada).

Aunque la app no crea despertadores vespertinos, estos eventos son la base de las **notificaciones de estado del día** del módulo de notificaciones (ver [08-modulo-notificaciones.md](08-modulo-notificaciones.md)):
- "Comienza el atardecer" → inicio del crepúsculo civil vespertino
- "Anochece" → inicio del crepúsculo astronómico vespertino (última luz natural del día)
