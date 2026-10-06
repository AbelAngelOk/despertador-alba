import { LinearGradient } from 'expo-linear-gradient';
import { HeaderHeightContext } from 'expo-router/react-navigation';
import { ReactNode, useContext } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/lib/skyGradient';
import { useLocationStore } from '@/store/location';
import { useSettingsStore } from '@/store/settings';

import { SkyScene, useSkyNow } from './sky-scene';

// Velo del color de fondo del template sobre el cielo: más liviano arriba
// (se ve el cielo) y más denso abajo, donde suele haber más contenido. Es lo
// que mantiene legible el texto del template sobre un cielo de día claro o
// de noche oscuro, y lo que hace que cada template "tiña" el mismo cielo.
const VEIL_TOP_ALPHA = 0.5;
const VEIL_BOTTOM_ALPHA = 0.78;

/** Cielo en vivo atenuado con el color del template. Absoluto, detrás del contenido. */
export function SkyBackdrop() {
  const theme = useTheme();
  const enabled = useSettingsStore((state) => state.skyBackgroundEnabled);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);

  if (!enabled || latitude == null || longitude == null) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LiveSky latitude={latitude} longitude={longitude} />
      <LinearGradient
        colors={[
          withAlpha(theme.colors.background, VEIL_TOP_ALPHA),
          withAlpha(theme.colors.background, VEIL_BOTTOM_ALPHA),
        ]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

// Separado para que el timer de 30 s solo exista cuando el cielo se muestra.
function LiveSky({ latitude, longitude }: { latitude: number; longitude: number }) {
  const now = useSkyNow();
  return <SkyScene latitude={latitude} longitude={longitude} now={now} />;
}

interface SkyScreenProps {
  children: ReactNode;
  /** Bordes con safe area. Las pantallas con header no necesitan 'top' (el header ya lo cubre). */
  edges?: Edge[];
  style?: ViewStyle;
}

/**
 * Contenedor raíz de pantalla con el cielo de fondo — la identidad visual
 * compartida de toda la app. Si la pantalla tiene header (transparente, ver
 * _layout.tsx), deja su alto como padding para que el contenido no quede
 * debajo, mientras el cielo sí sigue por detrás del header.
 */
export function SkyScreen({ children, edges = [], style }: SkyScreenProps) {
  const theme = useTheme();
  const headerHeight = useContext(HeaderHeightContext) ?? 0;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <SkyBackdrop />
      <SafeAreaView edges={edges} style={[styles.content, { paddingTop: headerHeight }, style]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
