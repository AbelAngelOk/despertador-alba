# Cielo de fondo, tab Despertadores unificada y tipos de despertador

## Navegación actual (bottom bar)
Inicio · Despertadores · Seguimiento · Recursos.

- **Despertadores** agrupa lo que antes eran dos tabs: un switch segmentado en el header alterna entre la lista de despertadores y los avisos de Notificaciones (`src/app/(tabs)/despertadores.tsx`, panel en `src/components/notificaciones/notifications-panel.tsx`). Acepta `?vista=notificaciones` para abrir directo en esa vista.
- **Perfil** (Ajustes, Microactividades) se abre desde la tarjeta superior de Seguimiento.

## Cielo en vivo como identidad visual
El cielo de Inicio (gradiente según la altura del sol, estrellas, luna, sol, clima opcional) se extrajo a `SkyScene` (`src/components/sky/sky-scene.tsx`) y es el fondo de todas las pantallas:

- **Inicio**: el cielo a pleno (`SkyClock`).
- **Resto de pantallas**: `SkyScreen` (`src/components/sky/sky-screen.tsx`) pone el cielo detrás y un velo con el color `background` del template (50 % arriba, 78 % abajo). El velo mantiene legible el texto del template sobre cielos de día o de noche, y hace que cada template "tiña" el mismo cielo.
- Los headers del Stack son transparentes (`_layout.tsx`); `SkyScreen` usa `HeaderHeightContext` para correr el contenido debajo del header (en tabs y modales sin header vale 0).
- **Ajustes → Cielo en vivo de fondo** (default: activado) lo apaga y deja el fondo liso del template. Sin ubicación configurada también cae al fondo liso.
- La pantalla de alarma sonando ya tenía su propio cielo y no usa `SkyScreen`.

Regla para pantallas nuevas: el contenedor raíz es `<SkyScreen>` (con `edges={['top']}` si no tiene header), no un `SafeAreaView` con `backgroundColor`.

## Tipos de despertador
`Alarm.kind`: `'solar'` (default; ausente en alarmas viejas) o `'classic'` (hora fija en `classicTime`). `getAlarmTimeForDate` resuelve los tres casos en orden: `testRingAt` → clásico → solar.

Opciones en **Ajustes → Despertadores** (ambas desactivadas por defecto):
- **Despertador clásico**: el + despliega un menú Solar/Clásico. El clásico usa `@react-native-community/datetimepicker` (diálogo en Android, spinner en iOS).
- **Despertador de prueba**: agrega "Prueba rápida" al menú del + (suena en 1 minuto con valores por defecto) y "Probar en 1 minuto" al formulario. Suena una vez y se borra al apagarla (`reconcileTestAlarms` limpia las que quedaron colgadas).

Si ninguna opción está activa, el + va directo al despertador solar (comportamiento original). Desactivar una opción no borra los despertadores ya creados.
