import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { exportBackup, importBackup } from '@/lib/backup';
import { requestDeviceLocation } from '@/lib/deviceLocation';
import { useLocationStore } from '@/store/location';
import { useSettingsStore } from '@/store/settings';

export default function PerfilScreen() {
  const router = useRouter();
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const setLocation = useLocationStore((state) => state.setLocation);
  const weatherEnabled = useSettingsStore((state) => state.weatherEnabled);
  const setWeatherEnabled = useSettingsStore((state) => state.setWeatherEnabled);
  const [updating, setUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  async function handleRefreshLocation() {
    setUpdating(true);
    try {
      const { latitude, longitude } = await requestDeviceLocation();
      setLocation(latitude, longitude);
    } catch {
      Alert.alert('No pudimos actualizar tu ubicación', 'Revisá los permisos de ubicación de la app.');
    } finally {
      setUpdating(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      await exportBackup();
    } catch {
      Alert.alert('No pudimos exportar el backup', 'Intentalo de nuevo.');
    } finally {
      setExporting(false);
    }
  }

  function handleImport() {
    Alert.alert(
      'Importar backup',
      'Esto reemplaza tus despertadores, ubicación, seguimiento y preferencias actuales por los del archivo. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Importar', style: 'destructive', onPress: runImport },
      ]
    );
  }

  async function runImport() {
    setImporting(true);
    try {
      const result = await importBackup();
      if (result === 'imported') {
        Alert.alert('Listo', 'Se importó el backup correctamente.');
      }
    } catch {
      Alert.alert('No pudimos importar el backup', 'Revisá que el archivo sea un backup válido de Despertador.');
    } finally {
      setImporting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.heading}>
          Perfil
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Ubicación</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {latitude != null && longitude != null
              ? `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`
              : 'Sin configurar'}
          </ThemedText>
          <PrimaryButton
            variant="ghost"
            label={updating ? 'Actualizando...' : 'Actualizar ubicación'}
            onPress={handleRefreshLocation}
            disabled={updating}
          />
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.labelRow}>
              <ThemedText type="smallBold">Clima</ThemedText>
              <ThemedText type="small" themeColor="accentSecondary">
                (beta)
              </ThemedText>
            </View>
            <Switch
              value={weatherEnabled}
              onValueChange={setWeatherEnabled}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor={Colors.text}
            />
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            Agrega nubes y lluvia al Reloj de Cielo según el clima real de tu zona (vía
            Open-Meteo). Necesita conexión — sin datos frescos, el cielo se ve igual que siempre,
            solo con sol, luna y estrellas. Desactivado por defecto.
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Microactividades</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Elegí qué actividades por defecto aparecen al armar un despertador, y creá las tuyas
            propias.
          </ThemedText>
          <PrimaryButton
            variant="ghost"
            label="Gestionar microactividades"
            onPress={() => router.push('/microactividades')}
          />
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Backup</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Alba funciona 100% local, sin login ni registro — es una decisión permanente,
            no algo pendiente. Eso también significa que tus datos (despertadores, ubicación,
            seguimiento) viven solo en este dispositivo: si lo perdés o desinstalás la app, se
            pierden con él. Por eso existe el backup manual — exportá un archivo para guardarlo o
            pasarlo a otro dispositivo.
          </ThemedText>
          <PrimaryButton
            variant="ghost"
            label={exporting ? 'Exportando...' : 'Exportar backup'}
            onPress={handleExport}
            disabled={exporting}
          />
          <PrimaryButton
            variant="ghost"
            label={importing ? 'Importando...' : 'Importar backup'}
            onPress={handleImport}
            disabled={importing}
          />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  heading: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: Spacing.two,
  },
  card: {
    borderRadius: Radius.large,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
