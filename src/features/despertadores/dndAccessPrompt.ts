import { useEffect, useRef, useState } from 'react';

import {
  configureAndroidChannel,
  ensureNotificationPermissions,
  getAlarmChannelBypassesDnd,
} from '@/lib/alarmNotifications';
import { isDndAccessRelevant, openDndAccessSettings } from '@/lib/dndAccess';
import { useDndAccessStore } from '@/store/dndAccess';

interface DndAccessPromptState {
  visible: boolean;
  /** true si el último intento de abrir Ajustes del sistema no funcionó (el popup queda abierto mostrando el camino manual). */
  openFailed: boolean;
  confirm: () => void;
  decline: () => void;
}

/**
 * Al abrir la app (Android real, una vez por sesión), si todavía no se
 * detectó el acceso a "No molestar" ni el usuario dijo explícitamente que no
 * quiere configurarlo, ofrece un diálogo (ver DndAccessPromptModal) que lleva
 * directo a esa pantalla de Ajustes del sistema. Si ya lo tiene, no interrumpe.
 */
export function useDndAccessPrompt(ready: boolean): DndAccessPromptState {
  const declined = useDndAccessStore((state) => state.declined);
  const setDeclined = useDndAccessStore((state) => state.setDeclined);
  const promptedRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [openFailed, setOpenFailed] = useState(false);

  useEffect(() => {
    if (!ready || promptedRef.current || declined || !isDndAccessRelevant()) return;
    promptedRef.current = true;

    (async () => {
      const permissionGranted = await ensureNotificationPermissions();
      if (!permissionGranted) return;

      await configureAndroidChannel();
      const bypassesDnd = await getAlarmChannelBypassesDnd();
      if (bypassesDnd !== false) return; // true (ya lo tiene) o null (no se pudo determinar): no interrumpir

      setVisible(true);
    })();
  }, [ready, declined]);

  function decline() {
    setVisible(false);
    setOpenFailed(false);
    setDeclined(true);
  }

  async function confirm() {
    // Primero abrir Ajustes y recién después cerrar el popup: si la apertura
    // falla, el usuario sigue viendo el diálogo con el camino manual.
    const opened = await openDndAccessSettings();
    setOpenFailed(!opened);
    if (opened) setVisible(false);
  }

  return { visible, openFailed, confirm, decline };
}
