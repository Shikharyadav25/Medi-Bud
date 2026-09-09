/**
 * Apple Human Interface Guidelines (HIG) Design Tokens
 * Tailored for iOS / Mobile Health Applications
 * Follows System Grouped Background & San Francisco type scales.
 */

export const colors = {
  // Apple System Grouped Backgrounds (Light Mode)
  background: "#F2F2F7", // System Grouped Background
  surface: "#FFFFFF",    // Secondary Grouped Background (Cards/Surfaces)
  surfaceElevated: "#FFFFFF",
  surfaceSubtle: "#E5E5EA", // Tertiary Grouped Background

  // Separators & Borders (Retina 0.5px / 1px hairline)
  borderSubtle: "#E5E5EA",  // Apple Separator Color
  borderOpaque: "#C6C6C8",  // Apple Opaque Separator Color
  borderStrong: "#C6C6C8",  // Apple Strong Border Alias
  borderActive: "#000000",

  // Apple Dynamic Labels (San Francisco Text Hierarchy)
  textPrimary: "#000000",   // Primary Label (100% contrast)
  textSecondary: "#3C3C43", // Secondary Label (subtle dark gray, 60% opacity)
  textTertiary: "#6C6C70",  // Tertiary Label (captions, headers, 30% opacity)
  textMuted: "#8E8E93",     // Quaternary / Placeholder Label
  textInverse: "#FFFFFF",

  // Apple Interactive / Tint Colors
  primary: "#000000",       // Crisp High-Contrast Action Color
  tint: "#007AFF",          // Apple System Blue (Info / Links)
  tintSubtle: "#E5F1FF",

  // Apple Health Clinical Urgency Levels (Muted Tints with AAA Contrast)
  emergency: {
    text: "#D70015",        // Apple System Red
    bg: "#FFEEEE",
    border: "#FFB3B8",
  },
  soon: {
    text: "#C93400",        // Apple System Orange
    bg: "#FFF2EC",
    border: "#FFCCA8",
  },
  monitor: {
    text: "#B25000",        // Apple System Yellow/Amber
    bg: "#FFF8E6",
    border: "#FFE199",
  },
  selfCare: {
    text: "#248A3D",        // Apple System Green
    bg: "#E8F8ED",
    border: "#A1E8B4",
  },

  // Apple Sync & Connectivity Indicators
  syncStatus: {
    synced: "#248A3D",
    pending: "#C93400",
    error: "#D70015",
  },
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const radii = {
  xs: 6,
  sm: 8,
  md: 10,   // Standard Apple Control corner radius
  lg: 12,   // Standard Apple Inset Grouped Card radius
  xl: 16,   // Prominent Modal / Card radius
  full: 9999,
} as const;

/**
 * Standard Apple Human Interface Guidelines Typography Scale (Mobile)
 */
export const typography = {
  largeTitle: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "700" as const,
    letterSpacing: 0.37,
  },
  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700" as const,
    letterSpacing: 0.36,
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700" as const,
    letterSpacing: 0.35,
  },
  title3: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "600" as const,
    letterSpacing: 0.38,
  },
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600" as const,
    letterSpacing: -0.41,
  },
  body: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "400" as const,
    letterSpacing: -0.41,
  },
  callout: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "400" as const,
    letterSpacing: -0.32,
  },
  subheadline: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "400" as const,
    letterSpacing: -0.24,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400" as const,
    letterSpacing: -0.08,
  },
  caption1: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
  },
  caption2: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "400" as const,
    letterSpacing: 0.07,
  },
  // Legacy mappings for backwards compatibility
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700" as const,
    letterSpacing: 0.36,
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700" as const,
    letterSpacing: 0.35,
  },
  h3: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "600" as const,
    letterSpacing: 0.38,
  },
  bodyMedium: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600" as const,
    letterSpacing: -0.41,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "500" as const,
  },
} as const;

/**
 * Accessibility standards per Apple HIG:
 * Minimum touch target is 44x44pt on mobile.
 */
export const accessibility = {
  minTouchTarget: 44,
} as const;

export const theme = {
  colors,
  spacing,
  radii,
  typography,
  accessibility,
};

export type Theme = typeof theme;
