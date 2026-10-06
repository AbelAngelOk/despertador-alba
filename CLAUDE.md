@AGENTS.md

# Despertador Alba

App mobile (Android primero) de despertador anclado al amanecer real de la ubicación del usuario. 100 % local: sin login ni backend propio ([docs/17](docs/17-sin-cuenta-y-notificaciones.md)).

Stack: Expo SDK 57 · React Native 0.86 · React 19 (React Compiler activo) · expo-router 57 (typed routes) · zustand + AsyncStorage · TypeScript.

## Documentación
No leer `docs/` entero: empezar por [docs/00-indice.md](docs/00-indice.md) y abrir solo el documento que aplique. Al terminar un cambio de producto relevante, actualizar el doc correspondiente (o agregar uno numerado y sumarlo al índice).

## Comandos
- Verificar antes de dar algo por terminado: `npx tsc --noEmit` y `npx expo lint` (ambos deben quedar limpios).
- Dependencias: `npx expo install <pkg>` (nunca `npm install` directo para paquetes de Expo/RN). `npx expo-doctor@latest` para chequear versiones.
- Dev: `npx expo start`. Expo Go no soporta notificaciones programadas ni el widget: se protegen con `isExpoGo` (ver `src/lib/alarmNotifications.ts`).

## Reglas del proyecto
- **Preguntar siempre antes de lanzar un build de EAS** (local o en la nube), aunque parezca el paso obvio.
- Confirmar antes de escribir en cuentas/servicios remotos del usuario (API de links, EAS env, dashboards).
- APK: `eas build -p android --profile preview` en la nube. El build release local de Gradle falla porque el proyecto vive en una carpeta de OneDrive (ninja "manifest still dirty").
- Secretos: `.env.local` está gitignoreado y **no se sube a EAS**. Toda `EXPO_PUBLIC_*` que necesite el build va también como env var de EAS (entorno `preview`), y se lee como `process.env.EXPO_PUBLIC_X` directo (se inlinea en el bundle).
- Archivos `.env`: escribirlos en UTF-8 **sin BOM** (el `Set-Content` de PowerShell agrega BOM y rompe el parseo de la primera línea).

## Mapa del código (`src/`)
- `app/` — rutas. Tabs: `index` (Inicio, cielo a pleno), `despertadores` (switch Despertadores/Notificaciones), `seguimiento` (+ acceso a `perfil` → `ajustes`, `microactividades`), `recursos` (libro recomendado). Modales: `alarma-sonando`, `microactividad`.
- `features/despertadores/` — store de alarmas, `schedule.ts` (cálculo de la próxima ocurrencia: prueba → clásico → solar), `ringing.ts` (programación y detección), `reconcile.ts`.
- `components/sky/` — `SkyScene` (el cielo) y `SkyScreen` (contenedor de pantalla con el cielo de fondo).
- `constants/themes/` — 4 templates visuales con tokens (`AppTheme`); `store/theme.ts` guarda el elegido.
- `lib/` — cálculos solares/lunares, notificaciones, sonido, backup, `booksApi.ts` (API de links referidos con read API key).
- `store/` — stores persistidos (zustand + AsyncStorage). `settings.ts` tiene los toggles de Ajustes.

`modules/alarm-engine/` — módulo nativo local (Kotlin) que hace sonar la alarma con la app cerrada; se importa como `@modules/alarm-engine` y vale `null` en iOS/Expo Go ([docs/22](docs/22-alarma-en-segundo-plano.md)). Para validar Kotlin sin build completo: `cd android; ./gradlew :alarm-engine:compileReleaseKotlin` (requiere `android/` generado con `npx expo prebuild`).

## Convenciones
- Textos de UI y comentarios en español rioplatense (vos: "tocá", "elegí").
- Estilos con tokens del template: `const theme = useTheme(); const styles = useMemo(() => createStyles(theme), [theme]);`. Nada de colores hardcodeados salvo sobre el cielo (texto claro fijo).
- Pantallas nuevas: contenedor raíz `<SkyScreen>` (headers del Stack son transparentes), no `SafeAreaView` con `backgroundColor`.
- Stores persistidos: los campos nuevos necesitan default en el estado inicial (persist hace merge superficial); campos opcionales en `Alarm` para no romper datos guardados.
- Lint del React Compiler: nada de leer refs ni llamadas impuras en render (usar `useState(() => ...)`); el patrón fetch-en-efecto lleva `// eslint-disable-next-line react-hooks/set-state-in-effect` con una línea que lo justifique.
