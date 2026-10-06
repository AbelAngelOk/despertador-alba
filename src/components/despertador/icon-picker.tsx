import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';
import { MICRO_ACTIVITY_ICON_CHOICES } from '@/features/despertadores/microActivityCatalogStore';
import { useTheme } from '@/hooks/use-theme';

type FeatherIconName = keyof typeof Feather.glyphMap;

interface IconPickerProps {
  visible: boolean;
  value: string;
  onSelect: (icon: string) => void;
  onClose: () => void;
}

export function IconPicker({ visible, value, onSelect, onClose }: IconPickerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
                  color={active ? theme.colors.onPrimary : theme.colors.textPrimary}
                />
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radius.large,
      borderTopRightRadius: theme.radius.large,
      paddingHorizontal: Spacing.four,
      paddingBottom: Spacing.four,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.border,
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
      borderRadius: theme.radius.medium,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cellActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
  });
}
