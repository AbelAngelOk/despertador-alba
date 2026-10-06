import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, View } from 'react-native';

import { SkyScreen } from '@/components/sky/sky-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Spacing } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';
import { getStoreLabel, RECOMENDACION_MOTIVO } from '@/features/libro-recomendado/constants';
import { useTheme } from '@/hooks/use-theme';
import {
  BooksApiError,
  BooksApiErrorKind,
  fetchRecommendedBook,
  resolveStoreUrl,
  RecommendedBook,
} from '@/lib/booksApi';

type LoadState = 'loading' | 'error' | 'empty' | 'ready';

// "Revisá tu conexión" solo aplica si de verdad no hubo respuesta; si la API
// contestó y rechazó el pedido, el problema no es del usuario.
const ERROR_COPY: Record<BooksApiErrorKind, { icon: 'wifi-off' | 'alert-circle'; detail: string }> = {
  network: { icon: 'wifi-off', detail: 'Revisá tu conexión e intentá de nuevo.' },
  server: { icon: 'alert-circle', detail: 'El servicio de recomendaciones no está respondiendo bien. Probá de nuevo en un rato.' },
  auth: { icon: 'alert-circle', detail: 'Hay un problema de configuración de la app (no es tu conexión). Probá más tarde o actualizá la app.' },
  config: { icon: 'alert-circle', detail: 'Hay un problema de configuración de la app (no es tu conexión). Probá más tarde o actualizá la app.' },
};

export default function RecursosScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [state, setState] = useState<LoadState>('loading');
  const [book, setBook] = useState<RecommendedBook | null>(null);
  const [errorKind, setErrorKind] = useState<BooksApiErrorKind>('network');

  // El estado inicial ya es 'loading', así que el efecto de carga inicial no
  // necesita setearlo de nuevo de forma síncrona; reintentar sí lo hace, pero
  // eso ocurre en un handler de botón, no dentro de un efecto.
  const fetchBook = useCallback(async () => {
    try {
      const result = await fetchRecommendedBook();
      if (!result) {
        setBook(null);
        setState('empty');
        return;
      }
      setBook(result);
      setState('ready');
    } catch (error) {
      setErrorKind(error instanceof BooksApiError ? error.kind : 'network');
      setState('error');
    }
  }, []);

  useEffect(() => {
    // Carga al montar: fetchBook termina llamando a setState tras el await,
    // patrón estándar de "fetch en un efecto" que esta regla marca igual.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBook();
  }, [fetchBook]);

  function retry() {
    setState('loading');
    fetchBook();
  }

  function handleOpenStore(ctaUrl: string) {
    Linking.openURL(resolveStoreUrl(ctaUrl));
  }

  return (
    <SkyScreen edges={['top']}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.heading}>
          Recursos
        </ThemedText>
      </View>

      {state === 'loading' ? (
        <View style={styles.centered}>
          <ThemedText type="small" themeColor="textSecondary">
            Buscando una recomendación...
          </ThemedText>
        </View>
      ) : null}

      {state === 'error' ? (
        <View style={styles.centered}>
          <Feather
            name={ERROR_COPY[errorKind].icon}
            size={32}
            color={theme.colors.textSecondary}
          />
          <ThemedText type="smallBold">No pudimos cargar el libro recomendado</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.centeredCopy}>
            {ERROR_COPY[errorKind].detail}
          </ThemedText>
          <PrimaryButton variant="ghost" label="Reintentar" onPress={retry} />
        </View>
      ) : null}

      {state === 'empty' ? (
        <View style={styles.centered}>
          <Feather name="book-open" size={32} color={theme.colors.textSecondary} />
          <ThemedText type="smallBold">Todavía no hay ningún libro recomendado</ThemedText>
        </View>
      ) : null}

      {state === 'ready' && book ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Image source={{ uri: book.imagenUrl }} style={styles.cover} resizeMode="cover" />

          <ThemedText type="subtitle" style={styles.title}>
            {book.titulo}
          </ThemedText>

          <ThemedView type="surface" style={styles.card}>
            <ThemedText type="smallBold">Descripción</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {book.descripcion}
            </ThemedText>
          </ThemedView>

          <ThemedView type="surface" style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="heart" size={16} color={theme.colors.accent} />
              <ThemedText type="smallBold">Por qué te lo recomendamos</ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {RECOMENDACION_MOTIVO}
            </ThemedText>
          </ThemedView>

          {book.slots.length > 0 ? (
            <View style={styles.actions}>
              {book.slots.map((slot, index) => (
                <PrimaryButton
                  key={slot.dominio}
                  variant={index === 0 ? 'primary' : 'ghost'}
                  label={getStoreLabel(slot.dominio)}
                  onPress={() => handleOpenStore(slot.ctaUrl)}
                />
              ))}
            </View>
          ) : (
            <ThemedText type="small" themeColor="textSecondary" style={styles.centeredCopy}>
              Por ahora no hay ningún link de compra disponible para este libro.
            </ThemedText>
          )}
        </ScrollView>
      ) : null}
    </SkyScreen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    header: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.two,
    },
    heading: {
      fontSize: 28,
      lineHeight: 34,
    },
    content: {
      padding: Spacing.four,
      paddingBottom: Spacing.six,
      gap: Spacing.three,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      padding: Spacing.five,
    },
    centeredCopy: {
      textAlign: 'center',
    },
    cover: {
      width: '100%',
      aspectRatio: 3 / 4,
      borderRadius: theme.radius.large,
      backgroundColor: theme.colors.surface,
    },
    title: {
      fontSize: 24,
      lineHeight: 30,
    },
    card: {
      borderRadius: theme.radius.large,
      padding: Spacing.four,
      gap: Spacing.two,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.one,
    },
    actions: {
      gap: Spacing.two,
      marginTop: Spacing.two,
    },
  });
}
