# Nombre de la app: Despertador Alba

> La app pasó a llamarse **Alba** primero, y después **Despertador Alba** — cambiado en `app.json` (`expo.name`), que es lo que define el nombre que se ve bajo el ícono en el dispositivo. `slug`, `scheme` y `android.package` (`com.abelangel1996.despertador`) quedaron sin tocar a propósito — cambiarlos trata a la app como una app distinta (se pierden datos locales de los que ya la tengan instalada, y hay que reconfigurar el proyecto en EAS si en algún momento se usa) y no hacía falta para lo que se pidió.

## Por qué "Despertador Alba" y no solo "Alba"

El buscador nativo del dispositivo (launcher de Android, Spotlight en iOS) para encontrar una app **ya instalada** solo indexa el nombre visible de la app — no lee `description`, ni ninguna otra palabra clave. "Alba" a secas solo aparecía buscando "Alba"; con "Despertador Alba" como nombre, buscar "despertador" en el propio dispositivo también la encuentra, sin depender de nada de la ficha de tienda (ver más abajo). "Reloj" y "amanecer" siguen sin cubrirse por esta vía — meterlas en el nombre visible ya sería demasiado largo para verse bien bajo el ícono.

## Descripción

Se agregó `expo.description` en `app.json`: *"Despertador circadiano: te despierta siguiendo el amanecer, no una hora fija."* — combina las dos variantes pedidas ("despertador circadiano" / "despertador siguiendo el amanecer") en una sola frase.

## Aparecer en búsquedas por "despertador", "reloj", "amanecer"

Esto tiene dos partes bien distintas, y solo una está resuelta desde el código:

**Resuelto**: el nombre visible del ícono ya es "Despertador Alba" — eso es lo único que Android/iOS indexan directamente desde la instalación de la app para la búsqueda del propio dispositivo (launcher / Spotlight-like search). Buscar "Alba" o "despertador" ya la encuentra.

**No resuelto desde acá — vive en Play Console / App Store Connect**: ni Android ni iOS buscan por texto que esté solamente en el código o en `app.json`. Para que buscar "despertador", "reloj" o "amanecer" en la Play Store devuelva esta app, esas palabras tienen que aparecer en la ficha de la tienda:

- **Google Play**: no existe un campo de "palabras clave" separado — el indexado sale de la **descripción corta** (80 caracteres) y la **descripción larga** de la ficha en Play Console. Recomendación concreta: descripción corta tipo *"Despertador que te levanta con el amanecer, no con una hora fija"*, y mencionar "reloj" y "amanecer" con naturalidad en la descripción larga.
- **App Store (iOS)**: sí existe un campo explícito de **Keywords** (100 caracteres, separadas por coma) en App Store Connect — ahí se puede poner literal `despertador,reloj,amanecer,circadiano,sueño`.

Ninguna de las dos cosas se configura en este repo todavía (no hay `eas.json` ni `store.config.json` — el proyecto nunca se preparó para publicar). Cuando llegue el momento de publicar, esto se completa a mano en cada consola, o vía `eas metadata` con un `store.config.json` si se quiere versionar esa ficha junto con el código.
