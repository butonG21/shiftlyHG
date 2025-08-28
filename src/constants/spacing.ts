// Spacing System - Consistent Design Tokens
export const SPACING = {
  // Base spacing units
  xs: 4,   // 4px
  sm: 8,   // 8px
  md: 16,  // 16px
  lg: 24,  // 24px
  xl: 32,  // 32px
  '2xl': 40, // 40px
  '3xl': 48, // 48px
  '4xl': 56, // 56px
  '5xl': 64, // 64px
  '6xl': 80, // 80px
} as const;

// Border radius values
export const BORDER_RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// Shadow configurations
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// Component-specific spacing
export const COMPONENT_SPACING = {
  // Card spacing
  card: {
    padding: SPACING.lg,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
  },
  
  // Button spacing
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    minHeight: 44, // Accessibility minimum touch target
  },
  
  // Input spacing
  input: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    minHeight: 48,
  },
  
  // Screen spacing
  screen: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  
  // Section spacing
  section: {
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
} as const;