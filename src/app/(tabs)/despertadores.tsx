import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlarmCard } from '@/components/despertador/alarm-card';
import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useAlarmsStore } from '@/features/despertadores/store';

export default function DespertadoresScreen() {
  const router = useRouter();
  const alarms = useAlarmsStore((state) => state.alarms);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Tus despertadores
        </ThemedText>
      </View>

      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <AlarmCard alarm={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText type="smallBold">Todavía no tenés despertadores</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyCopy}>
              Creá el primero para despertar con la luz del amanecer.
            </ThemedText>
          </View>
        }
      />

      <Pressable style={styles.fab} onPress={() => router.push('/despertador/nuevo')}>
        <ThemedText type="title" style={styles.fabLabel}>
          +
        </ThemedText>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  list: {
    padding: Spacing.four,
    gap: Spacing.three,
    flexGrow: 1,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.one,
  },
  emptyCopy: {
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: Spacing.five,
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabLabel: {
    color: Colors.background,
    fontSize: 32,
    lineHeight: 34,
  },
});
