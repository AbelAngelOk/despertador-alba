import { DayStages } from '@/lib/sunTimes';

export type DayNotificationTrigger =
  | { kind: 'sunStage'; stage: keyof DayStages }
  | { kind: 'beforeAlarm'; hoursBefore: number };

export interface DayNotificationDefinition {
  id: string;
  title: string;
  body: string;
  trigger: DayNotificationTrigger;
}

export const DAY_NOTIFICATIONS: DayNotificationDefinition[] = [
  {
    id: 'astronomicalDawn',
    title: 'Empieza a clarear',
    body: 'Amanecer astronómico: el cielo recién empieza a aclarar.',
    trigger: { kind: 'sunStage', stage: 'astronomicalDawn' },
  },
  {
    id: 'nauticalDawn',
    title: 'Amanecer náutico',
    body: 'Ya se distingue el horizonte.',
    trigger: { kind: 'sunStage', stage: 'nauticalDawn' },
  },
  {
    id: 'civilDawn',
    title: 'Amanecer civil',
    body: 'Hay luz de sobra para estar afuera.',
    trigger: { kind: 'sunStage', stage: 'civilDawn' },
  },
  {
    id: 'sunrise',
    title: 'Salió el sol',
    body: 'Amanecer: el sol se asoma en el horizonte.',
    trigger: { kind: 'sunStage', stage: 'sunrise' },
  },
  {
    id: 'solarNoon',
    title: 'Es mediodía',
    body: 'El sol está en su punto más alto del día.',
    trigger: { kind: 'sunStage', stage: 'solarNoon' },
  },
  {
    id: 'sunset',
    title: 'Se puso el sol',
    body: 'Atardecer: el sol se esconde en el horizonte.',
    trigger: { kind: 'sunStage', stage: 'sunset' },
  },
  {
    id: 'civilDusk',
    title: 'Empieza el atardecer',
    body: 'Crepúsculo civil: la luz natural empieza a bajar.',
    trigger: { kind: 'sunStage', stage: 'civilDusk' },
  },
  {
    id: 'nauticalDusk',
    title: 'Sigue bajando la luz',
    body: 'Crepúsculo náutico.',
    trigger: { kind: 'sunStage', stage: 'nauticalDusk' },
  },
  {
    id: 'astronomicalDusk',
    title: 'Acaba de oscurecer',
    body: 'Crepúsculo astronómico: últimas señales de luz natural, se acerca la hora de dormir.',
    trigger: { kind: 'sunStage', stage: 'astronomicalDusk' },
  },
  {
    id: 'bedtimeNow',
    title: 'Hora de ir a dormir',
    body: 'Es el momento de acostarte para dormir tus 8hs completas antes del despertador.',
    trigger: { kind: 'beforeAlarm', hoursBefore: 8 },
  },
  {
    id: 'bedtimeSoon',
    title: 'En 1 hora es mejor ir a dormir',
    body: 'Así llegás a tus 8hs de sueño completas antes de que suene el despertador.',
    trigger: { kind: 'beforeAlarm', hoursBefore: 9 },
  },
];

export const DAY_NOTIFICATION_MAP: Record<string, DayNotificationDefinition> =
  DAY_NOTIFICATIONS.reduce((acc, def) => ({ ...acc, [def.id]: def }), {});
