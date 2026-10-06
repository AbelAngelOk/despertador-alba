import { Feather } from '@expo/vector-icons';
import { AlarmEngine } from '@modules/alarm-engine';
import Constants from 'expo-constants';
import * as IntentLauncher from 'expo-intent-launcher';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AppState, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { SkyScreen } from '@/components/sky/sky-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ThemePicker } from '@/components/ui/theme-picker';
import { Spacing } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';
import { useTheme } from '@/hooks/use-theme';
import { configureAndroidChannel, getAlarmChannelBypassesDnd } from '@/lib/alarmNotifications';
import { exportBackup, importBackup } from '@/lib/backup';
import { requestDeviceLocation } from '@/lib/deviceLocation';
import { isDndAccessRelevant, openDndAccessSettings } from '@/lib/dndAccess';
import { useDndAccessStore } from '@/store/dndAccess';
import { useLocationStore } from '@/store/location';
import { useSettingsStore } from '@/store/settings';

export default function AjustesScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const setLocation = useLocationStore((state) => state.setLocation);
  const weatherEnabled = useSettingsStore((state) => state.weatherEnabled);
  const setWeatherEnabled = useSettingsStore((state) => state.setWeatherEnabled);
  const skyBackgroundEnabled = useSettingsStore((state) => state.skyBackgroundEnabled);
  const setSkyBackgroundEnabled = useSettingsStore((state) => state.setSkyBackgroundEnabled);
  const classicAlarmsEnabled = useSettingsStore((state) => state.classicAlarmsEnabled);
  const setClassicAlarmsEnabled = useSettingsStore((state) => state.setClassicAlarmsEnabled);
  const testAlarmEnabled = useSettingsStore((state) => state.testAlarmEnabled);
  const setTestAlarmEnabled = useSettingsStore((state) => state.setTestAlarmEnabled);
  const [updating, setUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dndBypassGranted, setDndBypassGranted] = useState<boolean | null>(null);
  const [fullScreenAllowed, setFullScreenAllowed] = useState(true);
  const dndDeclined = useDndAccessStore((state) => state.declined);
  const setDndDeclined = useDndAccessStore((state) => state.setDeclined);

  const refreshDndStatus = useCallback(async () => {
    if (AlarmEngine) setFullScreenAllowed(AlarmEngine.canUseFullScreenIntent());
    if (!isDndAccessRelevant()) return;
    await configureAndroidChannel();
    setDndBypassGranted(await getAlarmChannelBypassesDnd());
  }, []);

  useEffect(() => {
    // Carga al montar: refreshDndStatus termina llamando a setState tras el
    // await, patrón estándar de "fetch en un efecto" que esta regla marca igual.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshDndStatus();
    // Al volver de la pantalla de Ajustes del sistema (donde se otorga o
    // saca el permiso), la app solo se reactiva — no se remonta esta
    // pantalla — así que hace falta releer el estado en el resume.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshDndStatus();
    });
    return () => subscription.remove();
  }, [refreshDndStatus]);

  async function openDndSettingsOrExplain() {
    const opened = await openDndAccessSettings();
    if (!opened) {
      Alert.alert(
        'No pudimos abrir Ajustes',
        'Andá a Ajustes de Android → Apps → Acceso especial → No molestar, y buscá Alba.'
      );
    }
  }

  async function openFullScreenSettings() {
    const packageName = Constants.expoConfig?.android?.package;
    try {
      await IntentLauncher.startActivityAsync('android.settings.MANAGE_APP_USE_FULL_SCREEN_INTENT', {
        data: packageName ? `package:${packageName}` : undefined,
      });
    } catch {
      Alert.alert(
        'No pudimos abrir Ajustes',
        'Andá a Ajustes de Android → Apps → Despertador Alba → Notificaciones de pantalla completa, y activalas.'
      );
    }
  }

  function handleEnableDnd() {
    setDndDeclined(false);
    openDndSettingsOrExplain();
  }

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
    <SkyScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="smallBold" themeColor="accent" style={styles.sectionTitle}>
          Personalización
        </ThemedText>

        <ThemedView type="surface" style={styles.card}>
          <ThemedText type="smallBold">Identidad visual</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Elegí el estilo con el que se ve toda la app. Se aplica al instante.
          </ThemedText>
          <ThemePicker />
        </ThemedView>

        <ThemedView type="surface" style={styles.card}>
          <SettingSwitchRow
            label="Cielo en vivo de fondo"
            value={skyBackgroundEnabled}
            onValueChange={setSkyBackgroundEnabled}
          />
          <ThemedText type="small" themeColor="textSecondary">
            El cielo real de tu zona (sol, luna, estrellas) de fondo en todas las secciones,
            atenuado con el color del estilo elegido. Apagado, cada sección usa un fondo liso.
          </ThemedText>
        </ThemedView>

        <ThemedView type="surface" style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.labelRow}>
              <ThemedText type="smallBold">Clima</ThemedText>
              <ThemedText type="small" themeColor="accent">
                (beta)
              </ThemedText>
            </View>
            <Switch
              value={weatherEnabled}
              onValueChange={setWeatherEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.onPrimary}
            />
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            Agrega nubes y lluvia al Reloj de Cielo según el clima real de tu zona (vía
            Open-Meteo). Necesita conexión — sin datos frescos, el cielo se ve igual que siempre,
            solo con sol, luna y estrellas. Desactivado por defecto.
          </ThemedText>
        </ThemedView>

        <ThemedText type="smallBold" themeColor="accent" style={styles.sectionTitle}>
          Despertadores
        </ThemedText>

        <ThemedView type="surface" style={styles.card}>
          <SettingSwitchRow
            label="Despertador clásico"
            value={classicAlarmsEnabled}
            onValueChange={setClassicAlarmsEnabled}
          />
          <ThemedText type="small" themeColor="textSecondary">
            Suma la opción de crear despertadores a una hora fija, como uno tradicional. Al tocar
            el + vas a poder elegir entre el solar y el clásico.
          </ThemedText>
        </ThemedView>

        <ThemedView type="surface" style={styles.card}>
          <SettingSwitchRow
            label="Despertador de prueba"
            value={testAlarmEnabled}
            onValueChange={setTestAlarmEnabled}
          />
          <ThemedText type="small" themeColor="textSecondary">
            Para probar sonido y pantalla de alarma: agrega &quot;Prueba rápida&quot; al + y
            &quot;Probar en 1 minuto&quot; al editar un despertador. La prueba suena una sola vez y
            se borra sola al apagarla.
          </ThemedText>
        </ThemedView>

        <ThemedText type="smallBold" themeColor="accent" style={styles.sectionTitle}>
          Configuración
        </ThemedText>

        {!fullScreenAllowed ? (
          <ThemedView type="surface" style={styles.card}>
            <ThemedText type="smallBold">Alarma a pantalla completa</ThemedText>
            <View style={styles.warningRow}>
              <Feather name="alert-triangle" size={16} color={theme.colors.warning} />
              <ThemedText type="small" themeColor="textSecondary" style={styles.warningText}>
                Android no le está permitiendo a Alba mostrar la alarma a pantalla completa con el
                teléfono bloqueado. La alarma igual suena, pero para apagarla vas a tener que
                tocar la notificación y desbloquear.
              </ThemedText>
            </View>
            <PrimaryButton variant="ghost" label="Permitir pantalla completa" onPress={openFullScreenSettings} />
          </ThemedView>
        ) : null}

        {isDndAccessRelevant() ? (
          <ThemedView type="surface" style={styles.card}>
            <ThemedText type="smallBold">Alarma con volumen dedicado</ThemedText>
            {dndBypassGranted === true ? (
              <ThemedText type="small" themeColor="textSecondary">
                Activado: la alarma va a sonar aunque tengas el modo No molestar prendido. Si querés
                desactivarlo, hacelo desde los ajustes de Android.
              </ThemedText>
            ) : dndDeclined ? (
              <View style={styles.warningRow}>
                <Feather name="alert-triangle" size={16} color={theme.colors.warning} />
                <ThemedText type="small" themeColor="textSecondary" style={styles.warningText}>
                  Elegiste no activarlo por ahora. Podés hacerlo cuando quieras. Mientras tanto, la
                  alarma no va a sonar si tenés el modo No molestar activado.
                </ThemedText>
              </View>
            ) : (
              <ThemedText type="small" themeColor="textSecondary">
                Todavía no lo activaste — con el modo No molestar prendido, la alarma podría no
                sonar.
              </ThemedText>
            )}
            <PrimaryButton
              variant="ghost"
              label={
                dndBypassGranted === true
                  ? 'Desactivar en Ajustes de Android'
                  : 'Configurar acceso a No molestar'
              }
              onPress={dndBypassGranted === true ? openDndSettingsOrExplain : handleEnableDnd}
            />
          </ThemedView>
        ) : null}

        <ThemedView type="surface" style={styles.card}>
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

        <ThemedView type="surface" style={styles.card}>
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
    </SkyScreen>
  );
}

function SettingSwitchRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const theme = useTheme();
  return (
    <View style={switchRowStyles.row}>
      <ThemedText type="smallBold" style={switchRowStyles.label}>
        {label}
      </ThemedText>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor={theme.colors.onPrimary}
      />
    </View>
  );
}

const switchRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  label: {
    flexShrink: 1,
  },
});

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    content: {
      padding: Spacing.four,
      paddingBottom: Spacing.six,
      gap: Spacing.three,
    },
    sectionTitle: {
      marginTop: Spacing.two,
    },
    card: {
      borderRadius: theme.radius.large,
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
    warningRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.two,
    },
    warningText: {
      flex: 1,
    },
  });
}
