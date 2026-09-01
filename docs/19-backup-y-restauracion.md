# Backup y restauración

> Como la app no tiene cuenta ni backend ([17-sin-cuenta-y-notificaciones.md](17-sin-cuenta-y-notificaciones.md)), todos los datos viven solo en el dispositivo — sin esto, desinstalar la app o cambiar de teléfono significa perder despertadores, seguimiento e historial. Backup manual vía archivo es la forma más simple de cubrir ese caso sin construir cuenta ni sincronización.

## Qué hace

Desde Perfil → "Exportar backup" / "Importar backup" (`src/app/(tabs)/perfil.tsx`), implementado en `src/lib/backup.ts`.

- **Exportar**: junta el contenido crudo de todos los stores persistidos (`AsyncStorage`), arma un único JSON, lo escribe a un archivo temporal y abre el selector nativo para compartirlo/guardarlo (`expo-sharing`) — a Drive, al almacenamiento del dispositivo, por WhatsApp, donde el usuario elija.
- **Importar**: abre el selector de archivos nativo (`expo-document-picker`) filtrado a `.json`, valida que tenga la forma esperada, y sobrescribe cada store con lo que venga en el archivo. Pide confirmación antes de ejecutar (`Alert.alert`), porque reemplaza los datos actuales.

## Qué incluye

Todo lo persistido, store por store — el JSON exportado guarda el contenido crudo de cada clave de `AsyncStorage` bajo `data`:

| Clave | Contenido |
|---|---|
| `despertador-alarms` | Despertadores (tipo de amanecer, offset, días, sonido, microactividad) |
| `despertador-location` | Ubicación guardada |
| `despertador-settings` | Preferencias (hoy: switch de Clima) |
| `despertador-tracking` | Historial de Seguimiento (racha, días marcados) |
| `despertador-weather` | Último snapshot de clima cacheado |
| `despertador-microactivities` | Instancias de microactividad (pendientes/completadas/vencidas) |
| `despertador-microactivity-catalog` | Catálogo de microactividades: cuáles de las 5 por defecto están activadas + las personalizadas creadas (descripción, ícono) |
| `despertador-notification-prefs` | Qué notificaciones del día están activadas |

No hace falta mantener esta lista sincronizada a mano con cada store nuevo que se agregue: `STORES` en `backup.ts` es un array de `{ key, store }` — agregar un store ahí alcanza para que entre al backup.

## Formato del archivo

```json
{
  "version": 1,
  "exportedAt": "2026-08-20T10:00:00.000Z",
  "data": {
    "despertador-alarms": { "state": { "alarms": [...] }, "version": 0 },
    "despertador-location": { "state": { "latitude": -34.6, "longitude": -58.38, "label": null }, "version": 0 },
    ...
  }
}
```

Cada valor bajo `data` es exactamente lo que `zustand/persist` guarda para ese store (`{ state, version }`) — se copia tal cual, sin transformar, tanto al exportar como al importar.

## Por qué se sobrescribe cada store al importar (`persist.rehydrate()`)

Escribir directo en `AsyncStorage` no alcanza: los stores de Zustand ya están hidratados en memoria cuando la app está corriendo, así que un cambio en el storage no se refleja solo. Después de escribir cada clave, `backup.ts` llama a `store.persist.rehydrate()` sobre el store correspondiente, que fuerza una relectura desde `AsyncStorage` hacia el estado en memoria — así la UI se actualiza al toque, sin pedirle al usuario que reinicie la app.

## Validación

Al importar, si el archivo no tiene un campo `data` de tipo objeto, se rechaza con un error explícito antes de tocar nada — evita que un archivo cualquiera (o un backup corrupto) deje el storage en un estado a medio escribir.
