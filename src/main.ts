import type {
  GenerationOptions,
  VariantColors,
  VariantProperty,
  MarkerConfig,
} from "./types";
import {loadPluginFonts, getFont, setUnavailableFontFamilies} from "./utils/fonts";
import {processComponent} from "./core/traversal";
import {
  createColorSectionCombined,
  createTextSectionCombined,
  createSpacingSectionCombined,
  createEffectsSectionCombined,
  createEstadosSection,
  createPropertiesSection,
  createUsedComponentsSectionAutoLayout,
  createRequirementsSectionCombined,
  extractVariantProperties,
} from "./features"; // Importa do index.ts
import {insertAssetIntoFigma, updateMarker} from "./assets/marker-generator";

// ========================================
// FONT AVAILABILITY CHECK
// ========================================

/**
 * Verifica quais fontes candidatas estão disponíveis no Figma do usuário.
 * Usa listAvailableFontsAsync para não provocar erros no console do Figma.
 * @returns Lista de famílias disponíveis, sempre incluindo Inter e Roboto
 */
async function checkAvailableFonts(): Promise<string[]> {
  const CANDIDATES = ["BancoDoBrasil Textos", "Inter", "Roboto"];
  try {
    const allFonts = await figma.listAvailableFontsAsync();
    const availableFamilies = new Set(allFonts.map((f) => f.fontName.family));
    return CANDIDATES.filter((family) => availableFamilies.has(family));
  } catch {
    // Fallback: Inter e Roboto são sempre disponíveis no Figma
    return ["Inter", "Roboto"];
  }
}

// ========================================
// MAIN INITIALIZATION
// ========================================

async function main(): Promise<void> {
  figma.showUI(__html__, {width: 380, height: 720});

  const selection = figma.currentPage.selection;
  const availableFonts = await checkAvailableFonts();

  const validNodes = selection.filter(
    (node) =>
      node.type === "COMPONENT" ||
      node.type === "COMPONENT_SET" ||
      node.type === "INSTANCE",
  );

  if (validNodes.length === 0) {
    figma.ui.postMessage({
      type: "init",
      componentName: "Nenhum componente selecionado",
      variantProperties: [],
      selectionCount: 0,
      availableFonts,
    });
    return;
  }

  const componentNames: string[] = [];
  const allVariantProperties: Map<string, Set<string>> = new Map();

  for (const node of validNodes) {
    let nodeName = node.name;
    let nodeVariantProperties: VariantProperty[] = [];

    if (node.type === "COMPONENT_SET") {
      nodeVariantProperties = extractVariantProperties(node);
      nodeName = node.name;
    } else if (node.type === "INSTANCE") {
      const mainComponent = await (
        node as InstanceNode
      ).getMainComponentAsync();
      if (mainComponent?.parent?.type === "COMPONENT_SET") {
        nodeVariantProperties = extractVariantProperties(mainComponent.parent);
        nodeName = mainComponent.parent.name;
      } else {
        nodeName = mainComponent?.name || node.name;
      }
    } else if (node.type === "COMPONENT") {
      if (node.parent?.type === "COMPONENT_SET") {
        nodeVariantProperties = extractVariantProperties(
          node.parent as ComponentSetNode,
        );
        nodeName = node.parent.name;
      }
    }

    componentNames.push(nodeName);

    for (const prop of nodeVariantProperties) {
      if (!allVariantProperties.has(prop.name)) {
        allVariantProperties.set(prop.name, new Set());
      }
      for (const value of prop.values) {
        allVariantProperties.get(prop.name)!.add(value);
      }
    }
  }

  const mergedVariantProperties: VariantProperty[] = [];
  for (const [name, values] of allVariantProperties) {
    mergedVariantProperties.push({name, values: Array.from(values)});
  }

  const displayName =
    validNodes.length === 1
      ? componentNames[0]
      : `${validNodes.length} componentes selecionados`;

  // Determine node type for single selection
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
    nodeType: nodeType,
    availableFonts,
  });
}

// ========================================
// MARKER SELECTION HELPER
// ========================================

/**
 * Gets the marker config from selected node if it exists.
 * Checks both the selected node and its parent (in case user clicked on a child element).
 * @returns MarkerConfig or null
 */
function getSelectedMarkerConfig(): {
  node: SceneNode;
  config: MarkerConfig;
} | null {
  const selection = figma.currentPage.selection;
  if (selection.length !== 1) return null;

  const node = selection[0];

  // First, try to get pluginData from the node itself
  let pluginData = node.getPluginData("markerConfig");
  let markerNode = node;

  // If not found, try the parent (user might have clicked on dot/line/text inside the marker frame)
  if (!pluginData && node.parent && node.parent.type !== "PAGE") {
    pluginData = node.parent.getPluginData("markerConfig");
    if (pluginData) {
      markerNode = node.parent as SceneNode;
    }
  }

  if (!pluginData) return null;

  try {
    const config = JSON.parse(pluginData) as MarkerConfig;
    return {node: markerNode, config};
  } catch (e) {
    return null;
  }
}

/**
 * Handles selection changes and notifies UI if a marker is selected.
 */
function handleSelectionChange(): void {
  const markerData = getSelectedMarkerConfig();

  if (markerData) {
    // Marker selected - notify UI
    figma.ui.postMessage({
      type: "marker-selected",
      config: markerData.config,
    });
  } else {
    // No marker selected - notify UI to reset
    figma.ui.postMessage({
      type: "marker-deselected",
    });
  }

  // Send component/selection info to update header
  const selection = figma.currentPage.selection;

  if (selection.length === 1) {
    const node = selection[0];
    let componentName = node.name;
    let componentType = '-';
    let nodeType = node.type;

    if (node.type === 'COMPONENT_SET') {
      componentType = 'Component Set';
    } else if (node.type === 'COMPONENT') {
      componentType = 'Component';
    } else if (node.type === 'INSTANCE') {
      componentType = 'Instance';
    }

    figma.ui.postMessage({
      type: 'selection-info',
      text: componentName,
      componentType: componentType,
      nodeType: nodeType,
    });
  } else if (selection.length === 0) {
    figma.ui.postMessage({
      type: 'selection-info',
      text: 'Selecione um componente',
      componentType: '-',
    });
  } else {
    figma.ui.postMessage({
      type: 'selection-info',
      text: `${selection.length} itens selecionados`,
      componentType: '-',
    });
  }
}

// ========================================
// SPEC FRAME RENAMING
// ========================================

const SPEC_FRAME_NAMES_TO_RENAME = new Set([
  // Tabelas
  "Tabela Cores",
  "Tabela Tipografia",
  "Tabela Espaçamentos",
  "Tabela Efeitos",
  // Grids de visualização
  "Grid Variantes - Texto",
  "Comportamento de Texto",
  "Grid Variantes - Espaçamentos",
  "Grid Variantes - Dimensões",
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
  "Seção Propriedades",
]);

function renameSpecFrames(specFrame: FrameNode, baseName: string): void {
  let counter = 1;

  function walk(node: BaseNode): void {
    if (node.type === "FRAME" || node.type === "GROUP") {
      if (SPEC_FRAME_NAMES_TO_RENAME.has(node.name) || node.name.startsWith("Requirements - ")) {
        const num = String(counter++).padStart(2, "0");
        node.name = `${baseName}-spec-${num}`;
        return; // não desce nos filhos do frame renomeado
      }

      if ("children" in node) {
        for (const child of node.children) {
          walk(child);
        }
      }
    } else if ("children" in node) {
      for (const child of (node as ChildrenMixin).children) {
        walk(child);
      }
    }
  }

  for (const child of specFrame.children) {
    walk(child);
  }
}

// ========================================
// SECTION DIVIDER
// ========================================

async function addSectionDivider(
  parent: FrameNode,
  width: number,
): Promise<void> {
  const divider = figma.createFrame();
  divider.name = "Divider";
  divider.resize(width, 1);
  divider.fills = [{type: "SOLID", color: {r: 0.85, g: 0.85, b: 0.85}}];
  parent.appendChild(divider);
}

// ========================================
// COMPONENT FONT LOADING
// ========================================

/**
 * Scans the component tree for all unique fonts used in TextNodes, loads the
 * ones that are available, and registers unavailable families via
 * setUnavailableFontFamilies so that substituteUnavailableFontsInNode can
 * replace them inside visualization instances before appendChild.
 *
 * Uses figma.listAvailableFontsAsync for availability checks to avoid console
 * errors that figma.loadFontAsync produces for missing fonts.
 *
 * @param nodes The component nodes to scan
 */
async function loadComponentFonts(
  nodes: (ComponentNode | ComponentSetNode | InstanceNode)[],
): Promise<void> {
  const seen = new Set<string>(); // "family::style"

  function collect(node: BaseNode): void {
    if (node.type === "TEXT") {
      const textNode = node as TextNode;
      const len = textNode.characters.length;
      if (!len) return;
      const fn = textNode.fontName;
      if (fn !== figma.mixed) {
        seen.add(`${fn.family}::${fn.style}`);
      } else {
        // Mixed fonts: scan character by character to collect all families
        for (let i = 0; i < len; i++) {
          const f = textNode.getRangeFontName(i, i + 1);
          if (f !== figma.mixed) {
            seen.add(`${f.family}::${f.style}`);
          }
        }
      }
    }
    if ("children" in node) {
      for (const child of (node as ChildrenMixin).children) {
        collect(child);
      }
    }
  }

  for (const node of nodes) {
    collect(node);
  }

  // listAvailableFontsAsync lets us check availability without calling
  // loadFontAsync for missing fonts (which logs errors to the Figma console)
  let availableFamilies: Set<string>;
  try {
    const allFonts = await figma.listAvailableFontsAsync();
    availableFamilies = new Set(allFonts.map((f) => f.fontName.family));
  } catch {
    availableFamilies = new Set(["Inter", "Roboto"]);
  }

  const unavailable = new Set<string>();

  await Promise.all(
    Array.from(seen).map(async (key) => {
      const [family, style] = key.split("::");
      if (!availableFamilies.has(family)) {
        // Font not installed — skip loadFontAsync to avoid console errors
        unavailable.add(family);
        return;
      }
      try {
        await figma.loadFontAsync({family, style});
      } catch {
        unavailable.add(family);
      }
    }),
  );

  // Store unavailable families so visualization code can substitute them
  setUnavailableFontFamilies(unavailable);
}

// ========================================
// SPEC GENERATION
// ========================================

async function generateSpec(options: GenerationOptions): Promise<void> {
  figma.ui.hide();

  const loadingNotification = figma.notify("🔄 Gerando especificação...", {
    timeout: 50000,
  });

  await loadPluginFonts(options.fontFamily);

  const selection = figma.currentPage.selection;

  const validNodes: (ComponentNode | ComponentSetNode | InstanceNode)[] = [];
  const componentNames: string[] = [];

  for (const node of selection) {
    if (node.type === "INSTANCE") {
      const mainComp = await node.getMainComponentAsync();
      componentNames.push(mainComp?.name || node.name);
      validNodes.push(node);
    } else if (node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
      componentNames.push(node.name);
      validNodes.push(node);
    }
  }

  if (validNodes.length === 0) {
    loadingNotification.cancel();
    figma.notify(
      "❌ Selecione um Component, Component Set ou Instance para gerar especificações",
    );
    figma.ui.show();
    return;
  }

  // Load all fonts used within the component (e.g. BancoDoBrasil Textos) so
  // that visualization sections can safely clone/manipulate those text nodes.
  await loadComponentFonts(validNodes);

  const allVariantColors: VariantColors[] = [];
  for (const nodeToProcess of validNodes) {
    const variantColors = await processComponent(nodeToProcess);
    allVariantColors.push(...variantColors);
  }

  if (allVariantColors.length === 0) {
    figma.notify("⚠️ Nenhum dado encontrado nos componentes selecionados");
    figma.closePlugin();
    return;
  }

  const specTitle =
    componentNames.length === 1
      ? componentNames[0]
      : `${componentNames.length} Componentes`;

  const firstNode = validNodes[0];

  const frameWidth = options.frameWidth || 1140;
  const paddingH = options.paddingHorizontal || 100;
  const sectionGap = options.sectionSpacingValue || 40;
  const tableWidth = frameWidth - paddingH * 2;

  const specFrameBaseName = specTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
  specFrame.fills = [{type: "SOLID", color: {r: bgR, g: bgG, b: bgB}}];

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
  titleText.characters = `${specTitle} — Especificações`;
  titleText.textAutoResize = "HEIGHT";
  titleText.resize(tableWidth, titleText.height);
  specFrame.appendChild(titleText);

  if (componentNames.length > 1) {
    const subtitleText = figma.createText();
    subtitleText.fontName = getFont("Regular");
    subtitleText.fontSize = 14;
    subtitleText.characters = componentNames.join(", ");
    subtitleText.fills = [{type: "SOLID", color: {r: 0.4, g: 0.4, b: 0.4}}];
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
        options.colorVizProperties,
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
        compTitle.fills = [{type: "SOLID", color: {r: 0.2, g: 0.2, b: 0.2}}];
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
        options.textShowTable ?? true,
        options.textShowViz ?? true,
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
        (v) => v.spacings.length > 0 || v.borders.length > 0,
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
        compTitle.fills = [{type: "SOLID", color: {r: 0.2, g: 0.2, b: 0.2}}];
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
        options.spacingShowTable ?? true,
        options.spacingShowViz ?? true,
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
        compTitle.fills = [{type: "SOLID", color: {r: 0.2, g: 0.2, b: 0.2}}];
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
        options.effectsShowTable ?? true,
        options.effectsShowViz ?? true,
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
        compTitle.fills = [{type: "SOLID", color: {r: 0.2, g: 0.2, b: 0.2}}];
        specFrame.appendChild(compTitle);
      }
      const created = await createRequirementsSectionCombined(
        specFrame,
        nodeToProcess,
        tableWidth,
        options.highlightMode,
        options.requirementsVizProperties,
        options.requirementsFramesPerRow || 2,
        options.requirementsIncludeInstances ?? false,
      );
      if (created) sectionCreated = true;
    }
    if (sectionCreated) lastSectionCreated = true;
  }

  if (options.sectionComponents) {
    const componentMap = new Map<string, string>();
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
        options.highlightMode,
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
          compTitle.fills = [{type: "SOLID", color: {r: 0.2, g: 0.2, b: 0.2}}];
          specFrame.appendChild(compTitle);
        }
        let componentSet: ComponentSetNode | null = null;
        if (nodeToProcess.type === "COMPONENT_SET") {
          componentSet = nodeToProcess;
        } else if (
          nodeToProcess.type === "COMPONENT" &&
          nodeToProcess.parent?.type === "COMPONENT_SET"
        ) {
          componentSet = nodeToProcess.parent as ComponentSetNode;
        } else if (nodeToProcess.type === "INSTANCE") {
          const mainComp = await nodeToProcess.getMainComponentAsync();
          if (mainComp?.parent?.type === "COMPONENT_SET") {
            componentSet = mainComp.parent as ComponentSetNode;
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
            options.statesVariantPropertyOrder,
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
      let componentSet: ComponentSetNode | null = null;
      if (node.type === "COMPONENT_SET") {
        componentSet = node;
      } else if (
        node.type === "COMPONENT" &&
        node.parent?.type === "COMPONENT_SET"
      ) {
        componentSet = node.parent as ComponentSetNode;
      } else if (node.type === "INSTANCE") {
        const mainComp = await node.getMainComponentAsync();
        if (mainComp?.parent?.type === "COMPONENT_SET") {
          componentSet = mainComp.parent as ComponentSetNode;
        }
      }
      if (
        componentSet?.componentPropertyDefinitions &&
        Object.keys(componentSet.componentPropertyDefinitions).length > 0
      ) {
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
          compTitle.fills = [{type: "SOLID", color: {r: 0.2, g: 0.2, b: 0.2}}];
          specFrame.appendChild(compTitle);
        }
        let componentSet: ComponentSetNode | null = null;
        if (nodeToProcess.type === "COMPONENT_SET") {
          componentSet = nodeToProcess;
        } else if (
          nodeToProcess.type === "COMPONENT" &&
          nodeToProcess.parent?.type === "COMPONENT_SET"
        ) {
          componentSet = nodeToProcess.parent as ComponentSetNode;
        } else if (nodeToProcess.type === "INSTANCE") {
          const mainComp = await nodeToProcess.getMainComponentAsync();
          if (mainComp?.parent?.type === "COMPONENT_SET") {
            componentSet = mainComp.parent as ComponentSetNode;
          }
        }
        if (componentSet) {
          const created = await createPropertiesSection(
            specFrame,
            componentSet,
            tableWidth,
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
  const successMsg =
    validNodes.length === 1
      ? "✅ Especificação gerada com sucesso!"
      : `✅ Especificação gerada para ${validNodes.length} componentes!`;
  figma.notify(successMsg);
  figma.closePlugin();
}

figma.ui.onmessage = async (msg: {
  type: string;
  options?: GenerationOptions;
  assetType?: string;
  value?: string;
  color?: string;
  textColorType?: string;
  direction?: string;
  badgePosition?: string;
  highlightMode?: boolean;
  size?: number;
  width?: number;
  height?: number;
  markerConfig?: MarkerConfig;
}) => {
  if (msg.type === "generate" && msg.options) {
    await generateSpec(msg.options);
  } else if (msg.type === "insert-asset" && msg.assetType) {
    await insertAssetIntoFigma(
      msg.assetType,
      msg.value || "0px",
      msg.color || "red",
      (msg.direction as "horizontal" | "vertical") || "horizontal",
      (msg.badgePosition as "top" | "bottom" | "left" | "right") || "bottom",
      msg.highlightMode || false,
      msg.size || 100,
      msg.textColorType,
    );
  } else if (msg.type === "update-marker" && msg.markerConfig) {
    // Update selected marker
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

// Register selection change listener
figma.on("selectionchange", handleSelectionChange);

main();