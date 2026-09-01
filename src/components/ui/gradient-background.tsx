import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, ViewProps } from 'react-native';

import { Gradients } from '@/constants/theme';

export function GradientBackground({ style, children, ...rest }: ViewProps) {
  return (
    <LinearGradient
      colors={Gradients.sky}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.fill, style]}
      {...rest}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
