export type SunStageType = 'astronomical' | 'nautical' | 'civil' | 'sunrise';

export type AlarmSoundId = 'cuenco_a' | 'cuenco_b' | 'cuenco_c' | 'cuenco_d' | 'custom';

/** Id de una definición del catálogo de microactividades (ver microActivityCatalogStore) — antes era un union fijo, ahora es abierto porque el catálogo admite actividades personalizadas. */
export type MicroActivityType = string;

export interface MicroActivityConfig {
  enabled: boolean;
  type: MicroActivityType;
  completionWindowMinutes: number;
  /** Legacy: descripción libre de alarmas guardadas antes de que las actividades personalizadas pasaran a ser entradas reutilizables del catálogo. Ya no se escribe, solo se lee como fallback. */
  customLabel?: string;
}

export interface Alarm {
  id: string;
  name: string;
  stage: SunStageType;
  offsetMinutes: number;
  activeDays: number[];
  enabled: boolean;
  createdAt: string;
  microActivity?: MicroActivityConfig;
  sound: AlarmSoundId;
}

export type AlarmInput = Omit<Alarm, 'id' | 'createdAt'>;
