"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

  // src/utils/fonts.ts
  var FONT_CANDIDATES = ["BancoDoBrasil Textos", "Inter", "Roboto"];
  var FONT_STYLES = ["Regular", "Medium", "Bold"];
  var resolvedFontFamily = null;
  async function loadPluginFonts() {
    if (resolvedFontFamily) return resolvedFontFamily;
    for (const family of FONT_CANDIDATES) {
      try {
        for (const style of FONT_STYLES) {
          await figma.loadFontAsync({ family, style });
        }
        resolvedFontFamily = family;
        return family;
      } catch (e) {
      }
    }
    resolvedFontFamily = "Inter";
    try {
      for (const style of FONT_STYLES) {
        await figma.loadFontAsync({ family: "Inter", style });
      }
    } catch (e) {
    }
    return resolvedFontFamily;
  }
  function getResolvedFontFamily() {
    return resolvedFontFamily != null ? resolvedFontFamily : "Inter";
  }
  function getFont(style) {
    return { family: getResolvedFontFamily(), style };
  }

  // src/config/constants.ts
  var IGNORED_PROPERTIES = ["size", "icon"];
  var SIZE_ORDER = {
    "x-small": 1,
    xsmall: 1,
    small: 2,
    semiregular: 3,
    regular: 4,
    medium: 5,
    large: 6,
    "x-large": 7,
    xlarge: 7
  };
  var SEMANTIC_ROLES = {
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
    initials: "Initials"
  };

  // src/config/theme.ts
  var THEME_NORMAL = {
    gap: { r: 1, g: 0.2, b: 0.2 },
    // Red
    padding: { r: 0, g: 0.5, b: 1 },
    // Blue
    radius: { r: 1, g: 0.2, b: 0.2 },
    // Red
    border: { r: 0.6, g: 0.2, b: 0.6 },
    // Purple
    text: { r: 0.2, g: 0.6, b: 0.2 },
    // Green
    width: { r: 0.4, g: 0.4, b: 0.4 },
    // Gray
    height: { r: 0.85, g: 0.1, b: 0.1 },
    // Red
    effect: { r: 0.8, g: 0.5, b: 0.2 }
    // Orange
  };
  var THEME_HIGHLIGHT = {
    gap: { r: 255 / 255, g: 199 / 255, b: 203 / 255 },
    // #FFC7CB Light pink
    padding: { r: 98 / 255, g: 248 / 255, b: 79 / 255 },
    // #62F84F Bright green
    radius: { r: 255 / 255, g: 199 / 255, b: 203 / 255 },
    // #FFC7CB Light pink
    border: { r: 98 / 255, g: 248 / 255, b: 79 / 255 },
    // #62F84F Bright green
    text: { r: 98 / 255, g: 248 / 255, b: 79 / 255 },
    // #62F84F Bright green
    width: { r: 98 / 255, g: 248 / 255, b: 79 / 255 },
    // #62F84F Bright green
    height: { r: 98 / 255, g: 248 / 255, b: 79 / 255 },
    // #62F84F Bright green
    effect: { r: 255 / 255, g: 183 / 255, b: 77 / 255 }
    // #FFB74D Light orange
  };
  function getTheme(highlightMode) {
    return highlightMode ? THEME_HIGHLIGHT : THEME_NORMAL;
  }
  var TEXT_COLORS = {
    default: { r: 0, g: 0, b: 0 },
    secondary: { r: 0.4, g: 0.4, b: 0.4 },
    muted: { r: 0.6, g: 0.6, b: 0.6 },
    success: { r: 0.2, g: 0.6, b: 0.2 },
    error: { r: 0.85, g: 0.1, b: 0.1 },
    warning: { r: 0.8, g: 0.5, b: 0.2 },
    white: { r: 1, g: 1, b: 1 }
  };
  var VIZ_BG_COLOR = { r: 254 / 255, g: 254 / 255, b: 254 / 255 };
  var VIZ_BG_COLOR_HIGHLIGHT = { r: 56 / 255, g: 83 / 255, b: 255 / 255 };

  // src/utils/helpers.ts
  function formatToken(variableName) {
    return `$${variableName.toLowerCase().replace(/\//g, "-").replace(/\s+/g, "-")}`;
  }
  function formatSpaceToken(variableName) {
    return `$${variableName.toLowerCase().replace(/^(spacing|space|size)[-/]/g, "").replace(/\//g, "-").replace(/\s+/g, "-")}`;
  }
  function pad(str, length, char) {
    while (str.length < length) str = char + str;
    return str;
  }
  function rgbToHex(color) {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `#${pad(r.toString(16), 2, "0")}${pad(g.toString(16), 2, "0")}${pad(b.toString(16), 2, "0")}`.toUpperCase();
  }
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
  }
  function isVariantPropertiesName(name) {
    return /[A-Z][a-z]+=[A-Z]/.test(name) && name.includes("=");
  }
  function extractRelevantProperties(variantName) {
    const parts = variantName.split(",").map((p) => p.trim());
    const props = {};
    for (const part of parts) {
      const match = part.match(/(.+?)=(.+)/);
      if (match) {
        const propName = match[1].trim().toLowerCase();
        const propValue = match[2].trim();
        if (!IGNORED_PROPERTIES.includes(propName)) {
          props[propName] = propValue;
        }
      }
    }
    return props;
  }
  function extractMainState(variantName) {
    const props = extractRelevantProperties(variantName);
    const stateProperties = ["state", "status", "style", "type", "kind"];
    const foundStates = [];
    for (const key of stateProperties) {
      if (props[key]) {
        if (foundStates.length === 0) {
          foundStates.push(props[key]);
        } else {
          foundStates.push(`${key.charAt(0).toUpperCase() + key.slice(1)}=${props[key]}`);
        }
      }
    }
    return foundStates.length > 0 ? foundStates.join(", ") : "Default";
  }
  function formatPropertiesForDisplay(variantName) {
    const props = extractRelevantProperties(variantName);
    return Object.values(props).join(" / ") || "Default";
  }
  function extractAllProperties(variantName) {
    const props = {};
    const parts = variantName.split(",").map((p) => p.trim());
    for (const part of parts) {
      const [key, value] = part.split("=").map((s) => s.trim());
      if (key && value) {
        props[key.toLowerCase()] = value;
      }
    }
    return props;
  }
  function resolveSpacingElement(node) {
    const name = node.name.toLowerCase();
    if (isVariantPropertiesName(node.name) || name === "untitled" || name.startsWith("frame")) {
      return "Container";
    }
    return node.name;
  }
  function formatDimensionToken(name) {
    let cleaned = name.toLowerCase();
    cleaned = cleaned.replace(/\//g, "-").replace(/\s+/g, "-");
    cleaned = cleaned.replace(/^shapes-/, "");
    return `$${cleaned}`;
  }
  function formatRadiusToken(name) {
    let cleaned = name.toLowerCase();
    cleaned = cleaned.replace(/\//g, "-").replace(/\s+/g, "-");
    cleaned = cleaned.replace(/^border-radius-/, "").replace(/^shapes-/, "");
    return `$${cleaned}`;
  }
  function formatEffectToken(variableName) {
    return `$effect-${variableName.toLowerCase().replace(/\//g, "-").replace(/\s+/g, "-")}`;
  }
  function formatEffectValue(effect) {
    if (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") {
      const shadow = effect;
      const x = Math.round(shadow.offset.x);
      const y = Math.round(shadow.offset.y);
      const blur = Math.round(shadow.radius);
      const spread = Math.round(shadow.spread || 0);
      const color = shadow.color;
      const r = Math.round(color.r * 255);
      const g = Math.round(color.g * 255);
      const b = Math.round(color.b * 255);
      const a = Math.round((color.a || 1) * 100) / 100;
      return `${x}px ${y}px ${blur}px ${spread}px rgba(${r}, ${g}, ${b}, ${a})`;
    } else if (effect.type === "LAYER_BLUR") {
      const blur = effect;
      return `blur(${Math.round(blur.radius)}px)`;
    } else if (effect.type === "BACKGROUND_BLUR") {
      const blur = effect;
      return `backdrop-blur(${Math.round(blur.radius)}px)`;
    }
    return "Unknown effect";
  }
  function getEffectTypeLabel(effectType) {
    const labels = {
      DROP_SHADOW: "Drop Shadow",
      INNER_SHADOW: "Inner Shadow",
      LAYER_BLUR: "Layer Blur",
      BACKGROUND_BLUR: "Background Blur"
    };
    return labels[effectType] || effectType;
  }

  // src/core/node-helpers.ts
  function isStructuralName(name) {
    return name.startsWith(".") || name.startsWith("-") || name.startsWith("_") || name.toLowerCase().startsWith(".asset/") || name.toLowerCase().startsWith(".asset");
  }
  function cleanStructuralName(name) {
    let cleaned = name;
    if (cleaned.toLowerCase().startsWith(".asset/")) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith(".") || cleaned.startsWith("-") || cleaned.startsWith("_")) {
      cleaned = cleaned.substring(1);
    }
    return cleaned;
  }
  function isNodeVisible(node) {
    return !("visible" in node && !node.visible);
  }
  async function isStructuralInstance(instance) {
    const mainComp = await instance.getMainComponentAsync();
    if (!mainComp) return false;
    if (isStructuralName(mainComp.name)) {
      return true;
    }
    if (mainComp.parent && mainComp.parent.type === "COMPONENT_SET") {
      if (isStructuralName(mainComp.parent.name)) {
        return true;
      }
    }
    return false;
  }
  async function shouldCollectIcon(iconNode, componentRoot) {
    let current = iconNode.parent;
    while (current !== null && current !== componentRoot) {
      if (current.type === "INSTANCE") {
        const isStructural = await isStructuralInstance(current);
        if (!isStructural) return false;
      }
      current = current.parent;
    }
    return true;
  }
  async function shouldSkipNestedInstance(node, isTopLevel) {
    if (node.type !== "INSTANCE") return false;
    if (isTopLevel) return false;
    return !await isStructuralInstance(node);
  }
  async function resolveNodeName(node) {
    let currentNode = node.parent;
    while (currentNode) {
      if (currentNode.type === "INSTANCE") {
        const instanceNode = currentNode;
        const mainComp = await instanceNode.getMainComponentAsync();
        if (mainComp) {
          if (isStructuralName(mainComp.name)) {
            return cleanStructuralName(mainComp.name);
          }
          if (mainComp.parent && mainComp.parent.type === "COMPONENT_SET") {
            if (isStructuralName(mainComp.parent.name)) {
              return cleanStructuralName(mainComp.parent.name);
            }
          }
        }
      }
      if (currentNode.type === "COMPONENT") {
        const componentNode = currentNode;
        if (isStructuralName(componentNode.name)) {
          return cleanStructuralName(componentNode.name);
        }
        if (componentNode.parent && componentNode.parent.type === "COMPONENT_SET") {
          if (isStructuralName(componentNode.parent.name)) {
            return cleanStructuralName(componentNode.parent.name);
          }
        }
      }
      currentNode = currentNode.parent;
    }
    if (node.type === "INSTANCE") {
      const mainComp = await node.getMainComponentAsync();
      if (mainComp && isStructuralName(mainComp.name)) {
        return cleanStructuralName(mainComp.name);
      }
    }
    if (node.type === "COMPONENT") {
      const componentNode = node;
      if (isStructuralName(componentNode.name)) {
        return cleanStructuralName(componentNode.name);
      }
      if (componentNode.parent && componentNode.parent.type === "COMPONENT_SET") {
        if (isStructuralName(componentNode.parent.name)) {
          return cleanStructuralName(componentNode.parent.name);
        }
      }
    }
    return node.name;
  }
  async function findTextNodes(node, isTopLevel = true, skipNonStructural = false) {
    const textNodes = [];
    if (!isNodeVisible(node)) {
      return textNodes;
    }
    if (skipNonStructural && node.type === "INSTANCE" && !isTopLevel) {
      if (!await isStructuralInstance(node)) {
        return textNodes;
      }
    }
    if (node.type === "TEXT") {
      textNodes.push(node);
    }
    if ("children" in node) {
      for (const child of node.children) {
        textNodes.push(...await findTextNodes(child, false, skipNonStructural));
      }
    }
    return textNodes;
  }
  function findVectorNode(node) {
    if (node.name === "Vector" || node.type === "VECTOR") {
      return node;
    }
    if ("children" in node) {
      for (const child of node.children) {
        const found = findVectorNode(child);
        if (found) return found;
      }
    }
    return null;
  }
  async function resolveBoundVariable(node, property, formatter) {
    if (!("boundVariables" in node) || !node.boundVariables) return null;
    if (!(property in node.boundVariables)) return null;
    const boundVars = node.boundVariables;
    const binding = boundVars[property];
    if ((binding == null ? void 0 : binding.type) === "VARIABLE_ALIAS") {
      const variable = await figma.variables.getVariableByIdAsync(binding.id);
      if (variable) {
        return formatter ? formatter(variable.name) : variable.name;
      }
    }
    return null;
  }
  async function resolveBoundVariableAtIndex(node, property, index, formatter) {
    if (!("boundVariables" in node) || !node.boundVariables) return null;
    if (!(property in node.boundVariables)) return null;
    const boundVars = node.boundVariables;
    const bindings = boundVars[property];
    if (!Array.isArray(bindings) || !bindings[index]) return null;
    const binding = bindings[index];
    if ((binding == null ? void 0 : binding.type) === "VARIABLE_ALIAS") {
      const variable = await figma.variables.getVariableByIdAsync(binding.id);
      if (variable) {
        return formatter ? formatter(variable.name) : variable.name;
      }
    }
    return null;
  }

  // src/core/traversal.ts
  function createEmptyCollectedData() {
    return {
      colors: [],
      textStyles: [],
      spacings: [],
      borders: [],
      effects: [],
      usedComponents: /* @__PURE__ */ new Map()
    };
  }
  async function extractIconColor(node, state, properties) {
    var _a, _b, _c, _d;
    const vectorNode = findVectorNode(node);
    if (!vectorNode) return null;
    if ("fills" in vectorNode && Array.isArray(vectorNode.fills)) {
      for (const paint of vectorNode.fills) {
        if (paint.type === "SOLID" && paint.visible !== false) {
          const hex = rgbToHex(paint.color);
          let token = null;
          let varId = null;
          if ((_a = paint.boundVariables) == null ? void 0 : _a.color) {
            varId = paint.boundVariables.color.id;
            const variable = await figma.variables.getVariableByIdAsync(varId);
            if (variable) token = formatToken(variable.name);
          }
          let iconName = "Icon";
          const mainComp = await node.getMainComponentAsync();
          if (mainComp) {
            if (mainComp.parent && mainComp.parent.type === "COMPONENT_SET") {
              iconName = mainComp.parent.name;
            } else {
              iconName = mainComp.name;
            }
          } else {
            iconName = await resolveNodeName(node);
          }
          iconName = ((_b = iconName.split("/").pop()) == null ? void 0 : _b.trim()) || iconName;
          if (iconName.includes("=") && ((_c = mainComp == null ? void 0 : mainComp.parent) == null ? void 0 : _c.type) === "COMPONENT_SET") {
            const parentName = mainComp.parent.name;
            iconName = ((_d = parentName.split("/").pop()) == null ? void 0 : _d.trim()) || iconName;
          }
          return {
            element: `Icon (${iconName})`,
            state,
            token,
            colorHex: hex,
            colorVariableId: varId,
            properties
          };
        }
      }
    }
    return null;
  }
  async function collectNodeData(node, state, properties, data, isTopLevel = false, componentRoot) {
    var _a, _b, _c;
    if (!isNodeVisible(node)) return;
    const root = isTopLevel ? node : componentRoot;
    if (node.type === "INSTANCE") {
      const mainComponent = await node.getMainComponentAsync();
      if (mainComponent) {
        const displayName = ((_a = mainComponent.parent) == null ? void 0 : _a.type) === "COMPONENT_SET" ? mainComponent.parent.name : mainComponent.name;
        if (displayName) {
          data.usedComponents.set(mainComponent.id, displayName);
        }
      }
      const hasDirectVector = "children" in node && node.children.some(
        (c) => c.name === "Vector" || c.type === "VECTOR"
      );
      if (hasDirectVector && !isTopLevel && root && await shouldCollectIcon(node, root)) {
        const iconColor = await extractIconColor(node, state, properties);
        if (iconColor) {
          data.colors.push(iconColor);
        }
        const iconName = (iconColor == null ? void 0 : iconColor.element) || await resolveNodeName(node);
        const heightToken = await resolveBoundVariable(node, "height", formatDimensionToken);
        data.spacings.push({
          element: iconName,
          property: "Height",
          token: heightToken,
          value: `${Math.round(node.height)}px`,
          properties,
          sourceNodeId: node.id
        });
      }
    }
    if (await shouldSkipNestedInstance(node, isTopLevel)) return;
    const resolvedName = await resolveNodeName(node);
    const nodeName = resolvedName.toLowerCase();
    let semanticRole = null;
    const isVariantName = resolvedName.includes("=");
    if (!isVariantName) {
      for (const [key, value] of Object.entries(SEMANTIC_ROLES)) {
        if (nodeName.includes(key)) {
          semanticRole = value;
          break;
        }
      }
    }
    const elementName = semanticRole || resolvedName;
    const spacingElementName = resolveSpacingElement(node);
    if ("fills" in node && Array.isArray(node.fills)) {
      for (const paint of node.fills) {
        if (paint.type === "SOLID") {
          const hex = rgbToHex(paint.color);
          let token = null;
          let varId = null;
          if ((_b = paint.boundVariables) == null ? void 0 : _b.color) {
            varId = paint.boundVariables.color.id;
            const variable = await figma.variables.getVariableByIdAsync(varId);
            if (variable) token = formatToken(variable.name);
          }
          let fillElement;
          if (semanticRole) {
            fillElement = semanticRole;
          } else if (isVariantName && node.type === "COMPONENT") {
            fillElement = "Container";
          } else {
            fillElement = elementName;
          }
          data.colors.push({
            element: fillElement,
            state,
            token,
            colorHex: hex,
            colorVariableId: varId,
            properties
          });
        }
      }
    }
    if ("strokes" in node && Array.isArray(node.strokes) && node.strokes.length > 0) {
      let hasStrokeWeight = false;
      if ("strokeWeight" in node) {
        if (typeof node.strokeWeight === "number" && node.strokeWeight > 0) {
          hasStrokeWeight = true;
        } else if (node.strokeWeight === figma.mixed) {
          const strokeNode = node;
          const hasSideWeight = typeof strokeNode.strokeTopWeight === "number" && strokeNode.strokeTopWeight > 0 || typeof strokeNode.strokeBottomWeight === "number" && strokeNode.strokeBottomWeight > 0 || typeof strokeNode.strokeLeftWeight === "number" && strokeNode.strokeLeftWeight > 0 || typeof strokeNode.strokeRightWeight === "number" && strokeNode.strokeRightWeight > 0;
          hasStrokeWeight = hasSideWeight;
        }
      }
      const hasVisibleStroke = node.strokes.some((s) => s.visible !== false && s.type === "SOLID");
      if (hasVisibleStroke && hasStrokeWeight) {
        for (const paint of node.strokes) {
          if (paint.type === "SOLID" && paint.visible !== false) {
            const hex = rgbToHex(paint.color);
            let token = null;
            let varId = null;
            if ((_c = paint.boundVariables) == null ? void 0 : _c.color) {
              varId = paint.boundVariables.color.id;
              const variable = await figma.variables.getVariableByIdAsync(varId);
              if (variable) token = formatToken(variable.name);
            }
            let element;
            if (semanticRole) {
              element = `${semanticRole} Border`;
            } else if (isVariantName && node.type === "COMPONENT") {
              element = "Border";
            } else {
              element = `${resolvedName} Border`;
            }
            data.colors.push({
              element,
              state,
              token,
              colorHex: hex,
              colorVariableId: varId,
              properties
            });
          }
        }
      }
    }
    if (node.type === "TEXT") {
      const textElement = semanticRole || resolvedName;
      let token = null;
      if (node.textStyleId && node.textStyleId !== "" && node.textStyleId !== figma.mixed) {
        const textStyle = await figma.getStyleByIdAsync(node.textStyleId);
        if (textStyle && textStyle.type === "TEXT") {
          token = textStyle.name.toLowerCase().replace(/\//g, "-").replace(/\s+/g, "-");
        }
      }
      const fontName = node.fontName !== figma.mixed ? node.fontName : { family: "Mixed", style: "Mixed" };
      const fontSize = node.fontSize !== figma.mixed ? node.fontSize : 0;
      const lineHeight = node.lineHeight !== figma.mixed ? typeof node.lineHeight === "object" && "value" in node.lineHeight ? `${Math.round(node.lineHeight.value)}${node.lineHeight.unit === "PIXELS" ? "px" : "%"}` : "Auto" : "Mixed";
      const letterSpacing = node.letterSpacing !== figma.mixed ? typeof node.letterSpacing === "object" && "value" in node.letterSpacing ? `${Math.round(node.letterSpacing.value * 100) / 100}${node.letterSpacing.unit === "PIXELS" ? "px" : "%"}` : "0%" : "Mixed";
      data.textStyles.push({
        element: textElement,
        state,
        token,
        fontFamily: fontName.family,
        fontWeight: fontName.style,
        fontSize,
        lineHeight,
        letterSpacing,
        properties: node.characters || textElement,
        nodeId: node.id
      });
    }
    if ("layoutMode" in node && node.layoutMode !== "NONE" && "itemSpacing" in node && node.itemSpacing > 0 && "children" in node && node.children.length >= 2) {
      const token = await resolveBoundVariable(
        node,
        "itemSpacing",
        formatSpaceToken
      );
      const visibleChildren = node.children.filter((c) => c.visible !== false);
      let childContext = "";
      if (visibleChildren.length >= 2) {
        const names = visibleChildren.map((c) => {
          var _a2;
          let cleanName = c.name.replace(/^[#\-_.]/, "").trim();
          if (cleanName.includes("/")) {
            cleanName = ((_a2 = cleanName.split("/").pop()) == null ? void 0 : _a2.trim()) || cleanName;
          }
          if (cleanName.includes("=")) {
            cleanName = cleanName.split(",")[0].split("=")[0].trim() || cleanName;
          }
          return cleanName;
        });
        childContext = names.join(" + ");
      }
      data.spacings.push({
        element: spacingElementName,
        property: "Gap",
        token,
        value: `${node.itemSpacing}px`,
        direction: node.layoutMode === "HORIZONTAL" ? "H" : "V",
        properties: childContext || spacingElementName,
        sourceNodeId: node.id
      });
    }
    if ("layoutMode" in node && node.layoutMode !== "NONE") {
      const paddingNode = node;
      const paddings = [
        { prop: "paddingTop", label: "Padding Top", dir: "V" },
        { prop: "paddingBottom", label: "Padding Bottom", dir: "V" },
        { prop: "paddingLeft", label: "Padding Left", dir: "H" },
        { prop: "paddingRight", label: "Padding Right", dir: "H" }
      ];
      for (const pad2 of paddings) {
        const paddingValue = paddingNode[pad2.prop];
        if (paddingValue && paddingValue > 0) {
          const token = await resolveBoundVariable(
            node,
            pad2.prop,
            formatSpaceToken
          );
          data.spacings.push({
            element: spacingElementName,
            property: pad2.label,
            token,
            value: `${paddingValue}px`,
            direction: pad2.dir,
            properties,
            sourceNodeId: node.id
          });
        }
      }
    }
    if ("width" in node && "height" in node) {
      const heightToken = await resolveBoundVariable(
        node,
        "height",
        formatDimensionToken
      );
      if (heightToken) {
        data.spacings.push({
          element: spacingElementName,
          property: "Height",
          token: heightToken,
          value: `${Math.round(node.height)}px`,
          properties,
          sourceNodeId: node.id
        });
      }
      if (isTopLevel) {
        const widthToken = await resolveBoundVariable(
          node,
          "width",
          formatDimensionToken
        );
        if (widthToken) {
          data.spacings.push({
            element: spacingElementName,
            property: "Width",
            token: widthToken,
            value: `${Math.round(node.width)}px`,
            properties,
            sourceNodeId: node.id
          });
        }
      }
    }
    if ("cornerRadius" in node) {
      const cornerNode = node;
      const radii = [
        cornerNode.topLeftRadius,
        cornerNode.topRightRadius,
        cornerNode.bottomLeftRadius,
        cornerNode.bottomRightRadius
      ].filter((r) => typeof r === "number" && r > 0);
      if (radii.length > 0) {
        let token = null;
        for (const key of [
          "topLeftRadius",
          "topRightRadius",
          "bottomLeftRadius",
          "bottomRightRadius"
        ]) {
          token = await resolveBoundVariable(node, key, formatRadiusToken);
          if (token) break;
        }
        data.spacings.push({
          element: spacingElementName,
          property: "Border Radius",
          token,
          value: `${radii[0]}px`,
          properties,
          sourceNodeId: node.id
        });
      }
    }
    const hasVisibleStrokes = "strokes" in node && Array.isArray(node.strokes) && node.strokes.length > 0 && node.strokes.some((stroke) => stroke.visible !== false);
    if (hasVisibleStrokes && "strokeWeight" in node) {
      let position = "Center";
      if ("strokeAlign" in node) {
        const strokeAlignNode = node;
        const align = strokeAlignNode.strokeAlign;
        if (align === "INSIDE") position = "Inside";
        else if (align === "OUTSIDE") position = "Outside";
        else position = "Center";
      }
      const hasIndividualStrokes = "strokeTopWeight" in node || "strokeBottomWeight" in node || "strokeLeftWeight" in node || "strokeRightWeight" in node;
      if (hasIndividualStrokes) {
        const strokeWeightNode = node;
        const sides = [
          { prop: "strokeTopWeight", label: "Top", varKey: "strokeTopWeight" },
          {
            prop: "strokeBottomWeight",
            label: "Bottom",
            varKey: "strokeBottomWeight"
          },
          { prop: "strokeLeftWeight", label: "Left", varKey: "strokeLeftWeight" },
          {
            prop: "strokeRightWeight",
            label: "Right",
            varKey: "strokeRightWeight"
          }
        ];
        for (const side of sides) {
          const weight = strokeWeightNode[side.prop];
          if (typeof weight === "number" && weight > 0) {
            const token = await resolveBoundVariable(
              node,
              side.varKey,
              formatSpaceToken
            );
            data.borders.push({
              element: spacingElementName,
              token,
              value: `${weight}px`,
              properties,
              sourceNodeId: node.id,
              side: side.label,
              position
            });
          }
        }
      } else if (typeof node.strokeWeight === "number" && node.strokeWeight > 0) {
        const token = await resolveBoundVariable(
          node,
          "strokeWeight",
          formatSpaceToken
        );
        data.borders.push({
          element: spacingElementName,
          token,
          value: `${node.strokeWeight}px`,
          properties,
          sourceNodeId: node.id,
          side: "All",
          position
        });
      }
    }
    if ("effects" in node && Array.isArray(node.effects) && node.effects.length > 0) {
      for (let i = 0; i < node.effects.length; i++) {
        const effect = node.effects[i];
        if (!effect.visible) continue;
        let token = null;
        if ("effectStyleId" in node && node.effectStyleId && node.effectStyleId !== "") {
          try {
            const effectStyle = await figma.getStyleByIdAsync(
              node.effectStyleId
            );
            if (effectStyle && effectStyle.type === "EFFECT") {
              token = formatEffectToken(effectStyle.name);
            }
          } catch (e) {
          }
        }
        if (!token) {
          token = await resolveBoundVariableAtIndex(
            node,
            "effects",
            i,
            formatEffectToken
          );
        }
        data.effects.push({
          element: spacingElementName,
          effectType: effect.type,
          token,
          value: formatEffectValue(effect),
          properties,
          sourceNodeId: node.id
        });
      }
    }
    if ("children" in node) {
      for (const child of node.children) {
        await collectNodeData(child, state, properties, data, false, root);
      }
    }
  }
  async function processComponent(component) {
    const results = [];
    const allColors = [];
    const allUsedComponents = /* @__PURE__ */ new Map();
    if (component.type === "INSTANCE") {
      const data = createEmptyCollectedData();
      await collectNodeData(component, "Default", "Instance", data, true);
      if (data.colors.length > 0 || data.textStyles.length > 0 || data.spacings.length > 0 || data.borders.length > 0 || data.effects.length > 0 || data.usedComponents.size > 0) {
        results.push({
          variantName: "Default",
          properties: "Instance",
          propertyMap: {},
          colors: data.colors,
          textStyles: data.textStyles,
          spacings: data.spacings,
          borders: data.borders,
          effects: data.effects,
          usedComponents: data.usedComponents
        });
      }
      if (results.length === 0) {
        results.push({
          variantName: "Default",
          properties: "Instance",
          propertyMap: {},
          colors: [],
          textStyles: [],
          spacings: [],
          borders: [],
          effects: [],
          usedComponents: /* @__PURE__ */ new Map()
        });
      }
      return results;
    }
    if (component.type === "COMPONENT_SET") {
      for (const variant of component.children) {
        if (variant.type !== "COMPONENT") continue;
        const stateName = extractMainState(variant.name);
        const displayProperties = formatPropertiesForDisplay(variant.name);
        const propertyMap = extractAllProperties(variant.name);
        const data = createEmptyCollectedData();
        await collectNodeData(variant, stateName, displayProperties, data, true);
        for (const color of data.colors) allColors.push(color);
        for (const [id, name] of data.usedComponents)
          allUsedComponents.set(id, name);
        results.push({
          variantName: variant.name,
          properties: displayProperties,
          propertyMap,
          colors: data.colors,
          textStyles: data.textStyles,
          spacings: data.spacings,
          borders: data.borders,
          effects: data.effects,
          usedComponents: data.usedComponents
        });
      }
    } else {
      const data = createEmptyCollectedData();
      await collectNodeData(component, "Default", "Default", data, true);
      if (data.colors.length > 0 || data.textStyles.length > 0 || data.effects.length > 0 || data.usedComponents.size > 0) {
        results.push({
          variantName: "Default",
          properties: "Default",
          propertyMap: {},
          colors: data.colors,
          textStyles: data.textStyles,
          spacings: data.spacings,
          borders: data.borders,
          effects: data.effects,
          usedComponents: data.usedComponents
        });
      }
    }
    return results;
  }

  // src/features/common.ts
  function createSectionContainer(name, itemSpacing = 24) {
    const section = figma.createFrame();
    section.name = name;
    section.layoutMode = "VERTICAL";
    section.primaryAxisSizingMode = "AUTO";
    section.counterAxisSizingMode = "AUTO";
    section.itemSpacing = itemSpacing;
    section.fills = [];
    return section;
  }
  function getVariantTitle(variantColors, customOrder) {
    const { propertyMap } = variantColors;
    const priorityOrder = customOrder || ["size", "type", "style", "variant", "state", "status", "mode"];
    const titleParts = [];
    const normalizedPriorityOrder = priorityOrder.map((p) => p.toLowerCase());
    for (const prop of normalizedPriorityOrder) {
      if (propertyMap[prop]) {
        titleParts.push(propertyMap[prop]);
      }
    }
    for (const [key, value] of Object.entries(propertyMap)) {
      if (!normalizedPriorityOrder.includes(key) && value) {
        titleParts.push(value);
      }
    }
    if (titleParts.length > 0) {
      return titleParts.join(" / ").toUpperCase();
    }
    return variantColors.variantName || "DEFAULT";
  }
  function sortVariantsBySize(variants) {
    return [...variants].sort((a, b) => {
      var _a, _b;
      const sizeA = (a.propertyMap.size || "").toLowerCase();
      const sizeB = (b.propertyMap.size || "").toLowerCase();
      const orderA = (_a = SIZE_ORDER[sizeA]) != null ? _a : 99;
      const orderB = (_b = SIZE_ORDER[sizeB]) != null ? _b : 99;
      return orderA - orderB;
    });
  }
  function formatVariantPropertiesForTable(propertyMap, customOrder) {
    const priorityOrder = customOrder || ["size", "type", "style", "variant", "state", "status", "mode"];
    const parts = [];
    const normalizedPriorityOrder = priorityOrder.map((p) => p.toLowerCase());
    for (const prop of normalizedPriorityOrder) {
      if (propertyMap[prop]) {
        parts.push(propertyMap[prop]);
      }
    }
    if (!customOrder) {
      for (const [key, value] of Object.entries(propertyMap)) {
        if (!normalizedPriorityOrder.includes(key) && value) {
          parts.push(value);
        }
      }
    }
    if (parts.length > 0) {
      return parts.join(" / ");
    }
    return "Default";
  }
  function filterVariantsForVisualization(variantColors, selectedProperties) {
    if (!selectedProperties || Object.keys(selectedProperties).length === 0) {
      return variantColors;
    }
    const hasAnySelection = Object.values(selectedProperties).some(
      (values) => values.length > 0
    );
    if (!hasAnySelection) {
      return variantColors;
    }
    const filtered = variantColors.filter((vc) => {
      const variantProps = vc.propertyMap;
      for (const [propName, selectedValues] of Object.entries(
        selectedProperties
      )) {
        if (selectedValues.length === 0) continue;
        const propKey = propName.toLowerCase();
        const variantValue = variantProps[propKey];
        if (!variantValue) continue;
        const isSelected = selectedValues.some(
          (v) => v.toLowerCase() === variantValue.toLowerCase()
        );
        if (!isSelected) {
          return false;
        }
      }
      return true;
    });
    return deduplicateVariants(filtered, selectedProperties);
  }
  function deduplicateVariants(variants, selectedProperties) {
    const PRIORITY_VALUES = ["default", "regular", "enabled"];
    const selectedPropNames = Object.keys(selectedProperties).filter(
      (k) => selectedProperties[k].length > 0
    );
    if (selectedPropNames.length === 0) {
      return sortVariantsBySize(variants);
    }
    const groups = /* @__PURE__ */ new Map();
    for (const vc of variants) {
      const keyParts = selectedPropNames.map((prop) => `${prop}=${vc.propertyMap[prop] || ""}`).sort();
      const key = keyParts.join("|");
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(vc);
    }
    const result = [];
    for (const groupVariants of groups.values()) {
      if (groupVariants.length === 1) {
        result.push(groupVariants[0]);
        continue;
      }
      const allPropNames = /* @__PURE__ */ new Set();
      for (const vc of groupVariants) {
        Object.keys(vc.propertyMap).forEach((k) => allPropNames.add(k));
      }
      const hiddenPropNames = [...allPropNames].filter(
        (p) => !selectedPropNames.includes(p)
      );
      let bestVariant = groupVariants[0];
      let bestScore = -1;
      for (const vc of groupVariants) {
        let score = 0;
        for (const prop of hiddenPropNames) {
          const value = (vc.propertyMap[prop] || "").toLowerCase();
          if (PRIORITY_VALUES.includes(value)) {
            score++;
          }
        }
        if (score > bestScore) {
          bestScore = score;
          bestVariant = vc;
        }
      }
      result.push(bestVariant);
    }
    return sortVariantsBySize(result);
  }
  async function createTitledVariantFrame(variant, title, frameWidth, frameHeight, highlightMode) {
    const outerFrame = figma.createFrame();
    outerFrame.name = `Variant: ${title}`;
    outerFrame.layoutMode = "VERTICAL";
    outerFrame.primaryAxisSizingMode = "AUTO";
    outerFrame.counterAxisSizingMode = "AUTO";
    outerFrame.itemSpacing = 12;
    outerFrame.fills = [];
    const titleText = figma.createText();
    titleText.fontName = getFont("Medium");
    titleText.fontSize = 14;
    titleText.characters = title;
    titleText.fills = [{ type: "SOLID", color: { r: 0.4, g: 0.4, b: 0.4 } }];
    outerFrame.appendChild(titleText);
    const vizFrame = figma.createFrame();
    vizFrame.name = "Visualization Frame";
    vizFrame.resize(frameWidth, frameHeight);
    const frameBgColor = highlightMode ? { r: 56 / 255, g: 83 / 255, b: 255 / 255 } : { r: 254 / 255, g: 254 / 255, b: 254 / 255 };
    vizFrame.fills = [{ type: "SOLID", color: frameBgColor }];
    vizFrame.cornerRadius = 8;
    vizFrame.clipsContent = false;
    const instance = variant.createInstance();
    instance.x = frameWidth / 2 - instance.width / 2;
    instance.y = frameHeight / 2 - instance.height / 2;
    vizFrame.appendChild(instance);
    outerFrame.appendChild(vizFrame);
    return { outerFrame, vizFrame, instance };
  }
  async function createGenericVariantGrid(parent, componentSet, variantColors, tableWidth, highlightMode, framesPerRow, config, annotationCallback) {
    var _a;
    const sortedVariants = sortVariantsBySize(variantColors);
    const minHeight = (_a = config.minHeight) != null ? _a : 250;
    const GRID_GAP = 24;
    const gridContainer = figma.createFrame();
    gridContainer.name = config.gridName;
    gridContainer.layoutMode = "HORIZONTAL";
    gridContainer.layoutWrap = "WRAP";
    gridContainer.primaryAxisSizingMode = "FIXED";
    gridContainer.counterAxisSizingMode = "AUTO";
    gridContainer.resize(tableWidth, 100);
    gridContainer.itemSpacing = GRID_GAP;
    gridContainer.counterAxisSpacing = GRID_GAP;
    gridContainer.fills = [];
    const numColumns = sortedVariants.length === 1 ? 1 : framesPerRow;
    const frameWidth = Math.floor(
      (tableWidth - (numColumns - 1) * GRID_GAP) / numColumns
    );
    let maxFrameHeight = minHeight;
    for (const vc of sortedVariants) {
      const variant = componentSet.children.find(
        (c) => c.type === "COMPONENT" && c.name === vc.variantName
      );
      if (variant) {
        const candidateHeight = Math.max(
          minHeight,
          variant.height + config.margin * 2
        );
        if (candidateHeight > maxFrameHeight) {
          maxFrameHeight = candidateHeight;
        }
      }
    }
    for (const vc of sortedVariants) {
      const variant = componentSet.children.find(
        (c) => c.type === "COMPONENT" && c.name === vc.variantName
      );
      if (!variant) continue;
      const frameHeight = maxFrameHeight;
      const title = getVariantTitle(vc);
      const { outerFrame, vizFrame, instance } = await createTitledVariantFrame(
        variant,
        title,
        frameWidth,
        frameHeight,
        highlightMode
      );
      const instanceBounds = instance.absoluteBoundingBox;
      if (instanceBounds) {
        await annotationCallback({
          vc,
          variant,
          instance,
          vizFrame,
          instanceBounds,
          highlightMode
        });
      }
      gridContainer.appendChild(outerFrame);
    }
    parent.appendChild(gridContainer);
  }

  // src/ui/table-builder.ts
  function createSectionTitle(title, parent) {
    const text = figma.createText();
    text.fontName = getFont("Bold");
    text.fontSize = 40;
    text.characters = title;
    text.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
    text.letterSpacing = { value: 0, unit: "PIXELS" };
    parent.appendChild(text);
  }
  function createTableAutoLayoutContainer(name, width, rowGap = 4) {
    const frame = figma.createFrame();
    frame.name = name;
    frame.layoutMode = "VERTICAL";
    frame.primaryAxisSizingMode = "AUTO";
    frame.counterAxisSizingMode = "FIXED";
    frame.resize(width, 100);
    frame.itemSpacing = rowGap;
    frame.fills = [];
    return frame;
  }
  function groupElementsAndAppend(elements, name, parent) {
    const group = figma.group(elements, parent);
    group.name = name;
    return group;
  }
  var TableBuilder = class {
    constructor(name, width, columns) {
      this.themeColor = { r: 0.2, g: 0.2, b: 0.2 };
      this.width = width;
      this.columns = columns;
      this.container = createTableAutoLayoutContainer(name, width, 4);
      this.renderHeader();
    }
    getColumnWidth(index) {
      const startPct = this.columns[index].position;
      const endPct = this.columns[index + 1] ? this.columns[index + 1].position : 1;
      const width = (endPct - startPct) * this.width;
      return Math.max(width, 10);
    }
    renderHeader() {
      const headerRow = figma.createFrame();
      headerRow.name = "Header";
      headerRow.layoutMode = "HORIZONTAL";
      headerRow.primaryAxisSizingMode = "FIXED";
      headerRow.counterAxisSizingMode = "AUTO";
      headerRow.resize(this.width, 32);
      headerRow.fills = [];
      headerRow.itemSpacing = 0;
      headerRow.paddingTop = 12;
      headerRow.paddingBottom = 12;
      this.columns.forEach((col, index) => {
        const isFirst = index === 0;
        const cell = figma.createFrame();
        cell.name = `Header-${col.header}`;
        cell.layoutMode = "VERTICAL";
        cell.primaryAxisSizingMode = "AUTO";
        if (isFirst) {
          cell.layoutGrow = 1;
          cell.counterAxisSizingMode = "FIXED";
        } else {
          const colWidth = this.getColumnWidth(index);
          cell.counterAxisSizingMode = "FIXED";
          cell.resize(colWidth, 20);
          cell.layoutGrow = 0;
        }
        cell.fills = [];
        if (isFirst) {
          cell.paddingLeft = 16;
          cell.paddingRight = 16;
        } else {
          cell.paddingLeft = 0;
          cell.paddingRight = 16;
        }
        const text = figma.createText();
        text.fontName = getFont("Bold");
        text.fontSize = 12;
        text.characters = col.header.toUpperCase();
        text.fills = [{ type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5 } }];
        text.textAutoResize = "HEIGHT";
        text.layoutAlign = "STRETCH";
        cell.appendChild(text);
        headerRow.appendChild(cell);
      });
      this.container.appendChild(headerRow);
      const divider = figma.createRectangle();
      divider.name = "Header Divider";
      divider.resize(this.width, 1);
      divider.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } }];
      this.container.appendChild(divider);
    }
    addRow(rowName, cells) {
      const row = figma.createFrame();
      row.name = rowName;
      row.layoutMode = "HORIZONTAL";
      row.primaryAxisSizingMode = "FIXED";
      row.counterAxisSizingMode = "AUTO";
      row.resize(this.width, 1);
      row.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
      row.cornerRadius = 4;
      row.itemSpacing = 0;
      row.counterAxisAlignItems = "MIN";
      row.paddingTop = 12;
      row.paddingBottom = 12;
      this.columns.forEach((colConfig, index) => {
        const cellData = cells[index];
        const textContent = typeof cellData === "string" ? cellData : (cellData == null ? void 0 : cellData.text) || "";
        const isFirst = index === 0;
        const cellFrame = figma.createFrame();
        cellFrame.name = `Cell-${colConfig.header}`;
        cellFrame.layoutMode = "VERTICAL";
        cellFrame.primaryAxisSizingMode = "AUTO";
        cellFrame.counterAxisSizingMode = "FIXED";
        cellFrame.fills = [];
        const colWidth = this.getColumnWidth(index);
        cellFrame.resize(colWidth, 1);
        if (isFirst) {
          cellFrame.paddingLeft = 16;
          cellFrame.paddingRight = 16;
        } else {
          cellFrame.paddingLeft = 0;
          cellFrame.paddingRight = 16;
        }
        const textNode = figma.createText();
        textNode.fontName = getFont("Regular");
        textNode.fontSize = 14;
        textNode.characters = textContent;
        let textColor = this.themeColor;
        if (typeof cellData !== "string" && (cellData == null ? void 0 : cellData.color)) {
          textColor = TEXT_COLORS[cellData.color] || this.themeColor;
        } else if (colConfig.color) {
          textColor = TEXT_COLORS[colConfig.color] || this.themeColor;
        }
        textNode.fills = [{ type: "SOLID", color: textColor }];
        textNode.textAutoResize = "HEIGHT";
        textNode.layoutAlign = "STRETCH";
        cellFrame.appendChild(textNode);
        cellFrame.layoutSizingVertical = "HUG";
        cellFrame.layoutSizingHorizontal = "FIXED";
        row.appendChild(cellFrame);
      });
      this.container.appendChild(row);
      row.layoutSizingVertical = "HUG";
      row.layoutSizingHorizontal = "FIXED";
    }
    addSpacer(height) {
      const spacer = figma.createFrame();
      spacer.name = "Spacer";
      spacer.layoutMode = "VERTICAL";
      spacer.resize(this.width, height);
      spacer.fills = [];
      this.container.appendChild(spacer);
    }
    appendTo(parent) {
      parent.appendChild(this.container);
    }
  };
  function createTableBuilder(name, width, columns) {
    return new TableBuilder(name, width, columns);
  }

  // src/features/colors.ts
  function removeFilteredPropertyValues(elementName, variantPropertyOrder) {
    if (!variantPropertyOrder || variantPropertyOrder.length === 0) {
      return elementName;
    }
    const stateValues = ["Default", "Disabled", "Enabled", "Active", "Inactive", "Hover", "Pressed", "Focus", "Selected"];
    const sizeValues = ["X-Small", "Small", "Semiregular", "Regular", "Large", "X-Large", "XX-Large", "XXX-Large", "Display"];
    let cleaned = elementName;
    const hasState = variantPropertyOrder.some((prop) => prop.toLowerCase() === "state");
    if (!hasState) {
      for (const state of stateValues) {
        const pattern = ` / ${state}`;
        cleaned = cleaned.split(pattern).join("");
      }
    }
    const hasSize = variantPropertyOrder.some((prop) => prop.toLowerCase() === "size");
    if (!hasSize) {
      for (const size of sizeValues) {
        const pattern = ` / ${size}`;
        cleaned = cleaned.split(pattern).join("");
      }
    }
    return cleaned;
  }
  async function createColorSectionCombined(parent, variantColors, tableWidth, variantPropertyOrder, vizPropertyFilters) {
    const filtered = vizPropertyFilters ? filterVariantsForVisualization(variantColors, vizPropertyFilters) : variantColors;
    const hasColors = filtered.some((v) => v.colors.length > 0);
    if (!hasColors) return false;
    const section = createSectionContainer("Se\xE7\xE3o Cores");
    createSectionTitle("Cores", section);
    await createColorTableInSection(section, filtered, tableWidth, variantPropertyOrder);
    parent.appendChild(section);
    return true;
  }
  async function createColorTableInSection(parent, variantColors, tableWidth, variantPropertyOrder) {
    const hasColors = variantColors.some((v) => v.colors.length > 0);
    if (!hasColors) return;
    const ROW_HEIGHT = 44;
    const ROW_GAP = 4;
    const GROUP_SPACING = 16;
    const tableContainer = createTableAutoLayoutContainer(
      "Tabela Cores",
      tableWidth,
      ROW_GAP
    );
    const headerElements = [];
    const headers = ["Elemento / Estado", "Token", "Refer\xEAncia"];
    const headerX = [
      0,
      Math.floor(tableWidth * 0.4),
      Math.floor(tableWidth * 0.8)
    ];
    for (let i = 0; i < headers.length; i++) {
      const headerText = figma.createText();
      headerText.fontName = getFont("Bold");
      headerText.fontSize = 16;
      headerText.characters = headers[i];
      headerText.fills = [{ type: "SOLID", color: { r: 0.4, g: 0.4, b: 0.4 } }];
      headerText.x = headerX[i];
      headerText.y = 0;
      headerElements.push(headerText);
    }
    groupElementsAndAppend(headerElements, "Header", tableContainer);
    const allVariantLabels = /* @__PURE__ */ new Set();
    for (const variant of variantColors) {
      const variantLabel = formatVariantPropertiesForTable(variant.propertyMap, variantPropertyOrder);
      allVariantLabels.add(variantLabel);
    }
    const totalVariants = allVariantLabels.size;
    const colorsBySignature = /* @__PURE__ */ new Map();
    for (const variant of variantColors) {
      const variantLabel = formatVariantPropertiesForTable(variant.propertyMap, variantPropertyOrder);
      for (const color of variant.colors) {
        const cleanElement = removeFilteredPropertyValues(color.element, variantPropertyOrder);
        const signature = `${cleanElement}|${color.token || color.colorHex}`;
        if (!colorsBySignature.has(signature)) {
          colorsBySignature.set(signature, {
            element: cleanElement,
            token: color.token,
            colorHex: color.colorHex,
            colorVariableId: color.colorVariableId,
            variants: []
          });
        }
        const entry = colorsBySignature.get(signature);
        if (!entry.variants.includes(variantLabel)) {
          entry.variants.push(variantLabel);
        }
      }
    }
    const allDisplayEntries = [];
    for (const [, entry] of colorsBySignature) {
      const isUsedByAllVariants = entry.variants.length === totalVariants;
      if (isUsedByAllVariants && totalVariants > 1) {
        allDisplayEntries.push({
          prefix: "Todos",
          displayText: `Todos / ${entry.element}`,
          token: entry.token,
          colorHex: entry.colorHex,
          colorVariableId: entry.colorVariableId
        });
      } else {
        const entryGroups = /* @__PURE__ */ new Set();
        for (const variantLabel of entry.variants) {
          entryGroups.add(variantLabel);
        }
        for (const group of entryGroups) {
          allDisplayEntries.push({
            prefix: group,
            displayText: `${group} / ${entry.element}`,
            token: entry.token,
            colorHex: entry.colorHex,
            colorVariableId: entry.colorVariableId
          });
        }
      }
    }
    const entriesByPrefix = /* @__PURE__ */ new Map();
    for (const entry of allDisplayEntries) {
      if (!entriesByPrefix.has(entry.prefix)) {
        entriesByPrefix.set(entry.prefix, []);
      }
      entriesByPrefix.get(entry.prefix).push(entry);
    }
    const stateOrder = {
      "Todos": -1,
      "Default": 0,
      "Enabled": 1,
      "Active": 2,
      "Hover": 3,
      "Pressed": 4,
      "Focus": 5,
      "Disabled": 6
    };
    const sortedPrefixes = Array.from(entriesByPrefix.keys()).sort((a, b) => {
      var _a, _b;
      if (a === "Todos") return -1;
      if (b === "Todos") return 1;
      const partsA = a.split(" / ");
      const partsB = b.split(" / ");
      for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const pa = partsA[i] || "";
        const pb = partsB[i] || "";
        if (pa === pb) continue;
        const orderA = (_a = stateOrder[pa]) != null ? _a : 99;
        const orderB = (_b = stateOrder[pb]) != null ? _b : 99;
        if (orderA !== orderB) return orderA - orderB;
        return pa.localeCompare(pb);
      }
      return 0;
    });
    let isFirstGroup = true;
    for (const prefix of sortedPrefixes) {
      const groupEntries = entriesByPrefix.get(prefix);
      if (groupEntries.length === 0) continue;
      if (!isFirstGroup) {
        const spacer = figma.createFrame();
        spacer.name = "Spacer";
        spacer.resize(tableWidth, GROUP_SPACING - ROW_GAP);
        spacer.fills = [];
        tableContainer.appendChild(spacer);
      }
      isFirstGroup = false;
      for (const colorEntry of groupEntries) {
        const rowElements = [];
        const rowBg = figma.createRectangle();
        rowBg.name = "Row Background";
        rowBg.resize(tableWidth, ROW_HEIGHT);
        rowBg.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
        rowBg.cornerRadius = 4;
        rowBg.x = 0;
        rowBg.y = 0;
        rowElements.push(rowBg);
        const col1Width = Math.floor(tableWidth * 0.4) - 16 - 8;
        const col2Width = Math.floor(tableWidth * 0.8) - Math.floor(tableWidth * 0.4) - 8;
        const elementText = figma.createText();
        elementText.fontName = getFont("Regular");
        elementText.fontSize = 16;
        elementText.characters = colorEntry.displayText;
        elementText.resize(col1Width, elementText.height);
        elementText.textAutoResize = "HEIGHT";
        elementText.x = 16;
        elementText.y = 12;
        rowElements.push(elementText);
        const tokenText = figma.createText();
        tokenText.fontName = getFont("Regular");
        tokenText.fontSize = 16;
        tokenText.characters = colorEntry.token || colorEntry.colorHex;
        tokenText.fills = [{ type: "SOLID", color: { r: 0.85, g: 0.1, b: 0.1 } }];
        tokenText.resize(col2Width, tokenText.height);
        tokenText.textAutoResize = "HEIGHT";
        tokenText.x = Math.floor(tableWidth * 0.4);
        tokenText.y = 12;
        rowElements.push(tokenText);
        const textHeight = Math.max(elementText.height, tokenText.height);
        const dynamicRowHeight = Math.max(ROW_HEIGHT, textHeight + 24);
        rowBg.resize(tableWidth, dynamicRowHeight);
        const colorCircle = figma.createEllipse();
        colorCircle.resize(32, 32);
        colorCircle.x = Math.floor(tableWidth * 0.8);
        colorCircle.y = Math.floor(dynamicRowHeight / 2 - 16);
        if (colorEntry.colorVariableId) {
          colorCircle.fills = [
            {
              type: "SOLID",
              color: { r: 0.5, g: 0.5, b: 0.5 },
              boundVariables: {
                color: {
                  type: "VARIABLE_ALIAS",
                  id: colorEntry.colorVariableId
                }
              }
            }
          ];
        } else {
          colorCircle.fills = [
            { type: "SOLID", color: hexToRgb(colorEntry.colorHex) }
          ];
        }
        colorCircle.strokes = [
          { type: "SOLID", color: { r: 0.85, g: 0.85, b: 0.85 } }
        ];
        colorCircle.strokeWeight = 1;
        rowElements.push(colorCircle);
        groupElementsAndAppend(
          rowElements,
          colorEntry.displayText,
          tableContainer
        );
      }
    }
    parent.appendChild(tableContainer);
  }

  // src/ui/annotations.ts
  function findFreeYPosition(existingPositions, preferredY, minSpacing = 20) {
    if (existingPositions.length === 0) return preferredY;
    const sorted = [...existingPositions].sort((a, b) => a - b);
    let collision = sorted.some((pos) => Math.abs(pos - preferredY) < minSpacing);
    if (!collision) return preferredY;
    let offset = minSpacing;
    for (let i = 0; i < 10; i++) {
      const belowY = preferredY + offset;
      collision = sorted.some((pos) => Math.abs(pos - belowY) < minSpacing);
      if (!collision) return belowY;
      const aboveY = preferredY - offset;
      collision = sorted.some((pos) => Math.abs(pos - aboveY) < minSpacing);
      if (!collision) return aboveY;
      offset += minSpacing;
    }
    return preferredY + offset;
  }
  function findFreeXPosition(existingPositions, preferredX, minSpacing = 80) {
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
  function createAnnotationTracker() {
    return {
      topPositions: [],
      bottomPositions: [],
      leftPositions: [],
      rightPositions: [],
      gapPositions: []
    };
  }
  async function createSimpleAnnotation(container, startX, startY, endX, endY, label, color, markerType, colorType, highlightMode, textColor, fontSize, fontWeight) {
    const DOT_SIZE = 8;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const isVertical = Math.abs(deltaY) >= Math.abs(deltaX);
    const group = figma.createFrame();
    group.name = label;
    group.fills = [];
    group.clipsContent = false;
    const dot = figma.createEllipse();
    dot.name = "Dot";
    dot.resize(DOT_SIZE, DOT_SIZE);
    dot.fills = [{ type: "SOLID", color }];
    const line = figma.createRectangle();
    line.name = "Line";
    line.fills = [{ type: "SOLID", color }];
    const text = figma.createText();
    text.name = "Label";
    text.fontName = getFont(fontWeight || "Medium");
    text.fontSize = fontSize || 10;
    text.characters = label;
    text.fills = [{ type: "SOLID", color: textColor || color }];
    if (isVertical) {
      const lineLength = Math.abs(deltaY);
      const goingDown = deltaY > 0;
      const frameHeight = DOT_SIZE + lineLength + text.height;
      group.layoutMode = "VERTICAL";
      group.primaryAxisSizingMode = "FIXED";
      group.counterAxisSizingMode = "AUTO";
      group.counterAxisAlignItems = "CENTER";
      group.itemSpacing = 0;
      group.resize(Math.max(DOT_SIZE, text.width), frameHeight);
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
      group.x = startX - group.width / 2;
      group.y = goingDown ? startY - DOT_SIZE / 2 : endY - text.height;
    } else {
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
    if (markerType && colorType) {
      const deltaX2 = endX - startX;
      const deltaY2 = endY - startY;
      const isVertical2 = Math.abs(deltaY2) >= Math.abs(deltaX2);
      const goingDown = deltaY2 > 0;
      const goingRight = deltaX2 > 0;
      let direction;
      let badgePosition;
      let savedType = markerType;
      if (markerType === "gap" || markerType === "padding") {
        direction = isVertical2 ? "vertical" : "horizontal";
        if (isVertical2) {
          badgePosition = goingDown ? "bottom" : "top";
          savedType = goingDown ? "pointer-bottom" : "pointer-top";
        } else {
          badgePosition = goingRight ? "right" : "left";
          savedType = goingRight ? "pointer-right" : "pointer-left";
        }
      } else {
        if (markerType === "pointer-top") badgePosition = "top";
        else if (markerType === "pointer-bottom") badgePosition = "bottom";
        else if (markerType === "pointer-left") badgePosition = "left";
        else badgePosition = "right";
      }
      let savedTextColorType;
      if (textColor) {
        if (textColor.r < 0.3 && textColor.g < 0.3 && textColor.b < 0.3) {
          savedTextColorType = "black";
        } else if (textColor.r > 0.8 && textColor.g > 0.8 && textColor.b > 0.8) {
          savedTextColorType = "inherit";
        }
      }
      const markerConfig = {
        type: savedType,
        direction,
        value: label,
        colorType,
        badgePosition,
        highlightMode: highlightMode || false
      };
      if (savedTextColorType) {
        markerConfig.textColorType = savedTextColorType;
      }
      group.setPluginData("markerConfig", JSON.stringify(markerConfig));
    }
    container.appendChild(group);
  }
  async function annotateGapNew(container, node, gapValue, direction, nodeX, nodeY, token = null, childIndex = 0, highlightMode = false, tracker) {
    if (!node.children || node.children.length < 2) {
      return;
    }
    if (childIndex >= node.children.length - 1) {
      return;
    }
    const isHorizontal = direction === "H";
    const currentChild = node.children[childIndex];
    const label = token ? token : `${gapValue}px`;
    const color = getTheme(highlightMode).gap;
    const LINE_OFFSET = 40;
    let rectX, rectY, rectW, rectH;
    let startX, startY, endX, endY;
    if (isHorizontal) {
      rectX = nodeX + currentChild.x + currentChild.width;
      rectY = nodeY + currentChild.y;
      rectW = gapValue;
      rectH = currentChild.height;
      const preferredX = rectX + rectW / 2;
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
      rectX = nodeX + currentChild.x;
      rectY = nodeY + currentChild.y + currentChild.height;
      rectW = currentChild.width;
      rectH = gapValue;
      const preferredY = rectY + rectH / 2;
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
    const rect = figma.createRectangle();
    rect.name = `Gap - ${label}`;
    rect.x = rectX;
    rect.y = rectY;
    rect.resize(Math.max(rectW, 2), Math.max(rectH, 2));
    rect.fills = [{ type: "SOLID", color, opacity: 0.15 }];
    rect.strokes = [{ type: "SOLID", color, opacity: 0.5 }];
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
      highlightMode
    );
  }
  async function annotatePaddingNew(container, paddingValue, side, nodeX, nodeY, nodeW, nodeH, token = null, highlightMode = false, tracker) {
    const label = token ? token : `${paddingValue}px`;
    const color = getTheme(highlightMode).padding;
    const LINE_OFFSET = 50;
    let startX, startY, endX, endY;
    let rectX, rectY, rectW, rectH;
    switch (side) {
      case "top": {
        rectX = nodeX;
        rectY = nodeY;
        rectW = nodeW;
        rectH = paddingValue;
        const preferredX = nodeX + nodeW / 2;
        const freeX = tracker ? findFreeXPosition(tracker.topPositions, preferredX, 100) : preferredX;
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
        const freeX = tracker ? findFreeXPosition(tracker.bottomPositions, preferredX, 100) : preferredX;
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
        const freeY = tracker ? findFreeYPosition(tracker.leftPositions, preferredY, 25) : preferredY;
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
        const freeY = tracker ? findFreeYPosition(tracker.rightPositions, preferredY, 25) : preferredY;
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
    rect.fills = [{ type: "SOLID", color, opacity: 0.15 }];
    rect.strokes = [{ type: "SOLID", color, opacity: 0.5 }];
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
      highlightMode
    );
  }
  async function annotateRadiusNew(container, radius, nodeX, nodeY, _nodeW, _nodeH, token = null, highlightMode = false) {
    const label = token ? token : `${radius}px`;
    const color = getTheme(highlightMode).radius;
    const circleSize = Math.max(20, Math.min(radius * 2, 32));
    const circle = figma.createEllipse();
    circle.x = nodeX - circleSize / 4;
    circle.y = nodeY - circleSize / 4;
    circle.resize(circleSize, circleSize);
    circle.fills = [];
    circle.strokes = [{ type: "SOLID", color }];
    circle.strokeWeight = 1.5;
    circle.dashPattern = [4, 4];
    container.appendChild(circle);
    const LINE_LENGTH = 30;
    const startX = nodeX;
    const startY = nodeY;
    const endX = nodeX;
    const endY = nodeY - LINE_LENGTH;
    await createSimpleAnnotation(
      container,
      startX,
      startY,
      endX,
      endY,
      label,
      color,
      "pointer-top",
      // Texto em cima, bolinha embaixo tocando o canto
      "red",
      // ColorType: Radius usa 'red' (ver theme.ts THEME_NORMAL.radius)
      highlightMode
    );
  }
  async function annotateBorderNew(container, strokeWeight, nodeX, nodeY, nodeW, nodeH, token = null, highlightMode = false, side = "All", position = "Center") {
    const positionSuffix = position !== "Center" ? ` (${position})` : "";
    const label = token ? `${token}${positionSuffix}` : `${strokeWeight}px${positionSuffix}`;
    const color = getTheme(highlightMode).border;
    const borderLine = figma.createLine();
    borderLine.strokes = [{ type: "SOLID", color }];
    borderLine.strokeWeight = 2;
    borderLine.dashPattern = [4, 4];
    let startX, startY, endX, endY;
    if (side === "Top") {
      borderLine.x = nodeX;
      borderLine.y = nodeY;
      borderLine.resize(nodeW, 0);
      container.appendChild(borderLine);
      startX = nodeX + nodeW / 2;
      startY = nodeY;
      endX = startX;
      endY = nodeY - 35;
    } else if (side === "Bottom" || side === "All") {
      borderLine.x = nodeX;
      borderLine.y = nodeY + nodeH;
      borderLine.resize(nodeW, 0);
      container.appendChild(borderLine);
      startX = nodeX + nodeW / 2;
      startY = nodeY + nodeH;
      endX = startX;
      endY = nodeY + nodeH + 35;
    } else if (side === "Left") {
      borderLine.x = nodeX;
      borderLine.y = nodeY;
      borderLine.rotation = -90;
      borderLine.resize(nodeH, 0);
      container.appendChild(borderLine);
      startX = nodeX;
      startY = nodeY + nodeH / 2;
      endX = nodeX - 50;
      endY = startY;
    } else if (side === "Right") {
      borderLine.x = nodeX + nodeW;
      borderLine.y = nodeY;
      borderLine.rotation = -90;
      borderLine.resize(nodeH, 0);
      container.appendChild(borderLine);
      startX = nodeX + nodeW;
      startY = nodeY + nodeH / 2;
      endX = nodeX + nodeW + 50;
      endY = startY;
    } else {
      borderLine.x = nodeX;
      borderLine.y = nodeY + nodeH;
      borderLine.resize(nodeW, 0);
      container.appendChild(borderLine);
      startX = nodeX + nodeW / 2;
      startY = nodeY + nodeH;
      endX = startX;
      endY = nodeY + nodeH + 35;
    }
    let borderMarkerType;
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
      highlightMode
    );
  }
  async function annotateDimensionNewSmart(container, _dimension, value, nodeX, nodeY, nodeW, nodeH, token = null, highlightMode = false, side = "right", tracker) {
    const label = token ? token : `${value}px`;
    const theme = getTheme(highlightMode);
    const color = theme.height;
    const MARKER_WIDTH = 8;
    const text = figma.createText();
    text.name = "Label";
    text.fontName = getFont("Bold");
    text.fontSize = 11;
    text.characters = label;
    const textColor = highlightMode ? { r: 0, g: 0, b: 0 } : { r: 1, g: 1, b: 1 };
    text.fills = [{ type: "SOLID", color: textColor }];
    const badgePaddingH = 4;
    const badgeWidth = text.width + badgePaddingH * 2;
    const badgeHeight = 16;
    const connectorLength = 8;
    if (side === "bottom") {
      const lineY = nodeY + nodeH + 15;
      const MARKER_HEIGHT = 8;
      const frameWidth = nodeW;
      const frameHeight = MARKER_HEIGHT + connectorLength + badgeHeight;
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
      const line = figma.createRectangle();
      line.name = "Horizontal Line";
      line.x = 0;
      line.y = MARKER_HEIGHT / 2 - 0.5;
      line.resize(frameWidth, 1);
      line.fills = [{ type: "SOLID", color }];
      line.strokes = [];
      const leftMarker = figma.createRectangle();
      leftMarker.name = "Left Marker";
      leftMarker.x = -0.5;
      leftMarker.y = 0;
      leftMarker.resize(1, MARKER_HEIGHT);
      leftMarker.fills = [{ type: "SOLID", color }];
      leftMarker.strokes = [];
      const rightMarker = figma.createRectangle();
      rightMarker.name = "Right Marker";
      rightMarker.x = frameWidth - 0.5;
      rightMarker.y = 0;
      rightMarker.resize(1, MARKER_HEIGHT);
      rightMarker.fills = [{ type: "SOLID", color }];
      rightMarker.strokes = [];
      const connectorX = tracker ? freeX - nodeX - 0.5 : frameWidth / 2 - 0.5;
      const connector = figma.createRectangle();
      connector.name = "Connector";
      connector.x = connectorX;
      connector.y = MARKER_HEIGHT / 2;
      connector.resize(1, connectorLength);
      connector.fills = [{ type: "SOLID", color }];
      connector.strokes = [];
      const badgeX = tracker ? freeX - nodeX - badgeWidth / 2 : frameWidth / 2 - badgeWidth / 2;
      const badge = figma.createFrame();
      badge.name = "Badge";
      badge.fills = [{ type: "SOLID", color }];
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
      const markerConfig = {
        type: "dimension",
        direction: "horizontal",
        value: label,
        colorType: "red",
        badgePosition: "bottom",
        highlightMode
      };
      heightFrame.setPluginData("markerConfig", JSON.stringify(markerConfig));
      container.appendChild(heightFrame);
    } else if (side === "top") {
      const lineY = nodeY - 15;
      const MARKER_HEIGHT = 8;
      const frameWidth = nodeW;
      const frameHeight = MARKER_HEIGHT + connectorLength + badgeHeight;
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
      const line = figma.createRectangle();
      line.name = "Horizontal Line";
      line.x = 0;
      line.y = frameHeight - MARKER_HEIGHT / 2 - 0.5;
      line.resize(frameWidth, 1);
      line.fills = [{ type: "SOLID", color }];
      line.strokes = [];
      const leftMarker = figma.createRectangle();
      leftMarker.name = "Left Marker";
      leftMarker.x = -0.5;
      leftMarker.y = frameHeight - MARKER_HEIGHT;
      leftMarker.resize(1, MARKER_HEIGHT);
      leftMarker.fills = [{ type: "SOLID", color }];
      leftMarker.strokes = [];
      const rightMarker = figma.createRectangle();
      rightMarker.name = "Right Marker";
      rightMarker.x = frameWidth - 0.5;
      rightMarker.y = frameHeight - MARKER_HEIGHT;
      rightMarker.resize(1, MARKER_HEIGHT);
      rightMarker.fills = [{ type: "SOLID", color }];
      rightMarker.strokes = [];
      const connectorX = tracker ? freeX - nodeX - 0.5 : frameWidth / 2 - 0.5;
      const connector = figma.createRectangle();
      connector.name = "Connector";
      connector.x = connectorX;
      connector.y = 0;
      connector.resize(1, frameHeight - MARKER_HEIGHT / 2 - connectorLength);
      connector.fills = [{ type: "SOLID", color }];
      connector.strokes = [];
      const badgeX = tracker ? freeX - nodeX - badgeWidth / 2 : frameWidth / 2 - badgeWidth / 2;
      const badge = figma.createFrame();
      badge.name = "Badge";
      badge.fills = [{ type: "SOLID", color }];
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
      const markerConfig = {
        type: "dimension",
        direction: "horizontal",
        value: label,
        colorType: "red",
        badgePosition: "top",
        highlightMode
      };
      heightFrame.setPluginData("markerConfig", JSON.stringify(markerConfig));
      container.appendChild(heightFrame);
    } else {
      const lineX = side === "right" ? nodeX + nodeW + 15 : nodeX - 15;
      const frameWidth = MARKER_WIDTH + connectorLength + badgeWidth;
      const frameHeight = nodeH;
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
      const lineXPos = side === "right" ? MARKER_WIDTH / 2 - 0.5 : frameWidth - MARKER_WIDTH / 2 - 0.5;
      const line = figma.createRectangle();
      line.name = "Vertical Line";
      line.x = lineXPos;
      line.y = 0;
      line.resize(1, frameHeight);
      line.fills = [{ type: "SOLID", color }];
      line.strokes = [];
      line.constraints = { horizontal: side === "right" ? "MIN" : "MAX", vertical: "STRETCH" };
      const topMarker = figma.createRectangle();
      topMarker.name = "Top Marker";
      topMarker.x = side === "right" ? 0 : frameWidth - MARKER_WIDTH;
      topMarker.y = -0.5;
      topMarker.resize(MARKER_WIDTH, 1);
      topMarker.fills = [{ type: "SOLID", color }];
      topMarker.strokes = [];
      topMarker.constraints = { horizontal: side === "right" ? "MIN" : "MAX", vertical: "MIN" };
      const bottomMarker = figma.createRectangle();
      bottomMarker.name = "Bottom Marker";
      bottomMarker.x = side === "right" ? 0 : frameWidth - MARKER_WIDTH;
      bottomMarker.y = frameHeight - 0.5;
      bottomMarker.resize(MARKER_WIDTH, 1);
      bottomMarker.fills = [{ type: "SOLID", color }];
      bottomMarker.strokes = [];
      bottomMarker.constraints = { horizontal: side === "right" ? "MIN" : "MAX", vertical: "MAX" };
      const connectorY = tracker ? freeY - nodeY - 0.5 : frameHeight / 2 - 0.5;
      const connectorX = side === "right" ? MARKER_WIDTH / 2 : frameWidth - MARKER_WIDTH / 2 - connectorLength;
      const connector = figma.createRectangle();
      connector.name = "Connector";
      connector.x = connectorX;
      connector.y = connectorY;
      connector.resize(connectorLength, 1);
      connector.fills = [{ type: "SOLID", color }];
      connector.strokes = [];
      connector.constraints = { horizontal: side === "right" ? "MIN" : "MAX", vertical: "CENTER" };
      const badgeY = tracker ? freeY - nodeY - badgeHeight / 2 : frameHeight / 2 - badgeHeight / 2;
      const badgeX = side === "right" ? MARKER_WIDTH / 2 + connectorLength : frameWidth - MARKER_WIDTH / 2 - connectorLength - badgeWidth;
      const badge = figma.createFrame();
      badge.name = "Badge";
      badge.fills = [{ type: "SOLID", color }];
      badge.cornerRadius = 4;
      badge.resize(badgeWidth, badgeHeight);
      badge.x = badgeX;
      badge.y = badgeY;
      badge.constraints = { horizontal: side === "right" ? "MIN" : "MAX", vertical: "CENTER" };
      text.x = badgePaddingH;
      text.y = (badgeHeight - text.height) / 2;
      badge.appendChild(text);
      heightFrame.appendChild(line);
      heightFrame.appendChild(topMarker);
      heightFrame.appendChild(bottomMarker);
      heightFrame.appendChild(connector);
      heightFrame.appendChild(badge);
      const markerConfig = {
        type: "dimension",
        direction: "vertical",
        value: label,
        colorType: "red",
        badgePosition: side,
        highlightMode
      };
      heightFrame.setPluginData("markerConfig", JSON.stringify(markerConfig));
      container.appendChild(heightFrame);
    }
  }

  // src/features/typography.ts
  async function createTextSectionCombined(parent, variantColors, nodeToProcess, tableWidth, highlightMode, vizPropertyFilters, framesPerRow = 2, showTable = true, showViz = true) {
    const hasText = variantColors.some((v) => v.textStyles.length > 0);
    if (!hasText) return false;
    if (!showTable && !showViz) return false;
    const section = createSectionContainer("Se\xE7\xE3o Padr\xF5es de Texto");
    createSectionTitle("Padr\xF5es de texto", section);
    if (showTable) {
      await createTextTableInSection(section, variantColors, tableWidth, vizPropertyFilters);
    }
    if (showViz) {
      await createTextVisualizationInSection(
        section,
        nodeToProcess,
        variantColors,
        tableWidth,
        highlightMode,
        vizPropertyFilters,
        framesPerRow
      );
      await createTextBehaviorVisualization(
        section,
        nodeToProcess,
        variantColors,
        tableWidth,
        highlightMode,
        vizPropertyFilters,
        framesPerRow
      );
    }
    parent.appendChild(section);
    return true;
  }
  function detectTextGroupingProperty(variantColors) {
    const propertyUniqueValues = /* @__PURE__ */ new Map();
    for (const variant of variantColors) {
      if (variant.textStyles.length === 0) continue;
      for (const [propName, propValue] of Object.entries(variant.propertyMap)) {
        if (!propertyUniqueValues.has(propName)) {
          propertyUniqueValues.set(propName, /* @__PURE__ */ new Set());
        }
        propertyUniqueValues.get(propName).add(propValue);
      }
    }
    if (propertyUniqueValues.has("size")) {
      const sizeValues = propertyUniqueValues.get("size");
      if (sizeValues.size > 1) {
        return "size";
      }
    }
    let bestProperty = null;
    let maxUniqueValues = 1;
    for (const [propName, uniqueValues] of propertyUniqueValues) {
      if (uniqueValues.size > maxUniqueValues) {
        maxUniqueValues = uniqueValues.size;
        bestProperty = propName;
      }
    }
    return bestProperty;
  }
  async function createTextTableInSection(parent, variantColors, tableWidth, vizPropertyFilters) {
    var _a;
    const filteredVariants = filterVariantsForVisualization(
      variantColors,
      vizPropertyFilters
    );
    const hasText = filteredVariants.some((v) => v.textStyles.length > 0);
    if (!hasText) return;
    const ROW_HEIGHT = 44;
    const ROW_GAP = 4;
    const GROUP_SPACING = 16;
    const tableContainer = createTableAutoLayoutContainer(
      "Tabela Tipografia",
      tableWidth,
      ROW_GAP
    );
    const headerElements = [];
    const headers = ["ELEMENTO", "COMPONENTE"];
    const headerX = [0, Math.floor(tableWidth * 0.45)];
    for (let i = 0; i < headers.length; i++) {
      const headerText = figma.createText();
      headerText.fontName = getFont("Bold");
      headerText.fontSize = 16;
      headerText.characters = headers[i];
      headerText.fills = [{ type: "SOLID", color: { r: 0.4, g: 0.4, b: 0.4 } }];
      headerText.x = headerX[i];
      headerText.y = 0;
      headerElements.push(headerText);
    }
    groupElementsAndAppend(headerElements, "Header", tableContainer);
    const allTextRows = [];
    for (const variant of filteredVariants) {
      const size = variant.propertyMap.size || "Default";
      const sizeOrder = (_a = SIZE_ORDER[size.toLowerCase()]) != null ? _a : 99;
      for (const text of variant.textStyles) {
        allTextRows.push({
          sizeElement: `${size} / ${text.element}`,
          textSpec: text,
          sizeOrder,
          propertyMap: variant.propertyMap
        });
      }
    }
    allTextRows.sort((a, b) => a.sizeOrder - b.sizeOrder);
    const seen = /* @__PURE__ */ new Set();
    const uniqueRows = allTextRows.filter((row) => {
      const key = `${row.sizeElement}-${row.textSpec.token || row.textSpec.fontFamily}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const groupingProperty = detectTextGroupingProperty(filteredVariants);
    if (!groupingProperty) {
      for (const textRow of uniqueRows) {
        await createTextTableRow(
          tableContainer,
          textRow.sizeElement,
          textRow.textSpec,
          tableWidth,
          ROW_HEIGHT
        );
      }
    } else {
      const groupedRows = /* @__PURE__ */ new Map();
      for (const row of uniqueRows) {
        const groupValue = row.propertyMap[groupingProperty] || "Default";
        if (!groupedRows.has(groupValue)) {
          groupedRows.set(groupValue, []);
        }
        groupedRows.get(groupValue).push(row);
      }
      if (groupedRows.size === 1) {
        for (const textRow of uniqueRows) {
          await createTextTableRow(
            tableContainer,
            textRow.sizeElement,
            textRow.textSpec,
            tableWidth,
            ROW_HEIGHT
          );
        }
      } else {
        const sortedGroups = Array.from(groupedRows.entries()).sort((a, b) => {
          var _a2, _b;
          if (groupingProperty.toLowerCase() === "size") {
            const orderA = (_a2 = SIZE_ORDER[a[0].toLowerCase()]) != null ? _a2 : 99;
            const orderB = (_b = SIZE_ORDER[b[0].toLowerCase()]) != null ? _b : 99;
            return orderA - orderB;
          }
          return a[0].localeCompare(b[0]);
        });
        let isFirstGroup = true;
        for (const [, rows] of sortedGroups) {
          if (!isFirstGroup) {
            const spacer = figma.createFrame();
            spacer.name = "Spacer";
            spacer.resize(tableWidth, GROUP_SPACING - ROW_GAP);
            spacer.fills = [];
            tableContainer.appendChild(spacer);
          }
          isFirstGroup = false;
          for (const textRow of rows) {
            await createTextTableRow(
              tableContainer,
              textRow.sizeElement,
              textRow.textSpec,
              tableWidth,
              ROW_HEIGHT
            );
          }
        }
      }
    }
    parent.appendChild(tableContainer);
  }
  async function createTextTableRow(container, sizeElement, textSpec, tableWidth, rowHeight) {
    const rowElements = [];
    const rowBg = figma.createRectangle();
    rowBg.name = "Row Background";
    rowBg.resize(tableWidth, rowHeight);
    rowBg.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    rowBg.cornerRadius = 4;
    rowBg.x = 0;
    rowBg.y = 0;
    rowElements.push(rowBg);
    const elementText = figma.createText();
    elementText.fontName = getFont("Regular");
    elementText.fontSize = 16;
    elementText.characters = sizeElement;
    elementText.x = 16;
    elementText.y = 12;
    rowElements.push(elementText);
    const tokenValue = textSpec.token ? `$${textSpec.token.replace(/\//g, "-")}` : `${textSpec.fontFamily} / ${textSpec.fontWeight} / ${textSpec.fontSize}px / LH: ${textSpec.lineHeight} / LS: ${textSpec.letterSpacing || "0%"}`;
    const componentText = figma.createText();
    componentText.fontName = getFont("Regular");
    componentText.fontSize = 16;
    componentText.characters = tokenValue;
    componentText.fills = textSpec.token ? [{ type: "SOLID", color: { r: 12 / 255, g: 138 / 255, b: 0 } }] : [{ type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5 } }];
    componentText.x = Math.floor(tableWidth * 0.45);
    componentText.y = 12;
    rowElements.push(componentText);
    groupElementsAndAppend(rowElements, `Row ${sizeElement}`, container);
  }
  async function createTextVisualizationInSection(parent, component, variantColors, tableWidth, highlightMode, vizPropertyFilters, framesPerRow) {
    var _a;
    const hasText = variantColors.some((v) => v.textStyles.length > 0);
    if (!hasText) return;
    const filteredVariants = filterVariantsForVisualization(
      variantColors,
      vizPropertyFilters
    );
    if (component.type === "COMPONENT_SET" && filteredVariants.length > 1) {
      await createMultiVariantTextGrid(
        parent,
        component,
        filteredVariants,
        tableWidth,
        highlightMode,
        framesPerRow
      );
      return;
    }
    let baseComponent = null;
    if (component.type === "COMPONENT_SET") {
      baseComponent = component.children.find(
        (c) => c.type === "COMPONENT"
      );
    } else {
      baseComponent = component;
    }
    if (!baseComponent) return;
    const instance = baseComponent.type === "INSTANCE" ? baseComponent.clone() : baseComponent.createInstance();
    const MARGIN = 100;
    const frameHeight = Math.max(300, instance.height + MARGIN * 2);
    const vizContainer = figma.createFrame();
    vizContainer.name = "Visualiza\xE7\xE3o Textos";
    vizContainer.layoutMode = "VERTICAL";
    vizContainer.primaryAxisSizingMode = "AUTO";
    vizContainer.counterAxisSizingMode = "FIXED";
    vizContainer.resize(tableWidth, 100);
    vizContainer.itemSpacing = 16;
    vizContainer.fills = [];
    const subTitle = figma.createText();
    subTitle.fontName = getFont("Medium");
    subTitle.fontSize = 18;
    subTitle.characters = "Visualiza\xE7\xE3o";
    vizContainer.appendChild(subTitle);
    const vizFrame = figma.createFrame();
    vizFrame.name = "Text Visualization";
    vizFrame.resize(tableWidth, frameHeight);
    const frameBgColor = highlightMode ? { r: 56 / 255, g: 83 / 255, b: 255 / 255 } : { r: 254 / 255, g: 254 / 255, b: 254 / 255 };
    vizFrame.fills = [{ type: "SOLID", color: frameBgColor }];
    vizFrame.cornerRadius = 8;
    vizFrame.clipsContent = false;
    instance.x = tableWidth / 2 - instance.width / 2;
    instance.y = frameHeight / 2 - instance.height / 2;
    vizFrame.appendChild(instance);
    const allTextNodes = await findTextNodes(instance);
    const instanceBounds = instance.absoluteBoundingBox;
    if (instanceBounds) {
      const textStyles = ((_a = variantColors[0]) == null ? void 0 : _a.textStyles) || [];
      const color = getTheme(highlightMode).text;
      const seenFonts = /* @__PURE__ */ new Set();
      const uniqueTextNodes = [];
      for (const node of allTextNodes) {
        const fontName = node.fontName !== figma.mixed ? node.fontName : { family: "Mixed", style: "Mixed" };
        const fontSize = node.fontSize !== figma.mixed ? node.fontSize : 0;
        const fontKey = `${fontName.family}/${fontName.style}/${fontSize}`;
        if (!seenFonts.has(fontKey)) {
          seenFonts.add(fontKey);
          uniqueTextNodes.push(node);
        }
      }
      const tracker = createAnnotationTracker();
      for (let i = 0; i < uniqueTextNodes.length; i++) {
        const textNode = uniqueTextNodes[i];
        const textBounds = textNode.absoluteBoundingBox;
        if (!textBounds) continue;
        const textRelX = textBounds.x - instanceBounds.x;
        const textRelY = textBounds.y - instanceBounds.y;
        const nodeW = textBounds.width;
        const nodeH = textBounds.height;
        const textNodeFontName = textNode.fontName !== figma.mixed ? textNode.fontName : { family: "Mixed", style: "Mixed" };
        const textNodeFontSize = textNode.fontSize !== figma.mixed ? textNode.fontSize : 0;
        let label = "";
        for (const spec of textStyles) {
          if (spec.fontFamily === textNodeFontName.family && spec.fontWeight === textNodeFontName.style && spec.fontSize === textNodeFontSize) {
            label = spec.token ? `$${spec.token.replace(/\//g, "-")}` : `${spec.fontFamily} / ${spec.fontWeight} / ${spec.fontSize}px / LH: ${spec.lineHeight}`;
            break;
          }
        }
        if (!label) {
          const nodeName = textNode.name.toLowerCase();
          for (const spec of textStyles) {
            const specEl = spec.element.toLowerCase();
            if (specEl === nodeName || nodeName.includes(specEl) || specEl.includes(nodeName)) {
              label = spec.token ? `$${spec.token.replace(/\//g, "-")}` : `${spec.fontFamily} / ${spec.fontWeight} / ${spec.fontSize}px / LH: ${spec.lineHeight}`;
              break;
            }
          }
        }
        if (!label) {
          label = `${textNodeFontName.family} / ${textNodeFontName.style}`;
        }
        const textX = instance.x + textRelX;
        const textY = instance.y + textRelY;
        const isAbove = i % 2 === 0;
        const LINE_LENGTH = 30;
        const DOT_OFFSET = 10;
        const preferredX = textX + nodeW / 2;
        const positions = isAbove ? tracker.topPositions : tracker.bottomPositions;
        const freeX = findFreeXPosition(positions, preferredX, 80);
        positions.push(freeX);
        const startX = freeX;
        const startY = isAbove ? textY - DOT_OFFSET : textY + nodeH + DOT_OFFSET;
        const endX = freeX;
        const endY = isAbove ? textY - DOT_OFFSET - LINE_LENGTH : textY + nodeH + DOT_OFFSET + LINE_LENGTH;
        await createSimpleAnnotation(
          vizFrame,
          startX,
          startY,
          endX,
          endY,
          label,
          color,
          isAbove ? "pointer-top" : "pointer-bottom",
          "green",
          highlightMode
        );
      }
    }
    vizContainer.appendChild(vizFrame);
    parent.appendChild(vizContainer);
  }
  async function createMultiVariantTextGrid(parent, componentSet, variantColors, tableWidth, highlightMode, framesPerRow = 2) {
    await createGenericVariantGrid(
      parent,
      componentSet,
      variantColors,
      tableWidth,
      highlightMode,
      framesPerRow,
      {
        gridName: "Grid Variantes - Texto",
        margin: 80
      },
      async (ctx) => {
        if (ctx.vc.textStyles.length === 0) return;
        const allTextNodes = await findTextNodes(ctx.instance);
        const color = getTheme(ctx.highlightMode).text;
        const seenFonts = /* @__PURE__ */ new Set();
        const uniqueTextNodes = [];
        for (const node of allTextNodes) {
          const fontName = node.fontName !== figma.mixed ? node.fontName : { family: "Mixed", style: "Mixed" };
          const fontSize = node.fontSize !== figma.mixed ? node.fontSize : 0;
          const fontKey = `${fontName.family}/${fontName.style}/${fontSize}`;
          if (!seenFonts.has(fontKey)) {
            seenFonts.add(fontKey);
            uniqueTextNodes.push(node);
          }
        }
        const tracker = createAnnotationTracker();
        for (let i = 0; i < uniqueTextNodes.length; i++) {
          const textNode = uniqueTextNodes[i];
          const textBounds = textNode.absoluteBoundingBox;
          if (!textBounds) continue;
          const textRelX = textBounds.x - ctx.instanceBounds.x;
          const textRelY = textBounds.y - ctx.instanceBounds.y;
          const nodeW = textBounds.width;
          const nodeH = textBounds.height;
          const textNodeFontName = textNode.fontName !== figma.mixed ? textNode.fontName : { family: "Mixed", style: "Mixed" };
          const textNodeFontSize = textNode.fontSize !== figma.mixed ? textNode.fontSize : 0;
          let label = "";
          for (const spec of ctx.vc.textStyles) {
            if (spec.fontFamily === textNodeFontName.family && spec.fontWeight === textNodeFontName.style && spec.fontSize === textNodeFontSize) {
              label = spec.token ? `$${spec.token.replace(/\//g, "-")}` : `${spec.fontFamily} / ${spec.fontWeight} / ${spec.fontSize}px / LH: ${spec.lineHeight}`;
              break;
            }
          }
          if (!label) {
            const nodeName = textNode.name.toLowerCase();
            for (const spec of ctx.vc.textStyles) {
              const specEl = spec.element.toLowerCase();
              if (specEl === nodeName || nodeName.includes(specEl) || specEl.includes(nodeName)) {
                label = spec.token ? `$${spec.token.replace(/\//g, "-")}` : `${spec.fontFamily} / ${spec.fontWeight} / ${spec.fontSize}px / LH: ${spec.lineHeight}`;
                break;
              }
            }
          }
          if (!label) {
            label = `${textNodeFontName.family} / ${textNodeFontName.style}`;
          }
          const textX = ctx.instance.x + textRelX;
          const textY = ctx.instance.y + textRelY;
          const isAbove = i % 2 === 0;
          const LINE_LENGTH = 30;
          const DOT_OFFSET = 10;
          const preferredX = textX + nodeW / 2;
          const positions = isAbove ? tracker.topPositions : tracker.bottomPositions;
          const freeX = findFreeXPosition(positions, preferredX, 80);
          positions.push(freeX);
          const startX = freeX;
          const startY = isAbove ? textY - DOT_OFFSET : textY + nodeH + DOT_OFFSET;
          const endX = freeX;
          const endY = isAbove ? textY - DOT_OFFSET - LINE_LENGTH : textY + nodeH + DOT_OFFSET + LINE_LENGTH;
          await createSimpleAnnotation(
            ctx.vizFrame,
            startX,
            startY,
            endX,
            endY,
            label,
            color,
            isAbove ? "pointer-top" : "pointer-bottom",
            "green",
            ctx.highlightMode
          );
        }
      }
    );
  }
  async function createTextBehaviorVisualization(parent, component, variantColors, tableWidth, highlightMode, vizPropertyFilters, framesPerRow) {
    const filteredVariants = filterVariantsForVisualization(
      variantColors,
      vizPropertyFilters
    );
    if (filteredVariants.length === 0) return;
    const variantsWithTruncation = [];
    for (const variant of filteredVariants) {
      let checkInstance = null;
      if (component.type === "COMPONENT_SET") {
        const variantNode = component.children.find((child) => {
          if (child.type !== "COMPONENT") return false;
          const childName = child.name;
          const matches = Object.entries(variant.propertyMap).every(([key, value]) => {
            const normalized = childName.toLowerCase();
            const keyNormalized = key.toLowerCase();
            const valueNormalized = value.toLowerCase();
            return normalized.includes(`${keyNormalized}=${valueNormalized}`) || normalized.includes(valueNormalized);
          });
          return matches;
        });
        if (variantNode) {
          checkInstance = variantNode.createInstance();
        }
      } else if (component.type === "COMPONENT") {
        checkInstance = component.createInstance();
      } else if (component.type === "INSTANCE") {
        checkInstance = component.clone();
      }
      if (checkInstance) {
        const textNodes = await findTextNodes(checkInstance);
        let variantHasTruncation = false;
        for (const textNode of textNodes) {
          const textWithMaxLines = textNode;
          if (textNode.textAutoResize === "HEIGHT" && textWithMaxLines.maxLines != null) {
            variantHasTruncation = true;
            break;
          }
        }
        if (variantHasTruncation) {
          variantsWithTruncation.push(variant);
        }
        checkInstance.remove();
      }
    }
    if (variantsWithTruncation.length === 0) return;
    const subTitle = figma.createText();
    await figma.loadFontAsync(getFont("Medium"));
    subTitle.fontName = getFont("Medium");
    subTitle.fontSize = 18;
    subTitle.characters = "Comportamento de Texto";
    subTitle.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
    parent.appendChild(subTitle);
    await createGenericVariantGrid(
      parent,
      component,
      variantsWithTruncation,
      tableWidth,
      highlightMode,
      framesPerRow,
      {
        gridName: "Comportamento de Texto",
        margin: 80
      },
      async (ctx) => {
        const allTextNodes = await findTextNodes(ctx.instance);
        const truncatedTexts = [];
        for (const textNode of allTextNodes) {
          const textWithMaxLines = textNode;
          if (textNode.textAutoResize !== "HEIGHT" || textWithMaxLines.maxLines == null) continue;
          const textBounds = textNode.absoluteBoundingBox;
          if (!textBounds) continue;
          truncatedTexts.push({
            textNode,
            bounds: textBounds,
            maxLines: textWithMaxLines.maxLines || null
          });
        }
        truncatedTexts.sort((a, b) => a.bounds.y - b.bounds.y);
        for (let i = 0; i < truncatedTexts.length; i++) {
          const { textNode, bounds: textBounds, maxLines } = truncatedTexts[i];
          const textWidth = textBounds.width;
          const textHeight = textBounds.height;
          const fontSize = textNode.fontSize !== figma.mixed ? textNode.fontSize : 14;
          const lineHeight = textNode.lineHeight !== figma.mixed ? typeof textNode.lineHeight === "object" && "value" in textNode.lineHeight ? textNode.lineHeight.value : fontSize * 1.2 : fontSize * 1.2;
          const estimatedLines = maxLines || Math.ceil(textHeight / lineHeight);
          const charsPerLine = Math.floor(textWidth / (fontSize * 0.5));
          const totalChars = charsPerLine * (estimatedLines + 2);
          const loremText = generateLoremIpsum(totalChars);
          try {
            await figma.loadFontAsync(textNode.fontName);
            textNode.characters = loremText;
          } catch (e) {
            try {
              await figma.loadFontAsync({ family: "Inter", style: "Regular" });
              textNode.fontName = { family: "Inter", style: "Regular" };
              textNode.characters = loremText;
            } catch (e2) {
              console.warn("[Typography] Failed to load fallback font", e2);
            }
          }
          const textRelX = textBounds.x - ctx.instanceBounds.x;
          const textRelY = textBounds.y - ctx.instanceBounds.y;
          const textW = textBounds.width;
          const textH = textBounds.height;
          const textX = ctx.instance.x + textRelX;
          const textY = ctx.instance.y + textRelY;
          const label = maxLines ? `Ellipsis - limite de ${maxLines} linha${maxLines > 1 ? "s" : ""}` : "Ellipsis";
          const LINE_LENGTH = 60;
          const DOT_OFFSET = 12;
          let isTextOnTop;
          if (truncatedTexts.length === 1) {
            const textCenterY = textY + textH / 2;
            const instanceCenterY = ctx.instance.y + ctx.instanceBounds.height / 2;
            isTextOnTop = textCenterY < instanceCenterY;
          } else if (i === 0) {
            isTextOnTop = true;
          } else if (i === truncatedTexts.length - 1) {
            isTextOnTop = false;
          } else {
            isTextOnTop = i % 2 === 0;
          }
          const startX = textX + textW / 2;
          let startY;
          let endY;
          if (isTextOnTop) {
            startY = textY - DOT_OFFSET;
            endY = startY - LINE_LENGTH;
          } else {
            startY = textY + textH + DOT_OFFSET;
            endY = startY + LINE_LENGTH;
          }
          const pointerColor = ctx.highlightMode ? { r: 98 / 255, g: 248 / 255, b: 79 / 255 } : { r: 229 / 255, g: 51 / 255, b: 51 / 255 };
          const textColor = ctx.highlightMode ? { r: 98 / 255, g: 248 / 255, b: 79 / 255 } : { r: 0, g: 0, b: 0 };
          await createSimpleAnnotation(
            ctx.vizFrame,
            startX,
            startY,
            startX,
            endY,
            label,
            pointerColor,
            isTextOnTop ? "pointer-top" : "pointer-bottom",
            "red",
            ctx.highlightMode,
            textColor,
            12,
            // fontSize
            "Medium"
            // fontWeight
          );
        }
      }
    );
  }
  function generateLoremIpsum(charCount) {
    const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ";
    let result = "";
    while (result.length < charCount) {
      result += lorem;
    }
    return result.substring(0, charCount);
  }

  // src/core/token-resolution.ts
  async function findBoundVariableToken(node, property, formatter = formatSpaceToken) {
    if (!("boundVariables" in node) || !node.boundVariables) return null;
    const boundVars = node.boundVariables;
    const binding = boundVars[property];
    if (!(binding == null ? void 0 : binding.id)) return null;
    const variable = await figma.variables.getVariableByIdAsync(binding.id);
    if (variable) return formatter(variable.name);
    return null;
  }
  async function findHeightToken(node) {
    return findBoundVariableToken(node, "height", formatDimensionToken);
  }
  function findCornerRadius(node) {
    if (!("cornerRadius" in node)) return null;
    const nodeWithRadius = node;
    if (nodeWithRadius.cornerRadius !== void 0 && nodeWithRadius.cornerRadius !== figma.mixed && nodeWithRadius.cornerRadius > 0) {
      return { value: nodeWithRadius.cornerRadius, isUniform: true };
    }
    if ("topLeftRadius" in node) {
      const nodeWithRadii = node;
      const radii = [
        nodeWithRadii.topLeftRadius,
        nodeWithRadii.topRightRadius,
        nodeWithRadii.bottomLeftRadius,
        nodeWithRadii.bottomRightRadius
      ];
      const nonZero = radii.filter((r) => r > 0);
      if (nonZero.length > 0) {
        return { value: Math.max(...nonZero), isUniform: false };
      }
    }
    return null;
  }
  async function findCornerRadiusToken(node) {
    const radiusKeys = [
      "cornerRadius",
      "topLeftRadius",
      "topRightRadius",
      "bottomLeftRadius",
      "bottomRightRadius"
    ];
    for (const key of radiusKeys) {
      const token = await findBoundVariableToken(node, key, formatRadiusToken);
      if (token) return token;
    }
    return null;
  }
  async function findCornerRadiusRecursive(node) {
    const radiusInfo = findCornerRadius(node);
    if (radiusInfo) return __spreadProps(__spreadValues({}, radiusInfo), { node });
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
  async function findCornerRadiusTokenRecursive(node) {
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
  async function findAllHeightTokensWithNodes(node) {
    const results = [];
    const token = await findHeightToken(node);
    if (token) results.push({ token, node });
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
  async function findStrokeWeight(node) {
    if (!("strokes" in node) || !Array.isArray(node.strokes)) return null;
    if (node.strokes.length === 0) return null;
    const results = [];
    const boundVars = "boundVariables" in node ? node.boundVariables : {};
    const strokeAlign = "strokeAlign" in node ? String(node.strokeAlign) : "CENTER";
    const position = strokeAlign === "INSIDE" ? "Inside" : strokeAlign === "OUTSIDE" ? "Outside" : "Center";
    if ("strokeWeight" in node) {
      if (typeof node.strokeWeight === "number" && node.strokeWeight > 0) {
        results.push({ value: node.strokeWeight, side: "All", position, boundVars });
      } else if (node.strokeWeight === figma.mixed) {
        const sides = [
          { key: "strokeTopWeight", side: "Top" },
          { key: "strokeBottomWeight", side: "Bottom" },
          { key: "strokeLeftWeight", side: "Left" },
          { key: "strokeRightWeight", side: "Right" }
        ];
        for (const { key, side } of sides) {
          if (key in node) {
            const value = node[key];
            if (typeof value === "number" && value > 0) {
              results.push({ value, side, position, boundVars });
            }
          }
        }
      }
    }
    return results.length > 0 ? results : null;
  }
  async function resolveStrokeToken(stroke) {
    let varKey = stroke.side === "All" ? "strokeWeight" : `stroke${stroke.side}Weight`;
    if (stroke.side === "All" && !(varKey in stroke.boundVars) && "strokeTopWeight" in stroke.boundVars) {
      varKey = "strokeTopWeight";
    }
    const binding = stroke.boundVars[varKey];
    if (varKey in stroke.boundVars && (binding == null ? void 0 : binding.id)) {
      const variable = await figma.variables.getVariableByIdAsync(binding.id);
      if (variable) return formatSpaceToken(variable.name);
    }
    return null;
  }

  // src/features/spacing.ts
  async function createSpacingSectionCombined(parent, variantColors, nodeToProcess, tableWidth, highlightMode, vizPropertyFilters, framesPerRow = 2, showTable = true, showViz = true) {
    const hasSpacings = variantColors.some(
      (v) => v.spacings.length > 0 || v.borders.length > 0
    );
    if (!hasSpacings) return false;
    if (!showTable && !showViz) return false;
    const section = createSectionContainer("Se\xE7\xE3o Medidas e Espa\xE7amentos");
    createSectionTitle("Medidas e espa\xE7amentos", section);
    if (showTable) {
      const filteredForTable = filterVariantsForVisualization(variantColors, vizPropertyFilters);
      await createSpacingTableInSection(section, filteredForTable, tableWidth, void 0);
    }
    if (showViz) {
      await createPaddingGapVisualizationInSection(
        section,
        nodeToProcess,
        variantColors,
        tableWidth,
        highlightMode,
        vizPropertyFilters,
        framesPerRow
      );
      await createDimensionVisualizationInSection(
        section,
        nodeToProcess,
        variantColors,
        tableWidth,
        highlightMode,
        vizPropertyFilters,
        framesPerRow
      );
    }
    parent.appendChild(section);
    return true;
  }
  async function createSpacingTableInSection(parent, variantColors, tableWidth, variantPropertyOrder) {
    const hasSpacing = variantColors.some(
      (v) => v.spacings.length > 0 || v.borders.length > 0
    );
    if (!hasSpacing) return;
    const GROUP_SPACING = 20;
    const ROW_GAP = 4;
    const table = createTableBuilder("Tabela Espa\xE7amentos", tableWidth, [
      { header: "Medida", position: 0 },
      { header: "Token / Valor", position: 0.4, color: "error" },
      { header: "Refer\xEAncia", position: 0.75 }
    ]);
    const spacingsByProperty = /* @__PURE__ */ new Map();
    for (const variant of variantColors) {
      const variantLabel = formatVariantPropertiesForTable(variant.propertyMap, variantPropertyOrder);
      for (const spacing of variant.spacings) {
        let propName = spacing.property;
        if (spacing.property === "Gap") {
          const dirLabel = spacing.direction === "H" ? "Horiz" : "Vert";
          const parentLabel = spacing.element && spacing.element !== "Container" ? ` (${spacing.element})` : "";
          const hasContext = spacing.properties && spacing.properties !== spacing.element && spacing.properties !== "Container" && !spacing.properties.includes("=");
          const contextLabel = hasContext ? ` / ${spacing.properties}` : "";
          propName = `Gap (${dirLabel})${parentLabel}${contextLabel}`;
        } else if (spacing.property.includes("Padding") && spacing.element && spacing.element !== "Container") {
          propName = `${spacing.property} (${spacing.element})`;
        } else if ((spacing.property === "Border Radius" || spacing.property === "Height") && spacing.element && spacing.element !== "Container") {
          propName = `${spacing.property} / ${spacing.element}`;
        }
        if (!spacingsByProperty.has(propName)) {
          spacingsByProperty.set(propName, []);
        }
        const entries = spacingsByProperty.get(propName);
        const existing = entries.find(
          (e) => (e.token || e.value) === (spacing.token || spacing.value)
        );
        if (existing) {
          if (!existing.variants.includes(variantLabel)) {
            existing.variants.push(variantLabel);
          }
        } else {
          entries.push({
            token: spacing.token,
            value: spacing.value,
            variants: [variantLabel]
          });
        }
      }
      const bordersByPosition = /* @__PURE__ */ new Map();
      for (const border of variant.borders) {
        const position = border.position || "Center";
        if (!bordersByPosition.has(position)) {
          bordersByPosition.set(position, []);
        }
        bordersByPosition.get(position).push(border);
      }
      for (const [position, bordersInPosition] of bordersByPosition) {
        const sides = bordersInPosition.filter((b) => b.side && b.side !== "All");
        const allSide = bordersInPosition.find((b) => b.side === "All");
        if (allSide || sides.length === 4 && sides.every((b) => b.value === sides[0].value && (b.token || null) === (sides[0].token || null))) {
          const firstBorder = allSide || sides[0];
          const positionProp = "Stroke Position";
          if (!spacingsByProperty.has(positionProp)) {
            spacingsByProperty.set(positionProp, []);
          }
          const positionEntries = spacingsByProperty.get(positionProp);
          const existingPosition = positionEntries.find(
            (e) => e.value === position
          );
          if (existingPosition) {
            if (!existingPosition.variants.includes(variantLabel)) {
              existingPosition.variants.push(variantLabel);
            }
          } else {
            positionEntries.push({
              token: null,
              value: position,
              variants: [variantLabel]
            });
          }
          const borderProp = "Border";
          if (!spacingsByProperty.has(borderProp)) {
            spacingsByProperty.set(borderProp, []);
          }
          const borderEntries = spacingsByProperty.get(borderProp);
          const existingBorder = borderEntries.find(
            (e) => (e.token || e.value) === (firstBorder.token || firstBorder.value)
          );
          if (existingBorder) {
            if (!existingBorder.variants.includes(variantLabel)) {
              existingBorder.variants.push(variantLabel);
            }
          } else {
            borderEntries.push({
              token: firstBorder.token,
              value: firstBorder.value,
              variants: [variantLabel]
            });
          }
        } else {
          for (const border of bordersInPosition) {
            const sideName = border.side && border.side !== "All" ? ` ${border.side}` : "";
            const positionName = border.position ? ` (${border.position})` : "";
            const propName = `Border${sideName}${positionName}`;
            if (!spacingsByProperty.has(propName)) {
              spacingsByProperty.set(propName, []);
            }
            const entries = spacingsByProperty.get(propName);
            const existing = entries.find(
              (e) => (e.token || e.value) === (border.token || border.value)
            );
            if (existing) {
              if (!existing.variants.includes(variantLabel)) {
                existing.variants.push(variantLabel);
              }
            } else {
              entries.push({
                token: border.token,
                value: border.value,
                variants: [variantLabel]
              });
            }
          }
        }
      }
    }
    const allDisplayEntries = [];
    const allVariantLabels = /* @__PURE__ */ new Set();
    for (const variant of variantColors) {
      const variantLabel = formatVariantPropertiesForTable(variant.propertyMap, variantPropertyOrder);
      allVariantLabels.add(variantLabel);
    }
    const totalVariants = allVariantLabels.size;
    for (const [property, entries] of spacingsByProperty) {
      for (const entry of entries) {
        const isUsedByAllVariants = entry.variants.length === totalVariants;
        if (isUsedByAllVariants && totalVariants > 1) {
          allDisplayEntries.push({
            prefix: "Todos",
            displayText: `Todos / ${property}`,
            token: entry.token,
            value: entry.value
          });
        } else {
          const entryGroups = /* @__PURE__ */ new Set();
          for (const variantLabel of entry.variants) {
            const firstPart = variantLabel.split(" / ")[0];
            const groupValue = firstPart.split(": ")[1] || firstPart;
            entryGroups.add(groupValue);
          }
          for (const group of entryGroups) {
            allDisplayEntries.push({
              prefix: group,
              displayText: `${group} / ${property}`,
              token: entry.token,
              value: entry.value
            });
          }
        }
      }
    }
    const entriesByPrefix = /* @__PURE__ */ new Map();
    for (const entry of allDisplayEntries) {
      if (!entriesByPrefix.has(entry.prefix)) {
        entriesByPrefix.set(entry.prefix, []);
      }
      entriesByPrefix.get(entry.prefix).push(entry);
    }
    const sortedPrefixes = Array.from(entriesByPrefix.keys()).sort((a, b) => {
      if (a === "Todos") return -1;
      if (b === "Todos") return 1;
      return a.localeCompare(b);
    });
    let isFirstGroup = true;
    for (const prefix of sortedPrefixes) {
      const groupEntries = entriesByPrefix.get(prefix);
      if (groupEntries.length === 0) continue;
      if (!isFirstGroup) {
        table.addSpacer(GROUP_SPACING - ROW_GAP);
      }
      isFirstGroup = false;
      for (const entry of groupEntries) {
        table.addRow(`Row - ${entry.displayText}`, [
          { text: entry.displayText },
          { text: entry.token || entry.value, color: entry.token ? "error" : void 0 },
          { text: entry.value }
        ]);
      }
    }
    table.appendTo(parent);
  }
  async function createPaddingGapVisualizationInSection(parent, component, variantColors, tableWidth, highlightMode, vizPropertyFilters, framesPerRow) {
    const hasPaddingsOrGaps = variantColors.some(
      (v) => v.spacings.some((s) => s.property.includes("Padding") || s.property === "Gap")
    );
    if (!hasPaddingsOrGaps) return;
    const filteredVariants = filterVariantsForVisualization(
      variantColors,
      vizPropertyFilters
    );
    if (component.type === "COMPONENT_SET" && filteredVariants.length > 1) {
      await createMultiVariantSpacingGrid(
        parent,
        component,
        filteredVariants,
        tableWidth,
        highlightMode,
        framesPerRow
      );
      return;
    }
    let baseComponent = null;
    if (component.type === "COMPONENT_SET") {
      baseComponent = component.children.find(
        (c) => c.type === "COMPONENT"
      );
    } else {
      baseComponent = component;
    }
    if (!baseComponent) return;
    const instance = baseComponent.type === "INSTANCE" ? baseComponent.clone() : baseComponent.createInstance();
    const vizContainer = figma.createFrame();
    vizContainer.name = "Visualiza\xE7\xE3o Paddings e Gaps";
    vizContainer.layoutMode = "VERTICAL";
    vizContainer.primaryAxisSizingMode = "AUTO";
    vizContainer.counterAxisSizingMode = "FIXED";
    vizContainer.resize(tableWidth, 100);
    vizContainer.itemSpacing = 16;
    vizContainer.fills = [];
    const subTitle = figma.createText();
    subTitle.fontName = getFont("Medium");
    subTitle.fontSize = 18;
    subTitle.characters = "Visualiza\xE7\xE3o de Paddings e Gaps";
    vizContainer.appendChild(subTitle);
    const MARGIN = 120;
    const frameWidth = tableWidth;
    const frameHeight = Math.max(300, instance.height + MARGIN * 2);
    const frame = figma.createFrame();
    frame.name = "Spacing Visualization";
    frame.resize(frameWidth, frameHeight);
    const frameBgColor = highlightMode ? { r: 56 / 255, g: 83 / 255, b: 255 / 255 } : { r: 254 / 255, g: 254 / 255, b: 254 / 255 };
    frame.fills = [{ type: "SOLID", color: frameBgColor }];
    frame.cornerRadius = 8;
    frame.clipsContent = false;
    instance.x = frameWidth / 2 - instance.width / 2;
    instance.y = frameHeight / 2 - instance.height / 2;
    frame.appendChild(instance);
    const instanceBounds = instance.absoluteBoundingBox;
    if (instanceBounds) {
      await processSpacingNodeForViz(
        instance,
        frame,
        instance.x,
        instance.y,
        instanceBounds,
        highlightMode
      );
    }
    vizContainer.appendChild(frame);
    parent.appendChild(vizContainer);
  }
  async function createDimensionVisualizationInSection(parent, component, variantColors, tableWidth, highlightMode, vizPropertyFilters, framesPerRow) {
    var _a;
    const filteredVariants = filterVariantsForVisualization(
      variantColors,
      vizPropertyFilters
    );
    if (component.type === "COMPONENT_SET" && filteredVariants.length > 1) {
      await createMultiVariantDimensionGrid(
        parent,
        component,
        filteredVariants,
        tableWidth,
        highlightMode,
        framesPerRow
      );
      return;
    }
    let baseComponent = null;
    if (component.type === "COMPONENT_SET") {
      baseComponent = component.children.find(
        (c) => c.type === "COMPONENT"
      );
    } else {
      baseComponent = component;
    }
    if (!baseComponent) return;
    const instance = baseComponent.type === "INSTANCE" ? baseComponent.clone() : baseComponent.createInstance();
    const vizContainer = figma.createFrame();
    vizContainer.name = "Visualiza\xE7\xE3o Dimens\xF5es e Bordas";
    vizContainer.layoutMode = "VERTICAL";
    vizContainer.primaryAxisSizingMode = "AUTO";
    vizContainer.counterAxisSizingMode = "FIXED";
    vizContainer.resize(tableWidth, 100);
    vizContainer.itemSpacing = 16;
    vizContainer.fills = [];
    const subTitle = figma.createText();
    subTitle.fontName = getFont("Medium");
    subTitle.fontSize = 18;
    subTitle.characters = "Visualiza\xE7\xE3o de Dimens\xF5es e Bordas";
    vizContainer.appendChild(subTitle);
    const MARGIN = 120;
    const frameWidth = tableWidth;
    const frameHeight = Math.max(300, instance.height + MARGIN * 2);
    const frame = figma.createFrame();
    frame.name = "Dimension Visualization";
    frame.resize(frameWidth, frameHeight);
    const frameBgColor = highlightMode ? { r: 56 / 255, g: 83 / 255, b: 255 / 255 } : { r: 254 / 255, g: 254 / 255, b: 254 / 255 };
    frame.fills = [{ type: "SOLID", color: frameBgColor }];
    frame.cornerRadius = 8;
    frame.clipsContent = false;
    instance.x = frameWidth / 2 - instance.width / 2;
    instance.y = frameHeight / 2 - instance.height / 2;
    frame.appendChild(instance);
    const instX = instance.x;
    const instY = instance.y;
    const instW = instance.width;
    const instH = instance.height;
    const tracker = createAnnotationTracker();
    const allHeightTokens = await findAllHeightTokensWithNodes(instance);
    const instanceBoundsForDim = instance.absoluteBoundingBox;
    if (instanceBoundsForDim) {
      const rootTokens = allHeightTokens.filter((t) => t.node === instance);
      const childTokens = allHeightTokens.filter((t) => t.node !== instance);
      for (const heightResult of rootTokens) {
        await annotateDimensionNewSmart(
          frame,
          "height",
          instH,
          instX,
          instY,
          instW,
          instH,
          heightResult.token,
          highlightMode,
          "right",
          tracker
        );
      }
      const seenChildTokens = /* @__PURE__ */ new Set();
      for (const heightResult of childTokens) {
        const dedupeKey = `${(_a = heightResult.token) != null ? _a : ""}__${Math.round(heightResult.node.height)}`;
        if (seenChildTokens.has(dedupeKey)) continue;
        seenChildTokens.add(dedupeKey);
        const nodeBounds = heightResult.node.absoluteBoundingBox;
        if (nodeBounds) {
          const relX = nodeBounds.x - instanceBoundsForDim.x;
          const relY = nodeBounds.y - instanceBoundsForDim.y;
          const nodeW = nodeBounds.width;
          const nodeH = nodeBounds.height;
          const nodeX = instX + relX;
          const nodeY = instY + relY;
          await annotateDimensionNewSmart(
            frame,
            "height",
            nodeH,
            nodeX,
            nodeY,
            nodeW,
            nodeH,
            heightResult.token,
            highlightMode,
            "left",
            void 0
          );
        }
      }
    }
    const radiusResult = await findCornerRadiusRecursive(baseComponent);
    if (radiusResult) {
      const radiusToken = await findCornerRadiusTokenRecursive(baseComponent);
      await annotateRadiusNew(
        frame,
        radiusResult.value,
        instX,
        instY,
        instW,
        instH,
        radiusToken,
        highlightMode
      );
    }
    const instanceAbsBounds = instance.absoluteBoundingBox;
    if (instanceAbsBounds) {
      const allStrokes = await collectAllStrokesRecursive(instance, instanceAbsBounds, instX, instY);
      for (const entry of allStrokes) {
        await annotateBorderNew(
          frame,
          entry.stroke.value,
          entry.nodeX,
          entry.nodeY,
          entry.nodeW,
          entry.nodeH,
          entry.token,
          highlightMode,
          entry.stroke.side,
          entry.stroke.position
        );
      }
    }
    await annotateStructuralComponentsDimensions(frame, instance, highlightMode);
    vizContainer.appendChild(frame);
    parent.appendChild(vizContainer);
  }
  async function createMultiVariantSpacingGrid(parent, componentSet, variantColors, tableWidth, highlightMode, framesPerRow = 2) {
    await createGenericVariantGrid(
      parent,
      componentSet,
      variantColors,
      tableWidth,
      highlightMode,
      framesPerRow,
      {
        gridName: "Grid Variantes - Espa\xE7amentos",
        margin: 100
      },
      async (ctx) => {
        await processSpacingNodeForViz(
          ctx.instance,
          ctx.vizFrame,
          ctx.instance.x,
          ctx.instance.y,
          ctx.instanceBounds,
          ctx.highlightMode
        );
      }
    );
  }
  async function variantHasDimensionContent(componentSet, variant) {
    const variantNode = componentSet.children.find(
      (c) => c.type === "COMPONENT" && c.name === variant.variantName
    );
    if (!variantNode) return false;
    const tempInstance = variantNode.createInstance();
    try {
      const allHeightTokens = await findAllHeightTokensWithNodes(tempInstance);
      if (allHeightTokens.length > 0) {
        return true;
      }
      const radiusResult = await findCornerRadiusRecursive(variantNode);
      if (radiusResult) {
        return true;
      }
      const strokeInfo = await findStrokeWeight(tempInstance);
      if (strokeInfo && strokeInfo.length > 0) {
        return true;
      }
      const hasStructuralContent = await checkStructuralComponentsHaveContent(tempInstance);
      if (hasStructuralContent) {
        return true;
      }
      return false;
    } finally {
      tempInstance.remove();
    }
  }
  async function checkStructuralComponentsHaveContent(instance) {
    async function checkRecursive(node) {
      if (node.type === "INSTANCE") {
        const isStructural = await isStructuralInstance(node);
        if (!isStructural) {
          return false;
        }
        if (isStructural) {
          const structInstance = node;
          const mainComp = await structInstance.getMainComponentAsync();
          if (!mainComp) return false;
          const heightToken = await findHeightToken(mainComp);
          if (heightToken) return true;
          const radiusInfo = findCornerRadius(mainComp);
          if (radiusInfo) return true;
          const strokeInfo = await findStrokeWeight(structInstance);
          if (strokeInfo && strokeInfo.length > 0) return true;
        }
      }
      if ("children" in node) {
        for (const child of node.children) {
          if (await checkRecursive(child)) return true;
        }
      }
      return false;
    }
    return checkRecursive(instance);
  }
  async function createMultiVariantDimensionGrid(parent, componentSet, variantColors, tableWidth, highlightMode, framesPerRow = 2) {
    const variantsWithContent = [];
    for (const variant of variantColors) {
      const hasContent = await variantHasDimensionContent(componentSet, variant);
      if (hasContent) {
        variantsWithContent.push(variant);
      }
    }
    if (variantsWithContent.length === 0) return;
    const vizContainer = figma.createFrame();
    vizContainer.name = "Visualiza\xE7\xE3o Dimens\xF5es e Bordas";
    vizContainer.layoutMode = "VERTICAL";
    vizContainer.primaryAxisSizingMode = "AUTO";
    vizContainer.counterAxisSizingMode = "AUTO";
    vizContainer.itemSpacing = 16;
    vizContainer.fills = [];
    const subTitle = figma.createText();
    subTitle.fontName = getFont("Bold");
    subTitle.fontSize = 40;
    subTitle.characters = "Visualiza\xE7\xE3o de dimens\xF5es e bordas";
    vizContainer.appendChild(subTitle);
    await createGenericVariantGrid(
      vizContainer,
      componentSet,
      variantsWithContent,
      tableWidth,
      highlightMode,
      framesPerRow,
      {
        gridName: "Grid Variantes - Dimens\xF5es",
        margin: 100
      },
      async (ctx) => {
        var _a;
        const instX = ctx.instance.x;
        const instY = ctx.instance.y;
        const instW = ctx.instance.width;
        const instH = ctx.instance.height;
        const tracker = createAnnotationTracker();
        const mainComp = await ctx.instance.getMainComponentAsync();
        if (mainComp) {
          const allHeightTokens = await findAllHeightTokensWithNodes(ctx.instance);
          const instanceBounds = ctx.instance.absoluteBoundingBox;
          if (instanceBounds) {
            const rootTokens = allHeightTokens.filter((t) => t.node === ctx.instance);
            const childTokens = allHeightTokens.filter((t) => t.node !== ctx.instance);
            for (const heightResult of rootTokens) {
              await annotateDimensionNewSmart(
                ctx.vizFrame,
                "height",
                instH,
                instX,
                instY,
                instW,
                instH,
                heightResult.token,
                ctx.highlightMode,
                "right",
                // Lado direito para o componente principal
                tracker
              );
            }
            const seenChildTokens = /* @__PURE__ */ new Set();
            for (const heightResult of childTokens) {
              const dedupeKey = `${(_a = heightResult.token) != null ? _a : ""}__${Math.round(heightResult.node.height)}`;
              if (seenChildTokens.has(dedupeKey)) continue;
              seenChildTokens.add(dedupeKey);
              const nodeBounds = heightResult.node.absoluteBoundingBox;
              if (nodeBounds) {
                const relX = nodeBounds.x - instanceBounds.x;
                const relY = nodeBounds.y - instanceBounds.y;
                const nodeW = nodeBounds.width;
                const nodeH = nodeBounds.height;
                const nodeX = instX + relX;
                const nodeY = instY + relY;
                await annotateDimensionNewSmart(
                  ctx.vizFrame,
                  "height",
                  nodeH,
                  nodeX,
                  nodeY,
                  nodeW,
                  nodeH,
                  heightResult.token,
                  ctx.highlightMode,
                  "left",
                  // Lado esquerdo para elementos internos
                  void 0
                  // Não usar tracker - cada elemento interno tem sua própria posição Y
                );
              }
            }
          }
          const radiusResult = await findCornerRadiusRecursive(mainComp);
          if (radiusResult) {
            const radiusToken = await findCornerRadiusTokenRecursive(mainComp);
            await annotateRadiusNew(
              ctx.vizFrame,
              radiusResult.value,
              instX,
              instY,
              instW,
              instH,
              radiusToken,
              // pode ser null, a função vai mostrar o valor em px
              ctx.highlightMode
            );
          }
          const instanceAbsBoundsMulti = ctx.instance.absoluteBoundingBox;
          if (instanceAbsBoundsMulti) {
            const allStrokes = await collectAllStrokesRecursive(ctx.instance, instanceAbsBoundsMulti, instX, instY);
            for (const entry of allStrokes) {
              await annotateBorderNew(
                ctx.vizFrame,
                entry.stroke.value,
                entry.nodeX,
                entry.nodeY,
                entry.nodeW,
                entry.nodeH,
                entry.token,
                ctx.highlightMode,
                entry.stroke.side,
                entry.stroke.position
              );
            }
          }
        }
        await annotateStructuralComponentsDimensions(ctx.vizFrame, ctx.instance, ctx.highlightMode);
      }
    );
    parent.appendChild(vizContainer);
  }
  async function collectAllStrokesRecursive(node, instanceRootBounds, instX, instY) {
    const results = [];
    const strokeInfo = await findStrokeWeight(node);
    if (strokeInfo && strokeInfo.length > 0) {
      const nodeBounds = node.absoluteBoundingBox;
      if (nodeBounds) {
        const relX = nodeBounds.x - instanceRootBounds.x;
        const relY = nodeBounds.y - instanceRootBounds.y;
        const nodeX = instX + relX;
        const nodeY = instY + relY;
        const nodeW = nodeBounds.width;
        const nodeH = nodeBounds.height;
        for (const stroke of strokeInfo) {
          const token = await resolveStrokeToken(stroke);
          results.push({ stroke, token, nodeX, nodeY, nodeW, nodeH });
        }
      }
    }
    if ("children" in node) {
      for (const child of node.children) {
        if (child.type === "INSTANCE") {
          const structural = await isStructuralInstance(child);
          if (!structural) continue;
        }
        const childResults = await collectAllStrokesRecursive(child, instanceRootBounds, instX, instY);
        results.push(...childResults);
      }
    }
    return results;
  }
  function hasElementsInArea(instance, areaX, areaY, areaW, areaH, excludeNode) {
    const instanceBounds = instance.absoluteBoundingBox;
    if (!instanceBounds) return false;
    const absoluteAreaX = areaX;
    const absoluteAreaY = areaY;
    function checkNodeOverlap(node) {
      if (node === excludeNode) return false;
      if (!("visible" in node) || !node.visible) return false;
      if (node.type === "FRAME" || node.type === "GROUP") return false;
      const bounds = node.absoluteBoundingBox;
      if (!bounds) return false;
      const overlapsX = bounds.x < absoluteAreaX + areaW && bounds.x + bounds.width > absoluteAreaX;
      const overlapsY = bounds.y < absoluteAreaY + areaH && bounds.y + bounds.height > absoluteAreaY;
      return overlapsX && overlapsY;
    }
    function checkRecursive(node) {
      if (checkNodeOverlap(node)) return true;
      if ("children" in node) {
        for (const child of node.children) {
          if (checkRecursive(child)) return true;
        }
      }
      return false;
    }
    return checkRecursive(instance);
  }
  function getBestSideForHeightAnnotation(nodeX, nodeY, nodeW, nodeH, containerW, containerH, instance, structInstance) {
    const BADGE_WIDTH = 80;
    const BADGE_HEIGHT = 30;
    const MARGIN = 20;
    const instanceBounds = instance.absoluteBoundingBox;
    if (!instanceBounds) return "right";
    const structBounds = structInstance.absoluteBoundingBox;
    if (!structBounds) return "right";
    const sides = [
      {
        name: "left",
        areaX: structBounds.x - BADGE_WIDTH - MARGIN,
        areaY: structBounds.y + structBounds.height / 2 - BADGE_HEIGHT / 2,
        areaW: BADGE_WIDTH,
        areaH: BADGE_HEIGHT,
        hasSpace: nodeX >= BADGE_WIDTH + MARGIN
      },
      {
        name: "right",
        areaX: structBounds.x + structBounds.width + MARGIN,
        areaY: structBounds.y + structBounds.height / 2 - BADGE_HEIGHT / 2,
        areaW: BADGE_WIDTH,
        areaH: BADGE_HEIGHT,
        hasSpace: containerW - (nodeX + nodeW) >= BADGE_WIDTH + MARGIN
      },
      {
        name: "bottom",
        areaX: structBounds.x + structBounds.width / 2 - BADGE_WIDTH / 2,
        areaY: structBounds.y + structBounds.height + MARGIN,
        areaW: BADGE_WIDTH,
        areaH: BADGE_HEIGHT,
        hasSpace: containerH - (nodeY + nodeH) >= BADGE_HEIGHT + MARGIN + 15
      },
      {
        name: "top",
        areaX: structBounds.x + structBounds.width / 2 - BADGE_WIDTH / 2,
        areaY: structBounds.y - BADGE_HEIGHT - MARGIN,
        areaW: BADGE_WIDTH,
        areaH: BADGE_HEIGHT,
        hasSpace: nodeY >= BADGE_HEIGHT + MARGIN + 15
      }
    ];
    for (const side of sides) {
      if (!side.hasSpace) continue;
      const hasBlockingElements = hasElementsInArea(
        instance,
        side.areaX,
        side.areaY,
        side.areaW,
        side.areaH,
        structInstance
      );
      if (!hasBlockingElements) {
        return side.name;
      }
    }
    const leftSpace = nodeX;
    const rightSpace = containerW - (nodeX + nodeW);
    const bottomSpace = containerH - (nodeY + nodeH);
    const topSpace = nodeY;
    if (leftSpace >= rightSpace && leftSpace >= bottomSpace && leftSpace >= topSpace) return "left";
    if (rightSpace >= bottomSpace && rightSpace >= topSpace) return "right";
    if (bottomSpace >= topSpace) return "bottom";
    return "top";
  }
  async function annotateStructuralComponentsDimensions(container, instance, highlightMode) {
    const structuralInstances = [];
    async function findStructuralInstancesRecursive(node) {
      if (node.type === "INSTANCE") {
        const isStructural = await isStructuralInstance(node);
        if (isStructural) {
          structuralInstances.push(node);
        } else {
          return;
        }
      }
      if ("children" in node) {
        for (const child of node.children) {
          await findStructuralInstancesRecursive(child);
        }
      }
    }
    await findStructuralInstancesRecursive(instance);
    const instanceBounds = instance.absoluteBoundingBox;
    if (!instanceBounds) return;
    const tracker = createAnnotationTracker();
    for (const structInstance of structuralInstances) {
      const bounds = structInstance.absoluteBoundingBox;
      if (!bounds) continue;
      const mainComp = await structInstance.getMainComponentAsync();
      if (!mainComp) continue;
      const nodeRelX = bounds.x - instanceBounds.x;
      const nodeRelY = bounds.y - instanceBounds.y;
      const nodeX = instance.x + nodeRelX;
      const nodeY = instance.y + nodeRelY;
      const nodeW = bounds.width;
      const nodeH = bounds.height;
      const heightToken = await findHeightToken(mainComp);
      if (heightToken) {
        const bestSide = getBestSideForHeightAnnotation(
          nodeX,
          nodeY,
          nodeW,
          nodeH,
          container.width,
          container.height,
          instance,
          structInstance
        );
        await annotateDimensionNewSmart(
          container,
          "height",
          nodeH,
          nodeX,
          nodeY,
          nodeW,
          nodeH,
          heightToken,
          highlightMode,
          bestSide,
          tracker
        );
      }
      const radiusInfo = findCornerRadius(mainComp);
      if (radiusInfo) {
        const radiusToken = await findCornerRadiusToken(mainComp);
        await annotateRadiusNew(
          container,
          radiusInfo.value,
          nodeX,
          nodeY,
          nodeW,
          nodeH,
          radiusToken,
          highlightMode
        );
      }
      const strokeInfo = await findStrokeWeight(structInstance);
      if (strokeInfo && strokeInfo.length > 0) {
        for (const stroke of strokeInfo) {
          const borderToken = await resolveStrokeToken(stroke);
          await annotateBorderNew(
            container,
            stroke.value,
            nodeX,
            nodeY,
            nodeW,
            nodeH,
            borderToken,
            highlightMode,
            stroke.side,
            stroke.position
          );
        }
      }
    }
    const iconEntries = [];
    const processedIconIds = /* @__PURE__ */ new Set();
    async function findIconInstancesRecursive(node) {
      if (node.type === "INSTANCE" && node !== instance) {
        const hasDirectVector = "children" in node && node.children.some(
          (c) => c.name === "Vector" || c.type === "VECTOR"
        );
        if (hasDirectVector) {
          if (await shouldCollectIcon(node, instance)) {
            if (!processedIconIds.has(node.id)) {
              processedIconIds.add(node.id);
              iconEntries.push({ measureNode: node, iconInstance: node });
            }
          }
          return;
        }
        const isStructural = await isStructuralInstance(node);
        if (!isStructural) return;
      }
      if ("children" in node) {
        for (const child of node.children) {
          await findIconInstancesRecursive(child);
        }
      }
    }
    await findIconInstancesRecursive(instance);
    for (const { measureNode, iconInstance } of iconEntries) {
      const iconBounds = measureNode.absoluteBoundingBox;
      if (!iconBounds) continue;
      const relX = iconBounds.x - instanceBounds.x;
      const relY = iconBounds.y - instanceBounds.y;
      const nodeX = instance.x + relX;
      const nodeY = instance.y + relY;
      const nodeW = iconBounds.width;
      const nodeH = iconBounds.height;
      const iconToken = await findHeightToken(measureNode);
      const label = iconToken || `${Math.round(nodeH)}px`;
      const bestSide = getBestSideForHeightAnnotation(
        nodeX,
        nodeY,
        nodeW,
        nodeH,
        container.width,
        container.height,
        instance,
        iconInstance
      );
      await annotateDimensionNewSmart(
        container,
        "height",
        nodeH,
        nodeX,
        nodeY,
        nodeW,
        nodeH,
        label,
        highlightMode,
        bestSide,
        tracker
      );
    }
  }
  async function processSpacingNodeForViz(node, container, baseX, baseY, instanceBounds, highlightMode = false, tracker) {
    if ("visible" in node && !node.visible) return;
    if (!tracker) {
      tracker = {
        rightPositions: [],
        leftPositions: [],
        topPositions: [],
        bottomPositions: [],
        gapPositions: []
      };
    }
    const hasLayout = "layoutMode" in node && node.layoutMode !== "NONE" || node.type === "INSTANCE" && "layoutMode" in node;
    if (hasLayout) {
      const n = node;
      const nodeBounds = n.absoluteBoundingBox;
      if (!nodeBounds) {
        return;
      }
      const nodeRelX = nodeBounds.x - instanceBounds.x;
      const nodeRelY = nodeBounds.y - instanceBounds.y;
      const nodeX = baseX + nodeRelX;
      const nodeY = baseY + nodeRelY;
      const nodeW = nodeBounds.width;
      const nodeH = nodeBounds.height;
      if (n.itemSpacing && n.itemSpacing > 0 && n.children && n.children.length >= 2) {
        const gapToken = await findBoundVariableToken(n, "itemSpacing", formatSpaceToken);
        const visibleChildren = n.children.filter(
          (child) => "visible" in child ? child.visible : true
        );
        const isHorizontal = n.layoutMode === "HORIZONTAL";
        for (let i = 0; i < visibleChildren.length - 1; i++) {
          await annotateGapNew(
            container,
            n,
            n.itemSpacing,
            isHorizontal ? "H" : "V",
            nodeX,
            nodeY,
            gapToken,
            i,
            highlightMode,
            tracker
          );
        }
      }
      const paddingProps = [
        { key: "paddingTop", side: "top" },
        { key: "paddingBottom", side: "bottom" },
        { key: "paddingLeft", side: "left" },
        { key: "paddingRight", side: "right" }
      ];
      for (const { key, side } of paddingProps) {
        const paddingValue = n[key];
        if (paddingValue > 0) {
          const paddingToken = await findBoundVariableToken(n, key, formatSpaceToken);
          await annotatePaddingNew(
            container,
            paddingValue,
            side,
            nodeX,
            nodeY,
            nodeW,
            nodeH,
            paddingToken,
            highlightMode,
            tracker
          );
        }
      }
    }
    if ("children" in node) {
      for (const child of node.children) {
        if (child.type === "INSTANCE") {
          const isStructural = await isStructuralInstance(child);
          if (!isStructural) continue;
        }
        await processSpacingNodeForViz(
          child,
          container,
          baseX,
          baseY,
          instanceBounds,
          highlightMode,
          tracker
        );
      }
    }
  }

  // src/features/effects.ts
  function getSmartVariantLabel(variantPropertyMaps, totalVariants, layerName) {
    const count = variantPropertyMaps.length;
    if (count === totalVariants) {
      return layerName !== "Container" ? `Todos (${layerName})` : "Todos";
    }
    if (count === 1) {
      const props = variantPropertyMaps[0];
      const values = Object.values(props).filter((v) => v);
      const label2 = values.join(" / ") || "Default";
      return layerName !== "Container" ? `${label2} (${layerName})` : label2;
    }
    const allKeys = /* @__PURE__ */ new Set();
    for (const pm of variantPropertyMaps) {
      for (const key of Object.keys(pm)) {
        allKeys.add(key);
      }
    }
    const constantProps = {};
    const variableProps = /* @__PURE__ */ new Set();
    for (const key of allKeys) {
      const values = variantPropertyMaps.map((pm) => pm[key] || "").filter((v) => v);
      const uniqueValues = new Set(values);
      if (uniqueValues.size === 1 && values.length === count) {
        constantProps[key] = values[0];
      } else if (uniqueValues.size > 1) {
        variableProps.add(key);
      }
    }
    const constantValues = Object.values(constantProps);
    if (constantValues.length > 0) {
      const label2 = constantValues.join(" / ");
      return layerName !== "Container" ? `${label2} (${layerName})` : label2;
    }
    const priorityKeys = ["status", "state", "type", "variant", "mode"];
    let relevantKey = null;
    for (const pk of priorityKeys) {
      if (allKeys.has(pk)) {
        relevantKey = pk;
        break;
      }
    }
    if (!relevantKey && allKeys.size > 0) {
      relevantKey = Array.from(allKeys)[0];
    }
    if (relevantKey) {
      const uniqueValuesForKey = new Set(
        variantPropertyMaps.map((pm) => pm[relevantKey] || "").filter((v) => v)
      );
      if (uniqueValuesForKey.size <= 3) {
        const label2 = Array.from(uniqueValuesForKey).join(", ");
        return layerName !== "Container" ? `${label2} (${layerName})` : label2;
      }
    }
    const label = `${count} variantes`;
    return layerName !== "Container" ? `${label} (${layerName})` : label;
  }
  function findNodesWithEffectsLocal(node) {
    const results = [];
    if ("effects" in node && Array.isArray(node.effects) && node.effects.length > 0) {
      const hasVisibleEffect = node.effects.some((e) => e.visible !== false);
      if (hasVisibleEffect) {
        results.push(node);
      }
    }
    if ("children" in node) {
      for (const child of node.children) {
        results.push(...findNodesWithEffectsLocal(child));
      }
    }
    return results;
  }
  async function createEffectsSectionCombined(parent, variantColors, nodeToProcess, tableWidth, highlightMode, vizPropertyFilters, framesPerRow = 2, showTable = true, showViz = true) {
    const hasEffects = variantColors.some((v) => v.effects.length > 0);
    if (!hasEffects) return false;
    if (!showTable && !showViz) return false;
    const section = createSectionContainer("Se\xE7\xE3o Efeitos");
    createSectionTitle("Efeitos", section);
    if (showTable) {
      await createEffectsTableInSection(section, variantColors, tableWidth);
    }
    if (showViz) {
      await createEffectsVisualizationInSection(
        section,
        nodeToProcess,
        variantColors,
        tableWidth,
        highlightMode,
        vizPropertyFilters,
        framesPerRow
      );
    }
    parent.appendChild(section);
    return true;
  }
  async function createEffectsTableInSection(parent, variantColors, tableWidth) {
    var _a;
    const hasEffects = variantColors.some((v) => v.effects.length > 0);
    if (!hasEffects) return;
    const GROUP_SPACING = 20;
    const ROW_GAP = 4;
    const table = createTableBuilder("Tabela Efeitos", tableWidth, [
      { header: "Elemento", position: 0 },
      { header: "Token / Valor", position: 0.55, color: "warning" },
      { header: "Tipo", position: 0.85 }
    ]);
    const effectsGrouped = /* @__PURE__ */ new Map();
    for (const variant of variantColors) {
      const cleanVariantName = variant.variantName.trim();
      for (const effect of variant.effects) {
        let cleanLayer = ((_a = effect.element.split("/").pop()) == null ? void 0 : _a.trim()) || effect.element;
        const cleanLayerLower = cleanLayer.toLowerCase();
        if (cleanLayerLower === cleanVariantName.toLowerCase() || cleanLayerLower === "default" || cleanLayerLower === "untitled" || cleanLayerLower.startsWith("frame") || isVariantPropertiesName(cleanLayer) || isVariantPropertiesName(effect.element)) {
          cleanLayer = "Container";
        }
        const key = `${cleanLayer}|${effect.effectType}|${effect.token || effect.value}`;
        if (!effectsGrouped.has(key)) {
          effectsGrouped.set(key, {
            layerName: cleanLayer,
            effectType: effect.effectType,
            token: effect.token,
            value: effect.value,
            variantPropertyMaps: []
          });
        }
        const entry = effectsGrouped.get(key);
        entry.variantPropertyMaps.push(variant.propertyMap);
      }
    }
    const sortedEntries = Array.from(effectsGrouped.values()).sort((a, b) => {
      if (a.layerName === "Container" && b.layerName !== "Container") return -1;
      if (a.layerName !== "Container" && b.layerName === "Container") return 1;
      return a.layerName.localeCompare(b.layerName);
    });
    const totalVariants = variantColors.length;
    let lastLayer = "";
    for (const entry of sortedEntries) {
      if (entry.layerName !== lastLayer && lastLayer !== "") {
        table.addSpacer(GROUP_SPACING - ROW_GAP);
      }
      lastLayer = entry.layerName;
      const variantText = getSmartVariantLabel(entry.variantPropertyMaps, totalVariants, entry.layerName);
      const displayValue = entry.token ? entry.token : entry.value;
      const isToken = !!entry.token;
      const typeLabel = getEffectTypeLabel(entry.effectType);
      table.addRow(`Row-${entry.layerName}-${entry.effectType}`, [
        { text: variantText },
        // Elemento
        { text: displayValue, color: isToken ? "warning" : void 0 },
        // Token/Valor
        { text: typeLabel }
        // Tipo
      ]);
    }
    table.appendTo(parent);
  }
  async function createEffectsVisualizationInSection(parent, component, variantColors, tableWidth, highlightMode, vizPropertyFilters, framesPerRow) {
    if (component.type !== "COMPONENT_SET") return;
    const variantsWithEffects = variantColors.filter((v) => v.effects.length > 0);
    if (variantsWithEffects.length === 0) return;
    let filteredVariants = filterVariantsForVisualization(
      variantsWithEffects,
      vizPropertyFilters
    );
    if (filteredVariants.length === 0) {
      filteredVariants = variantsWithEffects;
    }
    if (filteredVariants.length > 0) {
      await createMultiVariantEffectsGrid(
        parent,
        component,
        filteredVariants,
        tableWidth,
        highlightMode,
        framesPerRow
      );
    }
  }
  async function createMultiVariantEffectsGrid(parent, componentSet, variantColors, tableWidth, highlightMode, framesPerRow = 2) {
    await createGenericVariantGrid(
      parent,
      componentSet,
      variantColors,
      tableWidth,
      highlightMode,
      framesPerRow,
      {
        gridName: "Grid Variantes - Efeitos",
        margin: 80
      },
      async (ctx) => {
        var _a, _b;
        if (ctx.vc.effects.length === 0) return;
        const color = getTheme(ctx.highlightMode).effect;
        const nodesWithEffects = findNodesWithEffectsLocal(ctx.instance);
        for (let i = 0; i < nodesWithEffects.length; i++) {
          const node = nodesWithEffects[i];
          const nodeBounds = node.absoluteBoundingBox;
          if (!nodeBounds) continue;
          const nodeRelX = nodeBounds.x - ctx.instanceBounds.x;
          const nodeRelY = nodeBounds.y - ctx.instanceBounds.y;
          const nodeW = nodeBounds.width;
          const nodeH = nodeBounds.height;
          let label = "";
          for (const spec of ctx.vc.effects) {
            const specElClean = (_a = spec.element.split("/").pop()) == null ? void 0 : _a.trim().toLowerCase();
            const nodeNameClean = (_b = node.name.split("/").pop()) == null ? void 0 : _b.trim().toLowerCase();
            const variantNameClean = ctx.vc.variantName.toLowerCase();
            if (specElClean === nodeNameClean || specElClean === variantNameClean && i === 0 || specElClean === "container") {
              label = spec.token || spec.value || getEffectTypeLabel(spec.effectType);
              break;
            }
          }
          if (!label && ctx.vc.effects.length > 0) {
            for (const spec of ctx.vc.effects) {
              if (spec.token) {
                label = spec.token;
                break;
              } else if (spec.value) {
                label = spec.value;
                break;
              }
            }
          }
          if (!label && "effects" in node && Array.isArray(node.effects) && node.effects.length > 0) {
            const firstEffect = node.effects.find((e) => e.visible);
            if (firstEffect) {
              label = getEffectTypeLabel(firstEffect.type);
            }
          }
          if (label) {
            const nodeX = ctx.instance.x + nodeRelX;
            const nodeY = ctx.instance.y + nodeRelY;
            const isAbove = i % 2 === 0;
            const LINE_LENGTH = 25;
            const startX = nodeX + nodeW / 2;
            const startY = isAbove ? nodeY : nodeY + nodeH;
            const endX = startX;
            const endY = isAbove ? nodeY - LINE_LENGTH : nodeY + nodeH + LINE_LENGTH;
            await createSimpleAnnotation(
              ctx.vizFrame,
              startX,
              startY,
              endX,
              endY,
              label,
              color,
              isAbove ? "pointer-top" : "pointer-bottom",
              "orange",
              ctx.highlightMode
            );
          }
        }
      }
    );
  }

  // src/features/components.ts
  async function createUsedComponentsSectionAutoLayout(parent, variantColors, tableWidth, mainComponents = [], highlightMode = false) {
    const componentMap = /* @__PURE__ */ new Map();
    for (const variant of variantColors) {
      for (const [compId, compName] of variant.usedComponents) {
        const lowerName = compName.toLowerCase();
        if (compName.startsWith(".") || compName.startsWith("_") || lowerName.startsWith("space")) {
          continue;
        }
        componentMap.set(compId, compName);
      }
    }
    if (componentMap.size === 0) return false;
    const section = createSectionContainer("Se\xE7\xE3o Componentes Utilizados");
    createSectionTitle("Componentes e \xEDcones utilizados", section);
    const componentsContainer = figma.createFrame();
    componentsContainer.name = "Components Container";
    componentsContainer.layoutMode = "HORIZONTAL";
    componentsContainer.layoutWrap = "WRAP";
    componentsContainer.primaryAxisSizingMode = "FIXED";
    componentsContainer.counterAxisSizingMode = "AUTO";
    componentsContainer.resize(tableWidth, 100);
    componentsContainer.itemSpacing = 48;
    componentsContainer.counterAxisSpacing = 40;
    componentsContainer.paddingLeft = 32;
    componentsContainer.paddingRight = 32;
    componentsContainer.paddingTop = 32;
    componentsContainer.paddingBottom = 32;
    const containerBgColor = highlightMode ? { r: 56 / 255, g: 83 / 255, b: 255 / 255 } : { r: 254 / 255, g: 254 / 255, b: 254 / 255 };
    componentsContainer.fills = [{ type: "SOLID", color: containerBgColor }];
    componentsContainer.cornerRadius = 8;
    const MAX_COMPONENTS_TO_SHOW = 100;
    const componentEntries = Array.from(componentMap.entries()).slice(
      0,
      MAX_COMPONENTS_TO_SHOW
    );
    if (componentMap.size > MAX_COMPONENTS_TO_SHOW) {
      const warningText = figma.createText();
      warningText.fontName = getFont("Regular");
      warningText.fontSize = 12;
      warningText.characters = `Mostrando ${MAX_COMPONENTS_TO_SHOW} de ${componentMap.size} componentes`;
      warningText.fills = [{ type: "SOLID", color: highlightMode ? { r: 1, g: 1, b: 1 } : { r: 0.5, g: 0.5, b: 0.5 } }];
      section.appendChild(warningText);
    }
    for (const [compId, displayName] of componentEntries) {
      const card = figma.createFrame();
      card.name = `Card: ${displayName}`;
      card.layoutMode = "VERTICAL";
      card.primaryAxisSizingMode = "AUTO";
      card.counterAxisSizingMode = "AUTO";
      card.primaryAxisAlignItems = "CENTER";
      card.counterAxisAlignItems = "CENTER";
      card.itemSpacing = 8;
      card.fills = [];
      let foundComponent = null;
      try {
        const node = await figma.getNodeByIdAsync(compId);
        if (node && node.type === "COMPONENT") {
          foundComponent = node;
        }
      } catch (e) {
        console.warn(`[Components] Failed to get node by ID: ${compId}`, e);
      }
      if (foundComponent) {
        try {
          const instance = foundComponent.createInstance();
          const maxSize = 180;
          if (instance.width > maxSize || instance.height > maxSize) {
            const scale = Math.min(
              maxSize / instance.width,
              maxSize / instance.height
            );
            instance.rescale(scale);
          }
          card.appendChild(instance);
        } catch (e) {
          console.warn(`[Components] Failed to create instance for: ${displayName}`, e);
          const placeholder = figma.createRectangle();
          placeholder.resize(80, 80);
          placeholder.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } }];
          placeholder.cornerRadius = 8;
          card.appendChild(placeholder);
        }
      } else {
        const placeholder = figma.createRectangle();
        placeholder.resize(80, 80);
        placeholder.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } }];
        placeholder.cornerRadius = 8;
        card.appendChild(placeholder);
      }
      const nameText = figma.createText();
      nameText.fontName = getFont("Medium");
      nameText.fontSize = 12;
      nameText.characters = displayName;
      nameText.textAlignHorizontal = "CENTER";
      nameText.fills = [{ type: "SOLID", color: highlightMode ? { r: 1, g: 1, b: 1 } : { r: 0.2, g: 0.6, b: 0.2 } }];
      card.appendChild(nameText);
      componentsContainer.appendChild(card);
    }
    section.appendChild(componentsContainer);
    if (mainComponents.length > 0) {
      await createComponentAnatomyVisualization(
        section,
        mainComponents[0],
        componentMap,
        tableWidth,
        highlightMode
      );
    }
    parent.appendChild(section);
    return true;
  }
  async function createComponentAnatomyVisualization(parent, mainComponent, componentMap, tableWidth, highlightMode = false) {
    if (componentMap.size === 0) return;
    const bgColor = highlightMode ? { r: 56 / 255, g: 83 / 255, b: 255 / 255 } : { r: 1, g: 1, b: 1 };
    const pointerColor = highlightMode ? { r: 98 / 255, g: 248 / 255, b: 79 / 255 } : { r: 229 / 255, g: 51 / 255, b: 51 / 255 };
    const textColor = highlightMode ? { r: 1, g: 1, b: 1 } : { r: 0.2, g: 0.2, b: 0.2 };
    const anatomyContainer = figma.createFrame();
    anatomyContainer.name = "Anatomia do Componente";
    anatomyContainer.layoutMode = "VERTICAL";
    anatomyContainer.primaryAxisSizingMode = "AUTO";
    anatomyContainer.counterAxisSizingMode = "FIXED";
    anatomyContainer.resize(tableWidth, 100);
    anatomyContainer.itemSpacing = 24;
    anatomyContainer.paddingTop = 24;
    anatomyContainer.paddingBottom = 32;
    anatomyContainer.paddingLeft = 32;
    anatomyContainer.paddingRight = 32;
    anatomyContainer.fills = [{ type: "SOLID", color: bgColor }];
    anatomyContainer.cornerRadius = 8;
    const variationsContainer = figma.createFrame();
    variationsContainer.name = "Variations Container";
    variationsContainer.layoutMode = "HORIZONTAL";
    variationsContainer.layoutWrap = "WRAP";
    variationsContainer.primaryAxisSizingMode = "FIXED";
    variationsContainer.counterAxisSizingMode = "AUTO";
    variationsContainer.resize(tableWidth - 64, 100);
    variationsContainer.itemSpacing = 32;
    variationsContainer.counterAxisSpacing = 32;
    variationsContainer.fills = [];
    variationsContainer.clipsContent = false;
    const variants = [];
    if (mainComponent.type === "COMPONENT_SET") {
      for (const child of mainComponent.children) {
        if (child.type === "COMPONENT") {
          variants.push(child);
        }
      }
    } else if (mainComponent.type === "COMPONENT") {
      variants.push(mainComponent);
    } else if (mainComponent.type === "INSTANCE") {
      const mainComp = await mainComponent.getMainComponentAsync();
      if (mainComp) {
        variants.push(mainComp);
      }
    }
    if (variants.length === 0) {
      anatomyContainer.remove();
      variationsContainer.remove();
      return;
    }
    const componentsShown = /* @__PURE__ */ new Set();
    async function variantContainsComponent(variant, targetComponentId) {
      const result = { found: false, x: 0, y: 0, w: 0, h: 0, instanceLabel: "" };
      async function searchInNode(node, offsetX, offsetY) {
        var _a;
        if (node.type === "INSTANCE") {
          const mainComp = await node.getMainComponentAsync();
          if (mainComp && mainComp.id === targetComponentId) {
            result.found = true;
            result.x = offsetX + node.x;
            result.y = offsetY + node.y;
            result.w = node.width;
            result.h = node.height;
            const baseName = ((_a = mainComp.parent) == null ? void 0 : _a.type) === "COMPONENT_SET" ? mainComp.parent.name : mainComp.name;
            const variantProps = node.variantProperties;
            const allowedKeys = ["Size", "Type", "Status", "State", "Kind", "Style"];
            if (variantProps) {
              const values = allowedKeys.filter((key) => variantProps[key] !== void 0).map((key) => variantProps[key]);
              result.instanceLabel = values.length > 0 ? `${baseName} / ${values.join(" / ")}` : baseName;
            } else {
              result.instanceLabel = baseName;
            }
            return true;
          }
        }
        if ("children" in node) {
          for (const child of node.children) {
            const newOffsetX = node.type === "INSTANCE" ? offsetX : offsetX + node.x;
            const newOffsetY = node.type === "INSTANCE" ? offsetY : offsetY + node.y;
            if (await searchInNode(child, newOffsetX, newOffsetY)) {
              return true;
            }
          }
        }
        return false;
      }
      for (const child of variant.children) {
        if (await searchInNode(child, 0, 0)) break;
      }
      return result;
    }
    for (const [compId, compName] of componentMap) {
      if (componentsShown.has(compId)) continue;
      let foundVariant = null;
      let componentPosition = { found: false, x: 0, y: 0, w: 0, h: 0, instanceLabel: "" };
      for (const variant of variants) {
        const pos = await variantContainsComponent(variant, compId);
        if (pos.found) {
          foundVariant = variant;
          componentPosition = pos;
          break;
        }
      }
      if (!foundVariant) continue;
      const vizFrame = figma.createFrame();
      vizFrame.name = `Anatomia - ${compName}`;
      vizFrame.fills = [];
      vizFrame.cornerRadius = 8;
      vizFrame.clipsContent = false;
      const instance = foundVariant.createInstance();
      const maxSize = 300;
      let scale = 1;
      if (instance.width > maxSize || instance.height > maxSize) {
        scale = Math.min(maxSize / instance.width, maxSize / instance.height);
        instance.rescale(scale);
      }
      const marginBottom = 10;
      const LINE_LENGTH = 30;
      const scaledW = componentPosition.w * scale;
      const scaledH = componentPosition.h * scale;
      const measureText = figma.createText();
      measureText.fontName = getFont("Medium");
      measureText.fontSize = 11;
      measureText.characters = componentPosition.instanceLabel;
      const labelWidth = measureText.width;
      measureText.remove();
      const subCompCenterX = componentPosition.x * scale + scaledW / 2;
      const labelHalf = labelWidth / 2;
      const minLeftMargin = Math.max(20, labelHalf - subCompCenterX + 10);
      const isTopHalf = componentPosition.y < instance.height / 2;
      const marginTop = isTopHalf ? LINE_LENGTH + 20 : 20;
      instance.x = minLeftMargin;
      instance.y = marginTop;
      vizFrame.appendChild(instance);
      const scaledX = minLeftMargin + componentPosition.x * scale;
      const scaledY = marginTop + componentPosition.y * scale;
      const targetX = scaledX + scaledW / 2;
      let startX, startY, endX, endY;
      let pointerType;
      if (isTopHalf) {
        pointerType = "pointer-top";
        startX = targetX;
        startY = scaledY;
        endX = targetX;
        endY = scaledY - LINE_LENGTH;
      } else {
        pointerType = "pointer-bottom";
        startX = targetX;
        startY = scaledY + scaledH;
        endX = targetX;
        endY = scaledY + scaledH + LINE_LENGTH;
      }
      await createSimpleAnnotation(
        vizFrame,
        // Container pai
        startX,
        // X onde fica o texto
        startY,
        // Y onde fica o texto
        endX,
        // X onde toca o componente
        endY,
        // Y onde toca o componente
        componentPosition.instanceLabel,
        // O texto do label com variantes
        pointerColor,
        // A cor do tema
        pointerType,
        // "pointer-top" ou "pointer-bottom"
        "red",
        // colorType (para o asset config/live editing)
        highlightMode,
        // modo de contraste
        textColor,
        // cor do texto
        11,
        // tamanho da fonte
        "Medium"
        // peso da fonte
      );
      const rightEdge = targetX + labelHalf + 10;
      const instanceRightEdge = minLeftMargin + instance.width + 20;
      const frameWidth = Math.max(rightEdge, instanceRightEdge, 150);
      const frameHeight = marginTop + instance.height + marginBottom + (isTopHalf ? 0 : LINE_LENGTH + 20);
      vizFrame.resize(frameWidth, frameHeight);
      variationsContainer.appendChild(vizFrame);
      componentsShown.add(compId);
    }
    if (componentsShown.size === 0) {
      anatomyContainer.remove();
      variationsContainer.remove();
      return;
    }
    anatomyContainer.appendChild(variationsContainer);
    parent.appendChild(anatomyContainer);
  }

  // src/features/states.ts
  async function createEstadosSection(parent, component, variantColors, tableWidth, highlightMode, framesPerRow = 4, vizPropertyFilters = {}, statesVariantPropertyOrder) {
    const filteredVariants = filterVariantsForVisualization(
      variantColors,
      vizPropertyFilters
    );
    if (filteredVariants.length === 0) {
      return false;
    }
    const variants = [];
    for (const vc of filteredVariants) {
      const variantNode = component.children.find((child) => {
        if (child.type !== "COMPONENT") return false;
        const childName = child.name;
        const matches = Object.entries(vc.propertyMap).every(([key, value]) => {
          const normalized = childName.toLowerCase();
          const keyNormalized = key.toLowerCase();
          const valueNormalized = value.toLowerCase();
          return normalized.includes(`${keyNormalized}=${valueNormalized}`) || normalized.includes(valueNormalized);
        });
        return matches;
      });
      if (variantNode) {
        let propertyValues;
        const propsToInclude = statesVariantPropertyOrder && statesVariantPropertyOrder.length > 0 ? statesVariantPropertyOrder : Object.keys(vc.propertyMap);
        propertyValues = propsToInclude.filter((propName) => {
          const propValue = vc.propertyMap[propName];
          if (!propValue) return false;
          if (Object.keys(vizPropertyFilters).length === 0) return true;
          if (!vizPropertyFilters[propName]) return true;
          if (vizPropertyFilters[propName].length === 0) return false;
          return vizPropertyFilters[propName].includes(propValue);
        }).map((propName) => vc.propertyMap[propName]).filter((value) => value !== void 0).join(" / ");
        const variantName = propertyValues || vc.variantName || variantNode.name;
        variants.push({ name: variantName, node: variantNode, vc });
      }
    }
    const section = createSectionContainer("Se\xE7\xE3o Estados");
    createSectionTitle("Estados", section);
    const GRID_GAP = 16;
    const CARD_PADDING = 24;
    const COLUMNS = framesPerRow;
    const cardWidth = Math.floor(
      (tableWidth - GRID_GAP * (COLUMNS - 1)) / COLUMNS
    );
    let maxCardHeight = 100;
    for (const variant of variants) {
      const tempCard = figma.createFrame();
      tempCard.layoutMode = "VERTICAL";
      tempCard.primaryAxisSizingMode = "AUTO";
      tempCard.counterAxisSizingMode = "FIXED";
      tempCard.resize(cardWidth, 100);
      tempCard.paddingTop = CARD_PADDING;
      tempCard.paddingBottom = CARD_PADDING;
      tempCard.paddingLeft = CARD_PADDING;
      tempCard.paddingRight = CARD_PADDING;
      tempCard.itemSpacing = 16;
      const tempLabel = figma.createText();
      tempLabel.fontName = getFont("Regular");
      tempLabel.fontSize = 14;
      tempLabel.characters = `01. ${variant.name}`;
      tempCard.appendChild(tempLabel);
      const tempInstance = variant.node.createInstance();
      tempCard.appendChild(tempInstance);
      const calculatedHeight = tempCard.height;
      if (calculatedHeight > maxCardHeight) {
        maxCardHeight = calculatedHeight;
      }
      tempCard.remove();
    }
    const gridContainer = figma.createFrame();
    gridContainer.name = "Grid Estados";
    gridContainer.layoutMode = "VERTICAL";
    gridContainer.primaryAxisSizingMode = "AUTO";
    gridContainer.counterAxisSizingMode = "AUTO";
    gridContainer.itemSpacing = GRID_GAP;
    gridContainer.fills = [];
    for (let i = 0; i < variants.length; i += COLUMNS) {
      const row = figma.createFrame();
      row.name = `Row ${Math.floor(i / COLUMNS) + 1}`;
      row.layoutMode = "HORIZONTAL";
      row.primaryAxisSizingMode = "AUTO";
      row.counterAxisSizingMode = "AUTO";
      row.itemSpacing = GRID_GAP;
      row.fills = [];
      for (let j = 0; j < COLUMNS && i + j < variants.length; j++) {
        const variant = variants[i + j];
        const index = i + j + 1;
        const card = figma.createFrame();
        card.name = `Estado ${index}`;
        card.layoutMode = "VERTICAL";
        card.primaryAxisSizingMode = "AUTO";
        card.counterAxisSizingMode = "FIXED";
        card.resize(cardWidth, maxCardHeight);
        card.paddingTop = CARD_PADDING;
        card.paddingBottom = CARD_PADDING;
        card.paddingLeft = CARD_PADDING;
        card.paddingRight = CARD_PADDING;
        card.itemSpacing = 16;
        const cardBgColor = highlightMode ? { r: 56 / 255, g: 83 / 255, b: 255 / 255 } : { r: 254 / 255, g: 254 / 255, b: 254 / 255 };
        card.fills = [{ type: "SOLID", color: cardBgColor }];
        card.cornerRadius = 8;
        const label = figma.createText();
        label.fontName = getFont("Regular");
        label.fontSize = 14;
        label.characters = `${String(index).padStart(2, "0")}. ${variant.name}`;
        const labelColor = highlightMode ? { r: 98 / 255, g: 248 / 255, b: 79 / 255 } : { r: 0.4, g: 0.4, b: 0.4 };
        label.fills = [{ type: "SOLID", color: labelColor }];
        card.appendChild(label);
        const instance = variant.node.createInstance();
        card.appendChild(instance);
        row.appendChild(card);
      }
      gridContainer.appendChild(row);
    }
    section.appendChild(gridContainer);
    parent.appendChild(section);
    return true;
  }

  // src/features/properties.ts
  var BLUE_COLOR = { r: 49 / 255, g: 53 / 255, b: 217 / 255 };
  var GRAY_COLOR = { r: 0.4, g: 0.4, b: 0.4 };
  var WHITE_COLOR = { r: 1, g: 1, b: 1 };
  async function resolveInstanceSwapDefault(def) {
    if (!def.defaultValue) return "";
    try {
      const node = await figma.getNodeByIdAsync(String(def.defaultValue));
      if (node && "name" in node) return node.name;
    } catch (e) {
    }
    return "";
  }
  function cleanComponentSetName(name) {
    return name.replace(/^[._-]\s*(?:Asset\s*\/\s*)?/i, "");
  }
  function createTableHeader(parent, colWidths, headers) {
    const headerRow = figma.createFrame();
    headerRow.name = "Header Row";
    headerRow.layoutMode = "HORIZONTAL";
    headerRow.primaryAxisSizingMode = "FIXED";
    headerRow.counterAxisSizingMode = "AUTO";
    headerRow.resize(colWidths.reduce((a, b) => a + b, 0), 40);
    headerRow.paddingTop = 12;
    headerRow.paddingBottom = 12;
    headerRow.fills = [];
    for (let i = 0; i < headers.length; i++) {
      const headerCell = figma.createFrame();
      headerCell.name = `Header ${headers[i]}`;
      headerCell.layoutMode = "HORIZONTAL";
      headerCell.primaryAxisSizingMode = "FIXED";
      headerCell.counterAxisSizingMode = "AUTO";
      headerCell.resize(colWidths[i], 20);
      headerCell.fills = [];
      const headerText = figma.createText();
      headerText.fontName = getFont("Bold");
      headerText.fontSize = 12;
      headerText.characters = headers[i];
      headerText.fills = [{ type: "SOLID", color: GRAY_COLOR }];
      headerCell.appendChild(headerText);
      headerRow.appendChild(headerCell);
    }
    parent.appendChild(headerRow);
  }
  function createPropertyRow(tableContainer, colWidths, propName, typeIcon, typeName, innerTableWidth) {
    const row = figma.createFrame();
    row.name = `Row ${propName}`;
    row.layoutMode = "HORIZONTAL";
    row.primaryAxisSizingMode = "FIXED";
    row.counterAxisSizingMode = "AUTO";
    row.counterAxisAlignItems = "MIN";
    row.minWidth = innerTableWidth;
    row.maxWidth = innerTableWidth;
    row.paddingTop = 12;
    row.paddingBottom = 12;
    row.strokes = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } }];
    row.strokeTopWeight = 1;
    row.strokeBottomWeight = 0;
    row.strokeLeftWeight = 0;
    row.strokeRightWeight = 0;
    row.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    const propCell = figma.createFrame();
    propCell.name = "Property Cell";
    propCell.layoutMode = "HORIZONTAL";
    propCell.primaryAxisSizingMode = "FIXED";
    propCell.counterAxisSizingMode = "AUTO";
    propCell.minWidth = colWidths[0];
    propCell.maxWidth = colWidths[0];
    propCell.fills = [];
    propCell.itemSpacing = 8;
    const propText = figma.createText();
    propText.fontName = getFont("Regular");
    propText.fontSize = 14;
    propText.characters = propName;
    propText.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
    propCell.appendChild(propText);
    row.appendChild(propCell);
    const typeCell = figma.createFrame();
    typeCell.name = "Type Cell";
    typeCell.layoutMode = "HORIZONTAL";
    typeCell.primaryAxisSizingMode = "FIXED";
    typeCell.counterAxisSizingMode = "AUTO";
    typeCell.counterAxisAlignItems = "CENTER";
    typeCell.minWidth = colWidths[1];
    typeCell.maxWidth = colWidths[1];
    typeCell.fills = [];
    typeCell.itemSpacing = 6;
    const iconText = figma.createText();
    iconText.fontName = getFont("Regular");
    iconText.fontSize = 14;
    iconText.characters = typeIcon;
    iconText.fills = [{ type: "SOLID", color: BLUE_COLOR }];
    typeCell.appendChild(iconText);
    const typeNameText = figma.createText();
    typeNameText.fontName = getFont("Regular");
    typeNameText.fontSize = 14;
    typeNameText.characters = typeName;
    typeNameText.fills = [{ type: "SOLID", color: GRAY_COLOR }];
    typeCell.appendChild(typeNameText);
    row.appendChild(typeCell);
    const valueCell = figma.createFrame();
    valueCell.name = "Value Cell";
    valueCell.layoutMode = "HORIZONTAL";
    valueCell.primaryAxisSizingMode = "FIXED";
    valueCell.counterAxisSizingMode = "AUTO";
    valueCell.counterAxisAlignItems = "MIN";
    valueCell.minWidth = colWidths[2];
    valueCell.maxWidth = colWidths[2];
    valueCell.fills = [];
    valueCell.itemSpacing = 8;
    valueCell.layoutWrap = "WRAP";
    valueCell.counterAxisSpacing = 8;
    row.appendChild(valueCell);
    tableContainer.appendChild(row);
    return { row, valueCell };
  }
  function addVariantBadges(valueCell, options, defaultValue) {
    for (const option of options) {
      const isDefault = option === defaultValue;
      const badge = figma.createFrame();
      badge.name = `Option ${option}`;
      badge.layoutMode = "HORIZONTAL";
      badge.primaryAxisSizingMode = "AUTO";
      badge.counterAxisSizingMode = "AUTO";
      badge.paddingLeft = 12;
      badge.paddingRight = 12;
      badge.paddingTop = 6;
      badge.paddingBottom = 6;
      badge.cornerRadius = 4;
      if (isDefault) {
        badge.fills = [{ type: "SOLID", color: BLUE_COLOR }];
      } else {
        badge.fills = [];
        badge.strokes = [{ type: "SOLID", color: BLUE_COLOR }];
        badge.strokeWeight = 1;
      }
      const optionText = figma.createText();
      optionText.fontName = getFont("Medium");
      optionText.fontSize = 12;
      optionText.characters = option;
      optionText.fills = [
        { type: "SOLID", color: isDefault ? WHITE_COLOR : BLUE_COLOR }
      ];
      badge.appendChild(optionText);
      valueCell.appendChild(badge);
    }
  }
  function addBooleanToggle(valueCell, defaultValue) {
    const toggleContainer = figma.createFrame();
    toggleContainer.name = "Boolean Toggle";
    toggleContainer.layoutMode = "HORIZONTAL";
    toggleContainer.primaryAxisSizingMode = "AUTO";
    toggleContainer.counterAxisSizingMode = "AUTO";
    toggleContainer.counterAxisAlignItems = "CENTER";
    toggleContainer.itemSpacing = 8;
    toggleContainer.fills = [];
    const isTrue = defaultValue === true;
    const toggle = figma.createFrame();
    toggle.name = "Toggle";
    toggle.resize(36, 20);
    toggle.cornerRadius = 10;
    toggle.fills = [
      {
        type: "SOLID",
        color: isTrue ? BLUE_COLOR : { r: 0.8, g: 0.8, b: 0.8 }
      }
    ];
    const knob = figma.createEllipse();
    knob.resize(16, 16);
    knob.x = isTrue ? 18 : 2;
    knob.y = 2;
    knob.fills = [{ type: "SOLID", color: WHITE_COLOR }];
    toggle.appendChild(knob);
    toggleContainer.appendChild(toggle);
    const boolText = figma.createText();
    boolText.fontName = getFont("Regular");
    boolText.fontSize = 14;
    boolText.characters = isTrue ? "True" : "False";
    boolText.fills = [{ type: "SOLID", color: GRAY_COLOR }];
    toggleContainer.appendChild(boolText);
    valueCell.appendChild(toggleContainer);
  }
  function addTextValue(valueCell, defaultValue) {
    const textValue = figma.createText();
    textValue.fontName = getFont("Regular");
    textValue.fontSize = 14;
    textValue.characters = String(defaultValue || "");
    textValue.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
    valueCell.appendChild(textValue);
  }
  function addInstanceSwapValue(valueCell, resolvedName) {
    if (!resolvedName) return;
    const badge = figma.createFrame();
    badge.layoutMode = "HORIZONTAL";
    badge.primaryAxisSizingMode = "AUTO";
    badge.counterAxisSizingMode = "AUTO";
    badge.paddingLeft = 12;
    badge.paddingRight = 12;
    badge.paddingTop = 6;
    badge.paddingBottom = 6;
    badge.cornerRadius = 4;
    badge.fills = [{ type: "SOLID", color: BLUE_COLOR }];
    const optionText = figma.createText();
    optionText.fontName = getFont("Medium");
    optionText.fontSize = 12;
    optionText.characters = resolvedName;
    optionText.fills = [{ type: "SOLID", color: WHITE_COLOR }];
    badge.appendChild(optionText);
    valueCell.appendChild(badge);
  }
  async function collectNestedInstances(component) {
    const results = [];
    const seenCompSetIds = /* @__PURE__ */ new Set();
    for (const variant of component.children) {
      if (variant.type !== "COMPONENT") continue;
      async function scanNode(node) {
        var _a;
        if (node.type === "INSTANCE") {
          const inst = node;
          if (!inst.isExposedInstance) return;
          const mainComp = await inst.getMainComponentAsync();
          if (!mainComp) return;
          let compSetName = null;
          let propDefs = null;
          let compSetId = null;
          if (((_a = mainComp.parent) == null ? void 0 : _a.type) === "COMPONENT_SET") {
            compSetName = mainComp.parent.name;
            propDefs = mainComp.parent.componentPropertyDefinitions;
            compSetId = mainComp.parent.id;
          }
          const uniqueKey = `${compSetId || mainComp.id}::${inst.name}`;
          if (seenCompSetIds.has(uniqueKey)) return;
          seenCompSetIds.add(uniqueKey);
          results.push({
            instanceName: inst.name,
            componentSetName: compSetName ? cleanComponentSetName(compSetName) : inst.name,
            propDefs: propDefs || {}
          });
          return;
        }
        if ("children" in node) {
          for (const child of node.children) {
            await scanNode(child);
          }
        }
      }
      for (const child of variant.children) {
        await scanNode(child);
      }
    }
    return results;
  }
  async function renderPropertyDef(tableContainer, colWidths, innerTableWidth, key, def) {
    const propName = key.split("#")[0];
    let typeIcon = "\u25C6";
    let typeName = "Variant";
    if (def.type === "BOOLEAN") {
      typeIcon = "\u2299";
      typeName = "Boolean";
    } else if (def.type === "TEXT") {
      typeIcon = "T";
      typeName = "Text";
    } else if (def.type === "INSTANCE_SWAP") {
      typeIcon = "\u25C7";
      typeName = "Instance Swap";
    }
    const { valueCell } = createPropertyRow(
      tableContainer,
      colWidths,
      propName,
      typeIcon,
      typeName,
      innerTableWidth
    );
    if (def.type === "VARIANT" && def.variantOptions) {
      addVariantBadges(valueCell, def.variantOptions, def.defaultValue);
    } else if (def.type === "BOOLEAN") {
      addBooleanToggle(valueCell, def.defaultValue);
    } else if (def.type === "TEXT") {
      addTextValue(valueCell, def.defaultValue);
    } else if (def.type === "INSTANCE_SWAP") {
      const name = await resolveInstanceSwapDefault(def);
      addInstanceSwapValue(valueCell, name);
    }
  }
  async function createPropertiesSection(parent, component, tableWidth) {
    if (!component.componentPropertyDefinitions) {
      return false;
    }
    const propDefs = component.componentPropertyDefinitions;
    const propKeys = Object.keys(propDefs);
    if (propKeys.length === 0) return false;
    const allPropsWithIndex = propKeys.map((key, index) => ({
      key,
      def: propDefs[key],
      originalIndex: index
    }));
    const variants = allPropsWithIndex.filter((p) => p.def.type === "VARIANT");
    const others = allPropsWithIndex.filter((p) => p.def.type !== "VARIANT");
    others.sort((a, b) => {
      const aKeyLower = a.key.split("#")[0].toLowerCase();
      const bKeyLower = b.key.split("#")[0].toLowerCase();
      if (a.def.type === "BOOLEAN" && b.def.type === "TEXT") {
        if (bKeyLower.includes(aKeyLower) || bKeyLower.startsWith("text " + aKeyLower)) {
          return -1;
        }
      }
      if (b.def.type === "BOOLEAN" && a.def.type === "TEXT") {
        if (aKeyLower.includes(bKeyLower) || aKeyLower.startsWith("text " + bKeyLower)) {
          return 1;
        }
      }
      return a.originalIndex - b.originalIndex;
    });
    const allProps = [...variants, ...others];
    const section = createSectionContainer("Se\xE7\xE3o Propriedades", 32);
    section.paddingLeft = 32;
    section.paddingRight = 32;
    section.paddingTop = 32;
    section.paddingBottom = 32;
    section.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    section.cornerRadius = 8;
    createSectionTitle(`\u2756 ${component.name} Properties`, section);
    const innerTableWidth = tableWidth - 64;
    const colWidths = [
      Math.floor(innerTableWidth * 0.25),
      Math.floor(innerTableWidth * 0.2),
      Math.floor(innerTableWidth * 0.55)
    ];
    const headers = ["PROPERTY", "TYPE", "DEFAULT / OPTIONS"];
    if (allProps.length > 0) {
      const tableContainer = figma.createFrame();
      tableContainer.name = "Properties Table";
      tableContainer.layoutMode = "VERTICAL";
      tableContainer.primaryAxisSizingMode = "AUTO";
      tableContainer.counterAxisSizingMode = "FIXED";
      tableContainer.resize(innerTableWidth, 100);
      tableContainer.itemSpacing = 0;
      tableContainer.fills = [];
      createTableHeader(tableContainer, colWidths, headers);
      for (const prop of allProps) {
        await renderPropertyDef(tableContainer, colWidths, innerTableWidth, prop.key, prop.def);
      }
      section.appendChild(tableContainer);
    }
    const nestedInstances = await collectNestedInstances(component);
    if (nestedInstances.length > 0) {
      const nestedTitle = figma.createText();
      nestedTitle.fontName = getFont("Bold");
      nestedTitle.fontSize = 24;
      nestedTitle.characters = "\u25C7 Nested Instances";
      section.appendChild(nestedTitle);
      for (const nested of nestedInstances) {
        const nestedPropKeys = Object.keys(nested.propDefs);
        if (nestedPropKeys.length === 0) continue;
        const instanceLabel = figma.createText();
        instanceLabel.fontName = getFont("Medium");
        instanceLabel.fontSize = 16;
        instanceLabel.characters = `\u25C7 ${nested.instanceName}`;
        if (nested.componentSetName !== nested.instanceName) {
          instanceLabel.characters = `\u25C7 ${nested.instanceName} (${nested.componentSetName})`;
        }
        instanceLabel.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
        section.appendChild(instanceLabel);
        const nestedTable = figma.createFrame();
        nestedTable.name = `Nested Table - ${nested.instanceName}`;
        nestedTable.layoutMode = "VERTICAL";
        nestedTable.primaryAxisSizingMode = "AUTO";
        nestedTable.counterAxisSizingMode = "FIXED";
        nestedTable.resize(innerTableWidth, 100);
        nestedTable.itemSpacing = 0;
        nestedTable.fills = [];
        createTableHeader(nestedTable, colWidths, headers);
        const nestedPropsWithIndex = nestedPropKeys.map((key, index) => ({
          key,
          def: nested.propDefs[key],
          originalIndex: index
        }));
        const nestedVariants = nestedPropsWithIndex.filter((p) => p.def.type === "VARIANT");
        const nestedOthers = nestedPropsWithIndex.filter((p) => p.def.type !== "VARIANT");
        nestedOthers.sort((a, b) => a.originalIndex - b.originalIndex);
        const sortedNestedProps = [...nestedVariants, ...nestedOthers];
        for (const prop of sortedNestedProps) {
          await renderPropertyDef(nestedTable, colWidths, innerTableWidth, prop.key, prop.def);
        }
        section.appendChild(nestedTable);
      }
    }
    parent.appendChild(section);
    return true;
  }
  function extractVariantProperties(componentSet) {
    const properties = [];
    const propDefs = componentSet.componentPropertyDefinitions;
    if (propDefs && Object.keys(propDefs).length > 0) {
      for (const [name, def] of Object.entries(propDefs)) {
        if (def.type === "VARIANT" && def.variantOptions) {
          const sizeOrder = SIZE_ORDER;
          const sortedValues = [...def.variantOptions].sort((a, b) => {
            var _a, _b;
            const aLower = a.toLowerCase();
            const bLower = b.toLowerCase();
            const aOrder = (_a = sizeOrder[aLower]) != null ? _a : 99;
            const bOrder = (_b = sizeOrder[bLower]) != null ? _b : 99;
            if (aOrder !== bOrder) return aOrder - bOrder;
            return a.localeCompare(b);
          });
          properties.push({ name: name.toLowerCase(), values: sortedValues });
        }
      }
    }
    if (properties.length === 0) {
      const propertiesMap = /* @__PURE__ */ new Map();
      for (const child of componentSet.children) {
        if (child.type !== "COMPONENT") continue;
        const parts = child.name.split(",").map((p) => p.trim());
        for (const part of parts) {
          const [key, value] = part.split("=").map((s) => s.trim());
          if (key && value) {
            const normalizedKey = key.toLowerCase();
            if (!propertiesMap.has(normalizedKey)) {
              propertiesMap.set(normalizedKey, /* @__PURE__ */ new Set());
            }
            propertiesMap.get(normalizedKey).add(value);
          }
        }
      }
      for (const [name, values] of propertiesMap) {
        const sortedValues = Array.from(values).sort((a, b) => {
          var _a, _b;
          const sizeOrder = SIZE_ORDER;
          const aLower = a.toLowerCase();
          const bLower = b.toLowerCase();
          const orderA = (_a = sizeOrder[aLower]) != null ? _a : 99;
          const orderB = (_b = sizeOrder[bLower]) != null ? _b : 99;
          if (orderA !== orderB) return orderA - orderB;
          return a.localeCompare(b);
        });
        properties.push({ name, values: sortedValues });
      }
    }
    return properties;
  }

  // src/features/requirements.ts
  async function getComponentSet(node) {
    var _a, _b;
    if (node.type === "COMPONENT_SET") return node;
    if (node.type === "COMPONENT" && ((_a = node.parent) == null ? void 0 : _a.type) === "COMPONENT_SET") {
      return node.parent;
    }
    if (node.type === "INSTANCE") {
      const mainComp = await node.getMainComponentAsync();
      if (((_b = mainComp == null ? void 0 : mainComp.parent) == null ? void 0 : _b.type) === "COMPONENT_SET") {
        return mainComp.parent;
      }
    }
    return null;
  }
  function getBooleanPropertyKeys(componentSet) {
    const defs = componentSet.componentPropertyDefinitions;
    if (!defs) return /* @__PURE__ */ new Map();
    const map = /* @__PURE__ */ new Map();
    for (const key of Object.keys(defs)) {
      if (defs[key].type === "BOOLEAN") {
        const cleanName = key.replace(/#.*$/, "").trim();
        map.set(key, cleanName);
      }
    }
    return map;
  }
  function findBooleanBoundLayers(node, booleanKeys, currentPath) {
    const results = [];
    if (!("children" in node)) return results;
    const parent = node;
    for (let i = 0; i < parent.children.length; i++) {
      const child = parent.children[i];
      const childPath = [...currentPath, i];
      const refs = child.componentPropertyReferences;
      if (refs && refs.visible) {
        const refKey = refs.visible;
        if (booleanKeys.has(refKey)) {
          results.push({
            propertyName: booleanKeys.get(refKey),
            nodePath: childPath,
            isOptional: true
          });
        }
      }
      if (child.type !== "INSTANCE" && "children" in child) {
        const nested = findBooleanBoundLayers(child, booleanKeys, childPath);
        results.push(...nested);
      }
    }
    return results;
  }
  function resolveNodeByPath(root, path) {
    let current = root;
    for (const idx of path) {
      if (!("children" in current)) return null;
      const parent = current;
      if (idx >= parent.children.length) return null;
      current = parent.children[idx];
    }
    return current;
  }
  function getBooleanSignature(layers) {
    return layers.map((l) => l.propertyName).sort().join("|");
  }
  function getVariantLabel(variant) {
    const parts = variant.name.split(",").map((p) => p.trim());
    return parts.join(" / ");
  }
  async function createVariantRequirementsViz(parent, variant, booleanKeys, tableWidth, highlightMode, showLabel) {
    const booleanLayers = findBooleanBoundLayers(variant, booleanKeys, []);
    if (booleanLayers.length === 0) return false;
    const tempInstance = variant.createInstance();
    const MARGIN = 120;
    const vizHeight = Math.max(300, tempInstance.height + MARGIN * 2);
    const vizWrapper = figma.createFrame();
    vizWrapper.name = `Requirements - ${variant.name}`;
    vizWrapper.layoutMode = "VERTICAL";
    vizWrapper.primaryAxisSizingMode = "AUTO";
    vizWrapper.counterAxisSizingMode = "FIXED";
    vizWrapper.resize(tableWidth, 100);
    vizWrapper.itemSpacing = 12;
    vizWrapper.fills = [];
    if (showLabel) {
      const label = figma.createText();
      label.fontName = getFont("Medium");
      label.fontSize = 14;
      label.characters = getVariantLabel(variant);
      label.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
      vizWrapper.appendChild(label);
    }
    const vizFrame = figma.createFrame();
    vizFrame.name = "Requirements Visualization";
    vizFrame.resize(tableWidth, vizHeight);
    const bgColor = highlightMode ? { r: 56 / 255, g: 83 / 255, b: 255 / 255 } : { r: 254 / 255, g: 254 / 255, b: 254 / 255 };
    vizFrame.fills = [{ type: "SOLID", color: bgColor }];
    vizFrame.cornerRadius = 8;
    vizFrame.clipsContent = false;
    tempInstance.x = tableWidth / 2 - tempInstance.width / 2;
    tempInstance.y = vizHeight / 2 - tempInstance.height / 2;
    vizFrame.appendChild(tempInstance);
    const vizBounds = vizFrame.absoluteBoundingBox;
    if (!vizBounds) {
      tempInstance.remove();
      vizWrapper.remove();
      return false;
    }
    const instBounds = tempInstance.absoluteBoundingBox;
    if (!instBounds) {
      tempInstance.remove();
      vizWrapper.remove();
      return false;
    }
    const instRelX = instBounds.x - vizBounds.x;
    const instCenterX = instRelX + tempInstance.width / 2;
    const leftPositions = [];
    const rightPositions = [];
    const LINE_LENGTH = 60;
    const pointerColor = highlightMode ? { r: 98 / 255, g: 248 / 255, b: 79 / 255 } : { r: 229 / 255, g: 51 / 255, b: 51 / 255 };
    const pointerColorType = highlightMode ? "#62F84F" : "#E53333";
    const textColor = highlightMode ? { r: 98 / 255, g: 248 / 255, b: 79 / 255 } : { r: 0, g: 0, b: 0 };
    let annotationCount = 0;
    for (const info of booleanLayers) {
      const instanceNode = resolveNodeByPath(tempInstance, info.nodePath);
      if (!instanceNode) continue;
      const elemBounds = instanceNode.absoluteBoundingBox;
      if (!elemBounds) continue;
      const elemRelX = elemBounds.x - vizBounds.x;
      const elemRelY = elemBounds.y - vizBounds.y;
      const elemCenterX = elemRelX + elemBounds.width / 2;
      const elemCenterY = elemRelY + elemBounds.height / 2;
      const annotLabel = `Opcional: ${info.propertyName}`;
      let startX, startY, endX, endY;
      let markerType;
      if (elemCenterX <= instCenterX) {
        const freeY = findFreeYPosition(leftPositions, elemCenterY, 22);
        leftPositions.push(freeY);
        startX = elemRelX;
        startY = freeY;
        endX = elemRelX - LINE_LENGTH;
        endY = freeY;
        markerType = "pointer-left";
      } else {
        const freeY = findFreeYPosition(rightPositions, elemCenterY, 22);
        rightPositions.push(freeY);
        startX = elemRelX + elemBounds.width;
        startY = freeY;
        endX = elemRelX + elemBounds.width + LINE_LENGTH;
        endY = freeY;
        markerType = "pointer-right";
      }
      await createSimpleAnnotation(
        vizFrame,
        startX,
        startY,
        endX,
        endY,
        annotLabel,
        pointerColor,
        markerType,
        pointerColorType,
        highlightMode,
        textColor
      );
      annotationCount++;
    }
    if (annotationCount === 0) {
      tempInstance.remove();
      vizWrapper.remove();
      return false;
    }
    vizWrapper.appendChild(vizFrame);
    parent.appendChild(vizWrapper);
    return true;
  }
  function applyVariantFilters(data, filters) {
    if (!filters || Object.keys(filters).length === 0) return data;
    const hasAnySelection = Object.values(filters).some((v) => v.length > 0);
    if (!hasAnySelection) return data;
    return data.filter((vd) => {
      const parts = vd.variant.name.split(",").map((p) => p.trim());
      const propMap = {};
      for (const part of parts) {
        const [key, value] = part.split("=").map((s) => s.trim());
        if (key && value) propMap[key.toLowerCase()] = value;
      }
      for (const [propName, selectedValues] of Object.entries(filters)) {
        if (selectedValues.length === 0) continue;
        const variantValue = propMap[propName.toLowerCase()];
        if (!variantValue) continue;
        if (!selectedValues.some((v) => v.toLowerCase() === variantValue.toLowerCase())) return false;
      }
      return true;
    });
  }
  async function createRequirementsSectionCombined(parent, nodeToProcess, tableWidth, highlightMode, vizPropertyFilters = {}, framesPerRow = 2, includeInstances = false) {
    var _a;
    const componentSet = await getComponentSet(nodeToProcess);
    if (!componentSet) return false;
    const booleanKeys = getBooleanPropertyKeys(componentSet);
    if (booleanKeys.size === 0) return false;
    const variantData = [];
    for (const child of componentSet.children) {
      if (child.type !== "COMPONENT") continue;
      const layers = findBooleanBoundLayers(child, booleanKeys, []);
      if (layers.length === 0) continue;
      variantData.push({
        variant: child,
        layers,
        signature: getBooleanSignature(layers)
      });
    }
    if (variantData.length === 0) return false;
    let filteredData = applyVariantFilters(variantData, vizPropertyFilters);
    if (filteredData.length === 0) return false;
    const signatureGroups = /* @__PURE__ */ new Map();
    for (const vd of filteredData) {
      if (!signatureGroups.has(vd.signature)) {
        signatureGroups.set(vd.signature, []);
      }
      signatureGroups.get(vd.signature).push(vd);
    }
    const variantsToRender = [];
    if (signatureGroups.size === 1) {
      const group = Array.from(signatureGroups.values())[0];
      variantsToRender.push({ variant: group[0].variant, showLabel: false });
    } else {
      for (const [, group] of signatureGroups) {
        variantsToRender.push({ variant: group[0].variant, showLabel: true });
      }
    }
    const section = createSectionContainer("Requisitos das Propriedades");
    const titleText = figma.createText();
    titleText.fontName = getFont("Bold");
    titleText.fontSize = 40;
    titleText.characters = "Requisitos das propriedades";
    titleText.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
    section.appendChild(titleText);
    if (variantsToRender.length === 1) {
      const { variant, showLabel } = variantsToRender[0];
      const created = await createVariantRequirementsViz(
        section,
        variant,
        booleanKeys,
        tableWidth,
        highlightMode,
        showLabel
      );
      if (!created) {
        section.remove();
        return false;
      }
    } else {
      const gridContainer = figma.createFrame();
      gridContainer.name = "Requirements Grid";
      gridContainer.layoutMode = "HORIZONTAL";
      gridContainer.layoutWrap = "WRAP";
      gridContainer.primaryAxisSizingMode = "FIXED";
      gridContainer.counterAxisSizingMode = "AUTO";
      gridContainer.resize(tableWidth, 100);
      gridContainer.itemSpacing = 24;
      gridContainer.counterAxisSpacing = 24;
      gridContainer.fills = [];
      const cellWidth = Math.floor((tableWidth - (framesPerRow - 1) * 24) / framesPerRow);
      let anyCreated = false;
      for (const { variant, showLabel } of variantsToRender) {
        const created = await createVariantRequirementsViz(
          gridContainer,
          variant,
          booleanKeys,
          cellWidth,
          highlightMode,
          showLabel
        );
        if (created) anyCreated = true;
      }
      if (!anyCreated) {
        gridContainer.remove();
        section.remove();
        return false;
      }
      section.appendChild(gridContainer);
    }
    if (includeInstances) {
      const structuralByName = /* @__PURE__ */ new Map();
      async function findStructuralInVariant(node) {
        var _a2;
        if (node.type === "INSTANCE") {
          const inst = node;
          const mainComp = await inst.getMainComponentAsync();
          if (mainComp) {
            const compSetName = ((_a2 = mainComp.parent) == null ? void 0 : _a2.type) === "COMPONENT_SET" ? mainComp.parent.name : mainComp.name;
            if (isStructuralName(compSetName)) {
              if (!structuralByName.has(inst.name)) {
                structuralByName.set(inst.name, { mainComp, seen: /* @__PURE__ */ new Set() });
              }
              return;
            }
          }
          if ("children" in inst) {
            for (const child of inst.children) await findStructuralInVariant(child);
          }
          return;
        }
        if ("children" in node) {
          for (const child of node.children) await findStructuralInVariant(child);
        }
      }
      for (const { variant } of filteredData) {
        for (const child of variant.children) {
          await findStructuralInVariant(child);
        }
      }
      for (const [instName, { mainComp }] of structuralByName) {
        const instCompSet = ((_a = mainComp.parent) == null ? void 0 : _a.type) === "COMPONENT_SET" ? mainComp.parent : null;
        const targetSet = instCompSet != null ? instCompSet : mainComp;
        const instBooleanKeys = getBooleanPropertyKeys(targetSet);
        if (instBooleanKeys.size === 0) continue;
        const instVariantData = [];
        const children = instCompSet ? instCompSet.children : [mainComp];
        for (const child of children) {
          if (child.type !== "COMPONENT") continue;
          const layers = findBooleanBoundLayers(child, instBooleanKeys, []);
          if (layers.length === 0) continue;
          instVariantData.push({ variant: child, layers, signature: getBooleanSignature(layers) });
        }
        if (instVariantData.length === 0) continue;
        const instTitle = figma.createText();
        instTitle.fontName = getFont("Medium");
        instTitle.fontSize = 20;
        instTitle.characters = `\u25C7 ${instName}`;
        instTitle.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
        section.appendChild(instTitle);
        const instSignatureGroups = /* @__PURE__ */ new Map();
        for (const vd of instVariantData) {
          if (!instSignatureGroups.has(vd.signature)) instSignatureGroups.set(vd.signature, []);
          instSignatureGroups.get(vd.signature).push(vd);
        }
        const instVariantsToRender = [];
        if (instSignatureGroups.size === 1) {
          instVariantsToRender.push({ variant: Array.from(instSignatureGroups.values())[0][0].variant, showLabel: false });
        } else {
          for (const [, group] of instSignatureGroups) {
            instVariantsToRender.push({ variant: group[0].variant, showLabel: true });
          }
        }
        if (instVariantsToRender.length === 1) {
          await createVariantRequirementsViz(
            section,
            instVariantsToRender[0].variant,
            instBooleanKeys,
            tableWidth,
            highlightMode,
            false
          );
        } else {
          const instGrid = figma.createFrame();
          instGrid.name = `Requirements Grid - ${instName}`;
          instGrid.layoutMode = "HORIZONTAL";
          instGrid.layoutWrap = "WRAP";
          instGrid.primaryAxisSizingMode = "FIXED";
          instGrid.counterAxisSizingMode = "AUTO";
          instGrid.resize(tableWidth, 100);
          instGrid.itemSpacing = 24;
          instGrid.counterAxisSpacing = 24;
          instGrid.fills = [];
          const cellWidth = Math.floor((tableWidth - (framesPerRow - 1) * 24) / framesPerRow);
          for (const { variant, showLabel } of instVariantsToRender) {
            await createVariantRequirementsViz(instGrid, variant, instBooleanKeys, cellWidth, highlightMode, showLabel);
          }
          section.appendChild(instGrid);
        }
      }
    }
    parent.appendChild(section);
    return true;
  }

  // src/assets/marker-generator.ts
  function createAssetBadge(value, color) {
    const badge = figma.createFrame();
    badge.name = "Badge";
    badge.fills = [{ type: "SOLID", color }];
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
    badgeText.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    badge.appendChild(badgeText);
    return badge;
  }
  function createMeasureAssetResizable(value, color, direction, badgePosition, size = 100) {
    const frame = figma.createFrame();
    frame.name = `Measure - ${value}`;
    frame.fills = [];
    frame.clipsContent = false;
    const SIZE = size;
    const MARKER_SIZE = 12;
    const strokeColor = color;
    if (direction === "horizontal") {
      frame.resize(SIZE, 45);
      const badge = createAssetBadge(value, color);
      const badgeHeight = badge.height;
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
      lineFrame.constraints = { horizontal: "STRETCH", vertical: "CENTER" };
      const leftMarker = figma.createRectangle();
      leftMarker.name = "Left Marker";
      leftMarker.resize(1, MARKER_SIZE);
      leftMarker.fills = [{ type: "SOLID", color: strokeColor }];
      leftMarker.x = 0;
      leftMarker.y = 0;
      leftMarker.constraints = { horizontal: "MIN", vertical: "STRETCH" };
      lineFrame.appendChild(leftMarker);
      const rightMarker = figma.createRectangle();
      rightMarker.name = "Right Marker";
      rightMarker.resize(1, MARKER_SIZE);
      rightMarker.fills = [{ type: "SOLID", color: strokeColor }];
      rightMarker.x = SIZE - 1;
      rightMarker.y = 0;
      rightMarker.constraints = { horizontal: "MAX", vertical: "STRETCH" };
      lineFrame.appendChild(rightMarker);
      const line = figma.createRectangle();
      line.name = "Line";
      line.resize(SIZE, 1);
      line.fills = [{ type: "SOLID", color: strokeColor }];
      line.x = 0;
      line.y = MARKER_SIZE / 2 - 0.5;
      line.constraints = { horizontal: "STRETCH", vertical: "CENTER" };
      lineFrame.appendChild(line);
      frame.appendChild(lineFrame);
      if (badgePosition === "top") {
        badge.x = SIZE / 2 - badge.width / 2;
        badge.y = 0;
        badge.constraints = { horizontal: "CENTER", vertical: "MIN" };
      } else if (badgePosition === "bottom") {
        badge.x = SIZE / 2 - badge.width / 2;
        badge.y = lineFrame.y + MARKER_SIZE + 5;
        badge.constraints = { horizontal: "CENTER", vertical: "MAX" };
      } else if (badgePosition === "left") {
        badge.x = -badge.width - 5;
        badge.y = frame.height / 2 - badge.height / 2;
        badge.constraints = { horizontal: "MIN", vertical: "CENTER" };
      } else {
        badge.x = SIZE + 5;
        badge.y = frame.height / 2 - badge.height / 2;
        badge.constraints = { horizontal: "MAX", vertical: "CENTER" };
      }
      frame.appendChild(badge);
    } else {
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
      lineFrame.constraints = { horizontal: "CENTER", vertical: "STRETCH" };
      const topMarker = figma.createRectangle();
      topMarker.name = "Top Marker";
      topMarker.resize(MARKER_SIZE, 1);
      topMarker.fills = [{ type: "SOLID", color: strokeColor }];
      topMarker.x = 0;
      topMarker.y = 0;
      topMarker.constraints = { horizontal: "STRETCH", vertical: "MIN" };
      lineFrame.appendChild(topMarker);
      const bottomMarker = figma.createRectangle();
      bottomMarker.name = "Bottom Marker";
      bottomMarker.resize(MARKER_SIZE, 1);
      bottomMarker.fills = [{ type: "SOLID", color: strokeColor }];
      bottomMarker.x = 0;
      bottomMarker.y = SIZE - 1;
      bottomMarker.constraints = { horizontal: "STRETCH", vertical: "MAX" };
      lineFrame.appendChild(bottomMarker);
      const line = figma.createRectangle();
      line.name = "Line";
      line.resize(1, SIZE);
      line.fills = [{ type: "SOLID", color: strokeColor }];
      line.x = MARKER_SIZE / 2 - 0.5;
      line.y = 0;
      line.constraints = { horizontal: "CENTER", vertical: "STRETCH" };
      lineFrame.appendChild(line);
      frame.appendChild(lineFrame);
      if (badgePosition === "left") {
        badge.x = 0;
        badge.y = SIZE / 2 - badge.height / 2;
        badge.constraints = { horizontal: "MIN", vertical: "CENTER" };
      } else if (badgePosition === "right") {
        badge.x = lineFrame.x + MARKER_SIZE + 5;
        badge.y = SIZE / 2 - badge.height / 2;
        badge.constraints = { horizontal: "MAX", vertical: "CENTER" };
      } else if (badgePosition === "top") {
        badge.x = frame.width / 2 - badge.width / 2;
        badge.y = -badge.height - 5;
        badge.constraints = { horizontal: "CENTER", vertical: "MIN" };
      } else {
        badge.x = frame.width / 2 - badge.width / 2;
        badge.y = SIZE + 5;
        badge.constraints = { horizontal: "CENTER", vertical: "MAX" };
      }
      frame.appendChild(badge);
    }
    return frame;
  }
  function createGapAssetResizable(value, color, direction, badgePosition, size = 80, type = "Gap") {
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
      gapArea.fills = [{ type: "SOLID", color, opacity: 0.15 }];
      gapArea.strokes = [{ type: "SOLID", color, opacity: 0.6 }];
      gapArea.strokeWeight = 1;
      gapArea.dashPattern = [4, 4];
      gapArea.y = badgePosition === "top" ? 25 : 0;
      gapArea.constraints = { horizontal: "STRETCH", vertical: "STRETCH" };
      frame.appendChild(gapArea);
      const badge = createAssetBadge(value, color);
      if (badgePosition === "top") {
        badge.x = SIZE / 2 - badge.width / 2;
        badge.y = 0;
        badge.constraints = { horizontal: "CENTER", vertical: "MIN" };
      } else if (badgePosition === "bottom") {
        badge.x = SIZE / 2 - badge.width / 2;
        badge.y = SECONDARY_SIZE + 5;
        badge.constraints = { horizontal: "CENTER", vertical: "MAX" };
      } else if (badgePosition === "left") {
        badge.x = -badge.width - 5;
        badge.y = SECONDARY_SIZE / 2 - badge.height / 2;
        badge.constraints = { horizontal: "MIN", vertical: "CENTER" };
      } else {
        badge.x = SIZE + 5;
        badge.y = SECONDARY_SIZE / 2 - badge.height / 2;
        badge.constraints = { horizontal: "MAX", vertical: "CENTER" };
      }
      frame.appendChild(badge);
    } else {
      frame.resize(SECONDARY_SIZE + 50, SIZE);
      const gapArea = figma.createRectangle();
      gapArea.name = `${type} - ${value}`;
      gapArea.resize(SECONDARY_SIZE, SIZE);
      gapArea.fills = [{ type: "SOLID", color, opacity: 0.15 }];
      gapArea.strokes = [{ type: "SOLID", color, opacity: 0.6 }];
      gapArea.strokeWeight = 1;
      gapArea.dashPattern = [4, 4];
      gapArea.x = badgePosition === "left" ? 45 : 0;
      gapArea.constraints = { horizontal: "STRETCH", vertical: "STRETCH" };
      frame.appendChild(gapArea);
      const badge = createAssetBadge(value, color);
      if (badgePosition === "left") {
        badge.x = 0;
        badge.y = SIZE / 2 - badge.height / 2;
        badge.constraints = { horizontal: "MIN", vertical: "CENTER" };
      } else if (badgePosition === "right") {
        badge.x = SECONDARY_SIZE + 5;
        badge.y = SIZE / 2 - badge.height / 2;
        badge.constraints = { horizontal: "MAX", vertical: "CENTER" };
      } else if (badgePosition === "top") {
        badge.x = SECONDARY_SIZE / 2 - badge.width / 2;
        badge.y = -badge.height - 5;
        badge.constraints = { horizontal: "CENTER", vertical: "MIN" };
      } else {
        badge.x = SECONDARY_SIZE / 2 - badge.width / 2;
        badge.y = SIZE + 5;
        badge.constraints = { horizontal: "CENTER", vertical: "MAX" };
      }
      frame.appendChild(badge);
    }
    return frame;
  }
  function createPointerAssetResizable(value, color, direction, textColor) {
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
      dot.fills = [{ type: "SOLID", color: strokeColor }];
      const line = figma.createRectangle();
      line.name = "Line";
      line.resize(1, LINE_LENGTH);
      line.fills = [{ type: "SOLID", color: strokeColor }];
      const label = figma.createText();
      label.name = "Label";
      label.fontName = getFont("Medium");
      label.fontSize = 10;
      label.characters = value;
      label.fills = [{ type: "SOLID", color: textColor || strokeColor }];
      label.textAutoResize = "WIDTH_AND_HEIGHT";
      const frameHeight = DOT_SIZE + LINE_LENGTH + label.height;
      frame.layoutMode = "VERTICAL";
      frame.primaryAxisSizingMode = "FIXED";
      frame.counterAxisSizingMode = "AUTO";
      frame.counterAxisAlignItems = "CENTER";
      frame.itemSpacing = 0;
      frame.resize(Math.max(DOT_SIZE, label.width), frameHeight);
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
      label.fills = [{ type: "SOLID", color: textColor || strokeColor }];
      label.textAutoResize = "WIDTH_AND_HEIGHT";
      const dot = figma.createEllipse();
      dot.name = "Dot";
      dot.resize(DOT_SIZE, DOT_SIZE);
      dot.fills = [{ type: "SOLID", color: strokeColor }];
      const line = figma.createRectangle();
      line.name = "Line";
      line.resize(LINE_LENGTH, 1);
      line.fills = [{ type: "SOLID", color: strokeColor }];
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
  function createAreaAsset(variant, size = 48, color = { r: 218 / 255, g: 160 / 255, b: 176 / 255 }) {
    const isCircle = variant.includes("circle");
    const isDashed = variant.includes("dashed");
    const isOutline = variant.includes("outline");
    const frame = figma.createFrame();
    frame.name = variant;
    frame.resize(size, size);
    frame.fills = [];
    frame.clipsContent = false;
    frame.constrainProportions = true;
    let shapeNode;
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
      shapeNode.fills = [{ type: "SOLID", color, opacity: 0.3 }];
      shapeNode.strokes = [{ type: "SOLID", color }];
      shapeNode.strokeWeight = 2;
      shapeNode.dashPattern = [4, 4];
    } else if (isOutline) {
      shapeNode.fills = [];
      shapeNode.strokes = [{ type: "SOLID", color }];
      shapeNode.strokeWeight = 1;
      shapeNode.dashPattern = [4, 4];
    } else {
      shapeNode.fills = [{ type: "SOLID", color }];
      shapeNode.strokes = [];
    }
    frame.appendChild(shapeNode);
    return frame;
  }
  function createNumberPointerAsset(number, direction, size = 25, color = { r: 1, g: 215 / 255, b: 0 }, textColor) {
    const frame = figma.createFrame();
    frame.name = `Number ${direction} - ${number}`;
    frame.fills = [];
    frame.clipsContent = false;
    const LINE_LENGTH = 40;
    const isVertical = direction === "top" || direction === "bottom";
    const finalTextColor = textColor || (() => {
      const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
      return luminance > 0.5 ? { r: 0, g: 0, b: 0 } : { r: 1, g: 1, b: 1 };
    })();
    if (isVertical) {
      frame.resize(size + 10, LINE_LENGTH + size + 10);
      const circle = figma.createEllipse();
      circle.name = "Circle";
      circle.resize(size, size);
      circle.fills = [{ type: "SOLID", color }];
      const line = figma.createRectangle();
      line.name = "Line";
      line.resize(1, LINE_LENGTH);
      line.fills = [{ type: "SOLID", color }];
      const text = figma.createText();
      text.name = "Number";
      text.fontName = getFont("Bold");
      text.fontSize = Math.round(size * 0.6);
      text.characters = number;
      text.fills = [{ type: "SOLID", color: finalTextColor }];
      text.textAlignHorizontal = "CENTER";
      text.textAlignVertical = "CENTER";
      if (direction === "top") {
        circle.x = frame.width / 2 - size / 2;
        circle.y = 0;
        circle.constraints = { horizontal: "CENTER", vertical: "MIN" };
        line.x = frame.width / 2 - 0.5;
        line.y = size / 2;
        line.constraints = { horizontal: "CENTER", vertical: "STRETCH" };
        text.x = circle.x + size / 2 - text.width / 2;
        text.y = circle.y + size / 2 - text.height / 2;
        text.constraints = { horizontal: "CENTER", vertical: "MIN" };
      } else {
        circle.x = frame.width / 2 - size / 2;
        circle.y = frame.height - size;
        circle.constraints = { horizontal: "CENTER", vertical: "MAX" };
        line.x = frame.width / 2 - 0.5;
        line.y = 0;
        line.resize(1, frame.height - size / 2);
        line.constraints = { horizontal: "CENTER", vertical: "STRETCH" };
        text.x = circle.x + size / 2 - text.width / 2;
        text.y = circle.y + size / 2 - text.height / 2;
        text.constraints = { horizontal: "CENTER", vertical: "MAX" };
      }
      frame.appendChild(line);
      frame.appendChild(circle);
      frame.appendChild(text);
    } else {
      frame.resize(LINE_LENGTH + size + 10, size + 10);
      const circle = figma.createEllipse();
      circle.name = "Circle";
      circle.resize(size, size);
      circle.fills = [{ type: "SOLID", color }];
      const line = figma.createRectangle();
      line.name = "Line";
      line.resize(LINE_LENGTH, 1);
      line.fills = [{ type: "SOLID", color }];
      const text = figma.createText();
      text.name = "Number";
      text.fontName = getFont("Bold");
      text.fontSize = Math.round(size * 0.6);
      text.characters = number;
      text.fills = [{ type: "SOLID", color: finalTextColor }];
      text.textAlignHorizontal = "CENTER";
      text.textAlignVertical = "CENTER";
      if (direction === "left") {
        circle.x = 0;
        circle.y = frame.height / 2 - size / 2;
        circle.constraints = { horizontal: "MIN", vertical: "CENTER" };
        line.x = size / 2;
        line.y = frame.height / 2 - 0.5;
        line.constraints = { horizontal: "STRETCH", vertical: "CENTER" };
        text.x = circle.x + size / 2 - text.width / 2;
        text.y = circle.y + size / 2 - text.height / 2;
        text.constraints = { horizontal: "MIN", vertical: "CENTER" };
      } else {
        circle.x = frame.width - size;
        circle.y = frame.height / 2 - size / 2;
        circle.constraints = { horizontal: "MAX", vertical: "CENTER" };
        line.x = 0;
        line.y = frame.height / 2 - 0.5;
        line.resize(frame.width - size / 2, 1);
        line.constraints = { horizontal: "STRETCH", vertical: "CENTER" };
        text.x = circle.x + size / 2 - text.width / 2;
        text.y = circle.y + size / 2 - text.height / 2;
        text.constraints = { horizontal: "MAX", vertical: "CENTER" };
      }
      frame.appendChild(line);
      frame.appendChild(circle);
      frame.appendChild(text);
    }
    return frame;
  }
  async function insertAssetIntoFigma(assetType, value, colorType, direction = "horizontal", badgePosition = "bottom", highlightMode = false, size = 100, textColorType) {
    await loadPluginFonts();
    const normalColors = {
      red: { r: 1, g: 0.2, b: 0.2 },
      blue: { r: 0, g: 0.5, b: 1 },
      pink: { r: 236 / 255, g: 72 / 255, b: 153 / 255 },
      green: { r: 0.2, g: 0.6, b: 0.2 },
      black: { r: 0, g: 0, b: 0 },
      purple: { r: 0.6, g: 0.2, b: 0.6 },
      orange: { r: 0.8, g: 0.5, b: 0.2 }
    };
    const highlightColors = {
      red: { r: 255 / 255, g: 199 / 255, b: 203 / 255 },
      blue: { r: 98 / 255, g: 248 / 255, b: 79 / 255 },
      pink: { r: 255 / 255, g: 199 / 255, b: 203 / 255 },
      green: { r: 98 / 255, g: 248 / 255, b: 79 / 255 },
      purple: { r: 255 / 255, g: 199 / 255, b: 203 / 255 },
      orange: { r: 255 / 255, g: 183 / 255, b: 77 / 255 }
    };
    let color;
    if (colorType.startsWith("#")) {
      color = hexToRgb(colorType);
    } else {
      const palette = highlightMode ? highlightColors : normalColors;
      color = palette[colorType] || normalColors.red;
    }
    let textColor = void 0;
    if (textColorType && textColorType !== "inherit") {
      if (textColorType.startsWith("#")) {
        textColor = hexToRgb(textColorType);
      } else {
        textColor = normalColors[textColorType];
      }
    }
    let assetFrame;
    switch (assetType) {
      case "measure":
        assetFrame = createMeasureAssetResizable(value, color, direction, badgePosition, size);
        break;
      case "gap":
        assetFrame = createGapAssetResizable(value, color, direction, badgePosition, size, "Gap");
        break;
      case "padding":
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
    const markerConfig = {
      type: assetType,
      direction,
      value,
      colorType,
      textColorType,
      badgePosition,
      highlightMode,
      size
    };
    assetFrame.setPluginData("markerConfig", JSON.stringify(markerConfig));
    const viewport = figma.viewport.center;
    assetFrame.x = viewport.x - assetFrame.width / 2;
    assetFrame.y = viewport.y - assetFrame.height / 2;
    figma.currentPage.selection = [assetFrame];
    figma.viewport.scrollAndZoomIntoView([assetFrame]);
    figma.notify(`Asset "${assetType}" inserted!`);
  }
  async function updateMarker(oldMarker, newConfig) {
    await loadPluginFonts();
    const oldX = oldMarker.x;
    const oldY = oldMarker.y;
    const parent = oldMarker.parent;
    if ("findOne" in oldMarker) {
      if (newConfig.type.startsWith("pointer-")) {
        const labelNode = oldMarker.findOne((n) => n.type === "TEXT" && n.name === "Label");
        if (labelNode && labelNode.characters) newConfig.value = labelNode.characters;
      } else if (newConfig.type === "measure" || newConfig.type === "gap" || newConfig.type === "padding") {
        const badgeText = oldMarker.findOne((n) => n.type === "TEXT");
        if (badgeText && badgeText.characters) newConfig.value = badgeText.characters;
      } else if (newConfig.type.startsWith("number-")) {
        const numText = oldMarker.findOne((n) => n.type === "TEXT");
        if (numText && numText.characters) newConfig.value = numText.characters;
      }
    }
    const normalColors = {
      red: { r: 1, g: 0.2, b: 0.2 },
      blue: { r: 0, g: 0.5, b: 1 },
      pink: { r: 236 / 255, g: 72 / 255, b: 153 / 255 },
      green: { r: 0.2, g: 0.6, b: 0.2 },
      black: { r: 0, g: 0, b: 0 }
    };
    const highlightColors = {
      red: { r: 255 / 255, g: 199 / 255, b: 203 / 255 },
      blue: { r: 98 / 255, g: 248 / 255, b: 79 / 255 },
      pink: { r: 255 / 255, g: 199 / 255, b: 203 / 255 },
      green: { r: 98 / 255, g: 248 / 255, b: 79 / 255 }
    };
    const colors = newConfig.highlightMode ? highlightColors : normalColors;
    let color;
    if (newConfig.colorType.startsWith("#")) {
      color = hexToRgb(newConfig.colorType);
    } else {
      color = colors[newConfig.colorType] || colors.red;
    }
    let textColor = void 0;
    if (newConfig.textColorType && newConfig.textColorType !== "inherit") {
      if (newConfig.textColorType.startsWith("#")) {
        textColor = hexToRgb(newConfig.textColorType);
      } else {
        textColor = normalColors[newConfig.textColorType];
      }
    }
    let newMarker;
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
      config: newConfig
    });
    figma.notify(`Marker updated!`);
  }

  // src/main.ts
  async function main() {
    var _a, _b;
    figma.showUI(__html__, { width: 380, height: 720 });
    const selection = figma.currentPage.selection;
    const validNodes = selection.filter(
      (node) => node.type === "COMPONENT" || node.type === "COMPONENT_SET" || node.type === "INSTANCE"
    );
    if (validNodes.length === 0) {
      figma.ui.postMessage({
        type: "init",
        componentName: "Nenhum componente selecionado",
        variantProperties: [],
        selectionCount: 0
      });
      return;
    }
    const componentNames = [];
    const allVariantProperties = /* @__PURE__ */ new Map();
    for (const node of validNodes) {
      let nodeName = node.name;
      let nodeVariantProperties = [];
      if (node.type === "COMPONENT_SET") {
        nodeVariantProperties = extractVariantProperties(node);
        nodeName = node.name;
      } else if (node.type === "INSTANCE") {
        const mainComponent = await node.getMainComponentAsync();
        if (((_a = mainComponent == null ? void 0 : mainComponent.parent) == null ? void 0 : _a.type) === "COMPONENT_SET") {
          nodeVariantProperties = extractVariantProperties(mainComponent.parent);
          nodeName = mainComponent.parent.name;
        } else {
          nodeName = (mainComponent == null ? void 0 : mainComponent.name) || node.name;
        }
      } else if (node.type === "COMPONENT") {
        if (((_b = node.parent) == null ? void 0 : _b.type) === "COMPONENT_SET") {
          nodeVariantProperties = extractVariantProperties(
            node.parent
          );
          nodeName = node.parent.name;
        }
      }
      componentNames.push(nodeName);
      for (const prop of nodeVariantProperties) {
        if (!allVariantProperties.has(prop.name)) {
          allVariantProperties.set(prop.name, /* @__PURE__ */ new Set());
        }
        for (const value of prop.values) {
          allVariantProperties.get(prop.name).add(value);
        }
      }
    }
    const mergedVariantProperties = [];
    for (const [name, values] of allVariantProperties) {
      mergedVariantProperties.push({ name, values: Array.from(values) });
    }
    const displayName = validNodes.length === 1 ? componentNames[0] : `${validNodes.length} componentes selecionados`;
    let nodeType = "COMPONENT";
    if (validNodes.length === 1) {
      nodeType = validNodes[0].type;
    }
    figma.ui.postMessage({
      type: "init",
      componentName: displayName,
      variantProperties: mergedVariantProperties,
      hasVariants: mergedVariantProperties.length > 0,
      selectionCount: validNodes.length,
      nodeType
    });
  }
  function getSelectedMarkerConfig() {
    const selection = figma.currentPage.selection;
    if (selection.length !== 1) return null;
    const node = selection[0];
    let pluginData = node.getPluginData("markerConfig");
    let markerNode = node;
    if (!pluginData && node.parent && node.parent.type !== "PAGE") {
      pluginData = node.parent.getPluginData("markerConfig");
      if (pluginData) {
        markerNode = node.parent;
      }
    }
    if (!pluginData) return null;
    try {
      const config = JSON.parse(pluginData);
      return { node: markerNode, config };
    } catch (e) {
      return null;
    }
  }
  function handleSelectionChange() {
    const markerData = getSelectedMarkerConfig();
    if (markerData) {
      figma.ui.postMessage({
        type: "marker-selected",
        config: markerData.config
      });
    } else {
      figma.ui.postMessage({
        type: "marker-deselected"
      });
    }
    const selection = figma.currentPage.selection;
    if (selection.length === 1) {
      const node = selection[0];
      let componentName = node.name;
      let componentType = "-";
      let nodeType = node.type;
      if (node.type === "COMPONENT_SET") {
        componentType = "Component Set";
      } else if (node.type === "COMPONENT") {
        componentType = "Component";
      } else if (node.type === "INSTANCE") {
        componentType = "Instance";
      }
      figma.ui.postMessage({
        type: "selection-info",
        text: componentName,
        componentType,
        nodeType
      });
    } else if (selection.length === 0) {
      figma.ui.postMessage({
        type: "selection-info",
        text: "Selecione um componente",
        componentType: "-"
      });
    } else {
      figma.ui.postMessage({
        type: "selection-info",
        text: `${selection.length} itens selecionados`,
        componentType: "-"
      });
    }
  }
  var SPEC_FRAME_NAMES_TO_RENAME = /* @__PURE__ */ new Set([
    // Tabelas
    "Tabela Cores",
    "Tabela Tipografia",
    "Tabela Espa\xE7amentos",
    "Tabela Efeitos",
    // Grids de visualização
    "Grid Variantes - Texto",
    "Comportamento de Texto",
    "Grid Variantes - Espa\xE7amentos",
    "Grid Variantes - Dimens\xF5es",
    "Grid Variantes - Efeitos",
    "Grid Estados",
    // Frames de visualização (filhos dos containers, não os containers pai)
    "Text Visualization",
    "Spacing Visualization",
    "Dimension Visualization",
    // Componentes e ícones utilizados
    "Components Container",
    "Anatomia do Componente",
    // Propriedades
    "Se\xE7\xE3o Propriedades"
  ]);
  function renameSpecFrames(specFrame, baseName) {
    let counter = 1;
    function walk(node) {
      if (node.type === "FRAME" || node.type === "GROUP") {
        if (SPEC_FRAME_NAMES_TO_RENAME.has(node.name) || node.name.startsWith("Requirements - ")) {
          const num = String(counter++).padStart(2, "0");
          node.name = `${baseName}-spec-${num}`;
          return;
        }
        if ("children" in node) {
          for (const child of node.children) {
            walk(child);
          }
        }
      } else if ("children" in node) {
        for (const child of node.children) {
          walk(child);
        }
      }
    }
    for (const child of specFrame.children) {
      walk(child);
    }
  }
  async function addSectionDivider(parent, width) {
    const divider = figma.createFrame();
    divider.name = "Divider";
    divider.resize(width, 1);
    divider.fills = [{ type: "SOLID", color: { r: 0.85, g: 0.85, b: 0.85 } }];
    parent.appendChild(divider);
  }
  async function generateSpec(options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
    figma.ui.hide();
    const loadingNotification = figma.notify("\u{1F504} Gerando especifica\xE7\xE3o...", {
      timeout: 5e4
    });
    await loadPluginFonts();
    const selection = figma.currentPage.selection;
    const validNodes = [];
    const componentNames = [];
    for (const node of selection) {
      if (node.type === "INSTANCE") {
        const mainComp = await node.getMainComponentAsync();
        componentNames.push((mainComp == null ? void 0 : mainComp.name) || node.name);
        validNodes.push(node);
      } else if (node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
        componentNames.push(node.name);
        validNodes.push(node);
      }
    }
    if (validNodes.length === 0) {
      loadingNotification.cancel();
      figma.notify(
        "\u274C Selecione um Component, Component Set ou Instance para gerar especifica\xE7\xF5es"
      );
      figma.ui.show();
      return;
    }
    const allVariantColors = [];
    for (const nodeToProcess of validNodes) {
      const variantColors = await processComponent(nodeToProcess);
      allVariantColors.push(...variantColors);
    }
    if (allVariantColors.length === 0) {
      figma.notify("\u26A0\uFE0F Nenhum dado encontrado nos componentes selecionados");
      figma.closePlugin();
      return;
    }
    const specTitle = componentNames.length === 1 ? componentNames[0] : `${componentNames.length} Componentes`;
    const firstNode = validNodes[0];
    const frameWidth = options.frameWidth || 1140;
    const paddingH = options.paddingHorizontal || 100;
    const sectionGap = options.sectionSpacingValue || 40;
    const tableWidth = frameWidth - paddingH * 2;
    const specFrameBaseName = specTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const specNamePattern = new RegExp(`^${specFrameBaseName}-spec-\\d+$`);
    const existingCount = figma.currentPage.children.filter(
      (n) => specNamePattern.test(n.name)
    ).length;
    const specFrameNumber = String(existingCount + 1).padStart(2, "0");
    const specFrameName = `${specFrameBaseName}-spec-${specFrameNumber}`;
    const specFrame = figma.createFrame();
    specFrame.name = specFrameName;
    specFrame.x = firstNode.x + firstNode.width + 100;
    specFrame.y = firstNode.y;
    const bgHex = options.bgColor || "F4F5F7";
    const bgR = parseInt(bgHex.substring(0, 2), 16) / 255;
    const bgG = parseInt(bgHex.substring(2, 4), 16) / 255;
    const bgB = parseInt(bgHex.substring(4, 6), 16) / 255;
    specFrame.fills = [{ type: "SOLID", color: { r: bgR, g: bgG, b: bgB } }];
    specFrame.layoutMode = "VERTICAL";
    specFrame.primaryAxisSizingMode = "AUTO";
    specFrame.counterAxisSizingMode = "FIXED";
    specFrame.resize(frameWidth, 100);
    specFrame.itemSpacing = sectionGap;
    specFrame.paddingLeft = paddingH;
    specFrame.paddingRight = paddingH;
    specFrame.paddingTop = 60;
    specFrame.paddingBottom = 60;
    const titleText = figma.createText();
    titleText.fontName = getFont("Bold");
    titleText.fontSize = 48;
    titleText.characters = `${specTitle} \u2014 Especifica\xE7\xF5es`;
    titleText.textAutoResize = "HEIGHT";
    titleText.resize(tableWidth, titleText.height);
    specFrame.appendChild(titleText);
    if (componentNames.length > 1) {
      const subtitleText = figma.createText();
      subtitleText.fontName = getFont("Regular");
      subtitleText.fontSize = 14;
      subtitleText.characters = componentNames.join(", ");
      subtitleText.fills = [{ type: "SOLID", color: { r: 0.4, g: 0.4, b: 0.4 } }];
      subtitleText.textAutoResize = "HEIGHT";
      subtitleText.resize(tableWidth, subtitleText.height);
      specFrame.appendChild(subtitleText);
    }
    let lastSectionCreated = false;
    if (options.sectionColors) {
      const hasContent = allVariantColors.some((v) => v.colors.length > 0);
      if (hasContent) {
        if (lastSectionCreated) await addSectionDivider(specFrame, tableWidth);
        const created = await createColorSectionCombined(
          specFrame,
          allVariantColors,
          tableWidth,
          options.variantPropertyOrder,
          options.colorVizProperties
        );
        if (created) lastSectionCreated = true;
      }
    }
    if (options.sectionText) {
      let sectionCreated = false;
      let dividerAdded = false;
      for (let i = 0; i < validNodes.length; i++) {
        const nodeToProcess = validNodes[i];
        const nodeVariantColors = await processComponent(nodeToProcess);
        const hasContent = nodeVariantColors.some((v) => v.textStyles.length > 0);
        if (!hasContent) continue;
        if (!dividerAdded && lastSectionCreated) {
          await addSectionDivider(specFrame, tableWidth);
          dividerAdded = true;
        }
        if (sectionCreated) {
          const compTitle = figma.createText();
          compTitle.fontName = getFont("Medium");
          compTitle.fontSize = 18;
          compTitle.characters = componentNames[i];
          compTitle.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
          specFrame.appendChild(compTitle);
        }
        const created = await createTextSectionCombined(
          specFrame,
          nodeVariantColors,
          nodeToProcess,
          tableWidth,
          options.highlightMode,
          options.textVizProperties,
          options.textFramesPerRow || 2,
          (_a = options.textShowTable) != null ? _a : true,
          (_b = options.textShowViz) != null ? _b : true
        );
        if (created) sectionCreated = true;
      }
      if (sectionCreated) lastSectionCreated = true;
    }
    if (options.sectionSpacing) {
      let sectionCreated = false;
      let dividerAdded = false;
      for (let i = 0; i < validNodes.length; i++) {
        const nodeToProcess = validNodes[i];
        const nodeVariantColors = await processComponent(nodeToProcess);
        const hasContent = nodeVariantColors.some(
          (v) => v.spacings.length > 0 || v.borders.length > 0
        );
        if (!hasContent) continue;
        if (!dividerAdded && lastSectionCreated) {
          await addSectionDivider(specFrame, tableWidth);
          dividerAdded = true;
        }
        if (sectionCreated) {
          const compTitle = figma.createText();
          compTitle.fontName = getFont("Medium");
          compTitle.fontSize = 18;
          compTitle.characters = componentNames[i];
          compTitle.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
          specFrame.appendChild(compTitle);
        }
        const created = await createSpacingSectionCombined(
          specFrame,
          nodeVariantColors,
          nodeToProcess,
          tableWidth,
          options.highlightMode,
          options.spacingVizProperties,
          options.spacingFramesPerRow || 2,
          (_c = options.spacingShowTable) != null ? _c : true,
          (_d = options.spacingShowViz) != null ? _d : true
        );
        if (created) sectionCreated = true;
      }
      if (sectionCreated) lastSectionCreated = true;
    }
    if (options.sectionEffects) {
      let sectionCreated = false;
      let dividerAdded = false;
      for (let i = 0; i < validNodes.length; i++) {
        const nodeToProcess = validNodes[i];
        const nodeVariantColors = await processComponent(nodeToProcess);
        const hasContent = nodeVariantColors.some((v) => v.effects.length > 0);
        if (!hasContent) continue;
        if (!dividerAdded && lastSectionCreated) {
          await addSectionDivider(specFrame, tableWidth);
          dividerAdded = true;
        }
        if (sectionCreated) {
          const compTitle = figma.createText();
          compTitle.fontName = getFont("Medium");
          compTitle.fontSize = 18;
          compTitle.characters = componentNames[i];
          compTitle.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
          specFrame.appendChild(compTitle);
        }
        const created = await createEffectsSectionCombined(
          specFrame,
          nodeVariantColors,
          nodeToProcess,
          tableWidth,
          options.highlightMode,
          options.effectsVizProperties || {},
          options.effectsFramesPerRow || 2,
          (_e = options.effectsShowTable) != null ? _e : true,
          (_f = options.effectsShowViz) != null ? _f : true
        );
        if (created) sectionCreated = true;
      }
      if (sectionCreated) lastSectionCreated = true;
    }
    if (options.sectionRequirements) {
      let sectionCreated = false;
      let dividerAdded = false;
      for (let i = 0; i < validNodes.length; i++) {
        const nodeToProcess = validNodes[i];
        if (!dividerAdded && lastSectionCreated) {
          await addSectionDivider(specFrame, tableWidth);
          dividerAdded = true;
        }
        if (sectionCreated && validNodes.length > 1) {
          const compTitle = figma.createText();
          compTitle.fontName = getFont("Medium");
          compTitle.fontSize = 18;
          compTitle.characters = `Requisitos: ${componentNames[i]}`;
          compTitle.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
          specFrame.appendChild(compTitle);
        }
        const created = await createRequirementsSectionCombined(
          specFrame,
          nodeToProcess,
          tableWidth,
          options.highlightMode,
          options.requirementsVizProperties,
          options.requirementsFramesPerRow || 2,
          (_g = options.requirementsIncludeInstances) != null ? _g : false
        );
        if (created) sectionCreated = true;
      }
      if (sectionCreated) lastSectionCreated = true;
    }
    if (options.sectionComponents) {
      const componentMap = /* @__PURE__ */ new Map();
      for (const variant of allVariantColors) {
        for (const [compId, compName] of variant.usedComponents) {
          componentMap.set(compId, compName);
        }
      }
      if (componentMap.size > 0) {
        if (lastSectionCreated) await addSectionDivider(specFrame, tableWidth);
        const created = await createUsedComponentsSectionAutoLayout(
          specFrame,
          allVariantColors,
          tableWidth,
          validNodes,
          options.highlightMode
        );
        if (created) lastSectionCreated = true;
      }
    }
    if (options.sectionEstados) {
      let hasAnyEstados = false;
      for (const node of validNodes) {
        if (node.type === "COMPONENT_SET" && node.children.length > 0) {
          hasAnyEstados = true;
          break;
        } else if (node.type === "COMPONENT" || node.type === "INSTANCE") {
          hasAnyEstados = true;
          break;
        }
      }
      if (hasAnyEstados) {
        let sectionCreated = false;
        let dividerAdded = false;
        for (let i = 0; i < validNodes.length; i++) {
          const nodeToProcess = validNodes[i];
          if (!dividerAdded && lastSectionCreated) {
            await addSectionDivider(specFrame, tableWidth);
            dividerAdded = true;
          }
          if (sectionCreated && validNodes.length > 1) {
            const compTitle = figma.createText();
            compTitle.fontName = getFont("Medium");
            compTitle.fontSize = 18;
            compTitle.characters = `Estados: ${componentNames[i]}`;
            compTitle.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
            specFrame.appendChild(compTitle);
          }
          let componentSet = null;
          if (nodeToProcess.type === "COMPONENT_SET") {
            componentSet = nodeToProcess;
          } else if (nodeToProcess.type === "COMPONENT" && ((_h = nodeToProcess.parent) == null ? void 0 : _h.type) === "COMPONENT_SET") {
            componentSet = nodeToProcess.parent;
          } else if (nodeToProcess.type === "INSTANCE") {
            const mainComp = await nodeToProcess.getMainComponentAsync();
            if (((_i = mainComp == null ? void 0 : mainComp.parent) == null ? void 0 : _i.type) === "COMPONENT_SET") {
              componentSet = mainComp.parent;
            }
          }
          if (componentSet) {
            const nodeVariantColors = await processComponent(componentSet);
            const created = await createEstadosSection(
              specFrame,
              componentSet,
              nodeVariantColors,
              tableWidth,
              options.highlightMode,
              options.gridDensity || 4,
              options.statesVizProperties || {},
              options.statesVariantPropertyOrder
            );
            if (created) sectionCreated = true;
          }
        }
        if (sectionCreated) lastSectionCreated = true;
      }
    }
    if (options.sectionProperties) {
      let hasAnyProperties = false;
      for (const node of validNodes) {
        let componentSet = null;
        if (node.type === "COMPONENT_SET") {
          componentSet = node;
        } else if (node.type === "COMPONENT" && ((_j = node.parent) == null ? void 0 : _j.type) === "COMPONENT_SET") {
          componentSet = node.parent;
        } else if (node.type === "INSTANCE") {
          const mainComp = await node.getMainComponentAsync();
          if (((_k = mainComp == null ? void 0 : mainComp.parent) == null ? void 0 : _k.type) === "COMPONENT_SET") {
            componentSet = mainComp.parent;
          }
        }
        if ((componentSet == null ? void 0 : componentSet.componentPropertyDefinitions) && Object.keys(componentSet.componentPropertyDefinitions).length > 0) {
          hasAnyProperties = true;
          break;
        }
      }
      if (hasAnyProperties) {
        let sectionCreated = false;
        let dividerAdded = false;
        for (let i = 0; i < validNodes.length; i++) {
          const nodeToProcess = validNodes[i];
          if (!dividerAdded && lastSectionCreated) {
            await addSectionDivider(specFrame, tableWidth);
            dividerAdded = true;
          }
          if (sectionCreated && validNodes.length > 1) {
            const compTitle = figma.createText();
            compTitle.fontName = getFont("Medium");
            compTitle.fontSize = 18;
            compTitle.characters = `Propriedades: ${componentNames[i]}`;
            compTitle.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
            specFrame.appendChild(compTitle);
          }
          let componentSet = null;
          if (nodeToProcess.type === "COMPONENT_SET") {
            componentSet = nodeToProcess;
          } else if (nodeToProcess.type === "COMPONENT" && ((_l = nodeToProcess.parent) == null ? void 0 : _l.type) === "COMPONENT_SET") {
            componentSet = nodeToProcess.parent;
          } else if (nodeToProcess.type === "INSTANCE") {
            const mainComp = await nodeToProcess.getMainComponentAsync();
            if (((_m = mainComp == null ? void 0 : mainComp.parent) == null ? void 0 : _m.type) === "COMPONENT_SET") {
              componentSet = mainComp.parent;
            }
          }
          if (componentSet) {
            const created = await createPropertiesSection(
              specFrame,
              componentSet,
              tableWidth
            );
            if (created) sectionCreated = true;
          }
        }
        if (sectionCreated) lastSectionCreated = true;
      }
    }
    figma.currentPage.appendChild(specFrame);
    renameSpecFrames(specFrame, specFrameBaseName);
    figma.viewport.scrollAndZoomIntoView([specFrame]);
    loadingNotification.cancel();
    const successMsg = validNodes.length === 1 ? "\u2705 Especifica\xE7\xE3o gerada com sucesso!" : `\u2705 Especifica\xE7\xE3o gerada para ${validNodes.length} componentes!`;
    figma.notify(successMsg);
    figma.closePlugin();
  }
  figma.ui.onmessage = async (msg) => {
    if (msg.type === "generate" && msg.options) {
      await generateSpec(msg.options);
    } else if (msg.type === "insert-asset" && msg.assetType) {
      await insertAssetIntoFigma(
        msg.assetType,
        msg.value || "0px",
        msg.color || "red",
        msg.direction || "horizontal",
        msg.badgePosition || "bottom",
        msg.highlightMode || false,
        msg.size || 100,
        msg.textColorType
      );
    } else if (msg.type === "update-marker" && msg.markerConfig) {
      const markerData = getSelectedMarkerConfig();
      if (markerData) {
        await updateMarker(markerData.node, msg.markerConfig);
      }
    } else if (msg.type === "resize") {
      const w = Math.round(Math.max(300, Math.min(msg.width || 380, 1200)));
      const h = Math.round(Math.max(400, Math.min(msg.height || 720, 1200)));
      figma.ui.resize(w, h);
    } else if (msg.type === "close" || msg.type === "cancel") {
      figma.closePlugin();
    } else if (msg.type === "refresh") {
      await main();
    }
  };
  figma.on("selectionchange", handleSelectionChange);
  main();
})();
