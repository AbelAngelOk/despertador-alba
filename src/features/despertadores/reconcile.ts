import { dateKey, useTrackingStore } from '@/store/tracking';

import { useMicroActivityStore } from './microActivityStore';
import { useAlarmsStore } from './store';
import { resolveWakeResult } from './wakeResult';

const LOOKBACK_DAYS = 14;
const STALE_TEST_ALARM_MS = 60 * 60_000;

/**
 * Borra despertadores de prueba (testRingAt) que quedaron sin apagar hace más
 * de una hora, por ejemplo porque la app se cerró antes de que sonaran. En uso
 * normal se borran solos al apagarlos (ver alarma-sonando.tsx), esto es solo
 * la red de seguridad para que no se acumulen en la lista.
 */
export function reconcileTestAlarms(): void {
  const { alarms, removeAlarm } = useAlarmsStore.getState();
  const now = Date.now();

  for (const alarm of alarms) {
    if (!alarm.testRingAt) continue;
    if (now - new Date(alarm.testRingAt).getTime() < STALE_TEST_ALARM_MS) continue;
    removeAlarm(alarm.id);
  }
}

export function reconcileMissedDays(): void {
  const alarms = useAlarmsStore.getState().alarms;
  const { entries, markMissed } = useTrackingStore.getState();

  const keysToMarkMissed: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= LOOKBACK_DAYS; i++) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const key = dateKey(day);
    if (entries[key]) continue;

    const hadActiveAlarm = alarms.some(
      (alarm) => alarm.enabled && alarm.activeDays.includes(day.getDay())
    );
    if (hadActiveAlarm) keysToMarkMissed.push(key);
  }

  if (keysToMarkMissed.length > 0) markMissed(keysToMarkMissed);
}

/**
 * Resuelve microactividades PENDING cuyo deadline ya pasó mientras la app estaba
 * cerrada. Es el mismo enfoque retroactivo que reconcileMissedDays: no depende de
 * un timer en background, solo se corrige la próxima vez que se abre la app.
 */
export function reconcilePendingMicroActivities(): void {
  const { instances, expireInstance } = useMicroActivityStore.getState();
  const { logResult } = useTrackingStore.getState();
  const now = Date.now();

  for (const instance of Object.values(instances)) {
    if (instance.status !== 'pending') continue;
    if (new Date(instance.deadline).getTime() > now) continue;

    expireInstance(instance.key);
    const result = resolveWakeResult(instance.dismissStatus, 'expired');
    if (result) logResult(dateKey(new Date(instance.occurrenceIso)), result);
  }
}

/**
 * Si queda una microactividad PENDING vigente (deadline no vencido) al abrir la
 * app, devuelve su key para que la UI pueda retomar el flujo. Debe llamarse
 * después de reconcilePendingMicroActivities, que ya limpió las vencidas.
 */
export function findResumableMicroActivityKey(): string | null {
  const { instances } = useMicroActivityStore.getState();
  const now = Date.now();

  const pending = Object.values(instances).find(
    (instance) => instance.status === 'pending' && new Date(instance.deadline).getTime() > now
  );

  return pending?.key ?? null;
}
