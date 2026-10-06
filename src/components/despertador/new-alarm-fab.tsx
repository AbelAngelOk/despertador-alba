import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';
import { createDefaultAlarmInput } from '@/features/despertadores/constants';
import { useAlarmsStore } from '@/features/despertadores/store';
import { useTheme } from '@/hooks/use-theme';
import { useSettingsStore } from '@/store/settings';

import { TestAlarmModal } from './test-alarm-modal';

type FeatherIconName = keyof typeof Feather.glyphMap;

interface FabOption {
  key: string;
  icon: FeatherIconName;
  title: string;
  description: string;
  onPress: () => void;
}

/**
 * "+" de la lista de despertadores. Sin opciones extra habilitadas en Ajustes
 * va directo al despertador solar (el comportamiento de siempre); con el
 * clásico o la prueba de 1 minuto habilitados, despliega un menú para elegir.
 * Debe renderizarse como último hijo de la pantalla para quedar por encima.
 */
export function NewAlarmFab() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const classicEnabled = useSettingsStore((state) => state.classicAlarmsEnabled);
  const testEnabled = useSettingsStore((state) => state.testAlarmEnabled);
  const addTestAlarm = useAlarmsStore((state) => state.addTestAlarm);
  const [open, setOpen] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);

  function choose(action: () => void) {
    setOpen(false);
    action();
  }

  const options: FabOption[] = [
    {
      key: 'solar',
      icon: 'sunrise',
      title: 'Despertador solar',
      description: 'Sigue al amanecer de cada día',
      onPress: () => router.push('/despertador/nuevo'),
    },
  ];
  if (classicEnabled) {
    options.push({
      key: 'classic',
      icon: 'clock',
      title: 'Despertador clásico',
      description: 'Suena siempre a la misma hora',
      onPress: () => router.push({ pathname: '/despertador/nuevo', params: { tipo: 'clasico' } }),
    });
  }
  if (testEnabled) {
    options.push({
      key: 'test',
      icon: 'zap',
      title: 'Prueba rápida',
      description: 'Suena en 1 minuto y se borra sola',
      onPress: () => {
        addTestAlarm({ ...createDefaultAlarmInput(), name: 'Prueba' });
        setTestModalVisible(true);
      },
    });
  }

  function handleFabPress() {
    if (options.length === 1) {
      options[0].onPress();
      return;
    }
    setOpen((value) => !value);
  }

  return (
    <>
      {open ? (
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(false)}
          accessibilityLabel="Cerrar menú"
        />
      ) : null}

      {open ? (
        <View style={styles.menu}>
          {options.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => choose(option.onPress)}
              style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
              <View style={styles.optionIcon}>
                <Feather name={option.icon} size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.optionText}>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {option.title}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                  {option.description}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
        onPress={handleFabPress}
        accessibilityLabel={open ? 'Cerrar menú' : 'Nuevo despertador'}>
        <Feather name={open ? 'x' : 'plus'} size={28} color={theme.colors.onPrimary} />
      </Pressable>

      <TestAlarmModal visible={testModalVisible} onClose={() => setTestModalVisible(false)} />
    </>
  );
}

const FAB_SIZE = 56;

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    backdrop: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    menu: {
      position: 'absolute',
      right: Spacing.four,
      bottom: Spacing.five + FAB_SIZE + Spacing.three,
      gap: Spacing.two,
      alignItems: 'stretch',
      minWidth: 260,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.three,
      borderRadius: theme.radius.large,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...(theme.cardShadow ?? {}),
    },
    optionIcon: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionText: {
      flexShrink: 1,
      gap: Spacing.half,
    },
    fab: {
      position: 'absolute',
      right: Spacing.four,
      bottom: Spacing.five,
      width: FAB_SIZE,
      height: FAB_SIZE,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...(theme.cardShadow ?? {}),
    },
    pressed: {
      opacity: 0.8,
    },
  });
}
