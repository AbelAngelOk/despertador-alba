import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { MicroActivityEditorPanel } from '@/components/despertador/microactivity-editor-panel';
import { SkyScreen } from '@/components/sky/sky-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Spacing } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';
import { useMicroActivityCatalogStore } from '@/features/despertadores/microActivityCatalogStore';
import { useTheme } from '@/hooks/use-theme';

type FeatherIconName = keyof typeof Feather.glyphMap;

export default function MicroactividadesScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
    <SkyScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <ThemedText type="smallBold">Por defecto</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Desactivá las que no quieras ver al armar un despertador.
          </ThemedText>
          <View style={styles.list}>
            {defaults.map((def) => (
              <ThemedView key={def.id} type="surface" style={styles.row}>
                <Feather name={def.icon as FeatherIconName} size={18} color={theme.colors.textSecondary} />
                <ThemedText type="small" style={styles.rowLabel} numberOfLines={1}>
                  {def.label}
                </ThemedText>
                <Switch
                  value={def.enabled}
                  onValueChange={(next) => toggleDefinition(def.id, next)}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.onPrimary}
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
                  <ThemedView key={def.id} type="surface" style={styles.row}>
                    <Feather
                      name={def.icon as FeatherIconName}
                      size={18}
                      color={theme.colors.textSecondary}
                    />
                    <ThemedText type="small" style={styles.rowLabel} numberOfLines={1}>
                      {def.label}
                    </ThemedText>
                    <Pressable
                      hitSlop={8}
                      onPress={() => setEditingId(def.id)}
                      style={styles.rowAction}>
                      <Feather name="edit-2" size={16} color={theme.colors.textSecondary} />
                    </Pressable>
                    <Pressable
                      hitSlop={8}
                      onPress={() => handleDelete(def.id, def.label)}
                      style={styles.rowAction}>
                      <Feather name="trash-2" size={16} color={theme.colors.error} />
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
    </SkyScreen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
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
      borderRadius: theme.radius.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
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
}
