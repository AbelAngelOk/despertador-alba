import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { MICRO_ACTIVITY_ICON_CHOICES } from '@/features/despertadores/microActivityCatalogStore';

type FeatherIconName = keyof typeof Feather.glyphMap;

interface IconPickerProps {
  visible: boolean;
  value: string;
  onSelect: (icon: string) => void;
  onClose: () => void;
}

export function IconPicker({ visible, value, onSelect, onClose }: IconPickerProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <SafeAreaView style={styles.sheet} edges={['bottom']}>
        <View style={styles.handle} />
        <ThemedText type="smallBold" style={styles.title}>
          Elegí un ícono
        </ThemedText>
        <View style={styles.grid}>
          {MICRO_ACTIVITY_ICON_CHOICES.map((icon) => {
            const active = icon === value;
            return (
              <Pressable
                key={icon}
                onPress={() => {
                  onSelect(icon);
                  onClose();
                }}
                style={[styles.cell, active && styles.cellActive]}>
                <Feather
                  name={icon as FeatherIconName}
                  size={22}
                  color={active ? Colors.background : Colors.text}
                />
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: Colors.backgroundElement,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.border,
    marginTop: Spacing.two,
  },
  title: {
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  cell: {
    width: 48,
    height: 48,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cellActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
});
