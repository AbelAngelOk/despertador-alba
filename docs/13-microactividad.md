# Microactividad

> Funcionalidad opcional por despertador: una pequeña tarea saludable que el usuario debe confirmar después de apagar la alarma para que ese despertar cuente en la racha ([Seguimiento](07-vistas-app.md)). Este documento registra las decisiones tomadas y cómo quedó implementada, como contraparte del análisis previo que las dejó abiertas.

## Idea central

Apagar la alarma y **cumplir el despertar** son, ahora, dos cosas distintas:

- **Despertar básico** (sin microactividad configurada): apagar la alarma = despertar cumplido. Comportamiento idéntico al que tenía la app antes de esta funcionalidad.
- **Despertar activo** (con microactividad configurada): apagar la alarma = despertar *iniciado*. Recién se cumple — y recién ahí se actualiza la racha — cuando el usuario confirma la microactividad dentro de una ventana de tiempo.

La racha ([`src/store/tracking.ts`](../src/store/tracking.ts)) **no cambió de forma**: sigue siendo `onTime | late | missed` por día, sin un cuarto estado. Lo único que cambió es *cuándo* se le escribe un resultado.

## Decisiones tomadas

El análisis previo a esta implementación dejó 8 preguntas de negocio abiertas. Se resolvieron así:

| # | Pregunta | Decisión |
|---|---|---|
| 1 | ¿La ventana de cumplimiento se mide desde que suena la alarma o desde que se apaga? | **Desde que se apaga** (`dismissedAt`). Coincide con el diagrama de flujo original: la microactividad se activa después de apagar. |
| 2 | ¿Ventana fija global o configurable por alarma? | **Configurable por alarma**, con default de 30 minutos. Rango permitido: 5–120 min. |
| 3 | ¿Qué pasa con la racha si la microactividad expira o nunca se completa? | Se loguea **`missed`**. Aunque el usuario apagó la alarma, el pedido fue explícito en que eso solo no alcanza — y agregar un cuarto estado hubiese complicado la racha, algo que se pidió evitar. |
| 4 | ¿Eliminar una alarma cancela su microactividad pendiente? | **Sí**, se marca `expired` sin loguear resultado — no tendría sentido dejar una tarea flotando de una alarma que ya no existe. |
| 5 | ¿Se corrige ahora la colisión de dos alarmas el mismo día en `tracking.entries`? | **No** — es un comportamiento preexistente (last-write-wins por día), no introducido por esta funcionalidad. Queda fuera de alcance, documentado como limitación conocida más abajo. |
| 6 | ¿Cómo se retoma una microactividad pendiente si se cerró la app? | Al abrir la app, si hay una instancia `pending` cuyo plazo no venció, **se navega automáticamente** a la pantalla de microactividad. No se agregó un banner adicional en Inicio/Despertadores (queda como mejora futura). |
| 7 | ¿Catálogo fijo o extensible de tipos de microactividad? | **Actualizado, ya no es fijo.** Arrancó como catálogo fijo de 5 (agua, luz solar, respiración, estiramiento, caminar). Ahora vive en un store persistido y editable (`microActivityCatalogStore.ts`): las 5 por defecto se pueden activar/desactivar desde Perfil, y el usuario puede crear, editar y borrar sus propias actividades (descripción + ícono elegido de una grilla) — quedan como entradas más del mismo catálogo, reutilizables en cualquier despertador. Ver detalle más abajo. |
| 8 | ¿La microactividad pendiente reenvía recordatorios (notificaciones) mientras espera? | **No, es pasiva.** El usuario la ve la próxima vez que abre la app. Evita reintroducir la complejidad de reintentos que ya tiene el sonido de la alarma ([09-riesgos-tecnicos.md](09-riesgos-tecnicos.md)). |

## Modelo de datos

**Catálogo** (nuevo, `src/features/despertadores/microActivityCatalogStore.ts`) — reemplaza la lista fija que antes vivía en `constants.ts`:

```
MicroActivityDefinition:
  id          // 'water' | 'sunlight' | 'breathing' | 'stretch' | 'walk' para las 5 por
              // defecto (estables, no cambian); 'custom-{timestamp}-{rand}' para las creadas
  label
  icon        // nombre de ícono Feather
  isDefault   // true = una de las 5 originales, no se puede borrar, solo activar/desactivar
  enabled     // solo aplica a isDefault: true — las custom siempre están "disponibles"
              // mientras existan (se borran, no se desactivan)
```

Persistido con `zustand/persist` igual que el resto de los stores. Se gestiona desde **Perfil → Microactividades** (`src/app/microactividades.tsx`): activar/desactivar las 5 por defecto, y crear/editar/eliminar las personalizadas — cada una con su propio ícono, elegido de una grilla tipo teclado (`src/components/despertador/icon-picker.tsx`, ~30 íconos curados).

**Configuración por alarma** (vive en la alarma recurrente, `src/types/alarm.ts`):

```
Alarm.microActivity?: {
  enabled: boolean
  type: string   // id de una MicroActivityDefinition del catálogo — antes era un union fijo
  completionWindowMinutes: number
  customLabel?: string   // legacy: alarmas guardadas antes de este cambio, no se escribe más
}
```

Campo opcional — una alarma sin este campo se comporta exactamente como antes de esta funcionalidad (despertar básico).

### Actividad personalizada

Cambió de "un campo de texto más dentro del selector de la alarma" a "una entrada real y reutilizable del catálogo". El selector (`src/components/despertador/microactivity-selector.tsx`) muestra hasta 6 filas visibles con scroll vertical propio para ver el resto, y al final una fila "Nueva actividad personalizada" que abre un mini-formulario (`microactivity-editor-panel.tsx`: descripción + ícono) — al guardar, la nueva entrada se agrega al catálogo global (no solo a esta alarma) y queda seleccionada. El mismo panel se reutiliza en Perfil para crear/editar.

Si una actividad personalizada se borra desde Perfil mientras una alarma la tiene seleccionada, esa alarma cae a un fallback genérico ("Actividad personalizada" + ícono lápiz) en vez de romperse — resuelto por `resolveMicroActivityDisplay()` en el mismo store, que también es la función que sostiene la compatibilidad con datos viejos: alarmas/instancias guardadas con el antiguo `type: 'custom'` + `customLabel` libre siguen mostrando su texto real aunque ya no exista ningún `type: 'custom'` en el catálogo actual.

**Instancia de ejecución** (nueva, `src/features/despertadores/microActivityStore.ts`) — esto es lo que antes **no existía en absoluto** en la app: ningún flujo persistía un estado "a mitad de camino" que sobreviva cerrar la app.

```
MicroActivityInstance:
  key                       // "{alarmId}::{occurrenceIso}" — misma clave compuesta
                             // que ya usaban las notificaciones y el ring watcher
  alarmId, alarmName
  occurrenceIso
  type, customLabel?, completionWindowMinutes   // copia (snapshot) del id de catálogo + ventana
                                   // al momento de crearse, no una referencia viva a la alarma
                                   // (customLabel solo se completa para datos legacy)
  dismissStatus: 'onTime' | 'late'
  status: 'pending' | 'completed' | 'expired'
  startedAt                 // = momento del apagado
  deadline                  // = startedAt + completionWindowMinutes
  completedAt?
```

El **snapshot** de `type`/`completionWindowMinutes` es deliberado: si el usuario edita la microactividad de la alarma mientras hay una instancia pendiente, esa instancia sigue las reglas con las que se creó — solo las próximas ocurrencias usan la config nueva. Es una excepción a la filosofía del resto del código (que siempre recalcula en vivo, nunca guarda snapshots), justificada porque es la primera vez que hace falta que algo sobreviva un reinicio de la app.

## Flujo implementado

```
Alarma suena → usuario apaga (alarma-sonando.tsx)
   ↓
¿alarm.microActivity?.enabled?
   │
   ├─ NO → resolveWakeResult(dismissStatus, 'notConfigured') → logResult (igual que antes)
   │
   └─ SÍ → startInstance(...) crea la instancia PENDING
           → navega a /microactividad (en vez de volver a los tabs)
                ↓
           usuario confirma → completeInstance
                → resolveWakeResult(dismissStatus, 'completed') → logResult
                ↓
           (o vence el plazo, en la pantalla o al reabrir la app)
                → expireInstance → resolveWakeResult(dismissStatus, 'expired') → logResult('missed')
```

`resolveWakeResult` ([`src/features/despertadores/wakeResult.ts`](../src/features/despertadores/wakeResult.ts)) es la función que combina ambos estados sin mezclarlos: `late` se decide únicamente por el tiempo de apagado, nunca por la microactividad; la microactividad solo decide *si* y *cuándo* se escribe un resultado.

## Dónde vencer el plazo si la app está cerrada

Igual que `reconcileMissedDays` (ya existía), se agregó `reconcilePendingMicroActivities` ([`src/features/despertadores/reconcile.ts`](../src/features/despertadores/reconcile.ts)): al abrir la app, resuelve retroactivamente cualquier instancia `pending` cuyo `deadline` ya pasó. No depende de ningún timer en segundo plano — hereda la misma limitación ya documentada en [09-riesgos-tecnicos.md](09-riesgos-tecnicos.md) para el sonido de la alarma: mientras la app está cerrada, nada se resuelve "en vivo", se corrige la próxima vez que se abre.

## Qué no se resolvió (a propósito)

- **Colisión de `tracking.entries` con dos alarmas el mismo día**: si dos despertadores activos caen el mismo día, el último `logResult` pisa al anterior — con microactividad esto se vuelve más notorio porque las resoluciones pueden llegar en momentos muy distintos entre sí (una se completa en 2 minutos, otra puede tardar 30+ en expirar). Es un comportamiento preexistente, no introducido acá — decisión #5 de la tabla de arriba.
- **Banner de "microactividad pendiente"** en Inicio/Despertadores: hoy la única forma de retomar el flujo es el redirect automático al abrir la app. Un banner persistente sería una mejora de UX, no implementada en esta pasada.
- **Recordatorios activos** mientras la microactividad está pendiente: decisión #8, queda pasiva.

## Archivos nuevos

- `src/features/despertadores/microActivityStore.ts` — persistencia de instancias.
- `src/features/despertadores/microActivityCatalogStore.ts` — persistencia del catálogo (default + personalizadas) y `resolveMicroActivityDisplay()`.
- `src/features/despertadores/wakeResult.ts` — resolución pura, testeable sin I/O.
- `src/components/despertador/microactivity-selector.tsx` — UI de configuración en el formulario de alarma (catálogo + lista con scroll capado a 6 filas + alta de personalizadas).
- `src/components/despertador/microactivity-editor-panel.tsx` — mini-formulario (descripción + ícono) reutilizado en el selector y en Perfil.
- `src/components/despertador/icon-picker.tsx` — grilla de íconos tipo teclado.
- `src/app/microactividades.tsx` — pantalla de Perfil para activar/desactivar defaults y gestionar personalizadas.
- `src/app/microactividad.tsx` — pantalla de confirmación.

## Archivos modificados

- `src/types/alarm.ts` — campo `microActivity?` en `Alarm`.
- `src/features/despertadores/constants.ts` — catálogo de tipos y límites de ventana.
- `src/features/despertadores/store.ts` — `removeAlarm` ahora expira microactividades pendientes de la alarma eliminada.
- `src/features/despertadores/reconcile.ts` — reconciliación de instancias vencidas + búsqueda de instancia retomable.
- `src/app/alarma-sonando.tsx` — `handleDismiss` bifurca entre despertar básico y activo.
- `src/app/_layout.tsx` — reconciliación + redirect de retomado al montar la app; nueva ruta registrada.
- `src/components/despertador/alarm-form.tsx`, `src/app/despertador/[id].tsx` — el campo nuevo se pasa explícitamente (ver nota de compatibilidad abajo).
- `src/components/despertador/alarm-card.tsx` — ícono indicador cuando la alarma tiene microactividad.

## Nota de compatibilidad

`src/app/despertador/[id].tsx` arma el `initialValue` del formulario como objeto literal en vez de spreadear la alarma completa — ya lo señalaba el análisis previo como el punto exacto donde un campo nuevo se puede perder silenciosamente al editar. Se agregó `microActivity: alarm.microActivity` explícitamente ahí. Si se agrega un campo nuevo a `Alarm` en el futuro, hay que recordar tocar ese mismo lugar.

Alarmas creadas antes de esta funcionalidad no tienen `microActivity` en su JSON persistido — `alarm.microActivity?.enabled` resuelve a `falsy` y siguen funcionando exactamente igual que antes (despertar básico), sin necesidad de migración.
