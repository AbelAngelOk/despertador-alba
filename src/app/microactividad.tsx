import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SkyScreen } from '@/components/sky/sky-screen';
import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Spacing } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';
import {
  resolveMicroActivityDisplay,
  useMicroActivityCatalogStore,
} from '@/features/despertadores/microActivityCatalogStore';
import { useMicroActivityStore } from '@/features/despertadores/microActivityStore';
import { resolveWakeResult } from '@/features/despertadores/wakeResult';
import { useTheme } from '@/hooks/use-theme';
import { formatCountdown } from '@/lib/format';
import { dateKey, useTrackingStore } from '@/store/tracking';

type FeatherIconName = keyof typeof Feather.glyphMap;

export default function MicroActividadScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { key } = useLocalSearchParams<{ key: string }>();
  const instance = useMicroActivityStore((state) => (key ? state.instances[key] : undefined));
  const completeInstance = useMicroActivityStore((state) => state.completeInstance);
  const expireInstance = useMicroActivityStore((state) => state.expireInstance);
  const definitions = useMicroActivityCatalogStore((state) => state.definitions);
  const logResult = useTrackingStore((state) => state.logResult);
  const confirmedRef = useRef(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(interval);
  }, []);

  const deadline = instance ? new Date(instance.deadline) : null;
  const isExpiredByTime = deadline ? now.getTime() >= deadline.getTime() : false;

  useEffect(() => {
    if (instance && instance.status === 'pending' && isExpiredByTime) {
      expireInstance(instance.key);
      const result = resolveWakeResult(instance.dismissStatus, 'expired');
      if (result) logResult(dateKey(new Date(instance.occurrenceIso)), result);
    }
  }, [instance, isExpiredByTime, expireInstance, logResult]);

  function handleConfirm() {
    if (!instance || confirmedRef.current) return;
    confirmedRef.current = true;

    completeInstance(instance.key);
    const result = resolveWakeResult(instance.dismissStatus, 'completed');
    if (result) logResult(dateKey(new Date(instance.occurrenceIso)), result);

    router.replace('/(tabs)');
  }

  if (!instance) {
    return (
      <SkyScreen edges={['top', 'bottom']}>
        <View style={styles.content}>
          <ThemedText type="small" themeColor="textSecondary">
            No hay ninguna microactividad pendiente.
          </ThemedText>
          <PrimaryButton label="Volver" onPress={() => router.replace('/(tabs)')} />
        </View>
      </SkyScreen>
    );
  }

  if (instance.status !== 'pending' || isExpiredByTime) {
    return (
      <SkyScreen edges={['top', 'bottom']}>
        <View style={styles.content}>
          <ThemedText type="title" style={styles.heading}>
            {instance.status === 'completed' ? 'Ya la completaste' : 'Se venció el tiempo'}
          </ThemedText>
          <PrimaryButton label="Volver" onPress={() => router.replace('/(tabs)')} />
        </View>
      </SkyScreen>
    );
  }

  const { label: activityLabel, icon: activityIcon } = resolveMicroActivityDisplay(
    instance.type,
    instance.customLabel,
    definitions
  );

  return (
    <SkyScreen edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Feather name={activityIcon as FeatherIconName} size={40} color={theme.colors.primary} />
        </View>

        <ThemedText type="title" style={styles.heading}>
          {activityLabel}
        </ThemedText>

        <ThemedText type="small" themeColor="textSecondary" style={styles.copy}>
          Apagaste la alarma. Completá esto para que cuente como despertar cumplido.
        </ThemedText>

        {deadline ? (
          <ThemedText type="smallBold" themeColor="primary">
            Vence {formatCountdown(deadline, now)}
          </ThemedText>
        ) : null}

        <View style={styles.buttonWrapper}>
          <PrimaryButton label="Confirmar" onPress={handleConfirm} />
        </View>
      </View>
    </SkyScreen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      paddingHorizontal: Spacing.five,
    },
    iconCircle: {
      width: 88,
      height: 88,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.two,
    },
    heading: {
      fontSize: 26,
      lineHeight: 32,
      textAlign: 'center',
    },
    copy: {
      textAlign: 'center',
    },
    buttonWrapper: {
      marginTop: Spacing.six,
      alignSelf: 'stretch',
    },
  });
}
