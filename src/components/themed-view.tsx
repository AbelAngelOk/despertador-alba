import { View, type ViewProps } from 'react-native';

import { ColorTokens } from '@/constants/themes';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  type?: keyof ColorTokens;
  /** Sombra sutil del template activo (si tiene). Pasar `false` cuando este contenedor vive dentro de otro. */
  shadow?: boolean;
};

export function ThemedView({ style, type, shadow = true, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        { backgroundColor: theme.colors[type ?? 'background'] },
        shadow ? theme.cardShadow : null,
        style,
      ]}
      {...otherProps}
    />
  );
}
