import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import {
  DEFAULT_COMPLETION_WINDOW_MIN,
  MAX_COMPLETION_WINDOW_MIN,
  MIN_COMPLETION_WINDOW_MIN,
} from '@/features/despertadores/constants';
import { useMicroActivityCatalogStore } from '@/features/despertadores/microActivityCatalogStore';
import { MicroActivityConfig } from '@/types/alarm';

import { MicroActivityEditorPanel } from './microactivity-editor-panel';

type FeatherIconName = keyof typeof Feather.glyphMap;

const VISIBLE_ROWS = 6;
const ROW_HEIGHT = 52;
const LIST_MAX_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS + Spacing.two * (VISIBLE_ROWS - 1);

interface MicroActivitySelectorProps {
  value: MicroActivityConfig | undefined;
  onChange: (value: MicroActivityConfig) => void;
}

export function MicroActivitySelector({ value, onChange }: MicroActivitySelectorProps) {
  const definitions = useMicroActivityCatalogStore((state) => state.definitions);
  const addCustom = useMicroActivityCatalogStore((state) => state.addCustom);
  const [creating, setCreating] = useState(false);

  const enabled = value?.enabled ?? false;
  const type = value?.type ?? definitions[0]?.id ?? '';
  const windowMinutes = value?.completionWindowMinutes ?? DEFAULT_COMPLETION_WINDOW_MIN;

  // Siempre mostramos la opción activa aunque haya sido desactivada después desde Perfil,
  // para que un despertador ya configurado no se vea "sin nada" seleccionado.
  const visibleDefinitions = definitions.filter((def) => def.enabled || def.id === type);

  function toggle(next: boolean) {
    onChange({ enabled: next, type, completionWindowMinutes: windowMinutes });
  }

  function setType(nextType: string) {
    onChange({ enabled, type: nextType, completionWindowMinutes: windowMinutes });
  }

  function setWindow(nextWindow: number) {
    const clamped = Math.min(
      MAX_COMPLETION_WINDOW_MIN,
      Math.max(MIN_COMPLETION_WINDOW_MIN, nextWindow)
    );
    onChange({ enabled, type, completionWindowMinutes: clamped });
  }

  function handleCreate(label: string, icon: string) {
    const definition = addCustom(label, icon);
    setCreating(false);
    setType(definition.id);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <ThemedText type="smallBold">Microactividad</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Una tarea breve después de apagar la alarma, para que el despertar cuente en tu racha.
          </ThemedText>
        </View>
        <Switch
          value={enabled}
          onValueChange={toggle}
          trackColor={{ false: Colors.border, true: Colors.accent }}
          thumbColor={Colors.text}
        />
      </View>

      {enabled ? (
        <View style={styles.options}>
          <View style={styles.listBox}>
            <ScrollView
              nestedScrollEnabled
              showsVerticalScrollIndicator
              style={styles.list}
              contentContainerStyle={styles.listContent}>
              {visibleDefinitions.map((def) => {
                const active = def.id === type;
                return (
                  <Pressable
                    key={def.id}
                    onPress={() => setType(def.id)}
                    style={[styles.option, active && styles.optionActive]}>
                    <Feather
                      name={def.icon as FeatherIconName}
                      size={18}
                      color={active ? Colors.background : Colors.textSecondary}
                    />
                    <ThemedText
                      type="small"
                      themeColor={active ? undefined : 'textSecondary'}
                      style={active ? styles.optionLabelActive : undefined}
                      numberOfLines={1}>
                      {def.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {creating ? (
            <MicroActivityEditorPanel onSave={handleCreate} onCancel={() => setCreating(false)} />
          ) : (
            <Pressable onPress={() => setCreating(true)} style={[styles.option, styles.addOption]}>
              <Feather name="plus" size={18} color={Colors.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary">
                Nueva actividad personalizada
              </ThemedText>
            </Pressable>
          )}

          <View style={styles.windowRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Ventana para completarla
            </ThemedText>
            <View style={styles.windowStepper}>
              <Pressable style={styles.stepButton} onPress={() => setWindow(windowMinutes - 5)}>
                <ThemedText type="smallBold">−</ThemedText>
              </Pressable>
              <ThemedText type="smallBold">{windowMinutes} min</ThemedText>
              <Pressable style={styles.stepButton} onPress={() => setWindow(windowMinutes + 5)}>
                <ThemedText type="smallBold">+</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  options: {
    gap: Spacing.three,
  },
  listBox: {
    maxHeight: LIST_MAX_HEIGHT,
  },
  list: {
    maxHeight: LIST_MAX_HEIGHT,
  },
  listContent: {
    gap: Spacing.two,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    height: ROW_HEIGHT,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  optionLabelActive: {
    color: Colors.background,
  },
  addOption: {
    borderStyle: 'dashed',
  },
  windowRow: {
    marginTop: Spacing.two,
    alignItems: 'center',
    gap: Spacing.two,
  },
  windowStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
