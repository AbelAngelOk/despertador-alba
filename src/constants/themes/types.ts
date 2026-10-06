import { TextStyle, ViewStyle } from 'react-native';

/**
 * Superficie mínima de tokens de color que cada template debe definir.
 * `primary` es siempre el color de acción/CTA (el que usan los botones
 * principales), no necesariamente el que cada brief llama "primary" en su
 * prosa — ver el mapeo documentado en cada archivo de template.
 */
export interface ColorTokens {
  background: string;
  surface: string;
  surfaceSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryHover: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;
  accent: string;
  onAccent: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface RadiusTokens {
  small: number;
  medium: number;
  large: number;
  pill: number;
}

export interface ThemeTypography {
  /** Familia tipográfica para títulos/subtítulos (type="title"/"subtitle" en ThemedText). Undefined = fuente del sistema. */
  displayFontFamily?: string;
  /** Peso de fuente para texto smallBold/botones, ajustado por template. */
  boldWeight: TextStyle['fontWeight'];
  /** Tracking sutil para reforzar personalidad (p. ej. minimalismo funcional usa letras más espaciadas en labels). */
  labelLetterSpacing: number;
  /** Glow sutil (text-shadow) solo para títulos/subtítulos — pensado para el template LED, donde la hora "emerge" del fondo oscuro. */
  displayGlow?: { color: string; radius: number };
}

export interface AppTheme {
  id: string;
  name: string;
  description: string;
  colors: ColorTokens;
  radius: RadiusTokens;
  /** Sombra sutil para contenedores de primer nivel. `null` = sin sombra (se apoya en `border` en su lugar). */
  cardShadow: ViewStyle | null;
  typography: ThemeTypography;
  /** true = fondo oscuro (usa StatusBar/iconografía de sistema en modo "light"). */
  isDark: boolean;
}
