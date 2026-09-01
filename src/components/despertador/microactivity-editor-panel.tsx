import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/primary-button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { MAX_CUSTOM_MICROACTIVITY_LENGTH } from '@/features/despertadores/constants';

import { IconPicker } from './icon-picker';

type FeatherIconName = keyof typeof Feather.glyphMap;

const DEFAULT_ICON: FeatherIconName = 'edit-3';

interface MicroActivityEditorPanelProps {
  initialLabel?: string;
  initialIcon?: string;
  onSave: (label: string, icon: string) => void;
  onCancel: () => void;
}

export function MicroActivityEditorPanel({
  initialLabel = '',
  initialIcon = DEFAULT_ICON,
  onSave,
  onCancel,
}: MicroActivityEditorPanelProps) {
  const [label, setLabel] = useState(initialLabel);
  const [icon, setIcon] = useState(initialIcon);
  const [pickerVisible, setPickerVisible] = useState(false);

  const trimmedLabel = label.trim();
  const canSave = trimmedLabel.length > 0;

  return (
    <View style={styles.panel}>
      <View style={styles.row}>
        <Pressable onPress={() => setPickerVisible(true)} style={styles.iconButton}>
          <Feather name={icon as FeatherIconName} size={20} color={Colors.text} />
        </Pressable>
        <TextInput
          value={label}
          onChangeText={setLabel}
          placeholder="Descripción de la actividad"
          placeholderTextColor={Colors.textSecondary}
          maxLength={MAX_CUSTOM_MICROACTIVITY_LENGTH}
          style={styles.input}
        />
      </View>

      <View style={styles.actions}>
        <View style={styles.actionButton}>
          <PrimaryButton variant="ghost" label="Cancelar" onPress={onCancel} />
        </View>
        <View style={styles.actionButton}>
          <PrimaryButton
            label="Guardar"
            disabled={!canSave}
            onPress={() => onSave(trimmedLabel, icon)}
          />
        </View>
      </View>

      <IconPicker
        visible={pickerVisible}
        value={icon}
        onSelect={setIcon}
        onClose={() => setPickerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
  },
});
