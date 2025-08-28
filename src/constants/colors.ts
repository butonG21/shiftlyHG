// Enhanced Modern Color Palette for Shiftly App
// Based on the redesigned UI with comprehensive color system

export const COLORS = {
  // Primary brand colors - Main gradient theme
  primary: '#6366f1',           // Indigo-500 - Primary brand color
  primaryDark: '#4338ca',       // Indigo-600 - Darker variant
  secondary: '#8b5cf6',         // Violet-500 - Secondary brand color
  secondaryDark: '#7c3aed',     // Violet-600 - Darker secondary
  
  // Background system - Multi-layer approach
  background: {
    primary: '#667eea',         // Main background start
    secondary: '#f97316',       // Orange accent (buttons, highlights)
    surface: '#FFFFFF',         // Pure white surfaces
    card: 'rgba(255, 255, 255, 0.15)', // Glass morphism cards
    overlay: 'rgba(0, 0, 0, 0.6)',     // Modal overlays
  },
  
  // Text hierarchy system
  text: {
    primary: '#1f2937',         // Gray-800 - Primary text
    secondary: '#475569',       // Slate-600 - Secondary text
    light: '#9ca3af',          // Gray-400 - Light text
    white: '#FFFFFF',          // Pure white text
    muted: 'rgba(255, 255, 255, 0.8)', // Muted white text
    accent: '#8b5cf6',         // Accent text color
  },
  
  // Status and semantic colors
  status: {
    success: '#10b981',        // Emerald-500 - Success states
    warning: '#f59e0b',        // Amber-500 - Warning states  
    error: '#ef4444',          // Red-500 - Error states
    info: '#3b82f6',           // Blue-500 - Info states
  },
  
  // Gradient combinations from the design
  gradient: {
    primary: ['#6366f1', '#8b5cf6'],                    // Main brand gradient
    secondary: ['#8b5cf6', '#a855f7'],                  // Secondary gradient
    background: ['#667eea', '#764ba2', '#8b5cf6'],      // Main background gradient
    card: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)'], // Glass cards
    accent: ['#f97316', '#fbbf24'],                     // Button gradient
    purple: ['#a855f7', '#ec4899'],                     // Purple accent
    blue: ['#3b82f6', '#6366f1'],                       // Blue accent
  },
  
  // Glass morphism effects
  glass: {
    background: 'rgba(255, 255, 255, 0.12)',  // Glass background
    border: 'rgba(255, 255, 255, 0.2)',       // Glass borders
    shadow: 'rgba(0, 0, 0, 0.1)',             // Subtle shadows
  },
} as const;

// Opacity values for various use cases
export const OPACITY = {
  disabled: 0.6,        // Disabled state opacity
  overlay: 0.8,         // Modal overlay opacity
  subtle: 0.1,          // Subtle background effects
  medium: 0.3,          // Medium transparency
  strong: 0.7,          // Strong transparency effects
} as const;