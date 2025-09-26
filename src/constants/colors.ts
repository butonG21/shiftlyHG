// Enhanced Professional Color Palette for Shiftly App
// Modern, attractive yet professional design with balanced colors
export const COLORS = {
  // Primary brand colors - Modern professional theme with more character
  primary: '#3b82f6',           // Blue-500 - Modern professional blue
  primaryDark: '#1d4ed8',       // Blue-700 - Deeper blue variant
  secondary: '#8b5cf6',         // Violet-500 - Attractive secondary purple
  secondaryDark: '#7c3aed',     // Violet-600 - Deeper secondary
  accent: {
    blue: '#60a5fa',
    purple: '#a78bfa',
    green: '#4ade80',
    yellow: '#facc15',
    red: '#f87171',
  },
  
  // Background system - Modern and inviting
  background: {
    primary: '#f8fafc',         // Slate-50 - Clean light background
    secondary: '#3b82f6',       // Blue-500 - Vibrant accent
    surface: '#FFFFFF',         // Pure white surfaces
    card: 'rgba(255, 255, 255, 0.95)', // Clean white cards with transparency
    overlay: 'rgba(15, 23, 42, 0.7)',  // Professional overlay
    accent: '#f0f9ff',          // Sky-50 - Light accent background
  },
  
  // Text hierarchy system - Enhanced readability with character
  text: {
    primary: '#1e293b',         // Slate-800 - Strong primary text
    secondary: '#475569',       // Slate-600 - Professional secondary text
    light: '#64748b',          // Slate-500 - Light text
    white: '#FFFFFF',          // Pure white text
    muted: 'rgba(71, 85, 105, 0.7)', // Muted professional text
    accent: '#3b82f6',         // Modern blue accent text
    success: '#059669',        // Emerald-600 - Success text
    warning: '#d97706',        // Amber-600 - Warning text
  },
  
  // Status and semantic colors - Modern vibrant tones
  status: {
    success: '#10b981',        // Emerald-500 - Vibrant success green
    warning: '#f59e0b',        // Amber-500 - Bright warning orange
    error: '#ef4444',          // Red-500 - Clear error red
    info: '#3b82f6',           // Blue-500 - Modern info blue
    purple: '#8b5cf6',         // Violet-500 - Attractive purple
    teal: '#14b8a6',           // Teal-500 - Fresh teal
  },
  
  // Gradient combinations - Modern and attractive
  gradient: {
    primary: ['#3b82f6', '#1d4ed8'],                    // Modern blue gradient
    secondary: ['#8b5cf6', '#7c3aed'],                  // Attractive purple gradient
    background: ['#f8fafc', '#f0f9ff', '#e0f2fe'],     // Sky-tinted background gradient
    card: ['rgba(255, 255, 255, 0.98)', 'rgba(240, 249, 255, 0.95)'], // Clean card gradient
    accent: ['#3b82f6', '#8b5cf6'],                     // Blue to purple gradient
    neutral: ['#f1f5f9', '#e2e8f0'],                   // Neutral gray gradient
    subtle: ['#f8fafc', '#f0f9ff'],                    // Sky-tinted subtle gradient
    success: ['#10b981', '#059669'],                   // Success gradient
    warning: ['#f59e0b', '#d97706'],                   // Warning gradient
    teal: ['#14b8a6', '#0d9488'],                      // Teal gradient
  },
  
  // Professional glass morphism effects - More subtle
  glass: {
    background: 'rgba(248, 250, 252, 0.8)',   // Professional glass background
    border: 'rgba(148, 163, 184, 0.2)',       // Subtle slate border
    shadow: 'rgba(15, 23, 42, 0.08)',         // Professional shadow
  },
  
  // Additional professional colors
  professional: {
    navy: '#1e293b',           // Slate-800 - Professional navy
    charcoal: '#334155',       // Slate-700 - Professional charcoal
    steel: '#475569',          // Slate-600 - Steel blue-gray
    silver: '#94a3b8',         // Slate-400 - Professional silver
    pearl: '#f1f5f9',         // Slate-100 - Pearl white
    frost: '#f8fafc',          // Slate-50 - Frost white
  },

  // Additional properties for compatibility
  border: '#e2e8f0',           // Slate-200 - Border color
  surface: '#FFFFFF',          // White surface color
} as const;

// Opacity values for professional applications
export const OPACITY = {
  disabled: 0.5,        // Professional disabled state
  overlay: 0.75,        // Professional modal overlay
  subtle: 0.05,         // Very subtle background effects
  medium: 0.2,          // Medium transparency for professional look
  strong: 0.6,          // Strong transparency effects
  glass: 0.8,           // Glass effect opacity
} as const;

// Note: SHADOWS moved to spacing.ts to avoid conflicts