import { VariantColors, AnnotationTracker } from "../types";
import { getFont } from "../utils/fonts";
import { formatSpaceToken } from "../utils/helpers";
import { createTableBuilder, createSectionTitle } from "../ui/table-builder";
import { annotateGapNew, annotatePaddingNew, annotateRadiusNew, annotateBorderNew, annotateDimensionNewSmart, createAnnotationTracker } from "../ui/annotations";
import { createSectionContainer, filterVariantsForVisualization, createGenericVariantGrid, formatVariantPropertiesForTable } from "./common";
import { isStructuralInstance, shouldCollectIcon } from "../core/node-helpers";
import {
  StrokeInfo,
  findBoundVariableToken,
  findHeightToken,
  findCornerRadius,
  findCornerRadiusToken,
  findCornerRadiusRecursive,
  findCornerRadiusTokenRecursive,
  findAllHeightTokensWithNodes,
  findStrokeWeight,
  resolveStrokeToken,
} from "../core/token-resolution";

export async function createSpacingSectionCombined(
  parent: FrameNode,
  variantColors: VariantColors[],
  nodeToProcess: ComponentNode | ComponentSetNode | InstanceNode,
  tableWidth: number,
  highlightMode: boolean,
  vizPropertyFilters: Record<string, string[]>,
  framesPerRow: number = 2,
  showTable: boolean = true,
  showViz: boolean = true,
): Promise<boolean> {
  const hasSpacings = variantColors.some(
    (v) => v.spacings.length > 0 || v.borders.length > 0,
  );
  if (!hasSpacings) return false;

  if (!showTable && !showViz) return false;

  const section = createSectionContainer("Seção Medidas e Espaçamentos");
  createSectionTitle("Medidas e espaçamentos", section);

  if (showTable) {
    const filteredForTable = filterVariantsForVisualization(variantColors, vizPropertyFilters);
    await createSpacingTableInSection(section, filteredForTable, tableWidth, undefined);
  }

  if (showViz) {
    await createPaddingGapVisualizationInSection(
      section,
      nodeToProcess,
      variantColors,
      tableWidth,
      highlightMode,
      vizPropertyFilters,
      framesPerRow,
    );

    await createDimensionVisualizationInSection(
      section,
      nodeToProcess,
      variantColors,
      tableWidth,
      highlightMode,
      vizPropertyFilters,
      framesPerRow,
    );
  }

  parent.appendChild(section);
  return true;
}

async function createSpacingTableInSection(
  parent: FrameNode,
  variantColors: VariantColors[],
  tableWidth: number,
  variantPropertyOrder?: string[],
): Promise<void> {
  const hasSpacing = variantColors.some(
    (v) => v.spacings.length > 0 || v.borders.length > 0,
  );
  if (!hasSpacing) return;

  const GROUP_SPACING = 20;
  const ROW_GAP = 4;

  const table = createTableBuilder("Tabela Espaçamentos", tableWidth, [
    {header: "Medida", position: 0},
    {header: "Token / Valor", position: 0.4, color: "error"},
    {header: "Referência", position: 0.75},
  ]);

  const spacingsByProperty: Map<
    string,
    {token: string | null; value: string; variants: string[]}[]
  > = new Map();

  for (const variant of variantColors) {
    const variantLabel = formatVariantPropertiesForTable(variant.propertyMap, variantPropertyOrder);

    for (const spacing of variant.spacings) {
      let propName = spacing.property;

      if (spacing.property === "Gap") {
        // 1. Resolve Direção
        const dirLabel = spacing.direction === "H" ? "Horiz" : "Vert";

        // 2. Resolve Elemento Pai (evita redundância se for Container genérico)
        const parentLabel = spacing.element && spacing.element !== "Container"
          ? ` (${spacing.element})`
          : "";

        // 3. Resolve Contexto dos Filhos (armazenado em spacing.properties)
        // Evita mostrar se for igual ao elemento pai ou muito genérico
        const hasContext = spacing.properties &&
          spacing.properties !== spacing.element &&
          spacing.properties !== "Container" &&
          !spacing.properties.includes("=");
        const contextLabel = hasContext ? ` / ${spacing.properties}` : "";

        // Monta string final: "Gap (Horiz) (Label) / Texto + Descrição"
        propName = `Gap (${dirLabel})${parentLabel}${contextLabel}`;
      }
      // Fazer o mesmo para Padding se tiver elemento específico
      else if (spacing.property.includes("Padding") && spacing.element && spacing.element !== "Container") {
        propName = `${spacing.property} (${spacing.element})`;
      }
      // Include element name for Border Radius and Height when not "Container"
      else if ((spacing.property === "Border Radius" || spacing.property === "Height") && spacing.element && spacing.element !== "Container") {
        propName = `${spacing.property} / ${spacing.element}`;
      }

      if (!spacingsByProperty.has(propName)) {
        spacingsByProperty.set(propName, []);
      }
      const entries = spacingsByProperty.get(propName)!;
      const existing = entries.find(
        (e) => (e.token || e.value) === (spacing.token || spacing.value),
      );
      if (existing) {
        if (!existing.variants.includes(variantLabel)) {
          existing.variants.push(variantLabel);
        }
      } else {
        entries.push({
          token: spacing.token,
          value: spacing.value,
          variants: [variantLabel],
        });
      }
    }

    // Group borders by position and check if all sides are equal
    const bordersByPosition: Map<string, typeof variant.borders> = new Map();
    for (const border of variant.borders) {
      const position = border.position || "Center";
      if (!bordersByPosition.has(position)) {
        bordersByPosition.set(position, []);
      }
      bordersByPosition.get(position)!.push(border);
    }

    // Process each position group
    for (const [position, bordersInPosition] of bordersByPosition) {
      const sides = bordersInPosition.filter(b => b.side && b.side !== "All");
      const allSide = bordersInPosition.find(b => b.side === "All");

      if (allSide || (sides.length === 4 && sides.every(b => b.value === sides[0].value && (b.token || null) === (sides[0].token || null)))) {
        // All sides have same value - add both Stroke Position and Border (with token)
        const firstBorder = allSide || sides[0];

        // 1. Add Stroke Position entry
        const positionProp = "Stroke Position";
        if (!spacingsByProperty.has(positionProp)) {
          spacingsByProperty.set(positionProp, []);
        }
        const positionEntries = spacingsByProperty.get(positionProp)!;
        const existingPosition = positionEntries.find(
          (e) => e.value === position,
        );
        if (existingPosition) {
          if (!existingPosition.variants.includes(variantLabel)) {
            existingPosition.variants.push(variantLabel);
          }
        } else {
          positionEntries.push({
            token: null,
            value: position,
            variants: [variantLabel],
          });
        }

        // 2. Add Border (stroke weight with token from borders)
        const borderProp = "Border";
        if (!spacingsByProperty.has(borderProp)) {
          spacingsByProperty.set(borderProp, []);
        }
        const borderEntries = spacingsByProperty.get(borderProp)!;
        const existingBorder = borderEntries.find(
          (e) => (e.token || e.value) === (firstBorder.token || firstBorder.value),
        );
        if (existingBorder) {
          if (!existingBorder.variants.includes(variantLabel)) {
            existingBorder.variants.push(variantLabel);
          }
        } else {
          borderEntries.push({
            token: firstBorder.token,
            value: firstBorder.value,
            variants: [variantLabel],
          });
        }
      } else {
        // Different values on different sides - add each side separately
        for (const border of bordersInPosition) {
          const sideName =
            border.side && border.side !== "All" ? ` ${border.side}` : "";
          const positionName = border.position ? ` (${border.position})` : "";
          const propName = `Border${sideName}${positionName}`;

          if (!spacingsByProperty.has(propName)) {
            spacingsByProperty.set(propName, []);
          }
          const entries = spacingsByProperty.get(propName)!;
          const existing = entries.find(
            (e) => (e.token || e.value) === (border.token || border.value),
          );
          if (existing) {
            if (!existing.variants.includes(variantLabel)) {
              existing.variants.push(variantLabel);
            }
          } else {
            entries.push({
              token: border.token,
              value: border.value,
              variants: [variantLabel],
            });
          }
        }
      }
    }
  }

  interface DisplayEntry {
    prefix: string;
    displayText: string;
    token: string | null;
    value: string;
  }
  const allDisplayEntries: DisplayEntry[] = [];

  const allVariantLabels = new Set<string>();
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
          value: entry.value,
        });
      } else {
        const entryGroups = new Set<string>();
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
            value: entry.value,
          });
        }
      }
    }
  }

  const entriesByPrefix: Map<string, DisplayEntry[]> = new Map();
  for (const entry of allDisplayEntries) {
    if (!entriesByPrefix.has(entry.prefix)) {
      entriesByPrefix.set(entry.prefix, []);
    }
    entriesByPrefix.get(entry.prefix)!.push(entry);
  }

  const sortedPrefixes = Array.from(entriesByPrefix.keys()).sort((a, b) => {
    if (a === "Todos") return -1;
    if (b === "Todos") return 1;
    return a.localeCompare(b);
  });

  let isFirstGroup = true;
  for (const prefix of sortedPrefixes) {
    const groupEntries = entriesByPrefix.get(prefix)!;
    if (groupEntries.length === 0) continue;

    if (!isFirstGroup) {
      table.addSpacer(GROUP_SPACING - ROW_GAP);
    }
    isFirstGroup = false;

    for (const entry of groupEntries) {
      table.addRow(`Row - ${entry.displayText}`, [
        {text: entry.displayText},
        {text: entry.token || entry.value, color: entry.token ? "error" : undefined},
        {text: entry.value},
      ]);
    }
  }

  table.appendTo(parent);
}

async function createPaddingGapVisualizationInSection(
  parent: FrameNode,
  component: ComponentNode | ComponentSetNode | InstanceNode,
  variantColors: VariantColors[],
  tableWidth: number,
  highlightMode: boolean,
  vizPropertyFilters: Record<string, string[]>,
  framesPerRow: number,
): Promise<void> {
  // Check if there are any paddings or gaps to visualize
  const hasPaddingsOrGaps = variantColors.some((v) =>
    v.spacings.some((s) => s.property.includes("Padding") || s.property === "Gap"),
  );
  if (!hasPaddingsOrGaps) return;

  const filteredVariants = filterVariantsForVisualization(
    variantColors,
    vizPropertyFilters,
  );

  if (component.type === "COMPONENT_SET" && filteredVariants.length > 1) {
    await createMultiVariantSpacingGrid(
      parent,
      component,
      filteredVariants,
      tableWidth,
      highlightMode,
      framesPerRow,
    );
    return;
  }

  let baseComponent: ComponentNode | InstanceNode | null = null;
  if (component.type === "COMPONENT_SET") {
    baseComponent = component.children.find(
      (c) => c.type === "COMPONENT",
    ) as ComponentNode;
  } else {
    baseComponent = component;
  }
  if (!baseComponent) return;

  const instance =
    baseComponent.type === "INSTANCE"
      ? (baseComponent.clone() as InstanceNode)
      : baseComponent.createInstance();

  const vizContainer = figma.createFrame();
  vizContainer.name = "Visualização Paddings e Gaps";
  vizContainer.layoutMode = "VERTICAL";
  vizContainer.primaryAxisSizingMode = "AUTO";
  vizContainer.counterAxisSizingMode = "FIXED";
  vizContainer.resize(tableWidth, 100);
  vizContainer.itemSpacing = 16;
  vizContainer.fills = [];

  const subTitle = figma.createText();
  subTitle.fontName = getFont("Medium");
  subTitle.fontSize = 18;
  subTitle.characters = "Visualização de Paddings e Gaps";
  vizContainer.appendChild(subTitle);

  const MARGIN = 120;
  const frameWidth = tableWidth;
  const frameHeight = Math.max(300, instance.height + MARGIN * 2);

  const frame = figma.createFrame();
  frame.name = "Spacing Visualization";
  frame.resize(frameWidth, frameHeight);
  const frameBgColor = highlightMode
    ? {r: 56 / 255, g: 83 / 255, b: 255 / 255}
    : {r: 0xFE / 255, g: 0xFE / 255, b: 0xFE / 255};
  frame.fills = [{type: "SOLID", color: frameBgColor}];
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
      highlightMode,
    );
  }

  vizContainer.appendChild(frame);
  parent.appendChild(vizContainer);
}

async function createDimensionVisualizationInSection(
  parent: FrameNode,
  component: ComponentNode | ComponentSetNode | InstanceNode,
  variantColors: VariantColors[],
  tableWidth: number,
  highlightMode: boolean,
  vizPropertyFilters: Record<string, string[]>,
  framesPerRow: number,
): Promise<void> {
  const filteredVariants = filterVariantsForVisualization(
    variantColors,
    vizPropertyFilters,
  );

  if (component.type === "COMPONENT_SET" && filteredVariants.length > 1) {
    await createMultiVariantDimensionGrid(
      parent,
      component,
      filteredVariants,
      tableWidth,
      highlightMode,
      framesPerRow,
    );
    return;
  }

  let baseComponent: ComponentNode | InstanceNode | null = null;
  if (component.type === "COMPONENT_SET") {
    baseComponent = component.children.find(
      (c) => c.type === "COMPONENT",
    ) as ComponentNode;
  } else {
    baseComponent = component;
  }
  if (!baseComponent) return;

  const instance =
    baseComponent.type === "INSTANCE"
      ? (baseComponent.clone() as InstanceNode)
      : baseComponent.createInstance();

  const vizContainer = figma.createFrame();
  vizContainer.name = "Visualização Dimensões e Bordas";
  vizContainer.layoutMode = "VERTICAL";
  vizContainer.primaryAxisSizingMode = "AUTO";
  vizContainer.counterAxisSizingMode = "FIXED";
  vizContainer.resize(tableWidth, 100);
  vizContainer.itemSpacing = 16;
  vizContainer.fills = [];

  const subTitle = figma.createText();
  subTitle.fontName = getFont("Medium");
  subTitle.fontSize = 18;
  subTitle.characters = "Visualização de Dimensões e Bordas";
  vizContainer.appendChild(subTitle);

  const MARGIN = 120;
  const frameWidth = tableWidth;
  const frameHeight = Math.max(300, instance.height + MARGIN * 2);

  const frame = figma.createFrame();
  frame.name = "Dimension Visualization";
  frame.resize(frameWidth, frameHeight);
  const frameBgColor = highlightMode
    ? {r: 56 / 255, g: 83 / 255, b: 255 / 255}
    : {r: 0xFE / 255, g: 0xFE / 255, b: 0xFE / 255};
  frame.fills = [{type: "SOLID", color: frameBgColor}];
  frame.cornerRadius = 8;
  frame.clipsContent = false;

  instance.x = frameWidth / 2 - instance.width / 2;
  instance.y = frameHeight / 2 - instance.height / 2;
  frame.appendChild(instance);

  const instX = instance.x;
  const instY = instance.y;
  const instW = instance.width;
  const instH = instance.height;

  // Height tokens - coletar TODOS os tokens (principal e internos)
  const tracker = createAnnotationTracker();
  const allHeightTokens = await findAllHeightTokensWithNodes(instance);
  const instanceBoundsForDim = instance.absoluteBoundingBox;

  if (instanceBoundsForDim) {
    const rootTokens = allHeightTokens.filter(t => t.node === instance);
    const childTokens = allHeightTokens.filter(t => t.node !== instance);

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
        tracker,
      );
    }

    const seenChildTokens = new Set<string>();
    for (const heightResult of childTokens) {
      const dedupeKey = `${heightResult.token ?? ""}__${Math.round(heightResult.node.height)}`;
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
          undefined,
        );
      }
    }
  }

  // Border radius - busca recursiva (SEMPRE anotar com token ou valor em px)
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
      highlightMode,
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
        entry.stroke.position,
      );
    }
  }

  // Annotate dimensions of structural components inside the instance
  await annotateStructuralComponentsDimensions(frame, instance, highlightMode);

  vizContainer.appendChild(frame);
  parent.appendChild(vizContainer);
}

// === GRID HELPERS ===

async function createMultiVariantSpacingGrid(
  parent: FrameNode,
  componentSet: ComponentSetNode,
  variantColors: VariantColors[],
  tableWidth: number,
  highlightMode: boolean,
  framesPerRow: number = 2,
): Promise<void> {
  await createGenericVariantGrid(
    parent,
    componentSet,
    variantColors,
    tableWidth,
    highlightMode,
    framesPerRow,
    {
      gridName: "Grid Variantes - Espaçamentos",
      margin: 100,
    },
    async (ctx) => {
      await processSpacingNodeForViz(
        ctx.instance,
        ctx.vizFrame,
        ctx.instance.x,
        ctx.instance.y,
        ctx.instanceBounds,
        ctx.highlightMode,
      );
    },
  );
}

/**
 * Verifica se uma variante tem conteúdo relevante para exibir na visualização de Dimensões e Bordas.
 * Retorna true se tiver: tokens de altura, border radius ou bordas.
 */
async function variantHasDimensionContent(
  componentSet: ComponentSetNode,
  variant: VariantColors,
): Promise<boolean> {
  // Encontrar o componente da variante
  const variantNode = componentSet.children.find(
    (c) => c.type === "COMPONENT" && c.name === variant.variantName,
  ) as ComponentNode | undefined;

  if (!variantNode) return false;

  // Criar instância temporária para verificar
  const tempInstance = variantNode.createInstance();

  try {
    // 1. Verificar tokens de altura (no componente principal e elementos internos)
    const allHeightTokens = await findAllHeightTokensWithNodes(tempInstance);
    if (allHeightTokens.length > 0) {
      return true;
    }

    // 2. Verificar border radius (recursivo)
    const radiusResult = await findCornerRadiusRecursive(variantNode);
    if (radiusResult) {
      return true;
    }

    // 3. Verificar bordas
    const strokeInfo = await findStrokeWeight(tempInstance);
    if (strokeInfo && strokeInfo.length > 0) {
      return true;
    }

    // 4. Verificar componentes estruturais internos com tokens
    const hasStructuralContent = await checkStructuralComponentsHaveContent(tempInstance);
    if (hasStructuralContent) {
      return true;
    }

    return false;
  } finally {
    // Limpar instância temporária
    tempInstance.remove();
  }
}

/**
 * Verifica se há componentes estruturais internos com conteúdo relevante.
 */
async function checkStructuralComponentsHaveContent(instance: InstanceNode): Promise<boolean> {
  async function checkRecursive(node: SceneNode): Promise<boolean> {
    if (node.type === "INSTANCE") {
      const isStructural = await isStructuralInstance(node as InstanceNode);

      // Skip non-structural instances - their icons are mapped in their own spec
      if (!isStructural) {
        return false;
      }

      if (isStructural) {
        const structInstance = node as InstanceNode;
        const mainComp = await structInstance.getMainComponentAsync();
        if (!mainComp) return false;

        // Verificar token de altura
        const heightToken = await findHeightToken(mainComp);
        if (heightToken) return true;

        // Verificar border radius
        const radiusInfo = findCornerRadius(mainComp);
        if (radiusInfo) return true;

        // Verificar bordas
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

async function createMultiVariantDimensionGrid(
  parent: FrameNode,
  componentSet: ComponentSetNode,
  variantColors: VariantColors[],
  tableWidth: number,
  highlightMode: boolean,
  framesPerRow: number = 2,
): Promise<void> {
  // Filtrar apenas variantes que têm conteúdo relevante para exibir
  const variantsWithContent: VariantColors[] = [];
  for (const variant of variantColors) {
    const hasContent = await variantHasDimensionContent(componentSet, variant);
    if (hasContent) {
      variantsWithContent.push(variant);
    }
  }

  // Se nenhuma variante tem conteúdo, não criar a seção
  if (variantsWithContent.length === 0) return;

  const vizContainer = figma.createFrame();
  vizContainer.name = "Visualização Dimensões e Bordas";
  vizContainer.layoutMode = "VERTICAL";
  vizContainer.primaryAxisSizingMode = "AUTO";
  vizContainer.counterAxisSizingMode = "AUTO";
  vizContainer.itemSpacing = 16;
  vizContainer.fills = [];

  const subTitle = figma.createText();
  subTitle.fontName = getFont("Bold");
  subTitle.fontSize = 40;
  subTitle.characters = "Visualização de dimensões e bordas";
  vizContainer.appendChild(subTitle);

  await createGenericVariantGrid(
    vizContainer,
    componentSet,
    variantsWithContent,
    tableWidth,
    highlightMode,
    framesPerRow,
    {
      gridName: "Grid Variantes - Dimensões",
      margin: 100,
    },
    async (ctx) => {
      const instX = ctx.instance.x;
      const instY = ctx.instance.y;
      const instW = ctx.instance.width;
      const instH = ctx.instance.height;

      // Annotate dimensions of the main instance first
      const tracker = createAnnotationTracker();
      const mainComp = await ctx.instance.getMainComponentAsync();

      if (mainComp) {
        // Height tokens - coletar TODOS os tokens (principal e internos)
        const allHeightTokens = await findAllHeightTokensWithNodes(ctx.instance);
        const instanceBounds = ctx.instance.absoluteBoundingBox;

        if (instanceBounds) {
          // Separar tokens do componente principal e dos elementos internos
          const rootTokens = allHeightTokens.filter(t => t.node === ctx.instance);
          const childTokens = allHeightTokens.filter(t => t.node !== ctx.instance);

          // 1. Anotar token do componente principal (se existir) - lado DIREITO, mais afastado
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
              "right", // Lado direito para o componente principal
              tracker,
            );
          }

          // 2. Anotar tokens dos elementos internos - lado ESQUERDO, próximo do elemento
          const seenChildTokens = new Set<string>();
          for (const heightResult of childTokens) {
            const dedupeKey = `${heightResult.token ?? ""}__${Math.round(heightResult.node.height)}`;
            if (seenChildTokens.has(dedupeKey)) continue;
            seenChildTokens.add(dedupeKey);

            const nodeBounds = heightResult.node.absoluteBoundingBox;

            if (nodeBounds) {
              // Calcular posição relativa dentro da instância
              const relX = nodeBounds.x - instanceBounds.x;
              const relY = nodeBounds.y - instanceBounds.y;
              const nodeW = nodeBounds.width;
              const nodeH = nodeBounds.height;

              // Aplicar à posição da instância no vizFrame
              const nodeX = instX + relX;
              const nodeY = instY + relY;

              // Elementos internos: colocar à esquerda do elemento, próximo dele
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
                "left", // Lado esquerdo para elementos internos
                undefined, // Não usar tracker - cada elemento interno tem sua própria posição Y
              );
            }
          }
        }

        // Border radius - busca recursiva (SEMPRE anotar com token ou valor em px)
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
            radiusToken, // pode ser null, a função vai mostrar o valor em px
            ctx.highlightMode,
          );
        }

        // Border width - anotar borda do frame raiz e de frames internos
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
              entry.stroke.position,
            );
          }
        }
      }

      // Annotate dimensions of structural components inside the instance
      await annotateStructuralComponentsDimensions(ctx.vizFrame, ctx.instance, ctx.highlightMode);
    },
  );

  parent.appendChild(vizContainer);
}

// === HELPER FUNCTIONS FOR DIMENSIONS ===
// Token resolution functions are imported from core/token-resolution.ts

interface StrokeEntry {
  stroke: StrokeInfo;
  token: string | null;
  nodeX: number;
  nodeY: number;
  nodeW: number;
  nodeH: number;
}

/**
 * Recursively collects all strokes from a node and its structural descendants.
 * Returns each stroke with its absolute position relative to the root instance origin.
 */
async function collectAllStrokesRecursive(
  node: SceneNode,
  instanceRootBounds: Rect,
  instX: number,
  instY: number,
): Promise<StrokeEntry[]> {
  const results: StrokeEntry[] = [];

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
    for (const child of (node as ChildrenMixin).children) {
      if (child.type === "INSTANCE") {
        const structural = await isStructuralInstance(child as InstanceNode);
        if (!structural) continue;
      }
      const childResults = await collectAllStrokesRecursive(child, instanceRootBounds, instX, instY);
      results.push(...childResults);
    }
  }

  return results;
}

/**
 * Checks if there are other elements blocking a specific area
 */
function hasElementsInArea(
  instance: InstanceNode,
  areaX: number,
  areaY: number,
  areaW: number,
  areaH: number,
  excludeNode: SceneNode,
): boolean {
  const instanceBounds = instance.absoluteBoundingBox;
  if (!instanceBounds) return false;

  // Convert area coordinates to absolute
  const absoluteAreaX = areaX;
  const absoluteAreaY = areaY;

  function checkNodeOverlap(node: SceneNode): boolean {
    if (node === excludeNode) return false;
    if (!("visible" in node) || !node.visible) return false;
    if (node.type === "FRAME" || node.type === "GROUP") return false; // Skip containers

    const bounds = node.absoluteBoundingBox;
    if (!bounds) return false;

    // Check if node overlaps with the area
    const overlapsX = bounds.x < absoluteAreaX + areaW && bounds.x + bounds.width > absoluteAreaX;
    const overlapsY = bounds.y < absoluteAreaY + areaH && bounds.y + bounds.height > absoluteAreaY;

    return overlapsX && overlapsY;
  }

  function checkRecursive(node: SceneNode): boolean {
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

/**
 * Determines the best side to place height annotation based on available space
 * Priority: Left > Right > Bottom > Top
 */
function getBestSideForHeightAnnotation(
  nodeX: number,
  nodeY: number,
  nodeW: number,
  nodeH: number,
  containerW: number,
  containerH: number,
  instance: InstanceNode,
  structInstance: InstanceNode,
): "right" | "left" | "bottom" | "top" {
  const BADGE_WIDTH = 80; // Approximate width needed for badge
  const BADGE_HEIGHT = 30; // Approximate height needed for badge
  const MARGIN = 20; // Margin from component edge

  const instanceBounds = instance.absoluteBoundingBox;
  if (!instanceBounds) return "right";

  // Calculate absolute positions for collision detection
  const structBounds = structInstance.absoluteBoundingBox;
  if (!structBounds) return "right";

  // Test each side in priority order: Left > Right > Bottom > Top
  const sides: Array<{
    name: "left" | "right" | "bottom" | "top";
    areaX: number;
    areaY: number;
    areaW: number;
    areaH: number;
    hasSpace: boolean;
  }> = [
    {
      name: "left",
      areaX: structBounds.x - BADGE_WIDTH - MARGIN,
      areaY: structBounds.y + structBounds.height / 2 - BADGE_HEIGHT / 2,
      areaW: BADGE_WIDTH,
      areaH: BADGE_HEIGHT,
      hasSpace: nodeX >= BADGE_WIDTH + MARGIN,
    },
    {
      name: "right",
      areaX: structBounds.x + structBounds.width + MARGIN,
      areaY: structBounds.y + structBounds.height / 2 - BADGE_HEIGHT / 2,
      areaW: BADGE_WIDTH,
      areaH: BADGE_HEIGHT,
      hasSpace: containerW - (nodeX + nodeW) >= BADGE_WIDTH + MARGIN,
    },
    {
      name: "bottom",
      areaX: structBounds.x + structBounds.width / 2 - BADGE_WIDTH / 2,
      areaY: structBounds.y + structBounds.height + MARGIN,
      areaW: BADGE_WIDTH,
      areaH: BADGE_HEIGHT,
      hasSpace: containerH - (nodeY + nodeH) >= BADGE_HEIGHT + MARGIN + 15,
    },
    {
      name: "top",
      areaX: structBounds.x + structBounds.width / 2 - BADGE_WIDTH / 2,
      areaY: structBounds.y - BADGE_HEIGHT - MARGIN,
      areaW: BADGE_WIDTH,
      areaH: BADGE_HEIGHT,
      hasSpace: nodeY >= BADGE_HEIGHT + MARGIN + 15,
    },
  ];

  // Find the first side that has space AND no blocking elements
  for (const side of sides) {
    if (!side.hasSpace) continue;

    const hasBlockingElements = hasElementsInArea(
      instance,
      side.areaX,
      side.areaY,
      side.areaW,
      side.areaH,
      structInstance,
    );

    if (!hasBlockingElements) {
      return side.name;
    }
  }

  // Fallback: return the side with most space (even if blocked)
  const leftSpace = nodeX;
  const rightSpace = containerW - (nodeX + nodeW);
  const bottomSpace = containerH - (nodeY + nodeH);
  const topSpace = nodeY;

  if (leftSpace >= rightSpace && leftSpace >= bottomSpace && leftSpace >= topSpace) return "left";
  if (rightSpace >= bottomSpace && rightSpace >= topSpace) return "right";
  if (bottomSpace >= topSpace) return "bottom";
  return "top";
}

/**
 * Finds and annotates dimensions of structural components inside an instance
 */
async function annotateStructuralComponentsDimensions(
  container: FrameNode,
  instance: InstanceNode,
  highlightMode: boolean,
): Promise<void> {
  // Find all INSTANCE nodes inside that are structural components
  const structuralInstances: InstanceNode[] = [];

  async function findStructuralInstancesRecursive(node: SceneNode) {
    if (node.type === "INSTANCE") {
      const isStructural = await isStructuralInstance(node as InstanceNode);
      if (isStructural) {
        structuralInstances.push(node as InstanceNode);
      } else {
        // Don't recurse into non-structural instances (used components like Avatar, Button, etc.)
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

  // Get the absolute bounds of the instance to calculate relative positions
  const instanceBounds = instance.absoluteBoundingBox;
  if (!instanceBounds) return;

  // Create tracker to avoid annotation collisions
  const tracker = createAnnotationTracker();

  // Annotate dimensions for each structural instance found
  for (const structInstance of structuralInstances) {
    const bounds = structInstance.absoluteBoundingBox;
    if (!bounds) continue;

    const mainComp = await structInstance.getMainComponentAsync();
    if (!mainComp) continue;

    // Calculate position relative to instance, then add instance position
    const nodeRelX = bounds.x - instanceBounds.x;
    const nodeRelY = bounds.y - instanceBounds.y;
    const nodeX = instance.x + nodeRelX;
    const nodeY = instance.y + nodeRelY;
    const nodeW = bounds.width;
    const nodeH = bounds.height;

    // Get token from the component's bound variables
    const heightToken = await findHeightToken(mainComp);

    // Annotate height only if we have a token
    if (heightToken) {
      const bestSide = getBestSideForHeightAnnotation(
        nodeX,
        nodeY,
        nodeW,
        nodeH,
        container.width,
        container.height,
        instance,
        structInstance,
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
        tracker,
      );
    }

    // Annotate border radius if present (ALWAYS at corner, no tracker)
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
        highlightMode,
      );
    }

    // Annotate borders if present
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
          stroke.position,
        );
      }
    }
  }

  // Annotate icon dimensions for non-structural instances containing Vector
  // Measures the direct parent of the Vector node (the icon frame, not the wrapper)
  const iconEntries: Array<{measureNode: SceneNode; iconInstance: InstanceNode}> = [];
  const processedIconIds = new Set<string>();

  async function findIconInstancesRecursive(node: SceneNode) {
    // Check if this is an icon: INSTANCE with a direct Vector child
    if (node.type === "INSTANCE" && node !== instance) {
      const hasDirectVector = "children" in node && node.children.some(
        (c) => c.name === "Vector" || c.type === "VECTOR",
      );
      if (hasDirectVector) {
        // Apply barrier rule: only collect if no non-structural instance in path to root
        if (await shouldCollectIcon(node, instance)) {
          if (!processedIconIds.has(node.id)) {
            processedIconIds.add(node.id);
            iconEntries.push({measureNode: node as SceneNode, iconInstance: node as InstanceNode});
          }
        }
        return; // Don't recurse into icon instances
      }

      // Non-icon instance: if non-structural, it's a barrier — stop recursion
      const isStructural = await isStructuralInstance(node as InstanceNode);
      if (!isStructural) return;
    }

    if ("children" in node) {
      for (const child of node.children) {
        await findIconInstancesRecursive(child);
      }
    }
  }

  await findIconInstancesRecursive(instance);

  for (const {measureNode, iconInstance} of iconEntries) {
    const iconBounds = measureNode.absoluteBoundingBox;
    if (!iconBounds) continue;

    const relX = iconBounds.x - instanceBounds.x;
    const relY = iconBounds.y - instanceBounds.y;
    const nodeX = instance.x + relX;
    const nodeY = instance.y + relY;
    const nodeW = iconBounds.width;
    const nodeH = iconBounds.height;

    // Use bound variable token from Figma, fallback to raw px value
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
      iconInstance,
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
      tracker,
    );
  }
}

async function processSpacingNodeForViz(
  node: SceneNode,
  container: FrameNode,
  baseX: number,
  baseY: number,
  instanceBounds: {x: number; y: number; width: number; height: number},
  highlightMode: boolean = false,
  tracker?: AnnotationTracker,
): Promise<void> {
  if ("visible" in node && !node.visible) return;

  if (!tracker) {
    tracker = {
      rightPositions: [],
      leftPositions: [],
      topPositions: [],
      bottomPositions: [],
      gapPositions: [],
    };
  }

  // Check if node has layout properties (FrameNode or InstanceNode with layout)
  const hasLayout = ("layoutMode" in node && node.layoutMode !== "NONE") ||
                    (node.type === "INSTANCE" && "layoutMode" in node);

  if (hasLayout) {
    const n = node as FrameNode | InstanceNode;
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

    if (
      n.itemSpacing &&
      n.itemSpacing > 0 &&
      n.children &&
      n.children.length >= 2
    ) {
      const gapToken = await findBoundVariableToken(n, "itemSpacing", formatSpaceToken);

      const visibleChildren = n.children.filter((child) =>
        "visible" in child ? child.visible : true,
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
          tracker,
        );
      }
    }

    const paddingProps = [
      {key: "paddingTop" as const, side: "top" as const},
      {key: "paddingBottom" as const, side: "bottom" as const},
      {key: "paddingLeft" as const, side: "left" as const},
      {key: "paddingRight" as const, side: "right" as const},
    ];

    for (const {key, side} of paddingProps) {
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
          tracker,
        );
      }
    }
  }

  if ("children" in node) {
    for (const child of node.children) {
      // Skip non-structural instances (don't recurse into used components like Avatar, Button, etc.)
      if (child.type === "INSTANCE") {
        const isStructural = await isStructuralInstance(child as InstanceNode);
        if (!isStructural) continue;
      }
      await processSpacingNodeForViz(
        child,
        container,
        baseX,
        baseY,
        instanceBounds,
        highlightMode,
        tracker,
      );
    }
  }
}