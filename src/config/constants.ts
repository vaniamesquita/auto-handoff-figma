// ========================================================================
// AUTO HANDOFF GENERATOR - DOMAIN CONSTANTS
// ========================================================================
// Non-theme constants: property filters, ordering, semantic mappings

/** Properties to ignore when extracting variant data */
export const IGNORED_PROPERTIES = ["size", "icon"];

/** Size ordering for variant visualizations */
export const SIZE_ORDER: Record<string, number> = {
  "x-small": 1,
  xsmall: 1,
  small: 2,
  semiregular: 3,
  regular: 4,
  medium: 5,
  large: 6,
  "x-large": 7,
  xlarge: 7,
};

/** Semantic role mapping for node names */
export const SEMANTIC_ROLES: Record<string, string> = {
  label: "Label",
  hint: "Hint",
  placeholder: "Placeholder",
  icon: "Icon",
  border: "Border",
  background: "Background",
  input: "Input",
  container: "Container",
  text: "Text",
  error: "Error Message",
  helper: "Helper Text",
  description: "Description",
  initials: "Initials",
};
