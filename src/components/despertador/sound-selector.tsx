import { Feather } from '@expo/vector-icons';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';
import { ALARM_SOUNDS, CUSTOM_SOUND_ID, CUSTOM_SOUND_LABEL } from '@/features/despertadores/constants';
import { useTheme } from '@/hooks/use-theme';
import { resolveAlarmSoundSource } from '@/lib/alarmSound';
import { pickCustomSound } from '@/lib/customSound';
import { useCustomSoundStore } from '@/store/customSound';
import { AlarmSoundId } from '@/types/alarm';

interface SoundSelectorProps {
  value: AlarmSoundId;
  onChange: (value: AlarmSoundId) => void;
}

export function SoundSelector({ value, onChange }: SoundSelectorProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const customSoundUri = useCustomSoundStore((state) => state.uri);
  const customSoundName = useCustomSoundStore((state) => state.name);
  const setCustomSound = useCustomSoundStore((state) => state.setCustomSound);

  const [playingId, setPlayingId] = useState<AlarmSoundId | null>(null);
  const [picking, setPicking] = useState(false);
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    return () => {
      playerRef.current?.pause();
      playerRef.current?.remove();
    };
  }, []);

  function stopPreview() {
    // remove() libera el objeto nativo pero no garantiza que el audio deje de sonar
    // de inmediato — pause() es el método real y síncrono para cortar la reproducción.
    playerRef.current?.pause();
    playerRef.current?.remove();
    playerRef.current = null;
    setPlayingId(null);
  }

  function handlePreviewPress(soundId: AlarmSoundId) {
    if (playingId === soundId) {
      stopPreview();
      return;
    }

    playerRef.current?.pause();
    playerRef.current?.remove();

    const source = resolveAlarmSoundSource(soundId, customSoundUri);
    const player = createAudioPlayer(source);
    playerRef.current = player;
    setPlayingId(soundId);
    player.play();

    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        setPlayingId((current) => (current === soundId ? null : current));
        playerRef.current = null;
      }
    });
  }

  async function handlePickCustomSound() {
    stopPreview();
    setPicking(true);
    try {
      const picked = await pickCustomSound();
      if (!picked) return;
      setCustomSound(picked.uri, picked.name);
      onChange(CUSTOM_SOUND_ID);
    } catch {
      Alert.alert('No pudimos usar ese archivo', 'Probá elegir otro audio del dispositivo.');
    } finally {
      setPicking(false);
    }
  }

  return (
    <View style={styles.container}>
      {ALARM_SOUNDS.map((sound) => {
        const active = sound.id === value;
        const playing = playingId === sound.id;
        return (
          <Pressable
            key={sound.id}
            onPress={() => onChange(sound.id)}
            style={[styles.option, active && styles.optionActive]}>
            <ThemedText type="small" themeColor={active ? 'onPrimary' : 'textSecondary'}>
              {sound.label}
            </ThemedText>
            <Pressable
              onPress={() => handlePreviewPress(sound.id)}
              hitSlop={8}
              style={styles.previewButton}>
              <Feather
                name={playing ? 'square' : 'play'}
                size={16}
                color={active ? theme.colors.onPrimary : theme.colors.textPrimary}
              />
            </Pressable>
          </Pressable>
        );
      })}

      {customSoundUri ? (
        <Pressable
          onPress={() => onChange(CUSTOM_SOUND_ID)}
          style={[styles.option, value === CUSTOM_SOUND_ID && styles.optionActive]}>
          <View style={styles.customLabel}>
            <ThemedText
              type="small"
              themeColor={value === CUSTOM_SOUND_ID ? 'onPrimary' : 'textSecondary'}
              numberOfLines={1}>
              {customSoundName ?? CUSTOM_SOUND_LABEL}
            </ThemedText>
          </View>
          <View style={styles.customActions}>
            <Pressable
              onPress={() => handlePreviewPress(CUSTOM_SOUND_ID)}
              hitSlop={8}
              style={styles.previewButton}>
              <Feather
                name={playingId === CUSTOM_SOUND_ID ? 'square' : 'play'}
                size={16}
                color={value === CUSTOM_SOUND_ID ? theme.colors.onPrimary : theme.colors.textPrimary}
              />
            </Pressable>
            <Pressable onPress={handlePickCustomSound} hitSlop={8} style={styles.previewButton}>
              <Feather
                name="upload"
                size={16}
                color={value === CUSTOM_SOUND_ID ? theme.colors.onPrimary : theme.colors.textPrimary}
              />
            </Pressable>
          </View>
        </Pressable>
      ) : (
        <Pressable
          onPress={handlePickCustomSound}
          disabled={picking}
          style={[styles.option, styles.optionDashed]}>
          <Feather name="upload" size={16} color={theme.colors.textSecondary} />
          <ThemedText type="small" themeColor="textSecondary">
            {picking ? 'Eligiendo...' : `${CUSTOM_SOUND_LABEL}: elegir un archivo de audio`}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      gap: Spacing.two,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Spacing.three,
      borderRadius: theme.radius.medium,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    optionActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    optionDashed: {
      justifyContent: 'flex-start',
      gap: Spacing.two,
      borderStyle: 'dashed',
    },
    customLabel: {
      flex: 1,
      marginRight: Spacing.two,
    },
    customActions: {
      flexDirection: 'row',
      gap: Spacing.one,
    },
    previewButton: {
      width: 32,
      height: 32,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
