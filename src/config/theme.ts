// ========================================================================
// AUTO HANDOFF GENERATOR - THEME & CONSTANTS
// ========================================================================

import type {AnnotationTheme} from "../types";

// Re-export domain constants for backwards compatibility
export {IGNORED_PROPERTIES, SIZE_ORDER, SEMANTIC_ROLES} from "./constants";

// ========================================
// THEME SYSTEM - Centralized annotation colors
// ========================================

export const THEME_NORMAL: AnnotationTheme = {
  gap: {r: 1, g: 0.2, b: 0.2},           // Red
  padding: {r: 0, g: 0.5, b: 1},          // Blue
  radius: {r: 1, g: 0.2, b: 0.2},         // Red
  border: {r: 0.6, g: 0.2, b: 0.6},       // Purple
  text: {r: 0.2, g: 0.6, b: 0.2},         // Green
  width: {r: 0.4, g: 0.4, b: 0.4},        // Gray
  height: {r: 0.85, g: 0.1, b: 0.1},      // Red
  effect: {r: 0.8, g: 0.5, b: 0.2},       // Orange
};

export const THEME_HIGHLIGHT: AnnotationTheme = {
  gap: {r: 255 / 255, g: 199 / 255, b: 203 / 255},      // #FFC7CB Light pink
  padding: {r: 98 / 255, g: 248 / 255, b: 79 / 255},    // #62F84F Bright green
  radius: {r: 255 / 255, g: 199 / 255, b: 203 / 255},   // #FFC7CB Light pink
  border: {r: 98 / 255, g: 248 / 255, b: 79 / 255},     // #62F84F Bright green
  text: {r: 98 / 255, g: 248 / 255, b: 79 / 255},       // #62F84F Bright green
  width: {r: 98 / 255, g: 248 / 255, b: 79 / 255},      // #62F84F Bright green
  height: {r: 98 / 255, g: 248 / 255, b: 79 / 255},     // #62F84F Bright green
  effect: {r: 255 / 255, g: 183 / 255, b: 77 / 255},    // #FFB74D Light orange
};

/**
 * Returns the annotation theme based on the mode.
 * @param highlightMode - If true, returns high contrast colors
 */
export function getTheme(highlightMode: boolean): AnnotationTheme {
  return highlightMode ? THEME_HIGHLIGHT : THEME_NORMAL;
}


// ========================================
// TYPOGRAPHY CONFIGURATION
// ========================================

/**
 * Fonte preferida do plugin (fallback: Inter → Roboto).
 * Para carregar e usar fontes, utilize loadPluginFonts() e getFont() em utils/fonts.
 */
export const FONT_FAMILY = "BancoDoBrasil Textos";

/** Text style preset type */
export type TextStylePreset =
  | "title"     // 32px Bold - Section titles
  | "subtitle"  // 24px Bold - Subtitles
  | "heading"   // 18px Medium - Headings
  | "body"      // 16px Regular - Body text
  | "bodyBold"  // 16px Bold - Bold body text
  | "small"     // 14px Regular - Secondary text
  | "label"     // 12px Regular - Labels
  | "caption";  // 10px Regular - Captions

/** Text style preset definitions */
export const TEXT_STYLE_PRESETS: Record<
  TextStylePreset,
  {
    fontSize: number;
    fontStyle: "Regular" | "Medium" | "Bold";
  }
> = {
  title: {fontSize: 32, fontStyle: "Bold"},
  subtitle: {fontSize: 24, fontStyle: "Bold"},
  heading: {fontSize: 18, fontStyle: "Medium"},
  body: {fontSize: 16, fontStyle: "Regular"},
  bodyBold: {fontSize: 16, fontStyle: "Bold"},
  small: {fontSize: 14, fontStyle: "Regular"},
  label: {fontSize: 12, fontStyle: "Regular"},
  caption: {fontSize: 10, fontStyle: "Regular"},
};

/** Default text colors */
export const TEXT_COLORS = {
  default: {r: 0, g: 0, b: 0} as RGB,
  secondary: {r: 0.4, g: 0.4, b: 0.4} as RGB,
  muted: {r: 0.6, g: 0.6, b: 0.6} as RGB,
  success: {r: 0.2, g: 0.6, b: 0.2} as RGB,
  error: {r: 0.85, g: 0.1, b: 0.1} as RGB,
  warning: {r: 0.8, g: 0.5, b: 0.2} as RGB,
  white: {r: 1, g: 1, b: 1} as RGB,
};

// ========================================
// LAYOUT CONSTANTS
// ========================================

/** Common layout values used across visualizations */
export const LAYOUT = {
  /** Margin around components in visualization frames */
  MARGIN: 100,
  /** Extended margin for dimension visualizations */
  MARGIN_EXTENDED: 120,
  /** Gap between grid items */
  GRID_GAP: 24,
  /** Padding inside cards */
  CARD_PADDING: 24,
  /** Standard line length for annotations */
  LINE_LENGTH: 30,
  /** Dot size for annotation pointers */
  DOT_SIZE: 8,
  /** Badge padding */
  BADGE_PADDING: 6,
  /** Connector length for dimension annotations */
  CONNECTOR_LENGTH: 8,
  /** Marker width for dimension annotations */
  MARKER_WIDTH: 8,
};

/** Background color for visualization frames (light mode) */
export const VIZ_BG_COLOR = {r: 0xFE / 255, g: 0xFE / 255, b: 0xFE / 255};

/** Background color for visualization frames (highlight mode) */
export const VIZ_BG_COLOR_HIGHLIGHT = {r: 56 / 255, g: 83 / 255, b: 255 / 255};
