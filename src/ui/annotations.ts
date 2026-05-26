// ========================================================================
// AUTO HANDOFF GENERATOR - ANNOTATIONS
// ========================================================================

import type {AnnotationTracker} from "../types";
import {getTheme} from "../config/theme";
import {getFont} from "../utils/fonts";

// ========================================
// POSITION FINDING HELPERS
// ========================================

/**
 * Finds a free Y position for lateral annotations (right/left).
 * @param existingPositions - Already used Y positions
 * @param preferredY - Preferred Y position
 * @param minSpacing - Minimum spacing between positions
 * @returns Free Y position
 */
export function findFreeYPosition(
  existingPositions: number[],
  preferredY: number,
  minSpacing: number = 20,
): number {
  if (existingPositions.length === 0) return preferredY;

  // Sort existing positions
  const sorted = [...existingPositions].sort((a, b) => a - b);

  // Check if preferred position is free
  let collision = sorted.some((pos) => Math.abs(pos - preferredY) < minSpacing);
  if (!collision) return preferredY;

  // Find the closest free position (alternating above/below)
  let offset = minSpacing;
  for (let i = 0; i < 10; i++) {
    // Try below
    const belowY = preferredY + offset;
    collision = sorted.some((pos) => Math.abs(pos - belowY) < minSpacing);
    if (!collision) return belowY;

    // Try above
    const aboveY = preferredY - offset;
    collision = sorted.some((pos) => Math.abs(pos - aboveY) < minSpacing);
    if (!collision) return aboveY;

    offset += minSpacing;
  }
  return preferredY + offset; // Fallback
}

/**
 * Finds a free X position for top/bottom annotations.
 * @param existingPositions - Already used X positions
 * @param preferredX - Preferred X position
 * @param minSpacing - Minimum spacing between positions
 * @returns Free X position
 */
export function findFreeXPosition(
  existingPositions: number[],
  preferredX: number,
  minSpacing: number = 80,
): number {
  if (existingPositions.length === 0) return preferredX;

  const sorted = [...existingPositions].sort((a, b) => a - b);

  let collision = sorted.some((pos) => Math.abs(pos - preferredX) < minSpacing);
  if (!collision) return preferredX;

  let offset = minSpacing;
  for (let i = 0; i < 10; i++) {
    const rightX = preferredX + offset;
    collision = sorted.some((pos) => Math.abs(pos - rightX) < minSpacing);
    if (!collision) return rightX;

    const leftX = preferredX - offset;
    collision = sorted.some((pos) => Math.abs(pos - leftX) < minSpacing);
    if (!collision) return leftX;

    offset += minSpacing;
  }
  return preferredX + offset;
}

/**
 * Creates a new empty annotation tracker.
 */
export function createAnnotationTracker(): AnnotationTracker {
  return {
    topPositions: [],
    bottomPositions: [],
    leftPositions: [],
    rightPositions: [],
    gapPositions: [],
  };
}

// ========================================
// SIMPLE ANNOTATION (BASE)
// ========================================

/**
 * Creates a grouped annotation: dot + line + label.
 * @param container - Parent frame
 * @param startX - Start X position
 * @param startY - Start Y position
 * @param endX - End X position
 * @param endY - End Y position
 * @param label - Annotation label text
 * @param color - Annotation color
 */
export async function createSimpleAnnotation(
  container: FrameNode,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  label: string,
  color: RGB,
  markerType?: "gap" | "padding" | "pointer-top" | "pointer-bottom" | "pointer-left" | "pointer-right",
  colorType?: "red" | "blue" | "pink" | "green" | "purple" | "orange",
  highlightMode?: boolean,
  textColor?: RGB,
  fontSize?: number,
  fontWeight?: "Regular" | "Medium" | "Bold",
): Promise<void> {
  const DOT_SIZE = 8;

  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const isVertical = Math.abs(deltaY) >= Math.abs(deltaX);

  // Create resizable frame for the annotation
  const group = figma.createFrame();
  group.name = label;
  group.fills = [];
  group.clipsContent = false;

  // Create the dot (origin point)
  const dot = figma.createEllipse();
  dot.name = "Dot";
  dot.resize(DOT_SIZE, DOT_SIZE);
  dot.fills = [{type: "SOLID", color}];

  // Create connection line using rectangle (easier to apply constraints)
  const line = figma.createRectangle();
  line.name = "Line";
  line.fills = [{type: "SOLID", color}];

  // Create label text
  const text = figma.createText();
  text.name = "Label";
  text.fontName = getFont(fontWeight || "Medium");
  text.fontSize = fontSize || 10;
  text.characters = label;
  text.fills = [{type: "SOLID", color: textColor || color}];

  if (isVertical) {
    // Vertical annotation (up or down)
    const lineLength = Math.abs(deltaY);
    const goingDown = deltaY > 0;

    const frameHeight = DOT_SIZE + lineLength + text.height;

    group.layoutMode = "VERTICAL";
    group.primaryAxisSizingMode = "FIXED";
    group.counterAxisSizingMode = "AUTO";
    group.counterAxisAlignItems = "CENTER";
    group.itemSpacing = 0;
    group.resize(Math.max(DOT_SIZE, text.width), frameHeight);

    // Pointer sub-frame — FILL vertical
    const pointer = figma.createFrame();
    pointer.name = "Pointer";
    pointer.fills = [];
    pointer.clipsContent = false;
    pointer.layoutMode = "VERTICAL";
    pointer.primaryAxisSizingMode = "FIXED";
    pointer.counterAxisSizingMode = "AUTO";
    pointer.counterAxisAlignItems = "CENTER";
    pointer.itemSpacing = 0;

    line.resize(1, lineLength);

    if (goingDown) {
      pointer.appendChild(line);
      pointer.appendChild(dot);
      line.layoutSizingVertical = "FILL";
      group.appendChild(pointer);
      pointer.layoutSizingVertical = "FILL";
      text.textAlignHorizontal = "CENTER";
      group.appendChild(text);
    } else {
      text.textAlignHorizontal = "CENTER";
      group.appendChild(text);
      pointer.appendChild(dot);
      pointer.appendChild(line);
      line.layoutSizingVertical = "FILL";
      group.appendChild(pointer);
      pointer.layoutSizingVertical = "FILL";
    }

    // Position the group
    group.x = startX - group.width / 2;
    group.y = goingDown ? startY - DOT_SIZE / 2 : endY - text.height;
  } else {
    // Horizontal annotation (left or right)
    const lineLength = Math.abs(deltaX);
    const goingRight = deltaX > 0;
    const frameWidth = DOT_SIZE + lineLength + text.width;
    const frameHeight = Math.max(text.height, DOT_SIZE);

    group.layoutMode = "HORIZONTAL";
    group.primaryAxisSizingMode = "FIXED";
    group.counterAxisSizingMode = "AUTO";
    group.counterAxisAlignItems = "CENTER";
    group.itemSpacing = 0;
    group.resize(frameWidth, frameHeight);
    group.x = goingRight ? startX - DOT_SIZE / 2 : endX - text.width;
    group.y = startY - frameHeight / 2;

    // Pointer sub-frame — FILL horizontal
    const pointer = figma.createFrame();
    pointer.name = "Pointer";
    pointer.fills = [];
    pointer.clipsContent = false;
    pointer.layoutMode = "HORIZONTAL";
    pointer.primaryAxisSizingMode = "FIXED";
    pointer.counterAxisSizingMode = "AUTO";
    pointer.counterAxisAlignItems = "CENTER";
    pointer.itemSpacing = 0;

    line.resize(lineLength, 1);

    if (goingRight) {
      pointer.appendChild(line);
      pointer.appendChild(dot);
      line.layoutSizingHorizontal = "FILL";
      group.appendChild(pointer);
      pointer.layoutSizingHorizontal = "FILL";
      group.appendChild(text);
    } else {
      group.appendChild(text);
      pointer.appendChild(dot);
      pointer.appendChild(line);
      line.layoutSizingHorizontal = "FILL";
      group.appendChild(pointer);
      pointer.layoutSizingHorizontal = "FILL";
    }
  }

  // Add plugin data for live editing if marker type is provided
  if (markerType && colorType) {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const isVertical = Math.abs(deltaY) >= Math.abs(deltaX);
    const goingDown = deltaY > 0;
    const goingRight = deltaX > 0;

    let direction: "horizontal" | "vertical" | undefined;
    let badgePosition: "top" | "bottom" | "left" | "right" | undefined;
    let savedType: string = markerType;

    if (markerType === "gap" || markerType === "padding") {
      // These are visually pointers, so save as pointer type for live editing
      direction = isVertical ? "vertical" : "horizontal";
      if (isVertical) {
        badgePosition = goingDown ? "bottom" : "top";
        savedType = goingDown ? "pointer-bottom" : "pointer-top";
      } else {
        badgePosition = goingRight ? "right" : "left";
        savedType = goingRight ? "pointer-right" : "pointer-left";
      }
    } else {
      // pointer type
      if (markerType === "pointer-top") badgePosition = "top";
      else if (markerType === "pointer-bottom") badgePosition = "bottom";
      else if (markerType === "pointer-left") badgePosition = "left";
      else badgePosition = "right";
    }

    // Determine textColorType from textColor if provided
    let savedTextColorType: string | undefined;
    if (textColor) {
      // Map RGB to known color types
      if (textColor.r < 0.3 && textColor.g < 0.3 && textColor.b < 0.3) {
        savedTextColorType = "black";
      } else if (textColor.r > 0.8 && textColor.g > 0.8 && textColor.b > 0.8) {
        savedTextColorType = "inherit"; // white text in highlight mode, keep marker color
      }
    }

    const markerConfig: Record<string, unknown> = {
      type: savedType,
      direction,
      value: label,
      colorType,
      badgePosition,
      highlightMode: highlightMode || false,
    };
    if (savedTextColorType) {
      markerConfig.textColorType = savedTextColorType;
    }
    group.setPluginData("markerConfig", JSON.stringify(markerConfig));
  }

  // Add group to container
  container.appendChild(group);
}

// ========================================
// GAP ANNOTATION
// ========================================

/**
 * Creates a GAP annotation with rectangle as padding.
 */
export async function annotateGapNew(
  container: FrameNode,
  node: FrameNode | InstanceNode,
  gapValue: number,
  direction: "H" | "V",
  nodeX: number,
  nodeY: number,
  token: string | null = null,
  childIndex: number = 0,
  highlightMode: boolean = false,
  tracker?: AnnotationTracker,
): Promise<void> {
  if (!node.children || node.children.length < 2) {
    return;
  }
  if (childIndex >= node.children.length - 1) {
    return;
  }

  const isHorizontal = direction === "H";
  const currentChild = node.children[childIndex] as SceneNode & {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  const label = token ? token : `${gapValue}px`;
  const color = getTheme(highlightMode).gap;
  const LINE_OFFSET = 40;

  let rectX: number, rectY: number, rectW: number, rectH: number;
  let startX: number, startY: number, endX: number, endY: number;

  if (isHorizontal) {
    // Horizontal gap - annotation goes up or down
    rectX = nodeX + currentChild.x + currentChild.width;
    rectY = nodeY + currentChild.y;
    rectW = gapValue;
    rectH = currentChild.height;

    const preferredX = rectX + rectW / 2;
    // Alternate between top and bottom for horizontal gaps
    const useTop = tracker ? tracker.gapPositions.length % 2 === 0 : true;

    if (useTop) {
      startX = preferredX;
      startY = rectY;
      endX = preferredX;
      endY = rectY - LINE_OFFSET;
    } else {
      startX = preferredX;
      startY = rectY + rectH;
      endX = preferredX;
      endY = rectY + rectH + LINE_OFFSET;
    }

    if (tracker) tracker.gapPositions.push(preferredX);
  } else {
    // Vertical gap - annotation goes right or left
    rectX = nodeX + currentChild.x;
    rectY = nodeY + currentChild.y + currentChild.height;
    rectW = currentChild.width;
    rectH = gapValue;

    const preferredY = rectY + rectH / 2;
    // Alternate between right and left for vertical gaps
    const useRight = tracker ? tracker.gapPositions.length % 2 === 0 : true;

    if (useRight) {
      startX = rectX + rectW;
      startY = preferredY;
      endX = rectX + rectW + LINE_OFFSET;
      endY = preferredY;
    } else {
      startX = rectX;
      startY = preferredY;
      endX = rectX - LINE_OFFSET;
      endY = preferredY;
    }

    if (tracker) tracker.gapPositions.push(preferredY);
  }

  // Create semi-transparent rectangle for the gap
  const rect = figma.createRectangle();
  rect.name = `Gap - ${label}`;
  rect.x = rectX;
  rect.y = rectY;
  rect.resize(Math.max(rectW, 2), Math.max(rectH, 2));
  rect.fills = [{type: "SOLID", color, opacity: 0.15}];
  rect.strokes = [{type: "SOLID", color, opacity: 0.5}];
  rect.strokeWeight = 1;
  rect.dashPattern = [3, 3];
  container.appendChild(rect);

  await createSimpleAnnotation(
    container,
    startX,
    startY,
    endX,
    endY,
    label,
    color,
    "gap",
    "red",
    highlightMode,
  );
}

// ========================================
// PADDING ANNOTATION
// ========================================

/**
 * Creates a PADDING annotation.
 */
export async function annotatePaddingNew(
  container: FrameNode,
  paddingValue: number,
  side: "top" | "bottom" | "left" | "right",
  nodeX: number,
  nodeY: number,
  nodeW: number,
  nodeH: number,
  token: string | null = null,
  highlightMode: boolean = false,
  tracker?: AnnotationTracker,
): Promise<void> {
  const label = token ? token : `${paddingValue}px`;
  const color = getTheme(highlightMode).padding;
  const LINE_OFFSET = 50;

  let startX: number, startY: number, endX: number, endY: number;
  let rectX: number, rectY: number, rectW: number, rectH: number;

  switch (side) {
    case "top": {
      rectX = nodeX;
      rectY = nodeY;
      rectW = nodeW;
      rectH = paddingValue;
      const preferredX = nodeX + nodeW / 2;
      const freeX = tracker
        ? findFreeXPosition(tracker.topPositions, preferredX, 100)
        : preferredX;
      if (tracker) tracker.topPositions.push(freeX);
      startX = freeX;
      startY = nodeY;
      endX = freeX;
      endY = nodeY - LINE_OFFSET;
      break;
    }
    case "bottom": {
      rectX = nodeX;
      rectY = nodeY + nodeH - paddingValue;
      rectW = nodeW;
      rectH = paddingValue;
      const preferredX = nodeX + nodeW / 2;
      const freeX = tracker
        ? findFreeXPosition(tracker.bottomPositions, preferredX, 100)
        : preferredX;
      if (tracker) tracker.bottomPositions.push(freeX);
      startX = freeX;
      startY = nodeY + nodeH;
      endX = freeX;
      endY = nodeY + nodeH + LINE_OFFSET;
      break;
    }
    case "left": {
      rectX = nodeX;
      rectY = nodeY;
      rectW = paddingValue;
      rectH = nodeH;
      const preferredY = nodeY + nodeH / 2;
      const freeY = tracker
        ? findFreeYPosition(tracker.leftPositions, preferredY, 25)
        : preferredY;
      if (tracker) tracker.leftPositions.push(freeY);
      startX = nodeX;
      startY = freeY;
      endX = nodeX - LINE_OFFSET;
      endY = freeY;
      break;
    }
    case "right": {
      rectX = nodeX + nodeW - paddingValue;
      rectY = nodeY;
      rectW = paddingValue;
      rectH = nodeH;
      const preferredY = nodeY + nodeH / 2;
      const freeY = tracker
        ? findFreeYPosition(tracker.rightPositions, preferredY, 25)
        : preferredY;
      if (tracker) tracker.rightPositions.push(freeY);
      startX = nodeX + nodeW;
      startY = freeY;
      endX = nodeX + nodeW + LINE_OFFSET;
      endY = freeY;
      break;
    }
  }

  const rect = figma.createRectangle();
  rect.name = `Padding - ${label}`;
  rect.x = rectX;
  rect.y = rectY;
  rect.resize(Math.max(rectW, 1), Math.max(rectH, 1));
  rect.fills = [{type: "SOLID", color, opacity: 0.15}];
  rect.strokes = [{type: "SOLID", color, opacity: 0.5}];
  rect.strokeWeight = 1;
  rect.dashPattern = [3, 3];
  container.appendChild(rect);

  await createSimpleAnnotation(
    container,
    startX,
    startY,
    endX,
    endY,
    label,
    color,
    "padding",
    "blue",
    highlightMode,
  );
}

// ========================================
// RADIUS ANNOTATION
// ========================================

/**
 * Creates a BORDER RADIUS annotation.
 */
export async function annotateRadiusNew(
  container: FrameNode,
  radius: number,
  nodeX: number,
  nodeY: number,
  _nodeW: number,
  _nodeH: number,
  token: string | null = null,
  highlightMode: boolean = false,
): Promise<void> {
  const label = token ? token : `${radius}px`;
  const color = getTheme(highlightMode).radius;

  // Create dashed circle at top left corner
  // The circle visually represents the border radius
  const circleSize = Math.max(20, Math.min(radius * 2, 32));
  const circle = figma.createEllipse();
  // Position circle centered at the corner
  circle.x = nodeX - circleSize / 4;
  circle.y = nodeY - circleSize / 4;
  circle.resize(circleSize, circleSize);
  circle.fills = [];
  circle.strokes = [{type: "SOLID", color}];
  circle.strokeWeight = 1.5;
  circle.dashPattern = [4, 4]; // Dashed line
  container.appendChild(circle);

  // Pointer usando o sistema padronizado de anotações
  const LINE_LENGTH = 30;

  // O pointer toca exatamente o canto do nó (onde está o círculo)
  // Start = bolinha (toca o canto), End = texto (acima)
  const startX = nodeX;
  const startY = nodeY;
  const endX = nodeX;
  const endY = nodeY - LINE_LENGTH;

  // Chamada padronizada com suporte a Live Editing
  await createSimpleAnnotation(
    container,
    startX,
    startY,
    endX,
    endY,
    label,
    color,
    "pointer-top",    // Texto em cima, bolinha embaixo tocando o canto
    "red",            // ColorType: Radius usa 'red' (ver theme.ts THEME_NORMAL.radius)
    highlightMode,
  );
}

// ========================================
// BORDER ANNOTATION
// ========================================

/**
 * Creates a BORDER WEIGHT annotation (position based on border side).
 */
export async function annotateBorderNew(
  container: FrameNode,
  strokeWeight: number,
  nodeX: number,
  nodeY: number,
  nodeW: number,
  nodeH: number,
  token: string | null = null,
  highlightMode: boolean = false,
  side: "Top" | "Bottom" | "Left" | "Right" | "All" = "All",
  position: "Inside" | "Outside" | "Center" = "Center",
): Promise<void> {
  // Include border position in label if available
  const positionSuffix = position !== "Center" ? ` (${position})` : "";
  const label = token
    ? `${token}${positionSuffix}`
    : `${strokeWeight}px${positionSuffix}`;

  const color = getTheme(highlightMode).border;

  const borderLine = figma.createLine();
  borderLine.strokes = [{type: "SOLID", color}];
  borderLine.strokeWeight = 2;
  borderLine.dashPattern = [4, 4];

  let startX: number, startY: number, endX: number, endY: number;

  // Position dashed line and annotation based on border side
  if (side === "Top") {
    // Line at top
    borderLine.x = nodeX;
    borderLine.y = nodeY;
    borderLine.resize(nodeW, 0);
    container.appendChild(borderLine);

    // Annotation above component
    startX = nodeX + nodeW / 2;
    startY = nodeY;
    endX = startX;
    endY = nodeY - 35;
  } else if (side === "Bottom" || side === "All") {
    // Line at bottom (default for "All")
    borderLine.x = nodeX;
    borderLine.y = nodeY + nodeH;
    borderLine.resize(nodeW, 0);
    container.appendChild(borderLine);

    // Annotation below component
    startX = nodeX + nodeW / 2;
    startY = nodeY + nodeH;
    endX = startX;
    endY = nodeY + nodeH + 35;
  } else if (side === "Left") {
    // Vertical line on left side
    borderLine.x = nodeX;
    borderLine.y = nodeY;
    borderLine.rotation = -90;
    borderLine.resize(nodeH, 0);
    container.appendChild(borderLine);

    // Annotation to the left of component
    startX = nodeX;
    startY = nodeY + nodeH / 2;
    endX = nodeX - 50;
    endY = startY;
  } else if (side === "Right") {
    // Vertical line on right side
    borderLine.x = nodeX + nodeW;
    borderLine.y = nodeY;
    borderLine.rotation = -90;
    borderLine.resize(nodeH, 0);
    container.appendChild(borderLine);

    // Annotation to the right of component
    startX = nodeX + nodeW;
    startY = nodeY + nodeH / 2;
    endX = nodeX + nodeW + 50;
    endY = startY;
  } else {
    // Fallback: bottom
    borderLine.x = nodeX;
    borderLine.y = nodeY + nodeH;
    borderLine.resize(nodeW, 0);
    container.appendChild(borderLine);

    startX = nodeX + nodeW / 2;
    startY = nodeY + nodeH;
    endX = startX;
    endY = nodeY + nodeH + 35;
  }

  // Determine markerType from side
  let borderMarkerType: "pointer-top" | "pointer-bottom" | "pointer-left" | "pointer-right";
  if (side === "Top") borderMarkerType = "pointer-top";
  else if (side === "Left") borderMarkerType = "pointer-left";
  else if (side === "Right") borderMarkerType = "pointer-right";
  else borderMarkerType = "pointer-bottom";

  await createSimpleAnnotation(
    container,
    startX,
    startY,
    endX,
    endY,
    label,
    color,
    borderMarkerType,
    "purple",
    highlightMode,
  );
}

// ========================================
// DIMENSION ANNOTATION
// ========================================

/**
 * Creates a DIMENSION annotation (width/height with token).
 */
export async function annotateDimensionNew(
  container: FrameNode,
  dimension: "width" | "height",
  value: number,
  nodeX: number,
  nodeY: number,
  nodeW: number,
  nodeH: number,
  token: string | null = null,
  highlightMode: boolean = false,
): Promise<void> {
  const label = token ? token : `${value}px`;
  const theme = getTheme(highlightMode);
  const color = dimension === "width" ? theme.width : theme.height;

  if (dimension === "width") {
    // Create grouped frame for width marker (resizable)
    const lineY = nodeY + nodeH + 15;
    const MARKER_HEIGHT = 8;

    // Create label text first to calculate dimensions
    const text = figma.createText();
    text.name = "Label";
    text.fontName = getFont("Medium");
    text.fontSize = 12;
    text.characters = label;
    text.fills = [{type: "SOLID", color}];

    // Calculate grouped frame dimensions
    const labelGap = 4;
    const frameWidth = nodeW;
    const frameHeight = MARKER_HEIGHT + labelGap + text.height;

    // Create grouped frame
    const widthFrame = figma.createFrame();
    widthFrame.name = label;
    widthFrame.fills = [];
    widthFrame.clipsContent = false;
    widthFrame.resize(frameWidth, frameHeight);
    widthFrame.x = nodeX;
    widthFrame.y = lineY - MARKER_HEIGHT / 2;

    // Horizontal line
    const line = figma.createRectangle();
    line.name = "Horizontal Line";
    line.x = 0;
    line.y = MARKER_HEIGHT / 2 - 0.5;
    line.resize(frameWidth, 1);
    line.fills = [{type: "SOLID", color}];
    line.strokes = [];
    line.constraints = {horizontal: "STRETCH", vertical: "MIN"};

    // Left marker
    const leftMarker = figma.createRectangle();
    leftMarker.name = "Left Marker";
    leftMarker.x = -0.5;
    leftMarker.y = 0;
    leftMarker.resize(1, MARKER_HEIGHT);
    leftMarker.fills = [{type: "SOLID", color}];
    leftMarker.strokes = [];
    leftMarker.constraints = {horizontal: "MIN", vertical: "MIN"};

    // Right marker
    const rightMarker = figma.createRectangle();
    rightMarker.name = "Right Marker";
    rightMarker.x = frameWidth - 0.5;
    rightMarker.y = 0;
    rightMarker.resize(1, MARKER_HEIGHT);
    rightMarker.fills = [{type: "SOLID", color}];
    rightMarker.strokes = [];
    rightMarker.constraints = {horizontal: "MAX", vertical: "MIN"};

    // Centered label
    text.x = frameWidth / 2 - text.width / 2;
    text.y = MARKER_HEIGHT + labelGap;
    text.constraints = {horizontal: "CENTER", vertical: "MAX"};

    // Add elements to frame
    widthFrame.appendChild(line);
    widthFrame.appendChild(leftMarker);
    widthFrame.appendChild(rightMarker);
    widthFrame.appendChild(text);

    // Add plugin data for live editing
    const markerConfig = {
      type: "dimension",
      direction: "horizontal",
      value: label,
      colorType: "red",
      badgePosition: "bottom",
      highlightMode: highlightMode,
    };
    widthFrame.setPluginData("markerConfig", JSON.stringify(markerConfig));

    container.appendChild(widthFrame);
  } else {
    // Create grouped frame for height marker (resizable)
    const lineX = nodeX + nodeW + 15;
    const MARKER_WIDTH = 8;

    // Create label text first to calculate dimensions
    const text = figma.createText();
    text.name = "Label";
    text.fontName = getFont("Bold");
    text.fontSize = 11;
    text.characters = label;
    const textColor = highlightMode
      ? {r: 0, g: 0, b: 0} // Black
      : {r: 1, g: 1, b: 1}; // White
    text.fills = [{type: "SOLID", color: textColor}];

    // Create badge
    const badgePaddingH = 4;
    const badgeWidth = text.width + badgePaddingH * 2;
    const badgeHeight = 16; // Fixed 16px height

    // Calculate grouped frame dimensions
    const connectorLength = 8;
    const frameWidth = MARKER_WIDTH + connectorLength + badgeWidth;
    const frameHeight = nodeH;

    // Create grouped frame
    const heightFrame = figma.createFrame();
    heightFrame.name = label;
    heightFrame.fills = [];
    heightFrame.clipsContent = false;
    heightFrame.resize(frameWidth, frameHeight);
    heightFrame.x = lineX - MARKER_WIDTH / 2;
    heightFrame.y = nodeY;

    // Vertical line (centered on MARKER_WIDTH)
    const line = figma.createRectangle();
    line.name = "Vertical Line";
    line.x = MARKER_WIDTH / 2 - 0.5;
    line.y = 0;
    line.resize(1, frameHeight);
    line.fills = [{type: "SOLID", color}];
    line.strokes = [];
    line.constraints = {horizontal: "MIN", vertical: "STRETCH"};

    // Top marker
    const topMarker = figma.createRectangle();
    topMarker.name = "Top Marker";
    topMarker.x = 0;
    topMarker.y = -0.5;
    topMarker.resize(MARKER_WIDTH, 1);
    topMarker.fills = [{type: "SOLID", color}];
    topMarker.strokes = [];
    topMarker.constraints = {horizontal: "MIN", vertical: "MIN"};

    // Bottom marker
    const bottomMarker = figma.createRectangle();
    bottomMarker.name = "Bottom Marker";
    bottomMarker.x = 0;
    bottomMarker.y = frameHeight - 0.5;
    bottomMarker.resize(MARKER_WIDTH, 1);
    bottomMarker.fills = [{type: "SOLID", color}];
    bottomMarker.strokes = [];
    bottomMarker.constraints = {horizontal: "MIN", vertical: "MAX"};

    // Horizontal connector line
    const connector = figma.createRectangle();
    connector.name = "Connector";
    connector.x = MARKER_WIDTH / 2;
    connector.y = frameHeight / 2 - 0.5;
    connector.resize(connectorLength, 1);
    connector.fills = [{type: "SOLID", color}];
    connector.strokes = [];
    connector.constraints = {horizontal: "MIN", vertical: "CENTER"};

    // Badge with label
    const badge = figma.createFrame();
    badge.name = "Badge";
    badge.fills = [{type: "SOLID", color}];
    badge.cornerRadius = 4;
    badge.resize(badgeWidth, badgeHeight);
    badge.x = MARKER_WIDTH / 2 + connectorLength;
    badge.y = frameHeight / 2 - badgeHeight / 2;
    badge.constraints = {horizontal: "MAX", vertical: "CENTER"};

    text.x = badgePaddingH;
    text.y = (badgeHeight - text.height) / 2;
    badge.appendChild(text);

    // Add elements to frame
    heightFrame.appendChild(line);
    heightFrame.appendChild(topMarker);
    heightFrame.appendChild(bottomMarker);
    heightFrame.appendChild(connector);
    heightFrame.appendChild(badge);

    // Add plugin data for live editing
    const markerConfig = {
      type: "dimension",
      direction: "vertical",
      value: label,
      colorType: "red",
      badgePosition: "right",
      highlightMode: highlightMode,
    };
    heightFrame.setPluginData("markerConfig", JSON.stringify(markerConfig));

    container.appendChild(heightFrame);
  }
}

/**
 * Annotates dimension with smart side selection (for structural components)
 */
export async function annotateDimensionNewSmart(
  container: FrameNode,
  _dimension: "width" | "height",
  value: number,
  nodeX: number,
  nodeY: number,
  nodeW: number,
  nodeH: number,
  token: string | null = null,
  highlightMode: boolean = false,
  side: "right" | "left" | "bottom" | "top" = "right",
  tracker?: AnnotationTracker,
): Promise<void> {
  const label = token ? token : `${value}px`;
  const theme = getTheme(highlightMode);
  const color = theme.height; // Always use height color for structural components

  const MARKER_WIDTH = 8;
  const text = figma.createText();
  text.name = "Label";
  text.fontName = getFont("Bold");
  text.fontSize = 11;
  text.characters = label;
  const textColor = highlightMode
    ? {r: 0, g: 0, b: 0} // Black
    : {r: 1, g: 1, b: 1}; // White
  text.fills = [{type: "SOLID", color: textColor}];

  const badgePaddingH = 4; // Horizontal padding
  const badgeWidth = text.width + badgePaddingH * 2;
  const badgeHeight = 16; // Fixed 16px height
  const connectorLength = 8;

  if (side === "bottom") {
    // Horizontal annotation below the component
    const lineY = nodeY + nodeH + 15;
    const MARKER_HEIGHT = 8;
    const frameWidth = nodeW;
    const frameHeight = MARKER_HEIGHT + connectorLength + badgeHeight;

    // Use tracker to find free X position
    const preferredX = nodeX + nodeW / 2;
    let freeX = preferredX;
    if (tracker) {
      freeX = findFreeXPosition(tracker.bottomPositions, preferredX, Math.max(badgeWidth + 10, 80));
      tracker.bottomPositions.push(freeX);
    }

    const heightFrame = figma.createFrame();
    heightFrame.name = label;
    heightFrame.fills = [];
    heightFrame.clipsContent = false;
    heightFrame.resize(frameWidth, frameHeight);
    heightFrame.x = nodeX;
    heightFrame.y = lineY - MARKER_HEIGHT / 2;

    // Horizontal line
    const line = figma.createRectangle();
    line.name = "Horizontal Line";
    line.x = 0;
    line.y = MARKER_HEIGHT / 2 - 0.5;
    line.resize(frameWidth, 1);
    line.fills = [{type: "SOLID", color}];
    line.strokes = [];

    // Left marker
    const leftMarker = figma.createRectangle();
    leftMarker.name = "Left Marker";
    leftMarker.x = -0.5;
    leftMarker.y = 0;
    leftMarker.resize(1, MARKER_HEIGHT);
    leftMarker.fills = [{type: "SOLID", color}];
    leftMarker.strokes = [];

    // Right marker
    const rightMarker = figma.createRectangle();
    rightMarker.name = "Right Marker";
    rightMarker.x = frameWidth - 0.5;
    rightMarker.y = 0;
    rightMarker.resize(1, MARKER_HEIGHT);
    rightMarker.fills = [{type: "SOLID", color}];
    rightMarker.strokes = [];

    // Vertical connector (position adjusted by tracker)
    const connectorX = tracker ? (freeX - nodeX) - 0.5 : frameWidth / 2 - 0.5;
    const connector = figma.createRectangle();
    connector.name = "Connector";
    connector.x = connectorX;
    connector.y = MARKER_HEIGHT / 2;
    connector.resize(1, connectorLength);
    connector.fills = [{type: "SOLID", color}];
    connector.strokes = [];

    // Badge (position adjusted by tracker)
    const badgeX = tracker ? (freeX - nodeX) - badgeWidth / 2 : frameWidth / 2 - badgeWidth / 2;
    const badge = figma.createFrame();
    badge.name = "Badge";
    badge.fills = [{type: "SOLID", color}];
    badge.cornerRadius = 4;
    badge.resize(badgeWidth, badgeHeight);
    badge.x = badgeX;
    badge.y = MARKER_HEIGHT / 2 + connectorLength;

    text.x = badgePaddingH;
    text.y = (badgeHeight - text.height) / 2;
    badge.appendChild(text);

    heightFrame.appendChild(line);
    heightFrame.appendChild(leftMarker);
    heightFrame.appendChild(rightMarker);
    heightFrame.appendChild(connector);
    heightFrame.appendChild(badge);

    // Add plugin data for live editing
    const markerConfig = {
      type: "dimension",
      direction: "horizontal",
      value: label,
      colorType: "red",
      badgePosition: "bottom",
      highlightMode: highlightMode,
    };
    heightFrame.setPluginData("markerConfig", JSON.stringify(markerConfig));

    container.appendChild(heightFrame);
  } else if (side === "top") {
    // Horizontal annotation above the component
    const lineY = nodeY - 15;
    const MARKER_HEIGHT = 8;
    const frameWidth = nodeW;
    const frameHeight = MARKER_HEIGHT + connectorLength + badgeHeight;

    // Use tracker to find free X position
    const preferredX = nodeX + nodeW / 2;
    let freeX = preferredX;
    if (tracker) {
      freeX = findFreeXPosition(tracker.topPositions, preferredX, Math.max(badgeWidth + 10, 80));
      tracker.topPositions.push(freeX);
    }

    const heightFrame = figma.createFrame();
    heightFrame.name = label;
    heightFrame.fills = [];
    heightFrame.clipsContent = false;
    heightFrame.resize(frameWidth, frameHeight);
    heightFrame.x = nodeX;
    heightFrame.y = lineY - frameHeight + MARKER_HEIGHT / 2;

    // Horizontal line
    const line = figma.createRectangle();
    line.name = "Horizontal Line";
    line.x = 0;
    line.y = frameHeight - MARKER_HEIGHT / 2 - 0.5;
    line.resize(frameWidth, 1);
    line.fills = [{type: "SOLID", color}];
    line.strokes = [];

    // Left marker
    const leftMarker = figma.createRectangle();
    leftMarker.name = "Left Marker";
    leftMarker.x = -0.5;
    leftMarker.y = frameHeight - MARKER_HEIGHT;
    leftMarker.resize(1, MARKER_HEIGHT);
    leftMarker.fills = [{type: "SOLID", color}];
    leftMarker.strokes = [];

    // Right marker
    const rightMarker = figma.createRectangle();
    rightMarker.name = "Right Marker";
    rightMarker.x = frameWidth - 0.5;
    rightMarker.y = frameHeight - MARKER_HEIGHT;
    rightMarker.resize(1, MARKER_HEIGHT);
    rightMarker.fills = [{type: "SOLID", color}];
    rightMarker.strokes = [];

    // Vertical connector (position adjusted by tracker)
    const connectorX = tracker ? (freeX - nodeX) - 0.5 : frameWidth / 2 - 0.5;
    const connector = figma.createRectangle();
    connector.name = "Connector";
    connector.x = connectorX;
    connector.y = 0;
    connector.resize(1, frameHeight - MARKER_HEIGHT / 2 - connectorLength);
    connector.fills = [{type: "SOLID", color}];
    connector.strokes = [];

    // Badge (position adjusted by tracker)
    const badgeX = tracker ? (freeX - nodeX) - badgeWidth / 2 : frameWidth / 2 - badgeWidth / 2;
    const badge = figma.createFrame();
    badge.name = "Badge";
    badge.fills = [{type: "SOLID", color}];
    badge.cornerRadius = 4;
    badge.resize(badgeWidth, badgeHeight);
    badge.x = badgeX;
    badge.y = 0;

    text.x = badgePaddingH;
    text.y = (badgeHeight - text.height) / 2;
    badge.appendChild(text);

    heightFrame.appendChild(line);
    heightFrame.appendChild(leftMarker);
    heightFrame.appendChild(rightMarker);
    heightFrame.appendChild(connector);
    heightFrame.appendChild(badge);

    // Add plugin data for live editing
    const markerConfig = {
      type: "dimension",
      direction: "horizontal",
      value: label,
      colorType: "red",
      badgePosition: "top",
      highlightMode: highlightMode,
    };
    heightFrame.setPluginData("markerConfig", JSON.stringify(markerConfig));

    container.appendChild(heightFrame);
  } else {
    // Vertical annotation (right or left)
    const lineX = side === "right" ? nodeX + nodeW + 15 : nodeX - 15;
    const frameWidth = MARKER_WIDTH + connectorLength + badgeWidth;
    const frameHeight = nodeH;

    // Use tracker to find free Y position
    const preferredY = nodeY + nodeH / 2;
    let freeY = preferredY;
    if (tracker) {
      const positions = side === "right" ? tracker.rightPositions : tracker.leftPositions;
      freeY = findFreeYPosition(positions, preferredY, Math.max(badgeHeight + 10, 40));
      positions.push(freeY);
    }

    const heightFrame = figma.createFrame();
    heightFrame.name = label;
    heightFrame.fills = [];
    heightFrame.clipsContent = false;
    heightFrame.resize(frameWidth, frameHeight);
    heightFrame.x = side === "right" ? lineX - MARKER_WIDTH / 2 : lineX - frameWidth + MARKER_WIDTH / 2;
    heightFrame.y = nodeY;

    // Vertical line - STRETCH verticalmente
    const lineXPos = side === "right" ? MARKER_WIDTH / 2 - 0.5 : frameWidth - MARKER_WIDTH / 2 - 0.5;
    const line = figma.createRectangle();
    line.name = "Vertical Line";
    line.x = lineXPos;
    line.y = 0;
    line.resize(1, frameHeight);
    line.fills = [{type: "SOLID", color}];
    line.strokes = [];
    line.constraints = {horizontal: side === "right" ? "MIN" : "MAX", vertical: "STRETCH"};

    // Top marker - fixo no topo
    const topMarker = figma.createRectangle();
    topMarker.name = "Top Marker";
    topMarker.x = side === "right" ? 0 : frameWidth - MARKER_WIDTH;
    topMarker.y = -0.5;
    topMarker.resize(MARKER_WIDTH, 1);
    topMarker.fills = [{type: "SOLID", color}];
    topMarker.strokes = [];
    topMarker.constraints = {horizontal: side === "right" ? "MIN" : "MAX", vertical: "MIN"};

    // Bottom marker - fixo no fundo
    const bottomMarker = figma.createRectangle();
    bottomMarker.name = "Bottom Marker";
    bottomMarker.x = side === "right" ? 0 : frameWidth - MARKER_WIDTH;
    bottomMarker.y = frameHeight - 0.5;
    bottomMarker.resize(MARKER_WIDTH, 1);
    bottomMarker.fills = [{type: "SOLID", color}];
    bottomMarker.strokes = [];
    bottomMarker.constraints = {horizontal: side === "right" ? "MIN" : "MAX", vertical: "MAX"};

    // Horizontal connector - centralizado verticalmente
    const connectorY = tracker ? (freeY - nodeY) - 0.5 : frameHeight / 2 - 0.5;
    const connectorX = side === "right" ? MARKER_WIDTH / 2 : frameWidth - MARKER_WIDTH / 2 - connectorLength;
    const connector = figma.createRectangle();
    connector.name = "Connector";
    connector.x = connectorX;
    connector.y = connectorY;
    connector.resize(connectorLength, 1);
    connector.fills = [{type: "SOLID", color}];
    connector.strokes = [];
    connector.constraints = {horizontal: side === "right" ? "MIN" : "MAX", vertical: "CENTER"};

    // Badge - centralizado verticalmente
    const badgeY = tracker ? (freeY - nodeY) - badgeHeight / 2 : frameHeight / 2 - badgeHeight / 2;
    const badgeX = side === "right"
      ? MARKER_WIDTH / 2 + connectorLength
      : frameWidth - MARKER_WIDTH / 2 - connectorLength - badgeWidth;
    const badge = figma.createFrame();
    badge.name = "Badge";
    badge.fills = [{type: "SOLID", color}];
    badge.cornerRadius = 4;
    badge.resize(badgeWidth, badgeHeight);
    badge.x = badgeX;
    badge.y = badgeY;
    badge.constraints = {horizontal: side === "right" ? "MIN" : "MAX", vertical: "CENTER"};

    text.x = badgePaddingH;
    text.y = (badgeHeight - text.height) / 2;
    badge.appendChild(text);

    heightFrame.appendChild(line);
    heightFrame.appendChild(topMarker);
    heightFrame.appendChild(bottomMarker);
    heightFrame.appendChild(connector);
    heightFrame.appendChild(badge);

    // Add plugin data for live editing
    const markerConfig = {
      type: "dimension",
      direction: "vertical",
      value: label,
      colorType: "red",
      badgePosition: side,
      highlightMode: highlightMode,
    };
    heightFrame.setPluginData("markerConfig", JSON.stringify(markerConfig));

    container.appendChild(heightFrame);
  }
}
