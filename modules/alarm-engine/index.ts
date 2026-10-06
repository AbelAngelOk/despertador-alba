import { NativeModule, requireOptionalNativeModule } from 'expo';

export interface RingingAlarm {
  alarmId: string;
  occurrenceIso: string;
}

type AlarmEngineEvents = {
  /** La alarma empezó a sonar (solo llega si el JS está vivo en ese momento). */
  onRing: (event: RingingAlarm) => void;
};

declare class AlarmEngineNativeModule extends NativeModule<AlarmEngineEvents> {
  scheduleAlarm(
    id: string,
    triggerAtMs: number,
    title: string,
    body: string,
    soundUri: string | null,
    alarmId: string,
    occurrenceIso: string
  ): void;
  cancelAll(): void;
  getRingingAlarm(): RingingAlarm | null;
  stopRinging(): void;
  canScheduleExactAlarms(): boolean;
  canUseFullScreenIntent(): boolean;
}

/**
 * Motor nativo de alarmas (solo Android, solo en builds nativos: en Expo Go
 * y en iOS vale null y la app cae a las notificaciones programadas de
 * expo-notifications). Ver docs/22-alarma-en-segundo-plano.md.
 */
export const AlarmEngine = requireOptionalNativeModule<AlarmEngineNativeModule>('AlarmEngine');
