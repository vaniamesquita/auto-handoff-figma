// ========================================================================
// AUTO HANDOFF GENERATOR - TYPE DEFINITIONS
// ========================================================================

// ========================================
// SPEC DATA INTERFACES
// ========================================

export interface ColorSpec {
  element: string;
  state: string;
  token: string | null;
  colorHex: string;
  colorVariableId: string | null;
  properties: string;
}

export interface TextSpec {
  element: string;
  state: string;
  token: string | null;
  fontFamily: string;
  fontWeight: string;
  fontSize: number;
  lineHeight: string;
  letterSpacing?: string;
  properties: string;
  nodeId: string;
}

export interface SpacingSpec {
  element: string;
  property: string;
  token: string | null;
  value: string;
  direction?: "H" | "V";
  properties: string;
  sourceNodeId: string;
}

export interface BorderSpec {
  element: string;
  token: string | null;
  value: string;
  properties: string;
  sourceNodeId: string;
  side?: "Top" | "Bottom" | "Left" | "Right" | "All";
  position?: "Inside" | "Outside" | "Center";
}

export interface EffectSpec {
  element: string;
  effectType: string;
  token: string | null;
  value: string;
  properties: string;
  sourceNodeId: string;
}

// ========================================
// COLLECTION INTERFACES
// ========================================

export interface VariantColors {
  variantName: string;
  properties: string;
  propertyMap: Record<string, string>;
  colors: ColorSpec[];
  textStyles: TextSpec[];
  spacings: SpacingSpec[];
  borders: BorderSpec[];
  effects: EffectSpec[];
  usedComponents: Map<string, string>;
}

export interface CollectedNodeData {
  colors: ColorSpec[];
  textStyles: TextSpec[];
  spacings: SpacingSpec[];
  borders: BorderSpec[];
  effects: EffectSpec[];
  usedComponents: Map<string, string>;
}

// ========================================
// CONFIGURATION INTERFACES
// ========================================

export interface VariantProperty {
  name: string;
  values: string[];
}

export interface GenerationOptions {
  // Sections
  sectionColors: boolean;
  sectionText: boolean;
  sectionSpacing: boolean;
  sectionEffects: boolean;
  sectionComponents: boolean;
  sectionEstados: boolean;
  sectionProperties: boolean;
  sectionRequirements: boolean;
  requirementsVizProperties: Record<string, string[]>;
  requirementsFramesPerRow: number;
  requirementsIncludeInstances: boolean;
  // Settings
  frameWidth: number;
  paddingHorizontal: number;
  sectionSpacingValue: number;
  bgColor: string;
  // Visualization mode
  highlightMode: boolean;
  // Variant property order for colors table
  variantPropertyOrder?: string[];
  // Visualization property filters (per section)
  colorVizProperties: Record<string, string[]>;
  textVizProperties: Record<string, string[]>;
  spacingVizProperties: Record<string, string[]>;
  effectsVizProperties: Record<string, string[]>;
  // Frames per row for visualizations
  textFramesPerRow: number;
  spacingFramesPerRow: number;
  effectsFramesPerRow: number;
  // Estados grid density
  gridDensity: number;
  // Estados visualization properties
  statesVizProperties?: Record<string, string[]>;
  statesVariantPropertyOrder?: string[];
  // Output type toggles (table/visualization)
  textShowTable: boolean;
  textShowViz: boolean;
  spacingShowTable: boolean;
  spacingShowViz: boolean;
  effectsShowTable: boolean;
  effectsShowViz: boolean;
}

// ========================================
// THEME INTERFACE
// ========================================

export interface AnnotationTheme {
  gap: RGB;
  padding: RGB;
  radius: RGB;
  border: RGB;
  text: RGB;
  width: RGB;
  height: RGB;
  effect: RGB;
}

// ========================================
// TABLE BUILDER INTERFACES
// ========================================

export interface TableColumnConfig {
  header: string;
  position: number;
  color?: string | RGB;
}

export interface TableCellData {
  text: string;
  color?: string | RGB;
  extraElements?: SceneNode[];
}

export interface TableCellConfig {
  text: string;
  x: number;
  color?: RGB;
}

export interface TableRowConfig {
  name: string;
  cells: TableCellConfig[];
  width: number;
  height?: number;
}

// ========================================
// ANNOTATION TRACKER INTERFACE
// ========================================

export interface AnnotationTracker {
  topPositions: number[];
  bottomPositions: number[];
  leftPositions: number[];
  rightPositions: number[];
  gapPositions: number[];
}

// ========================================
// TITLED VARIANT RESULT
// ========================================

export interface TitledVariantResult {
  outerFrame: FrameNode;
  vizFrame: FrameNode;
  instance: InstanceNode;
}

// ========================================
// ========================================
// FIGMA API EXTENSION TYPES
// These interfaces extend Figma's built-in types for properties
// that may not be present in the type definitions but exist at runtime
// ========================================

/**
 * Extended properties for FrameNode with individual stroke weights
 */
export interface IndividualStrokeWeights {
  strokeTopWeight?: number;
  strokeBottomWeight?: number;
  strokeLeftWeight?: number;
  strokeRightWeight?: number;
}

/**
 * Extended properties for FrameNode with individual padding
 */
export interface IndividualPadding {
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
}

/**
 * Extended properties for FrameNode with individual corner radii
 */
export interface IndividualCornerRadii {
  topLeftRadius?: number;
  topRightRadius?: number;
  bottomLeftRadius?: number;
  bottomRightRadius?: number;
}

/**
 * Extended TextNode with maxLines property (Figma API feature)
 * Note: maxLines is defined as number | null in Figma's types, but we use
 * type intersection to add the property without conflict
 */
export type TextNodeWithMaxLines = TextNode & {
  maxLines: number | null;
};

/**
 * Bound variable alias structure
 */
export interface VariableAliasBinding {
  type: "VARIABLE_ALIAS";
  id: string;
}

/**
 * BoundVariables record type for nodes
 */
export type BoundVariablesRecord = Record<string, VariableAliasBinding | VariableAliasBinding[] | undefined>;

// ========================================
// MARKER CONFIG (Live Editing)
// ========================================

export interface MarkerConfig {
  type: "measure" | "gap" | "padding" | "pointer-top" | "pointer-bottom" | "pointer-left" | "pointer-right" | "number-top" | "number-bottom" | "number-left" | "number-right" | "area-dashed-circle" | "area-dashed-square" | "area-solid-circle" | "area-solid-square" | "area-outline-circle" | "area-outline-square" | "dimension";
  direction?: "horizontal" | "vertical";
  value: string;
  colorType: "red" | "blue" | "pink" | "green" | "black" | "purple" | "orange";
  textColorType?: "red" | "blue" | "pink" | "green" | "black" | "inherit";
  badgePosition?: "top" | "bottom" | "left" | "right";
  highlightMode: boolean;
  size?: number;
}
