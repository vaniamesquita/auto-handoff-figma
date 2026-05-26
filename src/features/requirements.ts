// ========================================================================
// AUTO HANDOFF GENERATOR - REQUIREMENTS SECTION
// ========================================================================

import {createSectionContainer, filterVariantsForVisualization} from "./common";
import {createSimpleAnnotation, findFreeYPosition} from "../ui/annotations";
import {getFont} from "../utils/fonts";
import {VariantColors} from "../types";
import {isStructuralName} from "../core/node-helpers";

// ========================================
// HELPERS
// ========================================

async function getComponentSet(
  node: ComponentNode | ComponentSetNode | InstanceNode,
): Promise<ComponentSetNode | null> {
  if (node.type === "COMPONENT_SET") return node;
  if (node.type === "COMPONENT" && node.parent?.type === "COMPONENT_SET") {
    return node.parent as ComponentSetNode;
  }
  if (node.type === "INSTANCE") {
    const mainComp = await node.getMainComponentAsync();
    if (mainComp?.parent?.type === "COMPONENT_SET") {
      return mainComp.parent as ComponentSetNode;
    }
  }
  return null;
}

interface BooleanLayerInfo {
  propertyName: string;
  nodePath: number[];
  isOptional: boolean;
}

function getBooleanPropertyKeys(
  componentSet: ComponentSetNode,
): Map<string, string> {
  const defs = componentSet.componentPropertyDefinitions;
  if (!defs) return new Map();

  const map = new Map<string, string>();
  for (const key of Object.keys(defs)) {
    if (defs[key].type === "BOOLEAN") {
      const cleanName = key.replace(/#.*$/, "").trim();
      map.set(key, cleanName);
    }
  }
  return map;
}

function findBooleanBoundLayers(
  node: SceneNode,
  booleanKeys: Map<string, string>,
  currentPath: number[],
): BooleanLayerInfo[] {
  const results: BooleanLayerInfo[] = [];

  if (!("children" in node)) return results;

  const parent = node as FrameNode | ComponentNode;
  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i];
    const childPath = [...currentPath, i];

    const refs = (child as SceneNode & {componentPropertyReferences?: Record<string, string> | null}).componentPropertyReferences;
    if (refs && refs.visible) {
      const refKey = refs.visible;
      if (booleanKeys.has(refKey)) {
        results.push({
          propertyName: booleanKeys.get(refKey)!,
          nodePath: childPath,
          isOptional: true,
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

function resolveNodeByPath(
  root: SceneNode,
  path: number[],
): SceneNode | null {
  let current: SceneNode = root;
  for (const idx of path) {
    if (!("children" in current)) return null;
    const parent = current as FrameNode | InstanceNode;
    if (idx >= parent.children.length) return null;
    current = parent.children[idx];
  }
  return current;
}

/** Signature of boolean layers for a variant (sorted property names) */
function getBooleanSignature(layers: BooleanLayerInfo[]): string {
  return layers.map(l => l.propertyName).sort().join("|");
}

function getVariantLabel(variant: ComponentNode): string {
  const parts = variant.name.split(",").map(p => p.trim());
  return parts.join(" / ");
}

// ========================================
// VISUALIZATION FOR A SINGLE VARIANT
// ========================================

async function createVariantRequirementsViz(
  parent: FrameNode,
  variant: ComponentNode,
  booleanKeys: Map<string, string>,
  tableWidth: number,
  highlightMode: boolean,
  showLabel: boolean,
): Promise<boolean> {
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
    label.fills = [{type: "SOLID", color: {r: 0.3, g: 0.3, b: 0.3}}];
    vizWrapper.appendChild(label);
  }

  const vizFrame = figma.createFrame();
  vizFrame.name = "Requirements Visualization";
  vizFrame.resize(tableWidth, vizHeight);
  const bgColor = highlightMode
    ? {r: 56 / 255, g: 83 / 255, b: 255 / 255}
    : {r: 0xFE / 255, g: 0xFE / 255, b: 0xFE / 255};
  vizFrame.fills = [{type: "SOLID", color: bgColor}];
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

  const leftPositions: number[] = [];
  const rightPositions: number[] = [];
  const LINE_LENGTH = 60;

  const pointerColor = highlightMode
    ? {r: 98 / 255, g: 248 / 255, b: 79 / 255}
    : {r: 0xE5 / 255, g: 0x33 / 255, b: 0x33 / 255};
  const pointerColorType = highlightMode ? "#62F84F" : "#E53333";
  const textColor = highlightMode
    ? {r: 98 / 255, g: 248 / 255, b: 79 / 255}
    : {r: 0, g: 0, b: 0};

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

    let startX: number, startY: number, endX: number, endY: number;
    let markerType: "pointer-left" | "pointer-right";

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
      vizFrame, startX, startY, endX, endY,
      annotLabel, pointerColor, markerType, pointerColorType as "red",
      highlightMode, textColor,
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

// ========================================
// STRUCTURAL INSTANCES HELPER (reutilizável)
// ========================================

/**
 * Coleta instâncias estruturais únicas (prefixo ".", "-", "_", ".asset")
 * presentes nas variantes de um ComponentSet.
 * Retorna pares { instance, mainComponent } para processamento posterior.
 */
export async function collectStructuralInstancesFromSet(
  componentSet: ComponentSetNode,
): Promise<Array<{name: string; mainComp: ComponentNode}>> {
  const results: Array<{name: string; mainComp: ComponentNode}> = [];
  const seen = new Set<string>();

  async function scanForStructural(node: SceneNode) {
    if (node.type === "INSTANCE") {
      const inst = node as InstanceNode;
      const mainComp = await inst.getMainComponentAsync();
      if (mainComp) {
        // Verifica o nome do componentSet pai ou do próprio component
        const compSetName = mainComp.parent?.type === "COMPONENT_SET"
          ? mainComp.parent.name
          : mainComp.name;
        if (isStructuralName(compSetName)) {
          const key = `${mainComp.parent?.type === "COMPONENT_SET" ? mainComp.parent.id : mainComp.id}::${inst.name}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({name: inst.name, mainComp});
          }
          return; // não entra dentro de instâncias estruturais
        }
      }
      // Instância não-estrutural: entra para encontrar estruturais aninhadas
      if ("children" in inst) {
        for (const child of inst.children) {
          await scanForStructural(child);
        }
      }
      return;
    }
    if ("children" in node) {
      for (const child of (node as FrameNode).children) {
        await scanForStructural(child);
      }
    }
  }

  for (const variant of componentSet.children) {
    if (variant.type !== "COMPONENT") continue;
    for (const child of variant.children) {
      await scanForStructural(child);
    }
  }

  return results;
}

function applyVariantFilters<T extends {variant: ComponentNode}>(
  data: T[],
  filters: Record<string, string[]>,
): T[] {
  if (!filters || Object.keys(filters).length === 0) return data;
  const hasAnySelection = Object.values(filters).some(v => v.length > 0);
  if (!hasAnySelection) return data;

  return data.filter(vd => {
    const parts = vd.variant.name.split(",").map(p => p.trim());
    const propMap: Record<string, string> = {};
    for (const part of parts) {
      const [key, value] = part.split("=").map(s => s.trim());
      if (key && value) propMap[key.toLowerCase()] = value;
    }
    for (const [propName, selectedValues] of Object.entries(filters)) {
      if (selectedValues.length === 0) continue;
      const variantValue = propMap[propName.toLowerCase()];
      if (!variantValue) continue;
      if (!selectedValues.some(v => v.toLowerCase() === variantValue.toLowerCase())) return false;
    }
    return true;
  });
}

// ========================================
// MAIN SECTION
// ========================================

export async function createRequirementsSectionCombined(
  parent: FrameNode,
  nodeToProcess: ComponentNode | ComponentSetNode | InstanceNode,
  tableWidth: number,
  highlightMode: boolean,
  vizPropertyFilters: Record<string, string[]> = {},
  framesPerRow: number = 2,
  includeInstances: boolean = false,
): Promise<boolean> {
  const componentSet = await getComponentSet(nodeToProcess);
  if (!componentSet) return false;

  const booleanKeys = getBooleanPropertyKeys(componentSet);
  if (booleanKeys.size === 0) return false;

  // Collect boolean layers for ALL variants
  const variantData: Array<{
    variant: ComponentNode;
    layers: BooleanLayerInfo[];
    signature: string;
  }> = [];

  for (const child of componentSet.children) {
    if (child.type !== "COMPONENT") continue;
    const layers = findBooleanBoundLayers(child, booleanKeys, []);
    if (layers.length === 0) continue;
    variantData.push({
      variant: child,
      layers,
      signature: getBooleanSignature(layers),
    });
  }

  if (variantData.length === 0) return false;

  // Apply variant filters if provided
  let filteredData = applyVariantFilters(variantData, vizPropertyFilters);

  if (filteredData.length === 0) return false;

  // Group by signature — variants with same boolean layers show only one representative
  const signatureGroups = new Map<string, typeof filteredData>();
  for (const vd of filteredData) {
    if (!signatureGroups.has(vd.signature)) {
      signatureGroups.set(vd.signature, []);
    }
    signatureGroups.get(vd.signature)!.push(vd);
  }

  // Determine which variants to render
  const variantsToRender: Array<{variant: ComponentNode; showLabel: boolean}> = [];

  if (signatureGroups.size === 1) {
    // All variants have the same boolean layers — show just one (first)
    const group = Array.from(signatureGroups.values())[0];
    variantsToRender.push({variant: group[0].variant, showLabel: false});
  } else {
    // Different variants have different boolean layers — show one per group
    for (const [, group] of signatureGroups) {
      variantsToRender.push({variant: group[0].variant, showLabel: true});
    }
  }

  // Section container
  const section = createSectionContainer("Requisitos das Propriedades");

  const titleText = figma.createText();
  titleText.fontName = getFont("Bold");
  titleText.fontSize = 40;
  titleText.characters = "Requisitos das propriedades";
  titleText.fills = [{type: "SOLID", color: {r: 0, g: 0, b: 0}}];
  section.appendChild(titleText);

  // Render visualizations
  if (variantsToRender.length === 1) {
    // Single visualization
    const {variant, showLabel} = variantsToRender[0];
    const created = await createVariantRequirementsViz(
      section, variant, booleanKeys, tableWidth, highlightMode, showLabel,
    );
    if (!created) {
      section.remove();
      return false;
    }
  } else {
    // Grid layout for multiple variants
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
    for (const {variant, showLabel} of variantsToRender) {
      const created = await createVariantRequirementsViz(
        gridContainer, variant, booleanKeys, cellWidth, highlightMode, showLabel,
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

  // === Instâncias estruturais (.asset, etc.) ===
  // Estratégia: para cada variante do PAI que passou no filtro, encontrar as instâncias
  // estruturais dentro dela e analisá-las diretamente. Assim o filtro do pai
  // determina quais instâncias do .asset são analisadas.
  if (includeInstances) {
    // Coleta: instâncias estruturais encontradas nas variantes filtradas do pai
    // Agrupa por nome da instância estrutural → Map<instName, Set<mainCompId → ComponentNode>>
    const structuralByName = new Map<string, {mainComp: ComponentNode; seen: Set<string>}>();

    async function findStructuralInVariant(node: SceneNode) {
      if (node.type === "INSTANCE") {
        const inst = node as InstanceNode;
        const mainComp = await inst.getMainComponentAsync();
        if (mainComp) {
          const compSetName = mainComp.parent?.type === "COMPONENT_SET"
            ? mainComp.parent.name
            : mainComp.name;
          if (isStructuralName(compSetName)) {
            if (!structuralByName.has(inst.name)) {
              structuralByName.set(inst.name, {mainComp, seen: new Set()});
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
        for (const child of (node as FrameNode).children) await findStructuralInVariant(child);
      }
    }

    // Só percorre as variantes que passaram no filtro do pai
    for (const {variant} of filteredData) {
      for (const child of variant.children) {
        await findStructuralInVariant(child);
      }
    }

    for (const [instName, {mainComp}] of structuralByName) {
      const instCompSet = mainComp.parent?.type === "COMPONENT_SET"
        ? mainComp.parent as ComponentSetNode
        : null;

      const targetSet = instCompSet ?? (mainComp as unknown as ComponentSetNode);
      const instBooleanKeys = getBooleanPropertyKeys(targetSet);
      if (instBooleanKeys.size === 0) continue;

      const instVariantData: Array<{
        variant: ComponentNode;
        layers: BooleanLayerInfo[];
        signature: string;
      }> = [];

      const children = instCompSet ? instCompSet.children : [mainComp];
      for (const child of children) {
        if (child.type !== "COMPONENT") continue;
        const layers = findBooleanBoundLayers(child, instBooleanKeys, []);
        if (layers.length === 0) continue;
        instVariantData.push({variant: child, layers, signature: getBooleanSignature(layers)});
      }

      if (instVariantData.length === 0) continue;

      const instTitle = figma.createText();
      instTitle.fontName = getFont("Medium");
      instTitle.fontSize = 20;
      instTitle.characters = `◇ ${instName}`;
      instTitle.fills = [{type: "SOLID", color: {r: 0.2, g: 0.2, b: 0.2}}];
      section.appendChild(instTitle);

      const instSignatureGroups = new Map<string, typeof instVariantData>();
      for (const vd of instVariantData) {
        if (!instSignatureGroups.has(vd.signature)) instSignatureGroups.set(vd.signature, []);
        instSignatureGroups.get(vd.signature)!.push(vd);
      }

      const instVariantsToRender: Array<{variant: ComponentNode; showLabel: boolean}> = [];
      if (instSignatureGroups.size === 1) {
        instVariantsToRender.push({variant: Array.from(instSignatureGroups.values())[0][0].variant, showLabel: false});
      } else {
        for (const [, group] of instSignatureGroups) {
          instVariantsToRender.push({variant: group[0].variant, showLabel: true});
        }
      }

      if (instVariantsToRender.length === 1) {
        await createVariantRequirementsViz(
          section, instVariantsToRender[0].variant, instBooleanKeys, tableWidth, highlightMode, false,
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
        for (const {variant, showLabel} of instVariantsToRender) {
          await createVariantRequirementsViz(instGrid, variant, instBooleanKeys, cellWidth, highlightMode, showLabel);
        }
        section.appendChild(instGrid);
      }
    }
  }

  parent.appendChild(section);
  return true;
}
