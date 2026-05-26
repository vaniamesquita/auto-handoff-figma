import {loadPluginFonts, getFont} from "../utils/fonts";
import {hexToRgb} from "../utils/helpers";
import type {MarkerConfig} from "../types";

// ========================================
// ASSET BADGE HELPER
// ========================================

function createAssetBadge(value: string, color: RGB): FrameNode {
  const badge = figma.createFrame();
  badge.name = "Badge";
  badge.fills = [{type: "SOLID", color}];
  badge.cornerRadius = 2;
  badge.layoutMode = "HORIZONTAL";
  badge.primaryAxisSizingMode = "AUTO";
  badge.counterAxisSizingMode = "FIXED";
  badge.counterAxisAlignItems = "CENTER";
  badge.resize(badge.width, 16);
  badge.paddingLeft = 6;
  badge.paddingRight = 6;
  badge.paddingTop = 0;
  badge.paddingBottom = 0;

  const badgeText = figma.createText();
  badgeText.fontName = getFont("Bold");
  badgeText.fontSize = 11;
  badgeText.characters = value;
  badgeText.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
  badge.appendChild(badgeText);

  return badge;
}

// ========================================
// MEASURE ASSET
// ========================================

export function createMeasureAssetResizable(
  value: string,
  color: RGB,
  direction: "horizontal" | "vertical",
  badgePosition: "top" | "bottom" | "left" | "right",
  size: number = 100,
): FrameNode {
  const frame = figma.createFrame();
  frame.name = `Measure - ${value}`;
  frame.fills = [];
  frame.clipsContent = false;

  const SIZE = size;
  const MARKER_SIZE = 12;
  
  // CORREÇÃO: Usar a cor passada para as linhas
  const strokeColor = color; 

  if (direction === "horizontal") {
    frame.resize(SIZE, 45);

    // Badge
    const badge = createAssetBadge(value, color);
    const badgeHeight = badge.height;

    // Line Frame
    const lineFrame = figma.createFrame();
    lineFrame.name = "Line Frame";
    lineFrame.fills = [];
    lineFrame.resize(SIZE, MARKER_SIZE);

    if (badgePosition === "top") {
      lineFrame.y = badgeHeight + 5;
    } else if (badgePosition === "bottom") {
      lineFrame.y = 5;
    } else {
      lineFrame.y = (frame.height - MARKER_SIZE) / 2;
    }
    lineFrame.constraints = {horizontal: "STRETCH", vertical: "CENTER"};

    // Left marker
    const leftMarker = figma.createRectangle();
    leftMarker.name = "Left Marker";
    leftMarker.resize(1, MARKER_SIZE);
    leftMarker.fills = [{type: "SOLID", color: strokeColor}];
    leftMarker.x = 0;
    leftMarker.y = 0;
    leftMarker.constraints = {horizontal: "MIN", vertical: "STRETCH"};
    lineFrame.appendChild(leftMarker);

    // Right marker
    const rightMarker = figma.createRectangle();
    rightMarker.name = "Right Marker";
    rightMarker.resize(1, MARKER_SIZE);
    rightMarker.fills = [{type: "SOLID", color: strokeColor}];
    rightMarker.x = SIZE - 1;
    rightMarker.y = 0;
    rightMarker.constraints = {horizontal: "MAX", vertical: "STRETCH"};
    lineFrame.appendChild(rightMarker);

    // Horizontal line
    const line = figma.createRectangle();
    line.name = "Line";
    line.resize(SIZE, 1);
    line.fills = [{type: "SOLID", color: strokeColor}];
    line.x = 0;
    line.y = MARKER_SIZE / 2 - 0.5;
    line.constraints = {horizontal: "STRETCH", vertical: "CENTER"};
    lineFrame.appendChild(line);

    frame.appendChild(lineFrame);

    // Position badge
    if (badgePosition === "top") {
      badge.x = SIZE / 2 - badge.width / 2;
      badge.y = 0;
      badge.constraints = {horizontal: "CENTER", vertical: "MIN"};
    } else if (badgePosition === "bottom") {
      badge.x = SIZE / 2 - badge.width / 2;
      badge.y = lineFrame.y + MARKER_SIZE + 5;
      badge.constraints = {horizontal: "CENTER", vertical: "MAX"};
    } else if (badgePosition === "left") {
      badge.x = -badge.width - 5;
      badge.y = frame.height / 2 - badge.height / 2;
      badge.constraints = {horizontal: "MIN", vertical: "CENTER"};
    } else {
      badge.x = SIZE + 5;
      badge.y = frame.height / 2 - badge.height / 2;
      badge.constraints = {horizontal: "MAX", vertical: "CENTER"};
    }
    frame.appendChild(badge);
  } else {
    // Vertical
    frame.resize(60, SIZE);

    const badge = createAssetBadge(value, color);
    const badgeWidth = badge.width;

    const lineFrame = figma.createFrame();
    lineFrame.name = "Line Frame";
    lineFrame.fills = [];
    lineFrame.resize(MARKER_SIZE, SIZE);

    if (badgePosition === "left") {
      lineFrame.x = badgeWidth + 5;
    } else if (badgePosition === "right") {
      lineFrame.x = 5;
    } else {
      lineFrame.x = (frame.width - MARKER_SIZE) / 2;
    }
    lineFrame.constraints = {horizontal: "CENTER", vertical: "STRETCH"};

    // Top marker
    const topMarker = figma.createRectangle();
    topMarker.name = "Top Marker";
    topMarker.resize(MARKER_SIZE, 1);
    topMarker.fills = [{type: "SOLID", color: strokeColor}];
    topMarker.x = 0;
    topMarker.y = 0;
    topMarker.constraints = {horizontal: "STRETCH", vertical: "MIN"};
    lineFrame.appendChild(topMarker);

    // Bottom marker
    const bottomMarker = figma.createRectangle();
    bottomMarker.name = "Bottom Marker";
    bottomMarker.resize(MARKER_SIZE, 1);
    bottomMarker.fills = [{type: "SOLID", color: strokeColor}];
    bottomMarker.x = 0;
    bottomMarker.y = SIZE - 1;
    bottomMarker.constraints = {horizontal: "STRETCH", vertical: "MAX"};
    lineFrame.appendChild(bottomMarker);

    // Vertical line
    const line = figma.createRectangle();
    line.name = "Line";
    line.resize(1, SIZE);
    line.fills = [{type: "SOLID", color: strokeColor}];
    line.x = MARKER_SIZE / 2 - 0.5;
    line.y = 0;
    line.constraints = {horizontal: "CENTER", vertical: "STRETCH"};
    lineFrame.appendChild(line);

    frame.appendChild(lineFrame);

    if (badgePosition === "left") {
      badge.x = 0;
      badge.y = SIZE / 2 - badge.height / 2;
      badge.constraints = {horizontal: "MIN", vertical: "CENTER"};
    } else if (badgePosition === "right") {
      badge.x = lineFrame.x + MARKER_SIZE + 5;
      badge.y = SIZE / 2 - badge.height / 2;
      badge.constraints = {horizontal: "MAX", vertical: "CENTER"};
    } else if (badgePosition === "top") {
      badge.x = frame.width / 2 - badge.width / 2;
      badge.y = -badge.height - 5;
      badge.constraints = {horizontal: "CENTER", vertical: "MIN"};
    } else {
      badge.x = frame.width / 2 - badge.width / 2;
      badge.y = SIZE + 5;
      badge.constraints = {horizontal: "CENTER", vertical: "MAX"};
    }
    frame.appendChild(badge);
  }

  return frame;
}

// ========================================
// GAP/PADDING ASSET
// ========================================

export function createGapAssetResizable(
  value: string,
  color: RGB,
  direction: "horizontal" | "vertical",
  badgePosition: "top" | "bottom" | "left" | "right",
  size: number = 80,
  type: "Gap" | "Padding" = "Gap",
): FrameNode {
  const frame = figma.createFrame();
  frame.name = `${type} - ${value}`;
  frame.fills = [];
  frame.clipsContent = false;

  const SIZE = size;
  const SECONDARY_SIZE = 40;

  if (direction === "horizontal") {
    frame.resize(SIZE, SECONDARY_SIZE + 30);

    const gapArea = figma.createRectangle();
    gapArea.name = `${type} - ${value}`;
    gapArea.resize(SIZE, SECONDARY_SIZE);
    gapArea.fills = [{type: "SOLID", color, opacity: 0.15}];
    gapArea.strokes = [{type: "SOLID", color, opacity: 0.6}];
    gapArea.strokeWeight = 1;
    gapArea.dashPattern = [4, 4];
    gapArea.y = badgePosition === "top" ? 25 : 0;
    gapArea.constraints = {horizontal: "STRETCH", vertical: "STRETCH"};
    frame.appendChild(gapArea);

    const badge = createAssetBadge(value, color);
    if (badgePosition === "top") {
      badge.x = SIZE / 2 - badge.width / 2; badge.y = 0;
      badge.constraints = {horizontal: "CENTER", vertical: "MIN"};
    } else if (badgePosition === "bottom") {
      badge.x = SIZE / 2 - badge.width / 2; badge.y = SECONDARY_SIZE + 5;
      badge.constraints = {horizontal: "CENTER", vertical: "MAX"};
    } else if (badgePosition === "left") {
      badge.x = -badge.width - 5; badge.y = SECONDARY_SIZE / 2 - badge.height / 2;
      badge.constraints = {horizontal: "MIN", vertical: "CENTER"};
    } else {
      badge.x = SIZE + 5; badge.y = SECONDARY_SIZE / 2 - badge.height / 2;
      badge.constraints = {horizontal: "MAX", vertical: "CENTER"};
    }
    frame.appendChild(badge);
  } else {
    frame.resize(SECONDARY_SIZE + 50, SIZE);

    const gapArea = figma.createRectangle();
    gapArea.name = `${type} - ${value}`;
    gapArea.resize(SECONDARY_SIZE, SIZE);
    gapArea.fills = [{type: "SOLID", color, opacity: 0.15}];
    gapArea.strokes = [{type: "SOLID", color, opacity: 0.6}];
    gapArea.strokeWeight = 1;
    gapArea.dashPattern = [4, 4];
    gapArea.x = badgePosition === "left" ? 45 : 0;
    gapArea.constraints = {horizontal: "STRETCH", vertical: "STRETCH"};
    frame.appendChild(gapArea);

    const badge = createAssetBadge(value, color);
    if (badgePosition === "left") {
      badge.x = 0; badge.y = SIZE / 2 - badge.height / 2;
      badge.constraints = {horizontal: "MIN", vertical: "CENTER"};
    } else if (badgePosition === "right") {
      badge.x = SECONDARY_SIZE + 5; badge.y = SIZE / 2 - badge.height / 2;
      badge.constraints = {horizontal: "MAX", vertical: "CENTER"};
    } else if (badgePosition === "top") {
      badge.x = SECONDARY_SIZE / 2 - badge.width / 2; badge.y = -badge.height - 5;
      badge.constraints = {horizontal: "CENTER", vertical: "MIN"};
    } else {
      badge.x = SECONDARY_SIZE / 2 - badge.width / 2; badge.y = SIZE + 5;
      badge.constraints = {horizontal: "CENTER", vertical: "MAX"};
    }
    frame.appendChild(badge);
  }

  return frame;
}

// ========================================
// POINTER ASSET
// ========================================

export function createPointerAssetResizable(
  value: string,
  color: RGB,
  direction: "top" | "bottom" | "left" | "right",
  textColor?: RGB,
): FrameNode {
  const frame = figma.createFrame();
  frame.name = `Pointer - ${direction} - ${value}`;
  frame.fills = [];
  frame.clipsContent = false;

  const DOT_SIZE = 8;
  const LINE_LENGTH = 30;
  const strokeColor = color; 

  const isVertical = direction === "top" || direction === "bottom";

  if (isVertical) {
    const dot = figma.createEllipse();
    dot.name = "Dot";
    dot.resize(DOT_SIZE, DOT_SIZE);
    dot.fills = [{type: "SOLID", color: strokeColor}];

    const line = figma.createRectangle();
    line.name = "Line";
    line.resize(1, LINE_LENGTH);
    line.fills = [{type: "SOLID", color: strokeColor}];

    const label = figma.createText();
    label.name = "Label";
    label.fontName = getFont("Medium");
    label.fontSize = 10;
    label.characters = value;
    label.fills = [{type: "SOLID", color: textColor || strokeColor}];
    label.textAutoResize = "WIDTH_AND_HEIGHT";

    const frameHeight = DOT_SIZE + LINE_LENGTH + label.height;

    frame.layoutMode = "VERTICAL";
    frame.primaryAxisSizingMode = "FIXED";
    frame.counterAxisSizingMode = "AUTO";
    frame.counterAxisAlignItems = "CENTER";
    frame.itemSpacing = 0;
    frame.resize(Math.max(DOT_SIZE, label.width), frameHeight);

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

    if (direction === "top") {
      pointer.appendChild(line);
      pointer.appendChild(dot);
      line.layoutSizingVertical = "FILL";
      frame.appendChild(pointer);
      pointer.layoutSizingVertical = "FILL";
      label.textAlignHorizontal = "CENTER";
      frame.appendChild(label);
    } else {
      label.textAlignHorizontal = "CENTER";
      frame.appendChild(label);
      pointer.appendChild(dot);
      pointer.appendChild(line);
      line.layoutSizingVertical = "FILL";
      frame.appendChild(pointer);
      pointer.layoutSizingVertical = "FILL";
    }
  } else {
    const label = figma.createText();
    label.name = "Label";
    label.fontName = getFont("Medium");
    label.fontSize = 10;
    label.characters = value;
    label.fills = [{type: "SOLID", color: textColor || strokeColor}];
    label.textAutoResize = "WIDTH_AND_HEIGHT";

    const dot = figma.createEllipse();
    dot.name = "Dot";
    dot.resize(DOT_SIZE, DOT_SIZE);
    dot.fills = [{type: "SOLID", color: strokeColor}];

    const line = figma.createRectangle();
    line.name = "Line";
    line.resize(LINE_LENGTH, 1);
    line.fills = [{type: "SOLID", color: strokeColor}];

    const pointerFrame = figma.createFrame();
    pointerFrame.name = "Pointer";
    pointerFrame.fills = [];
    pointerFrame.layoutMode = "HORIZONTAL";
    pointerFrame.primaryAxisSizingMode = "FIXED";
    pointerFrame.counterAxisSizingMode = "AUTO";
    pointerFrame.counterAxisAlignItems = "CENTER";
    pointerFrame.itemSpacing = 0;
    pointerFrame.clipsContent = false;

    const frameWidth = DOT_SIZE + LINE_LENGTH + label.width;

    frame.layoutMode = "HORIZONTAL";
    frame.primaryAxisSizingMode = "FIXED";
    frame.counterAxisSizingMode = "AUTO";
    frame.counterAxisAlignItems = "CENTER";
    frame.itemSpacing = 0;
    frame.resize(frameWidth, Math.max(DOT_SIZE, label.height));

    if (direction === "left") {
      pointerFrame.appendChild(line);
      pointerFrame.appendChild(dot);
      line.layoutSizingHorizontal = "FILL";
      frame.appendChild(pointerFrame);
      pointerFrame.layoutSizingHorizontal = "FILL";
      frame.appendChild(label);
    } else {
      frame.appendChild(label);
      pointerFrame.appendChild(dot);
      pointerFrame.appendChild(line);
      line.layoutSizingHorizontal = "FILL";
      frame.appendChild(pointerFrame);
      pointerFrame.layoutSizingHorizontal = "FILL";
    }
  }

  return frame;
}

// ========================================
// TOUCHAREA ASSET
// ========================================

export function createTouchareaAsset(
  variant: "drag-up" | "touch" | "drag-down",
  size: number = 56,
  color: RGB = {r: 1, g: 0.4, b: 0.4},
): FrameNode {
  const totalHeight = variant === "touch" ? size : size * 2;
  const frame = figma.createFrame();
  frame.name = `Toucharea-${variant}`;
  frame.resize(size, totalHeight);
  frame.fills = [];
  frame.clipsContent = false;

  const gradient = figma.createRectangle();
  gradient.name = "Gradient";
  gradient.resize(size, totalHeight);

  if (variant === "drag-up") {
    gradient.y = 0;
    gradient.fills = [{
      type: "GRADIENT_LINEAR",
      gradientTransform: [[0, 0, 0], [0, 1, 0]],
      gradientStops: [{position: 0, color: {...color, a: 0}}, {position: 1, color: {...color, a: 0.3}}]
    }];
  } else if (variant === "drag-down") {
    gradient.y = 0;
    gradient.fills = [{
      type: "GRADIENT_LINEAR",
      gradientTransform: [[0, 0, 0], [0, 1, 0]],
      gradientStops: [{position: 0, color: {...color, a: 0.3}}, {position: 1, color: {...color, a: 0}}]
    }];
  } else {
    gradient.visible = false;
  }

  const circle = figma.createEllipse();
  circle.name = "Touch";
  circle.resize(size, size);
  circle.y = variant === "drag-up" ? totalHeight - size : 0;
  circle.fills = [{type: "SOLID", color, opacity: 0.8}];

  frame.appendChild(gradient);
  frame.appendChild(circle);
  return frame;
}

// ========================================
// CIRCLE/SQUARE AREA ASSET
// ========================================

export function createAreaAsset(
  variant: "dashed-circle" | "dashed-square" | "solid-circle" | "solid-square" | "outline-circle" | "outline-square",
  size: number = 48,
  color: RGB = {r: 218 / 255, g: 160 / 255, b: 176 / 255},
): FrameNode {
  const isCircle = variant.includes("circle");
  const isDashed = variant.includes("dashed");
  const isOutline = variant.includes("outline");

  const frame = figma.createFrame();
  frame.name = variant;
  frame.resize(size, size);
  frame.fills = [];
  frame.clipsContent = false;
  frame.constrainProportions = true;

  let shapeNode: EllipseNode | RectangleNode;

  if (isCircle) {
    shapeNode = figma.createEllipse();
    shapeNode.resize(size, size);
  } else {
    shapeNode = figma.createRectangle();
    shapeNode.resize(size, size);
  }

  shapeNode.name = isCircle ? "Circle" : "Square";
  shapeNode.x = 0;
  shapeNode.y = 0;
  shapeNode.constraints = { horizontal: "STRETCH", vertical: "STRETCH" };

  if (isDashed) {
    shapeNode.fills = [{type: "SOLID", color, opacity: 0.3}];
    shapeNode.strokes = [{type: "SOLID", color}];
    shapeNode.strokeWeight = 2;
    shapeNode.dashPattern = [4, 4];
  } else if (isOutline) {
    shapeNode.fills = [];
    shapeNode.strokes = [{type: "SOLID", color}];
    shapeNode.strokeWeight = 1;
    shapeNode.dashPattern = [4, 4];
  } else {
    shapeNode.fills = [{type: "SOLID", color}];
    shapeNode.strokes = [];
  }

  frame.appendChild(shapeNode);
  return frame;
}

// ========================================
// NUMBER POINTER ASSET
// ========================================

export function createNumberPointerAsset(
  number: string,
  direction: "top" | "bottom" | "left" | "right",
  size: number = 25,
  color: RGB = {r: 1, g: 215 / 255, b: 0},
  textColor?: RGB,
): FrameNode {
  const frame = figma.createFrame();
  frame.name = `Number ${direction} - ${number}`;
  frame.fills = [];
  frame.clipsContent = false;

  const LINE_LENGTH = 40;
  const isVertical = direction === "top" || direction === "bottom";

  // Calculate text color based on background luminance if not provided
  const finalTextColor = textColor || (() => {
    const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
    return luminance > 0.5 ? {r: 0, g: 0, b: 0} : {r: 1, g: 1, b: 1};
  })();

  if (isVertical) {
    frame.resize(size + 10, LINE_LENGTH + size + 10);

    const circle = figma.createEllipse();
    circle.name = "Circle";
    circle.resize(size, size);
    circle.fills = [{type: "SOLID", color}];

    const line = figma.createRectangle();
    line.name = "Line";
    line.resize(1, LINE_LENGTH);
    line.fills = [{type: "SOLID", color}];

    const text = figma.createText();
    text.name = "Number";
    text.fontName = getFont("Bold");
    text.fontSize = Math.round(size * 0.6);
    text.characters = number;
    text.fills = [{type: "SOLID", color: finalTextColor}];
    text.textAlignHorizontal = "CENTER";
    text.textAlignVertical = "CENTER";

    if (direction === "top") {
      circle.x = frame.width / 2 - size / 2; circle.y = 0;
      circle.constraints = {horizontal: "CENTER", vertical: "MIN"};
      line.x = frame.width / 2 - 0.5; line.y = size / 2;
      line.constraints = {horizontal: "CENTER", vertical: "STRETCH"};
      text.x = circle.x + size / 2 - text.width / 2; text.y = circle.y + size / 2 - text.height / 2;
      text.constraints = {horizontal: "CENTER", vertical: "MIN"};
    } else {
      circle.x = frame.width / 2 - size / 2; circle.y = frame.height - size;
      circle.constraints = {horizontal: "CENTER", vertical: "MAX"};
      line.x = frame.width / 2 - 0.5; line.y = 0; line.resize(1, frame.height - size / 2);
      line.constraints = {horizontal: "CENTER", vertical: "STRETCH"};
      text.x = circle.x + size / 2 - text.width / 2; text.y = circle.y + size / 2 - text.height / 2;
      text.constraints = {horizontal: "CENTER", vertical: "MAX"};
    }
    frame.appendChild(line); frame.appendChild(circle); frame.appendChild(text);
  } else {
    frame.resize(LINE_LENGTH + size + 10, size + 10);
    const circle = figma.createEllipse();
    circle.name = "Circle";
    circle.resize(size, size);
    circle.fills = [{type: "SOLID", color}];
    const line = figma.createRectangle();
    line.name = "Line";
    line.resize(LINE_LENGTH, 1);
    line.fills = [{type: "SOLID", color}];
    const text = figma.createText();
    text.name = "Number";
    text.fontName = getFont("Bold");
    text.fontSize = Math.round(size * 0.6);
    text.characters = number;
    text.fills = [{type: "SOLID", color: finalTextColor}];
    text.textAlignHorizontal = "CENTER";
    text.textAlignVertical = "CENTER";

    if (direction === "left") {
      circle.x = 0; circle.y = frame.height / 2 - size / 2;
      circle.constraints = {horizontal: "MIN", vertical: "CENTER"};
      line.x = size / 2; line.y = frame.height / 2 - 0.5;
      line.constraints = {horizontal: "STRETCH", vertical: "CENTER"};
      text.x = circle.x + size / 2 - text.width / 2; text.y = circle.y + size / 2 - text.height / 2;
      text.constraints = {horizontal: "MIN", vertical: "CENTER"};
    } else {
      circle.x = frame.width - size; circle.y = frame.height / 2 - size / 2;
      circle.constraints = {horizontal: "MAX", vertical: "CENTER"};
      line.x = 0; line.y = frame.height / 2 - 0.5; line.resize(frame.width - size / 2, 1);
      line.constraints = {horizontal: "STRETCH", vertical: "CENTER"};
      text.x = circle.x + size / 2 - text.width / 2; text.y = circle.y + size / 2 - text.height / 2;
      text.constraints = {horizontal: "MAX", vertical: "CENTER"};
    }
    frame.appendChild(line); frame.appendChild(circle); frame.appendChild(text);
  }
  return frame;
}

// ========================================
// MAIN INSERT FUNCTION & UTILS
// ========================================

export async function insertAssetIntoFigma(
  assetType: string,
  value: string,
  colorType: string,
  direction: "horizontal" | "vertical" = "horizontal",
  badgePosition: "top" | "bottom" | "left" | "right" = "bottom",
  highlightMode: boolean = false,
  size: number = 100,
  textColorType?: string,
): Promise<void> {
  await loadPluginFonts();

  const normalColors: Record<string, RGB> = {
    red: {r: 1, g: 0.2, b: 0.2},
    blue: {r: 0, g: 0.5, b: 1},
    pink: {r: 236 / 255, g: 72 / 255, b: 153 / 255},
    green: {r: 0.2, g: 0.6, b: 0.2},
    black: {r: 0, g: 0, b: 0},
    purple: {r: 0.6, g: 0.2, b: 0.6},
    orange: {r: 0.8, g: 0.5, b: 0.2},
  };

  const highlightColors: Record<string, RGB> = {
    red: {r: 255 / 255, g: 199 / 255, b: 203 / 255},
    blue: {r: 98 / 255, g: 248 / 255, b: 79 / 255},
    pink: {r: 255 / 255, g: 199 / 255, b: 203 / 255},
    green: {r: 98 / 255, g: 248 / 255, b: 79 / 255},
    purple: {r: 255 / 255, g: 199 / 255, b: 203 / 255},
    orange: {r: 255 / 255, g: 183 / 255, b: 77 / 255},
  };

  // Cores
  let color: RGB;
  if (colorType.startsWith('#')) {
    color = hexToRgb(colorType);
  } else {
    const palette = highlightMode ? highlightColors : normalColors;
    color = palette[colorType] || normalColors.red;
  }

  // Texto
  let textColor: RGB | undefined = undefined;
  if (textColorType && textColorType !== 'inherit') {
    if (textColorType.startsWith('#')) {
      textColor = hexToRgb(textColorType);
    } else {
      textColor = normalColors[textColorType];
    }
  }

  let assetFrame: FrameNode;

  switch (assetType) {
    case "measure":
      assetFrame = createMeasureAssetResizable(value, color, direction, badgePosition, size);
      break;
    case "gap":
      // CORRIGIDO: Passa a cor customizada se estiver setada, senao default
      assetFrame = createGapAssetResizable(value, color, direction, badgePosition, size, "Gap");
      break;
    case "padding":
      // CORRIGIDO: Mesmo para padding
      assetFrame = createGapAssetResizable(value, color, direction, badgePosition, size, "Padding");
      break;
    case "pointer-top":
      assetFrame = createPointerAssetResizable(value, color, "top", textColor);
      break;
    case "pointer-bottom":
      assetFrame = createPointerAssetResizable(value, color, "bottom", textColor);
      break;
    case "pointer-left":
      assetFrame = createPointerAssetResizable(value, color, "left", textColor);
      break;
    case "pointer-right":
      assetFrame = createPointerAssetResizable(value, color, "right", textColor);
      break;
    case "area-dashed-circle":
      assetFrame = createAreaAsset("dashed-circle", size || 48, color);
      break;
    case "area-dashed-square":
      assetFrame = createAreaAsset("dashed-square", size || 48, color);
      break;
    case "area-solid-circle":
      assetFrame = createAreaAsset("solid-circle", size || 48, color);
      break;
    case "area-solid-square":
      assetFrame = createAreaAsset("solid-square", size || 48, color);
      break;
    case "area-outline-circle":
      assetFrame = createAreaAsset("outline-circle", size || 28, color);
      break;
    case "area-outline-square":
      assetFrame = createAreaAsset("outline-square", size || 28, color);
      break;
    case "number-top":
      assetFrame = createNumberPointerAsset(value || "1", "top", size || 25, color, textColor);
      break;
    case "number-bottom":
      assetFrame = createNumberPointerAsset(value || "1", "bottom", size || 25, color, textColor);
      break;
    case "number-left":
      assetFrame = createNumberPointerAsset(value || "1", "left", size || 25, color, textColor);
      break;
    case "number-right":
      assetFrame = createNumberPointerAsset(value || "1", "right", size || 25, color, textColor);
      break;
    default:
      assetFrame = createMeasureAssetResizable(value, color, direction, badgePosition, size);
  }

  // Metadata
  const markerConfig: MarkerConfig = {
    type: assetType as MarkerConfig["type"],
    direction,
    value,
    colorType: colorType as MarkerConfig["colorType"],
    textColorType: textColorType as MarkerConfig["textColorType"],
    badgePosition,
    highlightMode,
    size,
  };
  assetFrame.setPluginData("markerConfig", JSON.stringify(markerConfig));

  // Viewport
  const viewport = figma.viewport.center;
  assetFrame.x = viewport.x - assetFrame.width / 2;
  assetFrame.y = viewport.y - assetFrame.height / 2;

  figma.currentPage.selection = [assetFrame];
  figma.viewport.scrollAndZoomIntoView([assetFrame]);
  figma.notify(`Asset "${assetType}" inserted!`);
}

// ========================================
// UPDATE MARKER (Live Editing)
// ========================================

export async function updateMarker(
  oldMarker: SceneNode,
  newConfig: MarkerConfig,
): Promise<void> {
  await loadPluginFonts();

  const oldX = oldMarker.x;
  const oldY = oldMarker.y;
  const parent = oldMarker.parent;

  // CORREÇÃO: Preservar texto de Measures E Pointers
  if ('findOne' in oldMarker) {
      if (newConfig.type.startsWith('pointer-')) {
          const labelNode = oldMarker.findOne((n) => n.type === 'TEXT' && n.name === 'Label') as TextNode | null;
          if (labelNode && labelNode.characters) newConfig.value = labelNode.characters;
      } else if (newConfig.type === 'measure' || newConfig.type === 'gap' || newConfig.type === 'padding') {
          // Tenta achar texto dentro do Badge
          const badgeText = oldMarker.findOne((n) => n.type === 'TEXT') as TextNode | null;
          if (badgeText && badgeText.characters) newConfig.value = badgeText.characters;
      } else if (newConfig.type.startsWith('number-')) {
          const numText = oldMarker.findOne((n) => n.type === 'TEXT') as TextNode | null;
          if (numText && numText.characters) newConfig.value = numText.characters;
      }
  }

  // Colors Logic
  const normalColors: Record<string, RGB> = {
    red: {r: 1, g: 0.2, b: 0.2},
    blue: {r: 0, g: 0.5, b: 1},
    pink: {r: 236 / 255, g: 72 / 255, b: 153 / 255},
    green: {r: 0.2, g: 0.6, b: 0.2},
    black: {r: 0, g: 0, b: 0},
  };
  const highlightColors: Record<string, RGB> = {
    red: {r: 255 / 255, g: 199 / 255, b: 203 / 255},
    blue: {r: 98 / 255, g: 248 / 255, b: 79 / 255},
    pink: {r: 255 / 255, g: 199 / 255, b: 203 / 255},
    green: {r: 98 / 255, g: 248 / 255, b: 79 / 255},
  };

  const colors = newConfig.highlightMode ? highlightColors : normalColors;
  let color: RGB;
  if (newConfig.colorType.startsWith('#')) {
    color = hexToRgb(newConfig.colorType);
  } else {
    color = colors[newConfig.colorType] || colors.red;
  }

  let textColor: RGB | undefined = undefined;
  if (newConfig.textColorType && newConfig.textColorType !== 'inherit') {
    if (newConfig.textColorType.startsWith('#')) {
      textColor = hexToRgb(newConfig.textColorType);
    } else {
      textColor = normalColors[newConfig.textColorType];
    }
  }

  let newMarker: FrameNode;
  const size = newConfig.size || 100;

  switch (newConfig.type) {
    case "measure":
      newMarker = createMeasureAssetResizable(newConfig.value, color, newConfig.direction || "horizontal", newConfig.badgePosition || "bottom", size);
      break;
    case "gap":
      newMarker = createGapAssetResizable(newConfig.value, color, newConfig.direction || "horizontal", newConfig.badgePosition || "bottom", size, "Gap");
      break;
    case "padding":
      newMarker = createGapAssetResizable(newConfig.value, color, newConfig.direction || "horizontal", newConfig.badgePosition || "bottom", size, "Padding");
      break;
    case "pointer-top":
      newMarker = createPointerAssetResizable(newConfig.value, color, "top", textColor);
      break;
    case "pointer-bottom":
      newMarker = createPointerAssetResizable(newConfig.value, color, "bottom", textColor);
      break;
    case "pointer-left":
      newMarker = createPointerAssetResizable(newConfig.value, color, "left", textColor);
      break;
    case "pointer-right":
      newMarker = createPointerAssetResizable(newConfig.value, color, "right", textColor);
      break;
    case "number-top":
      newMarker = createNumberPointerAsset(newConfig.value || "1", "top", size, color, textColor);
      break;
    case "number-bottom":
      newMarker = createNumberPointerAsset(newConfig.value || "1", "bottom", size, color, textColor);
      break;
    case "number-left":
      newMarker = createNumberPointerAsset(newConfig.value || "1", "left", size, color, textColor);
      break;
    case "number-right":
      newMarker = createNumberPointerAsset(newConfig.value || "1", "right", size, color, textColor);
      break;
    case "area-dashed-circle":
      newMarker = createAreaAsset("dashed-circle", size, color);
      break;
    case "area-dashed-square":
      newMarker = createAreaAsset("dashed-square", size, color);
      break;
    case "area-solid-circle":
      newMarker = createAreaAsset("solid-circle", size, color);
      break;
    case "area-solid-square":
      newMarker = createAreaAsset("solid-square", size, color);
      break;
    case "area-outline-circle":
      newMarker = createAreaAsset("outline-circle", size || 28, color);
      break;
    case "area-outline-square":
      newMarker = createAreaAsset("outline-square", size || 28, color);
      break;
    default:
      newMarker = createMeasureAssetResizable(newConfig.value, color, newConfig.direction || "horizontal", newConfig.badgePosition || "bottom", size);
  }

  newMarker.setPluginData("markerConfig", JSON.stringify(newConfig));
  newMarker.x = oldX;
  newMarker.y = oldY;

  if (parent && "appendChild" in parent) {
    parent.appendChild(newMarker);
  }

  oldMarker.remove();
  figma.currentPage.selection = [newMarker];
  
  figma.ui.postMessage({
    type: "marker-selected",
    config: newConfig,
  });

  figma.notify(`Marker updated!`);
}