// Typography Scale - Modern Design System
export const TYPOGRAPHY = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 42,
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
} as const;

// Pre-defined text styles
export const TEXT_STYLES = {
  // Headings
  h1: {
    fontSize: TYPOGRAPHY.fontSize['6xl'], // 42px
    fontWeight: TYPOGRAPHY.fontWeight.bold, // 700
    lineHeight: TYPOGRAPHY.lineHeight.tight,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
  },
  h2: {
    fontSize: TYPOGRAPHY.fontSize['3xl'], // 28px
    fontWeight: TYPOGRAPHY.fontWeight.bold, // 700
    lineHeight: TYPOGRAPHY.lineHeight.tight,
  },
  h3: {
    fontSize: TYPOGRAPHY.fontSize['2xl'], // 24px
    fontWeight: TYPOGRAPHY.fontWeight.semibold, // 600
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  h4: {
    fontSize: TYPOGRAPHY.fontSize.xl, // 20px
    fontWeight: TYPOGRAPHY.fontWeight.semibold, // 600
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  
  // Body text
  body: {
    fontSize: TYPOGRAPHY.fontSize.base, // 16px
    fontWeight: TYPOGRAPHY.fontWeight.normal, // 400
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  bodyLarge: {
    fontSize: TYPOGRAPHY.fontSize.lg, // 18px
    fontWeight: TYPOGRAPHY.fontWeight.normal, // 400
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  bodySmall: {
    fontSize: TYPOGRAPHY.fontSize.sm, // 14px
    fontWeight: TYPOGRAPHY.fontWeight.normal, // 400
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  
  // Captions and labels
  caption: {
    fontSize: TYPOGRAPHY.fontSize.sm, // 14px
    fontWeight: TYPOGRAPHY.fontWeight.medium, // 500
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm, // 14px
    fontWeight: TYPOGRAPHY.fontWeight.semibold, // 600
    lineHeight: TYPOGRAPHY.lineHeight.normal,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  small: {
    fontSize: TYPOGRAPHY.fontSize.xs, // 12px
    fontWeight: TYPOGRAPHY.fontWeight.normal, // 400
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  
  // Button text
  button: {
    fontSize: TYPOGRAPHY.fontSize.base, // 16px
    fontWeight: TYPOGRAPHY.fontWeight.semibold, // 600
    lineHeight: TYPOGRAPHY.lineHeight.tight,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  buttonSmall: {
    fontSize: TYPOGRAPHY.fontSize.sm, // 14px
    fontWeight: TYPOGRAPHY.fontWeight.semibold, // 600
    lineHeight: TYPOGRAPHY.lineHeight.tight,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
} as const;