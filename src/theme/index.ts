// src/theme/index.ts
/**
 * Design System Theme
 * Centralized design tokens from Figma
 * Keep this file in sync with Figma design system
 */

export const colors = {
  // Primary Brand Colors
  accent: '#3E3153',
  
  // Gradient Colors
  gradientA1: '#6461A4',
  gradientA2: '#453B55',
  gradientB1: '#C7DFFF',
  gradientB2: '#D8D2FF',
  gradientC1: '#F6EAC2',
  gradientC2: '#EEF3E7',
  
  // Base Colors
  black: '#1C1C1E',
  trueBlack: '#000000',
  white: '#FAFAFA',
  trueWhite: '#FFFFFF',
  
  // Gray Scale
  gray1: '#F2F2F2',
  gray2: '#E0E0E0',
  gray3: '#B0B0B0',
  gray4: '#707070',
  gray5: '#3C3C3C',
  
  // Semantic Colors
  hyperlink: '#5910CE',
  notiRed: '#E50000',
  
  // UI Component Colors (Derived from base colors)
  primary: '#3E3153',
  
  // Text Colors
  textPrimary: '#1C1C1E',
  textSecondary: '#707070',
  textTertiary: '#B0B0B0',
  textInverse: '#FAFAFA',
  
  // Background Colors
  background: '#FAFAFA',
  backgroundLight: '#F6EAC2',
  backgroundDark: '#3E3153',
  surface: '#FFFFFF',
  
  // Border Colors
  border: '#E0E0E0',
  borderLight: '#F2F2F2',
  borderDark: '#B0B0B0',
  
  // Button Colors
  buttonPrimary: '#3E3153',
  buttonDisabled: '#B0B0B0',
  buttonText: '#FAFAFA',
  
  // Link/Interactive
  link: '#5910CE',
  linkHover: '#453B55',
  
  // Status Colors
  error: '#E50000',
  success: '#10b981', // Can be updated if you have a success color in Figma
  warning: '#F59E0B', // Can be updated if you have a warning color in Figma
  info: '#6461A4',
  
  // Character/Illustration Colors
  blobPurple: '#D8D2FF',
  blobPurpleDark: '#6461A4',
};

/**
 * Typography System
 * Font: Maven Pro (as shown in Figma)
 */
export const typography = {
  fontFamily: {
    primary: 'Maven Pro',
    // Add other font families if needed
  },
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 32,
    hero: 40,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

/**
 * Spacing System
 * Based on 4px base unit (common design practice)
 */
export const spacing = {
  xxxs: 2,   // 2px
  xxs: 4,    // 4px
  xs: 8,     // 8px
  sm: 12,    // 12px
  md: 16,    // 16px
  lg: 24,    // 24px
  xl: 32,    // 32px
  xxl: 40,   // 40px
  xxxl: 48,  // 48px
  huge: 64,  // 64px
};

/**
 * Border Radius
 */
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 28,
  xxxl: 32,
  full: 9999,
  rounded: 999, // For buttons like in your Figma (Rounded style)
};

/**
 * Shadows
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
};

/**
 * Gradient Configurations
 */
export const gradients = {
  // Background gradient from Figma
  background: {
    colors: [colors.gradientC1, colors.gradientC2],
    start: { x: 0, y: 0 },
    end: { x: 0.1, y: 1 },
    locations: [0.4927, 0.8113],
  },
  // Purple gradient (A series)
  purpleDark: {
    colors: [colors.gradientA1, colors.gradientA2],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  // Light purple/blue gradient (B series)
  lightPurple: {
    colors: [colors.gradientB1, colors.gradientB2],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  // Warm gradient (C series)
  warm: {
    colors: [colors.gradientC1, colors.gradientC2],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
};

/**
 * Component-specific styles
 */
export const components = {
  // Input/TextField
  input: {
    height: 56,
    borderRadius: borderRadius.xxl, // 28px for pill-shaped inputs
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    fontSize: typography.sizes.md,
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  
  // Button
  button: {
    height: 56,
    borderRadius: borderRadius.rounded, // Full rounded like in Figma
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.buttonPrimary,
  },
  
  // Card
  card: {
    borderRadius: borderRadius.xxxl,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  
  // Avatar/Character
  avatar: {
    small: 40,
    medium: 80,
    large: 120,
    xlarge: 160,
  },
};

/**
 * Animation/Transition durations (in milliseconds)
 */
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
};

/**
 * Z-Index layers
 */
export const zIndex = {
  background: 0,
  content: 1,
  elevated: 2,
  dropdown: 10,
  sticky: 20,
  modal: 100,
  tooltip: 200,
  toast: 300,
};

/**
 * Breakpoints (if needed for responsive design)
 */
export const breakpoints = {
  xs: 320,
  sm: 375,
  md: 768,
  lg: 1024,
  xl: 1280,
};

/**
 * Main theme object - export everything together
 */
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  gradients,
  components,
  animation,
  zIndex,
  breakpoints,
};

export default theme;