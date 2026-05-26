// src/features/colors.ts

import { VariantColors, ColorSpec } from "../types";
import { getFont } from "../utils/fonts";
import { hexToRgb } from "../utils/helpers";
import { createSectionTitle, createTableAutoLayoutContainer, groupElementsAndAppend } from "../ui/table-builder";
import { createSectionContainer, filterVariantsForVisualization, formatVariantPropertiesForTable } from "./common";

/**
 * Removes property values from element names when those properties are not in variantPropertyOrder
 * Examples:
 *   - "Icon (Asset / Prefix / Default)" -> "Icon (Asset / Prefix)" (if state not in order)
 *   - "Label / Small" -> "Label" (if size not in order)
 */
function removeFilteredPropertyValues(
  elementName: string,
  variantPropertyOrder?: string[]
): string {
  // Only remove suffixes if user has configured property order (filtered properties)
  if (!variantPropertyOrder || variantPropertyOrder.length === 0) {
    return elementName;
  }

  // Common property values that might be filtered out
  // State values
  const stateValues = ['Default', 'Disabled', 'Enabled', 'Active', 'Inactive', 'Hover', 'Pressed', 'Focus', 'Selected'];

  // Size values (if "size" property is not in variantPropertyOrder)
  const sizeValues = ['X-Small', 'Small', 'Semiregular', 'Regular', 'Large', 'X-Large', 'XX-Large', 'XXX-Large', 'Display'];

  let cleaned = elementName;

  // Remove state values if "state" is not in variantPropertyOrder
  const hasState = variantPropertyOrder.some(prop => prop.toLowerCase() === 'state');
  if (!hasState) {
    for (const state of stateValues) {
      const pattern = ` / ${state}`;
      cleaned = cleaned.split(pattern).join('');
    }
  }

  // Remove size values if "size" is not in variantPropertyOrder
  const hasSize = variantPropertyOrder.some(prop => prop.toLowerCase() === 'size');
  if (!hasSize) {
    for (const size of sizeValues) {
      const pattern = ` / ${size}`;
      cleaned = cleaned.split(pattern).join('');
    }
  }

  return cleaned;
}

export async function createColorSectionCombined(
  parent: FrameNode,
  variantColors: VariantColors[],
  tableWidth: number,
  variantPropertyOrder?: string[],
  vizPropertyFilters?: Record<string, string[]>,
): Promise<boolean> {
  const filtered = vizPropertyFilters
    ? filterVariantsForVisualization(variantColors, vizPropertyFilters)
    : variantColors;
  const hasColors = filtered.some((v) => v.colors.length > 0);
  if (!hasColors) return false;

  const section = createSectionContainer("Seção Cores");
  createSectionTitle("Cores", section);

  await createColorTableInSection(section, filtered, tableWidth, variantPropertyOrder);

  parent.appendChild(section);
  return true;
}

async function createColorTableInSection(
  parent: FrameNode,
  variantColors: VariantColors[],
  tableWidth: number,
  variantPropertyOrder?: string[],
): Promise<void> {
  const hasColors = variantColors.some((v) => v.colors.length > 0);
  if (!hasColors) return;

  const ROW_HEIGHT = 44;
  const ROW_GAP = 4;
  const GROUP_SPACING = 16;

  // CRIA O CONTAINER (FrameNode)
  const tableContainer = createTableAutoLayoutContainer(
    "Tabela Cores",
    tableWidth,
    ROW_GAP,
  );

  const headerElements: SceneNode[] = [];
  const headers = ["Elemento / Estado", "Token", "Referência"];
  const headerX = [
    0,
    Math.floor(tableWidth * 0.4),
    Math.floor(tableWidth * 0.8),
  ];

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

  // ========================================
  // INVERSE GROUPING: Agrupa por assinatura da cor
  // ========================================

  // 1. Coletar todas as variantes únicas
  const allVariantLabels = new Set<string>();
  for (const variant of variantColors) {
    const variantLabel = formatVariantPropertiesForTable(variant.propertyMap, variantPropertyOrder);
    allVariantLabels.add(variantLabel);
  }
  const totalVariants = allVariantLabels.size;

  // 2. Mapear cores por assinatura (elemento + token/hex)
  interface ColorEntry {
    element: string;
    token: string | null;
    colorHex: string;
    colorVariableId: string | null;
    variants: string[];  // Lista de labels de variantes que usam esta cor
  }

  const colorsBySignature: Map<string, ColorEntry> = new Map();

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
          variants: [],
        });
      }

      const entry = colorsBySignature.get(signature)!;
      if (!entry.variants.includes(variantLabel)) {
        entry.variants.push(variantLabel);
      }
    }
  }

  // 3. Criar entradas de exibição com agrupamento inteligente
  interface DisplayEntry {
    prefix: string;
    displayText: string;
    token: string | null;
    colorHex: string;
    colorVariableId: string | null;
  }

  const allDisplayEntries: DisplayEntry[] = [];

  for (const [, entry] of colorsBySignature) {
    const isUsedByAllVariants = entry.variants.length === totalVariants;

    if (isUsedByAllVariants && totalVariants > 1) {
      // Cor usada por todas as variantes -> "Todos"
      allDisplayEntries.push({
        prefix: "Todos",
        displayText: `Todos / ${entry.element}`,
        token: entry.token,
        colorHex: entry.colorHex,
        colorVariableId: entry.colorVariableId,
      });
    } else {
      // Usar o label completo da variante como prefixo (ex: "Neutral / Default")
      const entryGroups = new Set<string>();
      for (const variantLabel of entry.variants) {
        entryGroups.add(variantLabel);
      }

      for (const group of entryGroups) {
        allDisplayEntries.push({
          prefix: group,
          displayText: `${group} / ${entry.element}`,
          token: entry.token,
          colorHex: entry.colorHex,
          colorVariableId: entry.colorVariableId,
        });
      }
    }
  }

  // 4. Agrupar entradas por prefixo para ordenação
  const entriesByPrefix: Map<string, DisplayEntry[]> = new Map();
  for (const entry of allDisplayEntries) {
    if (!entriesByPrefix.has(entry.prefix)) {
      entriesByPrefix.set(entry.prefix, []);
    }
    entriesByPrefix.get(entry.prefix)!.push(entry);
  }

  // 5. Ordenar prefixos: "Todos" primeiro, depois ordem lógica de estados
  const stateOrder: Record<string, number> = {
    "Todos": -1,
    "Default": 0,
    "Enabled": 1,
    "Active": 2,
    "Hover": 3,
    "Pressed": 4,
    "Focus": 5,
    "Disabled": 6,
  };

  const sortedPrefixes = Array.from(entriesByPrefix.keys()).sort((a, b) => {
    if (a === "Todos") return -1;
    if (b === "Todos") return 1;
    // For composite prefixes like "Neutral / Default", sort each part by stateOrder then alphabetically
    const partsA = a.split(" / ");
    const partsB = b.split(" / ");
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const pa = partsA[i] || "";
      const pb = partsB[i] || "";
      if (pa === pb) continue;
      const orderA = stateOrder[pa] ?? 99;
      const orderB = stateOrder[pb] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return pa.localeCompare(pb);
    }
    return 0;
  });

  // 6. Renderizar as linhas da tabela
  let isFirstGroup = true;
  for (const prefix of sortedPrefixes) {
    const groupEntries = entriesByPrefix.get(prefix)!;
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
      const rowElements: SceneNode[] = [];

      const rowBg = figma.createRectangle();
      rowBg.name = "Row Background";
      rowBg.resize(tableWidth, ROW_HEIGHT);
      rowBg.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
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
      tokenText.fills = [{type: "SOLID", color: {r: 0.85, g: 0.1, b: 0.1}}];
      tokenText.resize(col2Width, tokenText.height);
      tokenText.textAutoResize = "HEIGHT";
      tokenText.x = Math.floor(tableWidth * 0.4);
      tokenText.y = 12;
      rowElements.push(tokenText);

      // Adjust row height if text wraps
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
            color: {r: 0.5, g: 0.5, b: 0.5},
            boundVariables: {
              color: {
                type: "VARIABLE_ALIAS",
                id: colorEntry.colorVariableId,
              },
            },
          },
        ];
      } else {
        colorCircle.fills = [
          {type: "SOLID", color: hexToRgb(colorEntry.colorHex)},
        ];
      }
      colorCircle.strokes = [
        {type: "SOLID", color: {r: 0.85, g: 0.85, b: 0.85}},
      ];
      colorCircle.strokeWeight = 1;
      rowElements.push(colorCircle);

      groupElementsAndAppend(
        rowElements,
        colorEntry.displayText,
        tableContainer,
      );
    }
  }

  parent.appendChild(tableContainer);
}
