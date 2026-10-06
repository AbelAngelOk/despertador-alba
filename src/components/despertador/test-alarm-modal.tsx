import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Spacing } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';
import { useTheme } from '@/hooks/use-theme';

interface TestAlarmModalProps {
  visible: boolean;
  onClose: () => void;
}

/** Confirmación temática (no Alert nativo) al crear un despertador de prueba. */
export function TestAlarmModal({ visible, onClose }: TestAlarmModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ThemedView type="surface" style={styles.card}>
          <View style={styles.iconCircle}>
            <Feather name="zap" size={22} color={theme.colors.primary} />
          </View>
          <ThemedText type="smallBold" style={styles.title}>
            Despertador de prueba
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Va a sonar en 1 minuto y se va a borrar sola al apagarla.
          </ThemedText>
          <PrimaryButton label="Entendido" onPress={onClose} style={styles.action} />
        </ThemedView>
      </View>
    </Modal>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.five,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    card: {
      width: '100%',
      maxWidth: 360,
      alignItems: 'center',
      borderRadius: theme.radius.large,
      padding: Spacing.four,
      gap: Spacing.two,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.one,
    },
    title: {
      fontSize: 18,
      lineHeight: 24,
    },
    action: {
      alignSelf: 'stretch',
      marginTop: Spacing.two,
    },
  });
}
