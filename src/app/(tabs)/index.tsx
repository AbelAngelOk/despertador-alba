import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SkyClock } from '@/components/despertador/sky-clock';
import { ThemedText } from '@/components/themed-text';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Spacing } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';
import { useNextAlarm } from '@/features/despertadores/schedule';
import { useTheme } from '@/hooks/use-theme';
import { requestDeviceLocation } from '@/lib/deviceLocation';
import { useLocationStore } from '@/store/location';

// Obelisco, Buenos Aires — fallback para emuladores/simuladores sin GPS.
const FALLBACK_LOCATION = { latitude: -34.6037, longitude: -58.3816, label: 'Buenos Aires, Argentina' };

export default function InicioScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const setLocation = useLocationStore((state) => state.setLocation);
  const nextAlarm = useNextAlarm();
  const [requestingLocation, setRequestingLocation] = useState(false);

  async function handleEnableLocation() {
    setRequestingLocation(true);
    try {
      const { latitude, longitude } = await requestDeviceLocation();
      setLocation(latitude, longitude);
    } catch {
      Alert.alert(
        'No pudimos obtener tu ubicación',
        'Activá el permiso de ubicación para calcular tu horario de amanecer, o usá la ubicación de referencia de abajo.'
      );
    } finally {
      setRequestingLocation(false);
    }
  }

  function handleUseFallbackLocation() {
    setLocation(FALLBACK_LOCATION.latitude, FALLBACK_LOCATION.longitude, FALLBACK_LOCATION.label);
  }

  if (latitude == null || longitude == null) {
    return (
      <SafeAreaView style={styles.locationScreen} edges={['top', 'bottom']}>
        <View style={styles.locationContent}>
          <View style={styles.iconCircle}>
            <Feather name="map-pin" size={40} color={theme.colors.primary} />
          </View>
          <ThemedText type="subtitle" style={styles.locationTitle}>
            ¿Dónde amanece para vos?
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.locationCopy}>
            Necesitamos tu ubicación para calcular el horario exacto de amanecer en tu zona y
            mostrarte el cielo en vivo. Es el dato más importante de la app.
          </ThemedText>
        </View>

        <View style={styles.locationActions}>
          <PrimaryButton
            label={requestingLocation ? 'Buscando...' : 'Usar mi ubicación'}
            onPress={handleEnableLocation}
            disabled={requestingLocation}
          />
          <PrimaryButton
            variant="ghost"
            label="Usar Buenos Aires, Argentina"
            onPress={handleUseFallbackLocation}
            disabled={requestingLocation}
          />
          <ThemedText type="small" themeColor="textMuted" style={styles.fallbackNote}>
            Usá esta opción si estás en un emulador o simulador sin GPS disponible.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SkyClock latitude={latitude} longitude={longitude} nextAlarm={nextAlarm} />
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    locationScreen: {
      flex: 1,
      justifyContent: 'space-between',
      padding: Spacing.five,
      backgroundColor: theme.colors.background,
    },
    locationContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.three,
    },
    iconCircle: {
      width: 88,
      height: 88,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.two,
    },
    locationTitle: {
      textAlign: 'center',
    },
    locationCopy: {
      textAlign: 'center',
      maxWidth: 320,
    },
    locationActions: {
      gap: Spacing.two,
    },
    fallbackNote: {
      textAlign: 'center',
      paddingHorizontal: Spacing.three,
    },
  });
}
