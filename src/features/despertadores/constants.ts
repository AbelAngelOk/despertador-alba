import { AlarmSoundId, SunStageType } from '@/types/alarm';

export const DAYS_OF_WEEK: { jsDay: number; label: string; key: string }[] = [
  { jsDay: 1, label: 'L', key: 'lun' },
  { jsDay: 2, label: 'M', key: 'mar' },
  { jsDay: 3, label: 'M', key: 'mie' },
  { jsDay: 4, label: 'J', key: 'jue' },
  { jsDay: 5, label: 'V', key: 'vie' },
  { jsDay: 6, label: 'S', key: 'sab' },
  { jsDay: 0, label: 'D', key: 'dom' },
];

export const SUN_STAGES: { type: SunStageType; label: string; description: string }[] = [
  { type: 'astronomical', label: 'Amanecer astronómico', description: 'El cielo recién empieza a aclarar' },
  { type: 'nautical', label: 'Amanecer náutico', description: 'Ya se distingue el horizonte' },
  { type: 'civil', label: 'Amanecer civil', description: 'Hay luz de sobra para estar afuera' },
  { type: 'sunrise', label: 'Amanecer', description: 'El sol se asoma en el horizonte' },
];

export const SUN_STAGE_LABELS: Record<SunStageType, string> = SUN_STAGES.reduce(
  (acc, stage) => ({ ...acc, [stage.type]: stage.label }),
  {} as Record<SunStageType, string>
);

export const DEFAULT_ACTIVE_DAYS = [1, 2, 3, 4, 5];

// El catálogo de microactividades (default + personalizadas) vive en microActivityCatalogStore.ts,
// que es persistido y editable desde Perfil. Estas dos constantes son solo el fallback de
// visualización para instancias/alarmas viejas guardadas con el antiguo type: 'custom'.
export const CUSTOM_MICROACTIVITY_ICON = 'edit-3';
export const CUSTOM_MICROACTIVITY_LABEL = 'Actividad personalizada';
export const MAX_CUSTOM_MICROACTIVITY_LENGTH = 30;

export const DEFAULT_COMPLETION_WINDOW_MIN = 30;
export const MIN_COMPLETION_WINDOW_MIN = 5;
export const MAX_COMPLETION_WINDOW_MIN = 120;

export const DEFAULT_ALARM_SOUND: AlarmSoundId = 'cuenco_b';
export const CUSTOM_SOUND_ID: AlarmSoundId = 'custom';
export const CUSTOM_SOUND_LABEL = 'Mi sonido';

export const ALARM_SOUNDS: { id: AlarmSoundId; label: string; file: number }[] = [
  {
    id: 'cuenco_a',
    label: 'Cuenco tibetano A',
    file: require('../../../assets/sounds/cuenco_tibetano_a.mp3'),
  },
  {
    id: 'cuenco_b',
    label: 'Cuenco tibetano B',
    file: require('../../../assets/sounds/cuenco_tibetano_b.mp3'),
  },
  {
    id: 'cuenco_c',
    label: 'Cuenco tibetano C',
    file: require('../../../assets/sounds/cuenco_tibetano_c.mp3'),
  },
  {
    id: 'cuenco_d',
    label: 'Cuenco tibetano D',
    file: require('../../../assets/sounds/cuenco_tibetano_d.mp3'),
  },
];

export const ALARM_SOUND_LABELS: Record<AlarmSoundId, string> = {
  ...ALARM_SOUNDS.reduce(
    (acc, item) => ({ ...acc, [item.id]: item.label }),
    {} as Record<AlarmSoundId, string>
  ),
  [CUSTOM_SOUND_ID]: CUSTOM_SOUND_LABEL,
};
