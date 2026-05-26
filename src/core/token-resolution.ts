// ========================================================================
// AUTO HANDOFF GENERATOR - TOKEN RESOLUTION
// ========================================================================
// Generic utilities for resolving Figma bound variable tokens from nodes.
// These functions are used by spacing.ts and other feature modules.

import {formatSpaceToken, formatDimensionToken, formatRadiusToken} from "../utils/helpers";
import {isStructuralInstance} from "./node-helpers";

// ========================================
// STROKE INFO INTERFACE
// ========================================

export interface StrokeInfo {
  value: number;
  side: "Top" | "Bottom" | "Left" | "Right" | "All";
  position: "Inside" | "Outside" | "Center";
  boundVars: Record<string, {id: string} | undefined>;
}

// ========================================
// GENERIC BOUND VARIABLE RESOLUTION
// ========================================

/**
 * Finds a bound variable token for any property on a node.
 */
export async function findBoundVariableToken(
  node: SceneNode,
  property: string,
  formatter: (name: string) => string = formatSpaceToken,
): Promise<string | null> {
  if (!("boundVariables" in node) || !node.boundVariables) return null;

  const boundVars = node.boundVariables as Record<string, {type?: string; id?: string} | undefined>;
  const binding = boundVars[property];

  if (!binding?.id) return null;

  const variable = await figma.variables.getVariableByIdAsync(binding.id);
  if (variable) return formatter(variable.name);

  return null;
}

// ========================================
// HEIGHT TOKEN
// ========================================

export async function findHeightToken(node: SceneNode): Promise<string | null> {
  return findBoundVariableToken(node, "height", formatDimensionToken);
}

// ========================================
// CORNER RADIUS
// ========================================

/**
 * Returns corner radius info from a node, or null if none.
 */
export function findCornerRadius(
  node: SceneNode,
): {value: number; isUniform: boolean} | null {
  if (!("cornerRadius" in node)) return null;

  const nodeWithRadius = node as SceneNode & {cornerRadius?: number | typeof figma.mixed};
  if (
    nodeWithRadius.cornerRadius !== undefined &&
    nodeWithRadius.cornerRadius !== figma.mixed &&
    nodeWithRadius.cornerRadius > 0
  ) {
    return {value: nodeWithRadius.cornerRadius, isUniform: true};
  }

  if ("topLeftRadius" in node) {
    const nodeWithRadii = node as SceneNode & {
      topLeftRadius: number;
      topRightRadius: number;
      bottomLeftRadius: number;
      bottomRightRadius: number;
    };
    const radii = [
      nodeWithRadii.topLeftRadius,
      nodeWithRadii.topRightRadius,
      nodeWithRadii.bottomLeftRadius,
      nodeWithRadii.bottomRightRadius,
    ];
    const nonZero = radii.filter((r) => r > 0);
    if (nonZero.length > 0) {
      return {value: Math.max(...nonZero), isUniform: false};
    }
  }

  return null;
}

export async function findCornerRadiusToken(node: SceneNode): Promise<string | null> {
  const radiusKeys = [
    "cornerRadius",
    "topLeftRadius",
    "topRightRadius",
    "bottomLeftRadius",
    "bottomRightRadius",
  ];

  for (const key of radiusKeys) {
    const token = await findBoundVariableToken(node, key, formatRadiusToken);
    if (token) return token;
  }

  return null;
}

/**
 * Recursively searches for corner radius info in a node and its children.
 * Skips non-structural instances.
 */
export async function findCornerRadiusRecursive(
  node: SceneNode,
): Promise<{value: number; isUniform: boolean; node: SceneNode} | null> {
  const radiusInfo = findCornerRadius(node);
  if (radiusInfo) return {...radiusInfo, node};

  if ("children" in node) {
    for (const child of node.children) {
      if (child.type === "INSTANCE") {
        const structural = await isStructuralInstance(child);
        if (!structural) continue;
      }
      const result = await findCornerRadiusRecursive(child);
      if (result) return result;
    }
  }

  return null;
}

/**
 * Recursively searches for the first corner radius token in a node and its children.
 * Skips non-structural instances.
 */
export async function findCornerRadiusTokenRecursive(node: SceneNode): Promise<string | null> {
  const token = await findCornerRadiusToken(node);
  if (token) return token;

  if ("children" in node) {
    for (const child of node.children) {
      if (child.type === "INSTANCE") {
        const structural = await isStructuralInstance(child);
        if (!structural) continue;
      }
      const result = await findCornerRadiusTokenRecursive(child);
      if (result) return result;
    }
  }

  return null;
}

// ========================================
// HEIGHT TOKEN (RECURSIVE)
// ========================================

/**
 * Recursively searches for ALL height tokens in a node and its children.
 * Skips non-structural instances.
 */
export async function findAllHeightTokensWithNodes(
  node: SceneNode,
): Promise<Array<{token: string; node: SceneNode}>> {
  const results: Array<{token: string; node: SceneNode}> = [];

  const token = await findHeightToken(node);
  if (token) results.push({token, node});

  if ("children" in node) {
    for (const child of node.children) {
      if (child.type === "INSTANCE") {
        const structural = await isStructuralInstance(child);
        if (!structural) continue;
      }
      const childResults = await findAllHeightTokensWithNodes(child);
      results.push(...childResults);
    }
  }

  return results;
}

// ========================================
// STROKE WEIGHT
// ========================================

export async function findStrokeWeight(node: SceneNode): Promise<StrokeInfo[] | null> {
  if (!("strokes" in node) || !Array.isArray(node.strokes)) return null;
  if (node.strokes.length === 0) return null;

  const results: StrokeInfo[] = [];
  const boundVars =
    "boundVariables" in node
      ? (node.boundVariables as Record<string, {id: string} | undefined>)
      : {};

  const strokeAlign =
    "strokeAlign" in node ? String(node.strokeAlign) : "CENTER";
  const position: "Inside" | "Outside" | "Center" =
    strokeAlign === "INSIDE"
      ? "Inside"
      : strokeAlign === "OUTSIDE"
        ? "Outside"
        : "Center";

  if ("strokeWeight" in node) {
    if (typeof node.strokeWeight === "number" && node.strokeWeight > 0) {
      results.push({value: node.strokeWeight, side: "All", position, boundVars});
    } else if (node.strokeWeight === figma.mixed) {
      const sides: Array<{key: string; side: "Top" | "Bottom" | "Left" | "Right"}> = [
        {key: "strokeTopWeight", side: "Top"},
        {key: "strokeBottomWeight", side: "Bottom"},
        {key: "strokeLeftWeight", side: "Left"},
        {key: "strokeRightWeight", side: "Right"},
      ];

      for (const {key, side} of sides) {
        if (key in node) {
          const value = (node as unknown as Record<string, unknown>)[key];
          if (typeof value === "number" && value > 0) {
            results.push({value, side, position, boundVars});
          }
        }
      }
    }
  }

  return results.length > 0 ? results : null;
}

// ========================================
// STROKE TOKEN RESOLUTION
// ========================================

/**
 * Resolves the border token for a stroke, handling both uniform and per-side weights.
 */
export async function resolveStrokeToken(stroke: StrokeInfo): Promise<string | null> {
  let varKey = stroke.side === "All" ? "strokeWeight" : `stroke${stroke.side}Weight`;

  if (stroke.side === "All" && !(varKey in stroke.boundVars) && "strokeTopWeight" in stroke.boundVars) {
    varKey = "strokeTopWeight";
  }

  const binding = stroke.boundVars[varKey];
  if (varKey in stroke.boundVars && binding?.id) {
    const variable = await figma.variables.getVariableByIdAsync(binding.id);
    if (variable) return formatSpaceToken(variable.name);
  }

  return null;
}
