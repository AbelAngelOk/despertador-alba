import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { MicroActivityEditorPanel } from '@/components/despertador/microactivity-editor-panel';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useMicroActivityCatalogStore } from '@/features/despertadores/microActivityCatalogStore';

type FeatherIconName = keyof typeof Feather.glyphMap;

export default function MicroactividadesScreen() {
  const definitions = useMicroActivityCatalogStore((state) => state.definitions);
  const toggleDefinition = useMicroActivityCatalogStore((state) => state.toggleDefinition);
  const addCustom = useMicroActivityCatalogStore((state) => state.addCustom);
  const updateCustom = useMicroActivityCatalogStore((state) => state.updateCustom);
  const removeCustom = useMicroActivityCatalogStore((state) => state.removeCustom);

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const defaults = definitions.filter((def) => def.isDefault);
  const customs = definitions.filter((def) => !def.isDefault);

  function handleDelete(id: string, label: string) {
    Alert.alert(
      'Eliminar microactividad',
      `¿Eliminar "${label}"? Los despertadores que la tenían seleccionada van a mostrar una actividad genérica.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => removeCustom(id) },
      ]
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <ThemedText type="smallBold">Por defecto</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Desactivá las que no quieras ver al armar un despertador.
        </ThemedText>
        <View style={styles.list}>
          {defaults.map((def) => (
            <ThemedView key={def.id} type="backgroundElement" style={styles.row}>
              <Feather name={def.icon as FeatherIconName} size={18} color={Colors.textSecondary} />
              <ThemedText type="small" style={styles.rowLabel} numberOfLines={1}>
                {def.label}
              </ThemedText>
              <Switch
                value={def.enabled}
                onValueChange={(next) => toggleDefinition(def.id, next)}
                trackColor={{ false: Colors.border, true: Colors.accent }}
                thumbColor={Colors.text}
              />
            </ThemedView>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold">Personalizadas</ThemedText>
        {customs.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            Todavía no creaste ninguna.
          </ThemedText>
        ) : (
          <View style={styles.list}>
            {customs.map((def) =>
              editingId === def.id ? (
                <MicroActivityEditorPanel
                  key={def.id}
                  initialLabel={def.label}
                  initialIcon={def.icon}
                  onSave={(label, icon) => {
                    updateCustom(def.id, { label, icon });
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <ThemedView key={def.id} type="backgroundElement" style={styles.row}>
                  <Feather
                    name={def.icon as FeatherIconName}
                    size={18}
                    color={Colors.textSecondary}
                  />
                  <ThemedText type="small" style={styles.rowLabel} numberOfLines={1}>
                    {def.label}
                  </ThemedText>
                  <Pressable
                    hitSlop={8}
                    onPress={() => setEditingId(def.id)}
                    style={styles.rowAction}>
                    <Feather name="edit-2" size={16} color={Colors.textSecondary} />
                  </Pressable>
                  <Pressable
                    hitSlop={8}
                    onPress={() => handleDelete(def.id, def.label)}
                    style={styles.rowAction}>
                    <Feather name="trash-2" size={16} color={Colors.danger} />
                  </Pressable>
                </ThemedView>
              )
            )}
          </View>
        )}

        {creating ? (
          <MicroActivityEditorPanel
            onSave={(label, icon) => {
              addCustom(label, icon);
              setCreating(false);
            }}
            onCancel={() => setCreating(false)}
          />
        ) : (
          <PrimaryButton
            variant="ghost"
            label="Nueva microactividad"
            onPress={() => setCreating(true)}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
  section: {
    gap: Spacing.two,
  },
  list: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowLabel: {
    flex: 1,
  },
  rowAction: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
