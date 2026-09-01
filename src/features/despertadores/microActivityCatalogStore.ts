import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { CUSTOM_MICROACTIVITY_ICON, CUSTOM_MICROACTIVITY_LABEL } from './constants';

export interface MicroActivityDefinition {
  id: string;
  label: string;
  icon: string;
  isDefault: boolean;
  enabled: boolean;
}

const DEFAULT_DEFINITIONS: MicroActivityDefinition[] = [
  { id: 'water', label: 'Tomar un vaso de agua', icon: 'droplet', isDefault: true, enabled: true },
  {
    id: 'sunlight',
    label: 'Ir a mirar el sol / luz natural',
    icon: 'sun',
    isDefault: true,
    enabled: true,
  },
  { id: 'breathing', label: 'Respiración breve', icon: 'wind', isDefault: true, enabled: true },
  { id: 'stretch', label: 'Estirarse 30 segundos', icon: 'move', isDefault: true, enabled: true },
  { id: 'walk', label: 'Caminar 1 minuto', icon: 'compass', isDefault: true, enabled: true },
];

// Iconos curados para actividades cotidianas/de bienestar — es la grilla que ve el usuario
// en el selector de ícono al crear o editar una microactividad personalizada.
export const MICRO_ACTIVITY_ICON_CHOICES: string[] = [
  'droplet',
  'sun',
  'wind',
  'move',
  'compass',
  'coffee',
  'book-open',
  'feather',
  'headphones',
  'music',
  'heart',
  'smile',
  'activity',
  'edit-3',
  'camera',
  'check-circle',
  'star',
  'cloud',
  'moon',
  'watch',
  'bell',
  'gift',
  'home',
  'user',
  'zap',
  'umbrella',
  'thermometer',
  'anchor',
  'target',
  'calendar',
];

interface MicroActivityCatalogState {
  definitions: MicroActivityDefinition[];
  addCustom: (label: string, icon: string) => MicroActivityDefinition;
  updateCustom: (id: string, updates: { label: string; icon: string }) => void;
  removeCustom: (id: string) => void;
  toggleDefinition: (id: string, enabled: boolean) => void;
}

export const useMicroActivityCatalogStore = create<MicroActivityCatalogState>()(
  persist(
    (set) => ({
      definitions: DEFAULT_DEFINITIONS,
      addCustom: (label, icon) => {
        const definition: MicroActivityDefinition = {
          id: `custom-${Date.now()}-${Math.round(Math.random() * 1000)}`,
          label,
          icon,
          isDefault: false,
          enabled: true,
        };
        set((state) => ({ definitions: [...state.definitions, definition] }));
        return definition;
      },
      updateCustom: (id, updates) => {
        set((state) => ({
          definitions: state.definitions.map((def) =>
            def.id === id && !def.isDefault ? { ...def, ...updates } : def
          ),
        }));
      },
      removeCustom: (id) => {
        set((state) => ({
          definitions: state.definitions.filter((def) => def.isDefault || def.id !== id),
        }));
      },
      toggleDefinition: (id, enabled) => {
        set((state) => ({
          definitions: state.definitions.map((def) => (def.id === id ? { ...def, enabled } : def)),
        }));
      },
    }),
    {
      name: 'despertador-microactivity-catalog',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/**
 * Resuelve label + ícono a mostrar para un `type` de microactividad guardado en una alarma o
 * instancia. Busca primero en el catálogo actual; si no aparece (se borró, o es un dato viejo
 * guardado con el antiguo `type: 'custom'` + `customLabel` libre) cae al label/ícono legacy.
 */
export function resolveMicroActivityDisplay(
  type: string,
  customLabel: string | undefined,
  definitions: MicroActivityDefinition[]
): { label: string; icon: string } {
  const definition = definitions.find((def) => def.id === type);
  if (definition) return { label: definition.label, icon: definition.icon };
  if (customLabel) return { label: customLabel, icon: CUSTOM_MICROACTIVITY_ICON };
  return { label: CUSTOM_MICROACTIVITY_LABEL, icon: CUSTOM_MICROACTIVITY_ICON };
}
