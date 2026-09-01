# Widget de Android — Reloj de cielo

> Widget de pantalla de inicio que muestra el cielo actual y la próxima alarma. Implementado con [`react-native-android-widget`](https://saleksovski.github.io/react-native-android-widget/), no está disponible en Expo Go — requiere un build nativo (dev client o standalone), igual que las notificaciones ([09-riesgos-tecnicos.md](09-riesgos-tecnicos.md)).

## Qué muestra

- Fase del cielo actual + grados (ej. "Crepúsculo civil · 4°"), calculado con las mismas funciones que usa la vista Inicio (`src/lib/sunPosition.ts`, `src/lib/skyGradient.ts`).
- Próxima alarma (hora + countdown), o "Sin alarmas activas" si no hay ninguna.
- Tocar el widget abre la app.

## Por qué el fondo no es un degradado real

Los widgets de Android (RemoteViews) no soportan fondos con gradiente. Se aproxima apilando 10 franjas de color sólido interpoladas entre el color de arriba y abajo del cielo actual (`bandColors` en `src/widgets/sky-clock-widget.tsx`) — se ve como un degradado a simple vista, sin depender de renderizar una imagen.

## Frecuencia de actualización

- El sistema operativo lo actualiza como piso cada 30 minutos (`updatePeriodMillis` en `app.json`, ese valor es el mínimo que permite Android, no se puede bajar).
- Mientras la app está abierta, además se reenvía el contenido cada vez que cambian las alarmas o la ubicación, y cada 15 minutos (`src/widgets/useSyncSkyWidget.tsx`) para que se sienta más al día.
- No hay forma de tenerlo "en vivo" segundo a segundo — esa sería la limitación central de un live wallpaper real, que es una pieza de desarrollo nativo completamente aparte (ver la conversación de diseño de esta funcionalidad).

## Cómo funciona técnicamente

- **Entry point** (`index.ts`, raíz del proyecto): reemplaza al `expo-router/entry` por defecto (`package.json` → `"main": "index.ts"`) para poder registrar el manejador del widget (`registerWidgetTaskHandler`) antes de levantar la app.
- **`src/widgets/widgetData.ts`**: calcula los datos del widget (cielo + próxima alarma) leyendo los stores directamente con `.getState()` — importante: espera a que terminen de hidratarse desde `AsyncStorage` (`persist.rehydrate()`) porque una actualización de widget puede correr en un motor de JS recién arrancado, sin que la app esté abierta.
- **`src/widgets/sky-clock-widget.tsx`**: el componente visual, usando únicamente los primitivos que soporta la librería (`FlexWidget`, `OverlapWidget`, `TextWidget` — no `View`/`Text` normales de React Native).
- **`src/widgets/widget-task-handler.tsx`**: conecta las acciones del sistema (agregado, actualización periódica, resize) con el render del widget.
- **`src/features/despertadores/schedule.ts`**: se extrajo `getNextAlarmOccurrence` como función pura (sin hooks) a partir de `useNextAlarm`, para poder reusar exactamente la misma lógica de "próxima alarma" tanto en la app como en el widget.

## Por qué está guardado detrás del mismo chequeo de Expo Go

`react-native-android-widget` es un módulo nativo — no existe en Expo Go, igual que `expo-notifications`. El proyecto ya tenía este problema resuelto para notificaciones (ver [09-riesgos-tecnicos.md](09-riesgos-tecnicos.md)): nunca se importa la librería si `Constants.appOwnership === 'expo'`. El widget sigue exactamente el mismo patrón, tanto en `index.ts` como en `useSyncSkyWidget.tsx`.

## Cómo agregarlo al inicio

Por ahora es manual: mantener presionado en la pantalla de inicio de Android → Widgets → "despertador" → "Reloj de cielo". No se agregó un botón de "agregar widget" con `requestPinWidget` en esta pasada (la API existe en la librería pero no se verificó su firma exacta con la confianza suficiente antes de invertir otro ciclo de build de ~10 minutos) — queda como mejora posible.

## Compilar

El widget solo existe una vez que se regenera el proyecto nativo:

```
npx expo prebuild --platform android --clean
cd android && ./gradlew.bat assembleDebug
```

APK resultante en `android/app/build/outputs/apk/debug/app-debug.apk`.
