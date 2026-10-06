import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { ColorTokens } from '@/constants/themes';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: keyof ColorTokens;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const isDisplay = type === 'title' || type === 'subtitle';

  return (
    <Text
      style={[
        { color: theme.colors[themeColor ?? 'textPrimary'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && [styles.smallBold, { fontWeight: theme.typography.boldWeight }],
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && [styles.linkPrimary, { color: theme.colors.primary }],
        type === 'code' && styles.code,
        isDisplay && theme.typography.displayFontFamily
          ? { fontFamily: theme.typography.displayFontFamily }
          : null,
        isDisplay && theme.typography.displayGlow
          ? {
              textShadowColor: theme.typography.displayGlow.color,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: theme.typography.displayGlow.radius,
            }
          : null,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  title: {
    fontSize: 48,
    fontWeight: 600,
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: 600,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
