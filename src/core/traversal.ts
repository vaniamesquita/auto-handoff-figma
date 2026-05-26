// ========================================================================
// AUTO HANDOFF GENERATOR - TRAVERSAL
// ========================================================================

import type {
  ColorSpec,
  CollectedNodeData,
  VariantColors,
  IndividualStrokeWeights,
  IndividualPadding,
  IndividualCornerRadii,
} from "../types";
import {SEMANTIC_ROLES} from "../config/theme";
import {
  formatToken,
  formatSpaceToken,
  formatDimensionToken,
  formatRadiusToken,
  rgbToHex,
  extractMainState,
  formatPropertiesForDisplay,
  extractAllProperties,
  resolveSpacingElement,
  formatEffectToken,
  formatEffectValue,
  isVariantPropertiesName,
} from "../utils/helpers";
import {
  isNodeVisible,
  shouldSkipNestedInstance,
  shouldCollectIcon,
  resolveNodeName,
  resolveBoundVariable,
  resolveBoundVariableAtIndex,
  findVectorNode,
} from "./node-helpers";

// ========================================
// EMPTY DATA FACTORY
// ========================================

/**
 * Creates an empty CollectedNodeData object to start collection.
 */
export function createEmptyCollectedData(): CollectedNodeData {
  return {
    colors: [],
    textStyles: [],
    spacings: [],
    borders: [],
    effects: [],
    usedComponents: new Map<string, string>(),
  };
}

// ========================================
// ICON COLOR EXTRACTION
// ========================================

/**
 * Extracts icon color from a Vector node inside an instance.
 * Ignores wrapper structure (masks, FontAwesome containers): recursively searches
 * for a node named "Vector" or type VECTOR inside the instance.
 *
 * @param node - The instance node containing the icon
 * @param state - Current variant state
 * @param properties - Current properties string
 * @returns ColorSpec if icon color found, null otherwise
 */
async function extractIconColor(
  node: InstanceNode,
  state: string,
  properties: string,
): Promise<ColorSpec | null> {
  // Search recursively for "Vector" by name or type inside instance (ignore wrappers)
  const vectorNode = findVectorNode(node);
  if (!vectorNode) return null;

  // Extract fill color from Vector
  if ("fills" in vectorNode && Array.isArray(vectorNode.fills)) {
    for (const paint of vectorNode.fills) {
      if (paint.type === "SOLID" && paint.visible !== false) {
        const hex = rgbToHex(paint.color);
        let token: string | null = null;
        let varId: string | null = null;

        if (paint.boundVariables?.color) {
          varId = paint.boundVariables.color.id;
          const variable = await figma.variables.getVariableByIdAsync(varId!);
          if (variable) token = formatToken(variable.name);
        }

        // Busca o componente original para pegar o nome real (ex: "Error", "User")
        let iconName = "Icon";
        const mainComp = await node.getMainComponentAsync();

        if (mainComp) {
          // Se for variante, prefira o nome do Set, senão o nome do componente
          if (mainComp.parent && mainComp.parent.type === "COMPONENT_SET") {
            iconName = mainComp.parent.name;
          } else {
            iconName = mainComp.name;
          }
        } else {
          // Fallback para o nome da camada se não achar o componente
          iconName = await resolveNodeName(node);
        }

        // Limpeza de nome: Remove prefixos de pasta (ex: "Icons/Solid/User" -> "User")
        iconName = iconName.split("/").pop()?.trim() || iconName;

        // Se ainda for nome de propriedade de variante (ex: "Style=Filled"),
        // tenta pegar o nome do parent novamente
        if (iconName.includes("=") && mainComp?.parent?.type === "COMPONENT_SET") {
          const parentName = mainComp.parent.name;
          iconName = parentName.split("/").pop()?.trim() || iconName;
        }

        return {
          element: `Icon (${iconName})`,
          state,
          token,
          colorHex: hex,
          colorVariableId: varId,
          properties,
        };
      }
    }
  }

  return null;
}

// ========================================
// MAIN DATA COLLECTION (SINGLE PASS)
// ========================================

/**
 * Collects all design data from a node tree in a single pass.
 * Extracts colors, text styles, spacings, borders, and effects.
 *
 * @param node - The node to process
 * @param state - Current variant state
 * @param properties - Current properties string
 * @param data - The data collection object to populate
 * @param isTopLevel - Whether this is the top level of traversal
 */
export async function collectNodeData(
  node: SceneNode,
  state: string,
  properties: string,
  data: CollectedNodeData,
  isTopLevel: boolean = false,
  componentRoot?: SceneNode,
): Promise<void> {
  // Skip hidden nodes
  if (!isNodeVisible(node)) return;

  // Track the root of the component being analysed
  const root = isTopLevel ? node : componentRoot;

  // Check if it's an instance to collect used components and extract icon color
  if (node.type === "INSTANCE") {
    const mainComponent = await node.getMainComponentAsync();
    if (mainComponent) {
      const displayName =
        mainComponent.parent?.type === "COMPONENT_SET"
          ? mainComponent.parent.name
          : mainComponent.name;
      if (displayName) {
        data.usedComponents.set(mainComponent.id, displayName);
      }
    }

    // For icon instances (INSTANCE with direct Vector child), apply barrier rule:
    // only collect if no non-structural instance exists in path to component root
    const hasDirectVector = "children" in node && node.children.some(
      (c) => c.name === "Vector" || c.type === "VECTOR",
    );

    if (hasDirectVector && !isTopLevel && root && await shouldCollectIcon(node, root)) {
      // Extract icon color
      const iconColor = await extractIconColor(node, state, properties);
      if (iconColor) {
        data.colors.push(iconColor);
      }
      // Extract icon size
      const iconName = iconColor?.element || (await resolveNodeName(node));
      const heightToken = await resolveBoundVariable(node, "height", formatDimensionToken);
      data.spacings.push({
        element: iconName,
        property: "Height",
        token: heightToken,
        value: `${Math.round(node.height)}px`,
        properties,
        sourceNodeId: node.id,
      });
    }

  }

  // Skip nested instances unless they're structural components
  if (await shouldSkipNestedInstance(node, isTopLevel)) return;

  const resolvedName = await resolveNodeName(node);

  // ========================================
  // COLOR EXTRACTION (fills and strokes)
  // ========================================

  const nodeName = resolvedName.toLowerCase();
  let semanticRole: string | null = null;

  // Only apply semantic roles if NOT a variant properties name (contains "=")
  // This prevents "Badge=Text" from being detected as "Text" semantic role
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

  // Fill colors
  if ("fills" in node && Array.isArray(node.fills)) {
    for (const paint of node.fills) {
      if (paint.type === "SOLID") {
        const hex = rgbToHex(paint.color);
        let token: string | null = null;
        let varId: string | null = null;
        if (paint.boundVariables?.color) {
          varId = paint.boundVariables.color.id;
          const variable = await figma.variables.getVariableByIdAsync(varId!);
          if (variable) token = formatToken(variable.name);
        }

        // For fill colors on variant components, simplify element name
        // This allows deduplication when all variants have the same background
        let fillElement: string;
        if (semanticRole) {
          fillElement = semanticRole;
        } else if (isVariantName && node.type === "COMPONENT") {
          // Variant component background - use generic name for deduplication
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
          properties,
        });
      }
    }
  }

  // Stroke colors
  // Only collect if node has actual visible strokes AND strokeWeight > 0
  if ("strokes" in node && Array.isArray(node.strokes) && node.strokes.length > 0) {
    // Check if strokeWeight > 0 (handles both uniform and mixed stroke weights)
    let hasStrokeWeight = false;
    if ("strokeWeight" in node) {
      if (typeof node.strokeWeight === "number" && node.strokeWeight > 0) {
        // Uniform stroke weight
        hasStrokeWeight = true;
      } else if (node.strokeWeight === figma.mixed) {
        // Mixed stroke weights - check individual sides
        const strokeNode = node as SceneNode & IndividualStrokeWeights;
        const hasSideWeight =
          (typeof strokeNode.strokeTopWeight === "number" && strokeNode.strokeTopWeight > 0) ||
          (typeof strokeNode.strokeBottomWeight === "number" && strokeNode.strokeBottomWeight > 0) ||
          (typeof strokeNode.strokeLeftWeight === "number" && strokeNode.strokeLeftWeight > 0) ||
          (typeof strokeNode.strokeRightWeight === "number" && strokeNode.strokeRightWeight > 0);
        hasStrokeWeight = hasSideWeight;
      }
    }

    // Check if there's at least one visible stroke
    const hasVisibleStroke = node.strokes.some((s: Paint) => s.visible !== false && s.type === "SOLID");

    if (hasVisibleStroke && hasStrokeWeight) {
      for (const paint of node.strokes) {
        if (paint.type === "SOLID" && paint.visible !== false) {
          const hex = rgbToHex(paint.color);
          let token: string | null = null;
          let varId: string | null = null;
          if (paint.boundVariables?.color) {
            varId = paint.boundVariables.color.id;
            const variable = await figma.variables.getVariableByIdAsync(varId!);
            if (variable) token = formatToken(variable.name);
          }
          // For stroke colors on variant components, simplify to just "Border"
          // instead of showing the full variant name with properties
          let element: string;
          if (semanticRole) {
            element = `${semanticRole} Border`;
          } else if (isVariantName && node.type === "COMPONENT") {
            // Variant component with stroke - just use "Border" or "Container Border"
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
            properties,
          });
        }
      }
    }
  }

  // ========================================
  // TEXT EXTRACTION
  // ========================================
  if (node.type === "TEXT") {
    // Use the same elementName logic (semanticRole || resolvedName)
    // If no match in SEMANTIC_ROLES, use the resolved component name
    // Example: .asset/Saldo -> "Saldo" (not "Text")
    const textElement = semanticRole || resolvedName;

    let token: string | null = null;
    if (
      node.textStyleId &&
      node.textStyleId !== "" &&
      node.textStyleId !== figma.mixed
    ) {
      const textStyle = await figma.getStyleByIdAsync(node.textStyleId);
      if (textStyle && textStyle.type === "TEXT") {
        token = textStyle.name
          .toLowerCase()
          .replace(/\//g, "-")
          .replace(/\s+/g, "-");
      }
    }

    const fontName =
      node.fontName !== figma.mixed
        ? node.fontName
        : {family: "Mixed", style: "Mixed"};
    const fontSize = node.fontSize !== figma.mixed ? node.fontSize : 0;
    const lineHeight =
      node.lineHeight !== figma.mixed
        ? typeof node.lineHeight === "object" && "value" in node.lineHeight
          ? `${Math.round(node.lineHeight.value)}${node.lineHeight.unit === "PIXELS" ? "px" : "%"}`
          : "Auto"
        : "Mixed";
    const letterSpacing =
      node.letterSpacing !== figma.mixed
        ? typeof node.letterSpacing === "object" &&
          "value" in node.letterSpacing
          ? `${Math.round(node.letterSpacing.value * 100) / 100}${node.letterSpacing.unit === "PIXELS" ? "px" : "%"}`
          : "0%"
        : "Mixed";

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
      nodeId: node.id,
    });
  }

  // ========================================
  // SPACING EXTRACTION
  // ========================================
  // GAP
  if (
    "layoutMode" in node &&
    node.layoutMode !== "NONE" &&
    "itemSpacing" in node &&
    node.itemSpacing > 0 &&
    "children" in node &&
    node.children.length >= 2
  ) {
    const token = await resolveBoundVariable(
      node,
      "itemSpacing",
      formatSpaceToken,
    );

    // Coleta contexto dos filhos visíveis (ex: "Label + Input + Description")
    const visibleChildren = node.children.filter(c => c.visible !== false);
    let childContext = "";
    if (visibleChildren.length >= 2) {
      // Pega os nomes limpos de TODOS os elementos que formam os gaps
      const names = visibleChildren.map(c => {
        // Limpa o nome: remove prefixos técnicos e pega última parte se tiver "/"
        let cleanName = c.name.replace(/^[#\-_.]/, "").trim();
        // Se tiver caminho (ex: "Icons/Check"), pega só o final
        if (cleanName.includes("/")) {
          cleanName = cleanName.split("/").pop()?.trim() || cleanName;
        }
        // Se for nome de variante (ex: "Size=Small"), simplifica
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
      sourceNodeId: node.id,
    });
  }

  // PADDINGS
  if ("layoutMode" in node && node.layoutMode !== "NONE") {
    const paddingNode = node as SceneNode & IndividualPadding;
    const paddings = [
      {prop: "paddingTop" as const, label: "Padding Top", dir: "V" as const},
      {prop: "paddingBottom" as const, label: "Padding Bottom", dir: "V" as const},
      {prop: "paddingLeft" as const, label: "Padding Left", dir: "H" as const},
      {prop: "paddingRight" as const, label: "Padding Right", dir: "H" as const},
    ];

    for (const pad of paddings) {
      const paddingValue = paddingNode[pad.prop];
      if (paddingValue && paddingValue > 0) {
        const token = await resolveBoundVariable(
          node,
          pad.prop,
          formatSpaceToken,
        );
        data.spacings.push({
          element: spacingElementName,
          property: pad.label,
          token,
          value: `${paddingValue}px`,
          direction: pad.dir,
          properties,
          sourceNodeId: node.id,
        });
      }
    }
  }

  // WIDTH / HEIGHT - coletar de qualquer nó que tenha token aplicado
  if ("width" in node && "height" in node) {
    const heightToken = await resolveBoundVariable(
      node,
      "height",
      formatDimensionToken,
    );
    // Adicionar height se tiver token (em qualquer nível)
    if (heightToken) {
      data.spacings.push({
        element: spacingElementName,
        property: "Height",
        token: heightToken,
        value: `${Math.round(node.height)}px`,
        properties,
        sourceNodeId: node.id,
      });
    }

    // Width: só adicionar no nível principal (isTopLevel) para evitar poluir a tabela
    if (isTopLevel) {
      const widthToken = await resolveBoundVariable(
        node,
        "width",
        formatDimensionToken,
      );
      if (widthToken) {
        data.spacings.push({
          element: spacingElementName,
          property: "Width",
          token: widthToken,
          value: `${Math.round(node.width)}px`,
          properties,
          sourceNodeId: node.id,
        });
      }
    }
  }

  // STROKE WEIGHT - Skip this, it's collected via borders with proper tokens
  // Borders contain the stroke weight with tokens applied via styles
  // Collecting strokeWeight here would create duplicates without proper token resolution

  // BORDER RADIUS
  if ("cornerRadius" in node) {
    const cornerNode = node as SceneNode & IndividualCornerRadii;
    const radii = [
      cornerNode.topLeftRadius,
      cornerNode.topRightRadius,
      cornerNode.bottomLeftRadius,
      cornerNode.bottomRightRadius,
    ].filter((r): r is number => typeof r === "number" && r > 0);
    if (radii.length > 0) {
      let token: string | null = null;
      for (const key of [
        "topLeftRadius",
        "topRightRadius",
        "bottomLeftRadius",
        "bottomRightRadius",
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
        sourceNodeId: node.id,
      });
    }
  }

  // ========================================
  // BORDER EXTRACTION
  // ========================================
  const hasVisibleStrokes =
    "strokes" in node &&
    Array.isArray(node.strokes) &&
    node.strokes.length > 0 &&
    node.strokes.some((stroke: Paint) => stroke.visible !== false);

  if (hasVisibleStrokes && "strokeWeight" in node) {
    let position: "Inside" | "Outside" | "Center" = "Center";
    if ("strokeAlign" in node) {
      const strokeAlignNode = node as SceneNode & { strokeAlign?: "INSIDE" | "OUTSIDE" | "CENTER" };
      const align = strokeAlignNode.strokeAlign;
      if (align === "INSIDE") position = "Inside";
      else if (align === "OUTSIDE") position = "Outside";
      else position = "Center";
    }

    const hasIndividualStrokes =
      "strokeTopWeight" in node ||
      "strokeBottomWeight" in node ||
      "strokeLeftWeight" in node ||
      "strokeRightWeight" in node;

    if (hasIndividualStrokes) {
      const strokeWeightNode = node as SceneNode & IndividualStrokeWeights;
      const sides: {
        prop: keyof IndividualStrokeWeights;
        label: "Top" | "Bottom" | "Left" | "Right";
        varKey: string;
      }[] = [
        {prop: "strokeTopWeight", label: "Top", varKey: "strokeTopWeight"},
        {
          prop: "strokeBottomWeight",
          label: "Bottom",
          varKey: "strokeBottomWeight",
        },
        {prop: "strokeLeftWeight", label: "Left", varKey: "strokeLeftWeight"},
        {
          prop: "strokeRightWeight",
          label: "Right",
          varKey: "strokeRightWeight",
        },
      ];

      for (const side of sides) {
        const weight = strokeWeightNode[side.prop];
        if (typeof weight === "number" && weight > 0) {
          const token = await resolveBoundVariable(
            node,
            side.varKey,
            formatSpaceToken,
          );
          data.borders.push({
            element: spacingElementName,
            token,
            value: `${weight}px`,
            properties,
            sourceNodeId: node.id,
            side: side.label,
            position,
          });
        }
      }
    } else if (typeof node.strokeWeight === "number" && node.strokeWeight > 0) {
      const token = await resolveBoundVariable(
        node,
        "strokeWeight",
        formatSpaceToken,
      );
      data.borders.push({
        element: spacingElementName,
        token,
        value: `${node.strokeWeight}px`,
        properties,
        sourceNodeId: node.id,
        side: "All",
        position,
      });
    }
  }

  // ========================================
  // EFFECTS EXTRACTION
  // ========================================
  if (
    "effects" in node &&
    Array.isArray(node.effects) &&
    node.effects.length > 0
  ) {
    for (let i = 0; i < node.effects.length; i++) {
      const effect = node.effects[i];
      if (!effect.visible) continue;

      let token: string | null = null;

      if (
        "effectStyleId" in node &&
        node.effectStyleId &&
        node.effectStyleId !== ""
      ) {
        try {
          const effectStyle = await figma.getStyleByIdAsync(
            node.effectStyleId as string,
          );
          if (effectStyle && effectStyle.type === "EFFECT") {
            token = formatEffectToken(effectStyle.name);
          }
        } catch {
          // Ignore if style not found
        }
      }

      if (!token) {
        token = await resolveBoundVariableAtIndex(
          node,
          "effects",
          i,
          formatEffectToken,
        );
      }

      data.effects.push({
        element: spacingElementName,
        effectType: effect.type,
        token,
        value: formatEffectValue(effect),
        properties,
        sourceNodeId: node.id,
      });
    }
  }

  // ========================================
  // RECURSION - Process children
  // ========================================
  if ("children" in node) {
    for (const child of node.children) {
      await collectNodeData(child, state, properties, data, false, root);
    }
  }
}

// ========================================
// COMPONENT PROCESSING
// ========================================

/**
 * Processes a component (instance, component, or component set) and extracts
 * all variant data using single-pass traversal.
 *
 * @param component - The component to process
 * @returns Array of VariantColors with all extracted data
 */
export async function processComponent(
  component: ComponentNode | ComponentSetNode | InstanceNode,
): Promise<VariantColors[]> {
  const results: VariantColors[] = [];
  const allColors: ColorSpec[] = [];
  const allUsedComponents = new Map<string, string>();

  // PROCESS INSTANCE - Single Pass Traversal
  if (component.type === "INSTANCE") {
    const data = createEmptyCollectedData();
    await collectNodeData(component, "Default", "Instance", data, true);

    // Always add result for instances
    if (
      data.colors.length > 0 ||
      data.textStyles.length > 0 ||
      data.spacings.length > 0 ||
      data.borders.length > 0 ||
      data.effects.length > 0 ||
      data.usedComponents.size > 0
    ) {
      results.push({
        variantName: "Default",
        properties: "Instance",
        propertyMap: {},
        colors: data.colors,
        textStyles: data.textStyles,
        spacings: data.spacings,
        borders: data.borders,
        effects: data.effects,
        usedComponents: data.usedComponents,
      });
    }

    // If nothing found, create empty result to allow visualizations
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
        usedComponents: new Map<string, string>(),
      });
    }

    return results;
  }

  // PROCESS COMPONENT_SET - Single Pass Traversal for each variant
  if (component.type === "COMPONENT_SET") {
    for (const variant of component.children) {
      if (variant.type !== "COMPONENT") continue;

      const stateName = extractMainState(variant.name);
      const displayProperties = formatPropertiesForDisplay(variant.name);
      const propertyMap = extractAllProperties(variant.name);

      // Single pass - collect all data at once
      const data = createEmptyCollectedData();
      await collectNodeData(variant, stateName, displayProperties, data, true);

      // Accumulate for global tables
      for (const color of data.colors) allColors.push(color);
      for (const [id, name] of data.usedComponents)
        allUsedComponents.set(id, name);

      // Create VariantColors for this variant
      results.push({
        variantName: variant.name,
        properties: displayProperties,
        propertyMap,
        colors: data.colors,
        textStyles: data.textStyles,
        spacings: data.spacings,
        borders: data.borders,
        effects: data.effects,
        usedComponents: data.usedComponents,
      });
    }
  } else {
    // PROCESS SIMPLE COMPONENT - Single Pass Traversal
    const data = createEmptyCollectedData();
    await collectNodeData(component, "Default", "Default", data, true);

    if (
      data.colors.length > 0 ||
      data.textStyles.length > 0 ||
      data.effects.length > 0 ||
      data.usedComponents.size > 0
    ) {
      results.push({
        variantName: "Default",
        properties: "Default",
        propertyMap: {},
        colors: data.colors,
        textStyles: data.textStyles,
        spacings: data.spacings,
        borders: data.borders,
        effects: data.effects,
        usedComponents: data.usedComponents,
      });
    }
  }

  return results;
}
