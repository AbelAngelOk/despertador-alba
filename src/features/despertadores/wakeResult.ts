import { SNOOZE_INTERVAL_MIN } from '@/lib/alarmNotifications';
import { DayStatus } from '@/store/tracking';

import { DismissStatus, MicroActivityInstanceStatus } from './microActivityStore';

export function resolveDismissStatus(elapsedMsSinceOccurrence: number): DismissStatus {
  return elapsedMsSinceOccurrence < SNOOZE_INTERVAL_MIN * 60_000 ? 'onTime' : 'late';
}

/**
 * Combina el estado de apagado de la alarma con el estado de la microactividad.
 * `null` significa "todavía no hay resultado" (microactividad pendiente).
 */
export function resolveWakeResult(
  dismissStatus: DismissStatus,
  microActivityStatus: MicroActivityInstanceStatus | 'notConfigured'
): DayStatus | null {
  if (microActivityStatus === 'notConfigured' || microActivityStatus === 'completed') {
    return dismissStatus;
  }
  if (microActivityStatus === 'expired') {
    return 'missed';
  }
  return null;
}
