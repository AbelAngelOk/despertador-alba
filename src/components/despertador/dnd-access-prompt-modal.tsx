import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Spacing } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';
import { useTheme } from '@/hooks/use-theme';

interface DndAccessPromptModalProps {
  visible: boolean;
  /** El último intento de abrir Ajustes del sistema falló: se muestra el camino manual. */
  openFailed: boolean;
  onConfigure: () => void;
  onDecline: () => void;
}

/** Diálogo temático (no Alert nativo) que ofrece configurar el acceso a "No molestar" al abrir la app. */
export function DndAccessPromptModal({
  visible,
  openFailed,
  onConfigure,
  onDecline,
}: DndAccessPromptModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDecline}>
      <View style={styles.backdrop}>
        <ThemedView type="surface" style={styles.card}>
          <ThemedText type="smallBold" style={styles.title}>
            Alarma con volumen dedicado
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Para que la alarma suene incluso con el modo No molestar activado, Alba necesita el
            acceso especial a &quot;No molestar&quot; de Android. Podés configurarlo ahora o más
            tarde desde Ajustes.
          </ThemedText>

          {openFailed ? (
            <View style={styles.warningRow}>
              <Feather name="alert-triangle" size={16} color={theme.colors.warning} />
              <ThemedText type="small" themeColor="textSecondary" style={styles.warningText}>
                No pudimos abrir la pantalla automáticamente. Andá a Ajustes de Android → Apps →
                Acceso especial → No molestar y activá Alba.
              </ThemedText>
            </View>
          ) : null}

          {/* Apilados a ancho completo: "Prefiero no hacerlo" no entra en media fila. */}
          <View style={styles.actions}>
            <PrimaryButton label="Configurar" onPress={onConfigure} />
            <PrimaryButton variant="ghost" label="Prefiero no hacerlo" onPress={onDecline} />
          </View>
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
      borderRadius: theme.radius.large,
      padding: Spacing.four,
      gap: Spacing.three,
    },
    title: {
      fontSize: 18,
      lineHeight: 24,
    },
    warningRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.two,
    },
    warningText: {
      flex: 1,
    },
    actions: {
      gap: Spacing.two,
      marginTop: Spacing.one,
    },
  });
}
