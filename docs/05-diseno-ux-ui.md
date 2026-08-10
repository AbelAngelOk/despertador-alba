# Diseño UX/UI

## Dirección visual

Estética oscura, cálida y "amigable como el crepúsculo": la app debe sentirse como mirar el cielo un rato antes de dormir o un rato antes de amanecer, no como una herramienta fría de productividad.

### Paleta de colores (propuesta)

- **Fondo base**: azul-violeta muy oscuro, casi negro, con un leve tinte azulado (tipo cielo nocturno profundo) — no negro puro, para que se sienta "cielo" y no "apagado".
- **Superficies / tarjetas**: un tono de azul-violeta un escalón más claro que el fondo, para dar profundidad sin romper la atmósfera oscura.
- **Acento primario**: degradé cálido naranja-dorado-rosado (el color del sol asomando), usado para el estado "activo" de una alarma, botones principales y el indicador de progreso hacia el amanecer.
- **Acento secundario**: violeta/lavanda suave, para elementos informativos y las notificaciones de consejos (para diferenciarlas visualmente del acento principal de alarma).
- **Texto**: blanco cálido (no blanco puro) para el texto principal, gris azulado claro para texto secundario — evita el contraste duro típico de dark mode genérico.

### Principios visuales
- Transiciones y fondos con **degradados suaves tipo cielo** (de azul oscuro a violeta a naranja) en vez de bloques de color planos, reforzando la temática todo el tiempo.
- Evitar iconografía genérica de "reloj despertador"; preferir iconografía de sol/horizonte/curva de luz.
- Animaciones sutiles y lentas (nada abrupto), consistente con el concepto de "despertar gradual" del producto.

## Distribución de pantallas (views)

> Este apartado da la idea general. El detalle completo de la bottom bar, cada vista y sus elementos de UI está en [07-vistas-app.md](07-vistas-app.md).

### 1. Home / Lista de despertadores
- Elemento dominante: la **próxima alarma activa**, mostrada en grande arriba, con countdown hacia el amanecer configurado y un mini-degradado que representa visualmente en qué etapa de luz se despertará (crepúsculo civil, salida del sol, etc.)
- Debajo, lista de despertadores existentes (nombre, tipo de amanecer + offset, días activos, switch on/off)
- Botón flotante prominente para crear un nuevo despertador
- Jerarquía clara: la próxima alarma activa siempre debe ser lo primero que se ve, sin scroll

### 2. Crear / Editar despertador
- Flujo simple, pocos pasos, todo en una sola pantalla si es posible (evitar wizard de múltiples pantallas):
  1. Selector de tipo de amanecer (4 opciones visuales, ver [04-etapas-del-dia.md](04-etapas-del-dia.md)), representado como puntos sobre una curva de luz día/noche
  2. Slider u input de offset en minutos (antes/después), con preview en vivo de la hora estimada resultante para hoy
  3. Selector de días activos (L-D)
  4. Nombre del despertador (opcional)
  5. Toggle de notificación de advertencia asociada (ver pantalla 3)
- Preview textual siempre visible: "Hoy sonaría aprox. a las 6:28" (aclarando que se recalcula cada día)

### 3. Notificaciones (advertencia + consejos)
- Sección "Advertencia de sueño": configurar cuántas horas antes de la alarma avisar, y si hay más de un aviso escalonado
- Sección "Consejos de higiene del sueño": catálogo de tips (cafeína, luz azul, exposición solar matutina, etc. — ver [02-funcionalidades.md](02-funcionalidades.md)) con switch individual y horario configurable por tip
- Visualmente diferenciada de la sección de alarmas con el acento violeta/lavanda, para que se perciba como contenido "informativo" y no como otra alarma

### 4. Pantalla de alarma sonando
- Pantalla a pantalla completa con el degradado de cielo correspondiente al tipo de amanecer configurado, animando lentamente de oscuro a claro/cálido a medida que pasan los segundos (simulando el amanecer real, independientemente de si hay luz solar real disponible en ese momento)
- Acciones grandes y simples: apagar / posponer
- Mensaje corto contextual (ej. "El sol ya está saliendo")

### 5. Ajustes generales
- Ubicación (automática por GPS o manual)
- Unidad de hora (12h/24h)
- Permisos de notificaciones
- Acerca de / información sobre ritmo circadiano (enlace conceptual a los documentos [03-ritmo-circadiano.md](03-ritmo-circadiano.md) y [04-etapas-del-dia.md](04-etapas-del-dia.md), como contenido "Aprendé más" dentro de la app)

## Principios de UX específicos de un despertador

- **Mínima fricción para crear una alarma**: no debe sentirse más complicado que un despertador tradicional a pesar de tener más conceptos nuevos (tipo de amanecer, offset). Usar valores por defecto sensatos (ej. "salida del sol", offset 0) para que crear la primera alarma sea de 2 toques.
- **Confianza en el recálculo automático**: como el horario cambia todos los días, la UI debe comunicar constantemente "esto se ajusta solo" para que el usuario no sienta que perdió el control (ej. mostrar siempre la hora estimada de hoy, no solo la regla configurada).
- **Feedback del estado del cielo**: usar el degradado de color como lenguaje visual consistente en toda la app para comunicar "qué tan de noche o de día" es cada elemento (alarma, countdown, pantalla de alarma sonando).
