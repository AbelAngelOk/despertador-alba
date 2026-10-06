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

/**
 * - solar:   suena en una etapa del amanecer (+ desfasaje), recalculada cada día.
 * - classic: suena a una hora fija (classicTime), como un despertador tradicional.
 */
export type AlarmKind = 'solar' | 'classic';

export interface ClassicTime {
  hour: number;
  minute: number;
}

export interface Alarm {
  id: string;
  /** Ausente en alarmas guardadas antes de existir los clásicos: se leen como 'solar'. */
  kind?: AlarmKind;
  /** Solo para kind === 'classic'. */
  classicTime?: ClassicTime;
  name: string;
  stage: SunStageType;
  offsetMinutes: number;
  activeDays: number[];
  enabled: boolean;
  createdAt: string;
  microActivity?: MicroActivityConfig;
  sound: AlarmSoundId;
  /**
   * Presente solo en despertadores de prueba creados desde "Probar en 1 minuto".
   * Cuando está seteado, reemplaza el cálculo por horario solar: la alarma suena
   * una única vez en ese instante y se borra sola al apagarla (ver reconcile.ts
   * y alarma-sonando.tsx).
   */
  testRingAt?: string;
  /**
   * Presente cuando el usuario eligió "Sonar de nuevo" al apagar la alarma
   * (5 minutos, o la hora de la próxima etapa del amanecer). Tiene prioridad
   * sobre el cálculo normal (incluso sobre testRingAt) hasta que suena y se
   * apaga o se pospone de nuevo — ver schedule.ts.
   */
  postponedUntil?: string;
}

export type AlarmInput = Omit<Alarm, 'id' | 'createdAt'>;
