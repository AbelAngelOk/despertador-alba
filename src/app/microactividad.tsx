import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import {
  resolveMicroActivityDisplay,
  useMicroActivityCatalogStore,
} from '@/features/despertadores/microActivityCatalogStore';
import { useMicroActivityStore } from '@/features/despertadores/microActivityStore';
import { resolveWakeResult } from '@/features/despertadores/wakeResult';
import { formatCountdown } from '@/lib/format';
import { dateKey, useTrackingStore } from '@/store/tracking';

type FeatherIconName = keyof typeof Feather.glyphMap;

export default function MicroActividadScreen() {
  const router = useRouter();
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
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ThemedText type="small" themeColor="textSecondary">
            No hay ninguna microactividad pendiente.
          </ThemedText>
          <PrimaryButton label="Volver" onPress={() => router.replace('/(tabs)')} />
        </View>
      </SafeAreaView>
    );
  }

  if (instance.status !== 'pending' || isExpiredByTime) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ThemedText type="title" style={styles.heading}>
            {instance.status === 'completed' ? 'Ya la completaste' : 'Se venció el tiempo'}
          </ThemedText>
          <PrimaryButton label="Volver" onPress={() => router.replace('/(tabs)')} />
        </View>
      </SafeAreaView>
    );
  }

  const { label: activityLabel, icon: activityIcon } = resolveMicroActivityDisplay(
    instance.type,
    instance.customLabel,
    definitions
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Feather name={activityIcon as FeatherIconName} size={40} color={Colors.accent} />
        </View>

        <ThemedText type="title" style={styles.heading}>
          {activityLabel}
        </ThemedText>

        <ThemedText type="small" themeColor="textSecondary" style={styles.copy}>
          Apagaste la alarma. Completá esto para que cuente como despertar cumplido.
        </ThemedText>

        {deadline ? (
          <ThemedText type="smallBold" themeColor="accent">
            Vence {formatCountdown(deadline, now)}
          </ThemedText>
        ) : null}

        <View style={styles.buttonWrapper}>
          <PrimaryButton label="Confirmar" onPress={handleConfirm} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
    borderRadius: Radius.pill,
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.border,
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
