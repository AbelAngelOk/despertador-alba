import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';
import { useTheme } from '@/hooks/use-theme';

type FeatherIconName = keyof typeof Feather.glyphMap;

interface NavCardProps {
  icon: FeatherIconName;
  title: string;
  description?: string;
  onPress: () => void;
}

/** Tarjeta de navegación: ícono + título/descripción + flecha, para menús como Perfil o el enlace desde Seguimiento. */
export function NavCard({ icon, title, description, onPress }: NavCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable onPress={onPress}>
      <ThemedView type="surface" style={styles.card}>
        <View style={styles.iconCircle}>
          <Feather name={icon} size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.textGroup}>
          <ThemedText type="smallBold">{title}</ThemedText>
          {description ? (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
              {description}
            </ThemedText>
          ) : null}
        </View>
        <Feather name="chevron-right" size={20} color={theme.colors.textSecondary} />
      </ThemedView>
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      borderRadius: theme.radius.large,
      padding: Spacing.four,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textGroup: {
      flex: 1,
      gap: Spacing.half,
    },
  });
}
