import { VariantColors, TextSpec, TextNodeWithMaxLines } from "../types";
import { SIZE_ORDER, getTheme } from "../config/theme";
import { getFont, substituteUnavailableFontsInNode } from "../utils/fonts";
import { findTextNodes } from "../core/node-helpers";
import { createTableAutoLayoutContainer, createSectionTitle, groupElementsAndAppend } from "../ui/table-builder";
import { createSimpleAnnotation, createAnnotationTracker, findFreeXPosition } from "../ui/annotations";
import { createSectionContainer, filterVariantsForVisualization, createGenericVariantGrid } from "./common";

export async function createTextSectionCombined(
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
  const hasText = variantColors.some((v) => v.textStyles.length > 0);
  if (!hasText) return false;

  if (!showTable && !showViz) return false;

  const section = createSectionContainer("Seção Padrões de Texto");
  createSectionTitle("Padrões de texto", section);

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
      framesPerRow,
    );

    // Visualização de comportamento de texto (truncamento/ellipsis)
    await createTextBehaviorVisualization(
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

/**
 * Detecta automaticamente qual propriedade usar para agrupar registros de texto.
 * Prioriza 'size' se existir com múltiplos valores, caso contrário usa a propriedade
 * que tem mais variação. Se todas as propriedades forem únicas, retorna null.
 */
function detectTextGroupingProperty(
  variantColors: VariantColors[]
): string | null {
  // Mapear os valores únicos de cada propriedade
  const propertyUniqueValues: Map<string, Set<string>> = new Map();

  for (const variant of variantColors) {
    if (variant.textStyles.length === 0) continue;

    for (const [propName, propValue] of Object.entries(variant.propertyMap)) {
      if (!propertyUniqueValues.has(propName)) {
        propertyUniqueValues.set(propName, new Set());
      }
      propertyUniqueValues.get(propName)!.add(propValue);
    }
  }

  // Prioridade 1: Se 'size' existe e tem múltiplos valores, usar size
  if (propertyUniqueValues.has('size')) {
    const sizeValues = propertyUniqueValues.get('size')!;
    if (sizeValues.size > 1) {
      return 'size';
    }
  }

  // Prioridade 2: Encontrar propriedade com mais valores únicos (mais variação)
  let bestProperty: string | null = null;
  let maxUniqueValues = 1; // Precisa ter pelo menos 2 valores diferentes para agrupar

  for (const [propName, uniqueValues] of propertyUniqueValues) {
    if (uniqueValues.size > maxUniqueValues) {
      maxUniqueValues = uniqueValues.size;
      bestProperty = propName;
    }
  }

  return bestProperty;
}

async function createTextTableInSection(
  parent: FrameNode,
  variantColors: VariantColors[],
  tableWidth: number,
  vizPropertyFilters: Record<string, string[]>,
): Promise<void> {
  // Filtrar variants conforme seleção do usuário (igual à visualização)
  const filteredVariants = filterVariantsForVisualization(
    variantColors,
    vizPropertyFilters,
  );

  const hasText = filteredVariants.some((v) => v.textStyles.length > 0);
  if (!hasText) return;

  const ROW_HEIGHT = 44;
  const ROW_GAP = 4;
  const GROUP_SPACING = 16;

  // Criar container da tabela
  const tableContainer = createTableAutoLayoutContainer(
    "Tabela Tipografia",
    tableWidth,
    ROW_GAP,
  );

  // Criar header
  const headerElements: SceneNode[] = [];
  const headers = ["ELEMENTO", "COMPONENTE"];
  const headerX = [0, Math.floor(tableWidth * 0.45)];

  for (let i = 0; i < headers.length; i++) {
    const headerText = figma.createText();
    headerText.fontName = getFont("Bold");
    headerText.fontSize = 16;
    headerText.characters = headers[i];
    headerText.fills = [{type: "SOLID", color: {r: 0.4, g: 0.4, b: 0.4}}];
    headerText.x = headerX[i];
    headerText.y = 0;
    headerElements.push(headerText);
  }
  groupElementsAndAppend(headerElements, "Header", tableContainer);

  // Coletar todos os registros
  const allTextRows: {
    sizeElement: string;
    textSpec: TextSpec;
    sizeOrder: number;
    propertyMap: Record<string, string>;
  }[] = [];

  for (const variant of filteredVariants) {
    const size = variant.propertyMap.size || "Default";
    const sizeOrder = SIZE_ORDER[size.toLowerCase()] ?? 99;

    for (const text of variant.textStyles) {
      allTextRows.push({
        sizeElement: `${size} / ${text.element}`,
        textSpec: text,
        sizeOrder,
        propertyMap: variant.propertyMap,
      });
    }
  }

  // Ordenar por size
  allTextRows.sort((a, b) => a.sizeOrder - b.sizeOrder);

  // Deduplicação
  const seen = new Set<string>();
  const uniqueRows = allTextRows.filter((row) => {
    const key = `${row.sizeElement}-${row.textSpec.token || row.textSpec.fontFamily}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Detectar propriedade de agrupamento usando os variants FILTRADOS
  const groupingProperty = detectTextGroupingProperty(filteredVariants);

  if (!groupingProperty) {
    // Sem agrupamento: listar tudo sequencialmente
    for (const textRow of uniqueRows) {
      await createTextTableRow(
        tableContainer,
        textRow.sizeElement,
        textRow.textSpec,
        tableWidth,
        ROW_HEIGHT,
      );
    }
  } else {
    // Com agrupamento: agrupar pela propriedade detectada
    const groupedRows: Map<string, typeof uniqueRows> = new Map();

    for (const row of uniqueRows) {
      const groupValue = row.propertyMap[groupingProperty] || "Default";
      if (!groupedRows.has(groupValue)) {
        groupedRows.set(groupValue, []);
      }
      groupedRows.get(groupValue)!.push(row);
    }

    // Se só tem 1 grupo, não precisa de spacers - listar tudo junto
    if (groupedRows.size === 1) {
      for (const textRow of uniqueRows) {
        await createTextTableRow(
          tableContainer,
          textRow.sizeElement,
          textRow.textSpec,
          tableWidth,
          ROW_HEIGHT,
        );
      }
    } else {
      // Múltiplos grupos: adicionar spacers entre eles
      // Ordenar grupos (por size order se a propriedade for size)
      const sortedGroups = Array.from(groupedRows.entries()).sort((a, b) => {
        if (groupingProperty.toLowerCase() === "size") {
          const orderA = SIZE_ORDER[a[0].toLowerCase()] ?? 99;
          const orderB = SIZE_ORDER[b[0].toLowerCase()] ?? 99;
          return orderA - orderB;
        }
        return a[0].localeCompare(b[0]);
      });

      let isFirstGroup = true;
      for (const [, rows] of sortedGroups) {
        // Adicionar spacer entre grupos
        if (!isFirstGroup) {
          const spacer = figma.createFrame();
          spacer.name = "Spacer";
          spacer.resize(tableWidth, GROUP_SPACING - ROW_GAP);
          spacer.fills = [];
          tableContainer.appendChild(spacer);
        }
        isFirstGroup = false;

        // Adicionar linhas do grupo
        for (const textRow of rows) {
          await createTextTableRow(
            tableContainer,
            textRow.sizeElement,
            textRow.textSpec,
            tableWidth,
            ROW_HEIGHT,
          );
        }
      }
    }
  }

  parent.appendChild(tableContainer);
}

/**
 * Cria uma linha da tabela de texto (função auxiliar específica para textos).
 */
async function createTextTableRow(
  container: FrameNode,
  sizeElement: string,
  textSpec: TextSpec,
  tableWidth: number,
  rowHeight: number,
): Promise<void> {
  const rowElements: SceneNode[] = [];

  // Background da linha
  const rowBg = figma.createRectangle();
  rowBg.name = "Row Background";
  rowBg.resize(tableWidth, rowHeight);
  rowBg.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
  rowBg.cornerRadius = 4;
  rowBg.x = 0;
  rowBg.y = 0;
  rowElements.push(rowBg);

  // Texto do elemento
  const elementText = figma.createText();
  elementText.fontName = getFont("Regular");
  elementText.fontSize = 16;
  elementText.characters = sizeElement;
  elementText.x = 16;
  elementText.y = 12;
  rowElements.push(elementText);

  // Texto do componente (token ou especificação)
  const tokenValue = textSpec.token
    ? `$${textSpec.token.replace(/\//g, "-")}`
    : `${textSpec.fontFamily} / ${textSpec.fontWeight} / ${textSpec.fontSize}px / LH: ${textSpec.lineHeight} / LS: ${textSpec.letterSpacing || "0%"}`;

  const componentText = figma.createText();
  componentText.fontName = getFont("Regular");
  componentText.fontSize = 16;
  componentText.characters = tokenValue;
  componentText.fills = textSpec.token
    ? [{type: "SOLID", color: {r: 12 / 255, g: 138 / 255, b: 0}}]
    : [{type: "SOLID", color: {r: 0.5, g: 0.5, b: 0.5}}];
  componentText.x = Math.floor(tableWidth * 0.45);
  componentText.y = 12;
  rowElements.push(componentText);

  groupElementsAndAppend(rowElements, `Row ${sizeElement}`, container);
}

/**
 * Builds a map of textNode.name → original FontName by walking the given node tree.
 * Used to recover the original font family/style for annotation labels after
 * substituteUnavailableFontsInNode has replaced missing fonts in the instance copy.
 * When multiple nodes share a name the last one wins (acceptable for annotation purposes).
 */
function buildOriginalFontMap(root: BaseNode): Map<string, FontName> {
  const map = new Map<string, FontName>();
  function walk(node: BaseNode): void {
    if (node.type === "TEXT") {
      const fn = (node as TextNode).fontName;
      if (fn !== figma.mixed) {
        map.set(node.name, fn as FontName);
      }
    }
    if ("children" in node) {
      for (const child of (node as ChildrenMixin).children) {
        walk(child);
      }
    }
  }
  walk(root);
  return map;
}

async function createTextVisualizationInSection(
  parent: FrameNode,
  component: ComponentNode | ComponentSetNode | InstanceNode,
  variantColors: VariantColors[],
  tableWidth: number,
  highlightMode: boolean,
  vizPropertyFilters: Record<string, string[]>,
  framesPerRow: number,
): Promise<void> {
  const hasText = variantColors.some((v) => v.textStyles.length > 0);
  if (!hasText) return;

  const filteredVariants = filterVariantsForVisualization(
    variantColors,
    vizPropertyFilters,
  );

  if (component.type === "COMPONENT_SET" && filteredVariants.length > 1) {
    await createMultiVariantTextGrid(
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

  // Build original font map from the source component BEFORE any substitution
  const originalFontMapSingle = buildOriginalFontMap(baseComponent);

  const instance =
    baseComponent.type === "INSTANCE"
      ? (baseComponent.clone() as InstanceNode)
      : baseComponent.createInstance();

  // Replace fonts not available on this machine before appendChild to prevent
  // "unloaded font" errors when rendering proprietary fonts (e.g. BancoDoBrasil Textos)
  substituteUnavailableFontsInNode(instance);

  const MARGIN = 100;
  const frameHeight = Math.max(300, instance.height + MARGIN * 2);

  const vizContainer = figma.createFrame();
  vizContainer.name = "Visualização Textos";
  vizContainer.layoutMode = "VERTICAL";
  vizContainer.primaryAxisSizingMode = "AUTO";
  vizContainer.counterAxisSizingMode = "FIXED";
  vizContainer.resize(tableWidth, 100);
  vizContainer.itemSpacing = 16;
  vizContainer.fills = [];

  const subTitle = figma.createText();
  subTitle.fontName = getFont("Medium");
  subTitle.fontSize = 18;
  subTitle.characters = "Visualização";
  vizContainer.appendChild(subTitle);

  const vizFrame = figma.createFrame();
  vizFrame.name = "Text Visualization";
  vizFrame.resize(tableWidth, frameHeight);
  const frameBgColor = highlightMode
    ? {r: 56 / 255, g: 83 / 255, b: 255 / 255}
    : {r: 0xFE / 255, g: 0xFE / 255, b: 0xFE / 255};
  vizFrame.fills = [{type: "SOLID", color: frameBgColor}];
  vizFrame.cornerRadius = 8;
  vizFrame.clipsContent = false;

  instance.x = tableWidth / 2 - instance.width / 2;
  instance.y = frameHeight / 2 - instance.height / 2;
  vizFrame.appendChild(instance);

  const allTextNodes = await findTextNodes(instance);
  const instanceBounds = instance.absoluteBoundingBox;

  if (instanceBounds) {
    const textStyles = variantColors[0]?.textStyles || [];
    const color = getTheme(highlightMode).text;

    // Deduplicar pela fonte ORIGINAL (não substituída) + tamanho
    const seenFonts = new Set<string>();
    const uniqueTextNodes: TextNode[] = [];
    for (const node of allTextNodes) {
      const origFont = originalFontMapSingle.get(node.name);
      const fontName = origFont ?? (node.fontName !== figma.mixed ? node.fontName : {family: "Mixed", style: "Mixed"});
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

      // Use the original font (pre-substitution) for matching and label display
      const origFont = originalFontMapSingle.get(textNode.name);
      const textNodeFontName = origFont ?? (
        textNode.fontName !== figma.mixed
          ? textNode.fontName
          : {family: "Mixed", style: "Mixed"}
      );
      const textNodeFontSize =
        textNode.fontSize !== figma.mixed ? textNode.fontSize : 0;

      let label = "";
      // Match por fonte original — mais confiável para subcomponentes aninhados
      for (const spec of textStyles) {
        if (
          spec.fontFamily === textNodeFontName.family &&
          spec.fontWeight === textNodeFontName.style &&
          spec.fontSize === textNodeFontSize
        ) {
          label = spec.token
            ? `$${spec.token.replace(/\//g, "-")}`
            : `${spec.fontFamily} / ${spec.fontWeight} / ${spec.fontSize}px / LH: ${spec.lineHeight}`;
          break;
        }
      }

      // Fallback: match por nome do nó vs spec.element
      if (!label) {
        const nodeName = textNode.name.toLowerCase();
        for (const spec of textStyles) {
          const specEl = spec.element.toLowerCase();
          if (specEl === nodeName || nodeName.includes(specEl) || specEl.includes(nodeName)) {
            label = spec.token
              ? `$${spec.token.replace(/\//g, "-")}`
              : `${spec.fontFamily} / ${spec.fontWeight} / ${spec.fontSize}px / LH: ${spec.lineHeight}`;
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

      // Posição X preferida (centro do texto)
      const preferredX = textX + nodeW / 2;

      // Usar tracker para ajustar X horizontalmente (igual ao padding)
      const positions = isAbove ? tracker.topPositions : tracker.bottomPositions;
      const freeX = findFreeXPosition(positions, preferredX, 80);
      positions.push(freeX);

      // Calcular posições start e end
      const startX = freeX;
      const startY = isAbove ? textY - DOT_OFFSET : textY + nodeH + DOT_OFFSET;
      const endX = freeX;
      const endY = isAbove
        ? textY - DOT_OFFSET - LINE_LENGTH
        : textY + nodeH + DOT_OFFSET + LINE_LENGTH;

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
        highlightMode,
      );
    }
  }

  vizContainer.appendChild(vizFrame);
  parent.appendChild(vizContainer);
}

async function createMultiVariantTextGrid(
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
      gridName: "Grid Variantes - Texto",
      margin: 80,
    },
    async (ctx) => {
      if (ctx.vc.textStyles.length === 0) return;

      // Build original font map from the unmutated variant ComponentNode
      // (instance may have had fonts substituted by substituteUnavailableFontsInNode)
      const originalFontMap = buildOriginalFontMap(ctx.variant);

      const allTextNodes = await findTextNodes(ctx.instance);
      const color = getTheme(ctx.highlightMode).text;

      // Deduplicar pela fonte ORIGINAL + tamanho para preservar distinção entre estilos
      const seenFonts = new Set<string>();
      const uniqueTextNodes: TextNode[] = [];
      for (const node of allTextNodes) {
        const origFont = originalFontMap.get(node.name);
        const fontName = origFont ?? (node.fontName !== figma.mixed ? node.fontName : {family: "Mixed", style: "Mixed"});
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

        // Use original font for matching and label — instance may have substituted fonts
        const origFont = originalFontMap.get(textNode.name);
        const textNodeFontName = origFont ?? (
          textNode.fontName !== figma.mixed
            ? textNode.fontName
            : {family: "Mixed", style: "Mixed"}
        );
        const textNodeFontSize =
          textNode.fontSize !== figma.mixed ? textNode.fontSize : 0;
        let label = "";

        // Match por fonte original (família + peso + tamanho)
        for (const spec of ctx.vc.textStyles) {
          if (
            spec.fontFamily === textNodeFontName.family &&
            spec.fontWeight === textNodeFontName.style &&
            spec.fontSize === textNodeFontSize
          ) {
            label = spec.token
              ? `$${spec.token.replace(/\//g, "-")}`
              : `${spec.fontFamily} / ${spec.fontWeight} / ${spec.fontSize}px / LH: ${spec.lineHeight}`;
            break;
          }
        }

        // Fallback: match por nome do nó vs spec.element
        if (!label) {
          const nodeName = textNode.name.toLowerCase();
          for (const spec of ctx.vc.textStyles) {
            const specEl = spec.element.toLowerCase();
            if (specEl === nodeName || nodeName.includes(specEl) || specEl.includes(nodeName)) {
              label = spec.token
                ? `$${spec.token.replace(/\//g, "-")}`
                : `${spec.fontFamily} / ${spec.fontWeight} / ${spec.fontSize}px / LH: ${spec.lineHeight}`;
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

        // Posição X preferida (centro do texto)
        const preferredX = textX + nodeW / 2;

        // Usar tracker para ajustar X horizontalmente
        const positions = isAbove ? tracker.topPositions : tracker.bottomPositions;
        const freeX = findFreeXPosition(positions, preferredX, 80);
        positions.push(freeX);

        // Calcular posições start e end
        const startX = freeX;
        const startY = isAbove ? textY - DOT_OFFSET : textY + nodeH + DOT_OFFSET;
        const endX = freeX;
        const endY = isAbove
          ? textY - DOT_OFFSET - LINE_LENGTH
          : textY + nodeH + DOT_OFFSET + LINE_LENGTH;

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
          ctx.highlightMode,
        );
      }
    },
  );
}

/**
 * Cria visualização de comportamento de texto (truncamento/ellipsis).
 * Detecta nós de texto com textAutoResize === "TRUNCATE" e gera visualização.
 */
async function createTextBehaviorVisualization(
  parent: FrameNode,
  component: ComponentNode | ComponentSetNode | InstanceNode,
  variantColors: VariantColors[],
  tableWidth: number,
  highlightMode: boolean,
  vizPropertyFilters: Record<string, string[]>,
  framesPerRow: number,
): Promise<void> {
  // Filtrar variants
  const filteredVariants = filterVariantsForVisualization(
    variantColors,
    vizPropertyFilters,
  );

  if (filteredVariants.length === 0) return;

  // Verificar prévia: coletar apenas variantes com truncamento
  const variantsWithTruncation: VariantColors[] = [];

  for (const variant of filteredVariants) {
    let checkInstance: InstanceNode | null = null;

    if (component.type === "COMPONENT_SET") {
      const variantNode = component.children.find((child) => {
        if (child.type !== "COMPONENT") return false;
        const childName = child.name;
        const matches = Object.entries(variant.propertyMap).every(([key, value]) => {
          const normalized = childName.toLowerCase();
          const keyNormalized = key.toLowerCase();
          const valueNormalized = value.toLowerCase();
          return (
            normalized.includes(`${keyNormalized}=${valueNormalized}`) ||
            normalized.includes(valueNormalized)
          );
        });
        return matches;
      }) as ComponentNode | undefined;

      if (variantNode) {
        checkInstance = variantNode.createInstance();
      }
    } else if (component.type === "COMPONENT") {
      checkInstance = component.createInstance();
    } else if (component.type === "INSTANCE") {
      checkInstance = component.clone() as InstanceNode;
    }

    if (checkInstance) {
      const textNodes = await findTextNodes(checkInstance);
      let variantHasTruncation = false;

      for (const textNode of textNodes) {
        const textWithMaxLines = textNode as TextNodeWithMaxLines;
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

  // Criar título
  const subTitle = figma.createText();
  await figma.loadFontAsync(getFont("Medium"));
  subTitle.fontName = getFont("Medium");
  subTitle.fontSize = 18;
  subTitle.characters = "Comportamento de Texto";
  subTitle.fills = [{type: "SOLID", color: {r: 0, g: 0, b: 0}}];
  parent.appendChild(subTitle);

  await createGenericVariantGrid(
    parent,
    component as ComponentSetNode,
    variantsWithTruncation,
    tableWidth,
    highlightMode,
    framesPerRow,
    {
      gridName: "Comportamento de Texto",
      margin: 80,
    },
    async (ctx) => {
      const allTextNodes = await findTextNodes(ctx.instance);

      // Primeiro, coletar todos os textos com truncamento e suas posições
      const truncatedTexts: {
        textNode: TextNode;
        bounds: { x: number; y: number; width: number; height: number };
        maxLines: number | null;
      }[] = [];

      for (const textNode of allTextNodes) {
        // Verificar se o texto tem truncamento (HEIGHT + maxLines)
        const textWithMaxLines = textNode as TextNodeWithMaxLines;
        if (textNode.textAutoResize !== "HEIGHT" || textWithMaxLines.maxLines == null) continue;

        const textBounds = textNode.absoluteBoundingBox;
        if (!textBounds) continue;

        truncatedTexts.push({
          textNode,
          bounds: textBounds,
          maxLines: textWithMaxLines.maxLines || null,
        });
      }

      // Ordenar por posição Y (de cima para baixo)
      truncatedTexts.sort((a, b) => a.bounds.y - b.bounds.y);

      // Processar cada texto truncado
      for (let i = 0; i < truncatedTexts.length; i++) {
        const { textNode, bounds: textBounds, maxLines } = truncatedTexts[i];

        // Calcular quantidade de texto necessária para forçar truncamento
        const textWidth = textBounds.width;
        const textHeight = textBounds.height;
        const fontSize = textNode.fontSize !== figma.mixed ? textNode.fontSize : 14;
        const lineHeight = textNode.lineHeight !== figma.mixed
          ? (typeof textNode.lineHeight === "object" && "value" in textNode.lineHeight
            ? textNode.lineHeight.value
            : fontSize * 1.2)
          : fontSize * 1.2;

        // Calcular número de linhas que cabem
        const estimatedLines = maxLines || Math.ceil(textHeight / lineHeight);
        const charsPerLine = Math.floor(textWidth / (fontSize * 0.5));
        const totalChars = charsPerLine * (estimatedLines + 2); // +2 para forçar overflow

        // Gerar texto Lorem Ipsum suficiente
        const loremText = generateLoremIpsum(totalChars);

        // Substituir o texto para forçar truncamento
        try {
          await figma.loadFontAsync(textNode.fontName as FontName);
          textNode.characters = loremText;
        } catch (e) {
          // Se falhar ao carregar a fonte, tenta com fonte padrão
          try {
            await figma.loadFontAsync({ family: "Inter", style: "Regular" });
            textNode.fontName = { family: "Inter", style: "Regular" };
            textNode.characters = loremText;
          } catch (e2) {
            console.warn("[Typography] Failed to load fallback font", e2);
          }
        }

        // Usar coordenadas do TEXTO diretamente (não do pai)
        const textRelX = textBounds.x - ctx.instanceBounds.x;
        const textRelY = textBounds.y - ctx.instanceBounds.y;
        const textW = textBounds.width;
        const textH = textBounds.height;

        const textX = ctx.instance.x + textRelX;
        const textY = ctx.instance.y + textRelY;

        const label = maxLines
          ? `Ellipsis - limite de ${maxLines} linha${maxLines > 1 ? 's' : ''}`
          : "Ellipsis";

        const LINE_LENGTH = 60;
        const DOT_OFFSET = 12; // Distância do dot à borda do texto

        // Determinar direção do pointer baseado na posição do texto na lista
        // Se é o primeiro (mais acima), pointer vai para cima
        // Se é o último (mais abaixo), pointer vai para baixo
        // Se estiver no meio, alternar baseado no índice
        let isTextOnTop: boolean;
        if (truncatedTexts.length === 1) {
          // Só um texto: usar posição relativa ao centro da instância
          const textCenterY = textY + textH / 2;
          const instanceCenterY = ctx.instance.y + ctx.instanceBounds.height / 2;
          isTextOnTop = textCenterY < instanceCenterY;
        } else if (i === 0) {
          // Primeiro texto (mais acima): pointer para cima
          isTextOnTop = true;
        } else if (i === truncatedTexts.length - 1) {
          // Último texto (mais abaixo): pointer para baixo
          isTextOnTop = false;
        } else {
          // Textos intermediários: alternar
          isTextOnTop = i % 2 === 0;
        }

        // Posicionar dot AFASTADO da borda do texto
        const startX = textX + textW / 2;
        let startY: number;
        let endY: number;

        if (isTextOnTop) {
          // Texto em cima: dot acima da borda superior, pointer vai para cima
          startY = textY - DOT_OFFSET;
          endY = startY - LINE_LENGTH;
        } else {
          // Texto embaixo: dot abaixo da borda inferior, pointer vai para baixo
          startY = textY + textH + DOT_OFFSET;
          endY = startY + LINE_LENGTH;
        }

        // Cores dependem do highlightMode
        // Normal: #E53333 (vermelho) para bolinha/haste, preto para texto
        // Highlight: #62F84F (verde brilhante) para bolinha/haste E para texto
        const pointerColor = ctx.highlightMode
          ? {r: 98 / 255, g: 248 / 255, b: 79 / 255}  // #62F84F
          : {r: 0xE5 / 255, g: 0x33 / 255, b: 0x33 / 255};  // #E53333
        const textColor = ctx.highlightMode
          ? {r: 98 / 255, g: 248 / 255, b: 79 / 255}  // #62F84F (verde)
          : {r: 0, g: 0, b: 0};  // Preto

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
          12, // fontSize
          "Medium", // fontWeight
        );
      }
    },
  );
}

/**
 * Gera texto Lorem Ipsum com quantidade aproximada de caracteres.
 */
function generateLoremIpsum(charCount: number): string {
  const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ";

  let result = "";
  while (result.length < charCount) {
    result += lorem;
  }

  return result.substring(0, charCount);
}