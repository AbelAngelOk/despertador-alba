import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { SkyScreen } from '@/components/sky/sky-screen';
import { NavCard } from '@/components/ui/nav-card';
import { Spacing } from '@/constants/theme';

export default function PerfilScreen() {
  const router = useRouter();

  return (
    <SkyScreen>
      <ScrollView contentContainerStyle={styles.content}>
        <NavCard
          icon="sliders"
          title="Ajustes y configuración"
          description="Personalización, ubicación y backup."
          onPress={() => router.push('/ajustes')}
        />

        <NavCard
          icon="check-circle"
          title="Microactividades"
          description="Elegí qué actividades aparecen al armar un despertador."
          onPress={() => router.push('/microactividades')}
        />
      </ScrollView>
    </SkyScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
});
