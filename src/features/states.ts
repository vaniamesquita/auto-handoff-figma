import { VariantColors } from "../types";
import { getFont, substituteUnavailableFontsInNode } from "../utils/fonts";
import { createSectionTitle } from "../ui/table-builder";
import { createSectionContainer, filterVariantsForVisualization } from "./common";

export async function createEstadosSection(
  parent: FrameNode,
  component: ComponentSetNode,
  variantColors: VariantColors[],
  tableWidth: number,
  highlightMode: boolean,
  framesPerRow: number = 4,
  vizPropertyFilters: Record<string, string[]> = {},
  statesVariantPropertyOrder?: string[],
): Promise<boolean> {
  // Filtrar variantes conforme seleção do usuário
  const filteredVariants = filterVariantsForVisualization(
    variantColors,
    vizPropertyFilters,
  );

  if (filteredVariants.length === 0) {
    return false;
  }

  // Mapear para estrutura com nome e node
  const variants: {name: string; node: ComponentNode; vc: VariantColors}[] = [];

  for (const vc of filteredVariants) {
    // Encontrar o ComponentNode correspondente
    const variantNode = component.children.find((child) => {
      if (child.type !== "COMPONENT") return false;
      const childName = child.name;
      const matches = Object.entries(vc.propertyMap).every(([key, value]) => {
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
      // Formatar nome da variante respeitando a ordem E os filtros selecionados
      let propertyValues: string;

      // Determinar quais propriedades incluir no nome
      const propsToInclude = statesVariantPropertyOrder && statesVariantPropertyOrder.length > 0
        ? statesVariantPropertyOrder
        : Object.keys(vc.propertyMap);

      // Filtrar apenas propriedades que têm valores selecionados nos filtros
      // IMPORTANTE: Se uma propriedade tem filtro mas NENHUM valor selecionado,
      // essa propriedade NÃO deve aparecer no nome
      propertyValues = propsToInclude
        .filter(propName => {
          const propValue = vc.propertyMap[propName];
          if (!propValue) return false;

          // Se vizPropertyFilters está vazio, incluir todas
          if (Object.keys(vizPropertyFilters).length === 0) return true;

          // Se a propriedade não está nos filtros, incluir
          if (!vizPropertyFilters[propName]) return true;

          // Se a propriedade está nos filtros mas array vazio, NÃO incluir
          // (significa que o usuário desmarcou todos os valores dessa propriedade)
          if (vizPropertyFilters[propName].length === 0) return false;

          // Incluir apenas se o valor está nos filtros selecionados
          return vizPropertyFilters[propName].includes(propValue);
        })
        .map(propName => vc.propertyMap[propName])
        .filter(value => value !== undefined)
        .join(' / ');

      const variantName = propertyValues || vc.variantName || variantNode.name;
      variants.push({name: variantName, node: variantNode, vc});
    }
  }

  const section = createSectionContainer("Seção Estados");
  createSectionTitle("Estados", section);

  const GRID_GAP = 16;
  const CARD_PADDING = 24;
  const COLUMNS = framesPerRow;
  const cardWidth = Math.floor(
    (tableWidth - GRID_GAP * (COLUMNS - 1)) / COLUMNS,
  );

  // First pass: calculate max height needed
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
    substituteUnavailableFontsInNode(tempInstance);
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
      card.resize(cardWidth, maxCardHeight); // Use max height
      card.paddingTop = CARD_PADDING;
      card.paddingBottom = CARD_PADDING;
      card.paddingLeft = CARD_PADDING;
      card.paddingRight = CARD_PADDING;
      card.itemSpacing = 16;
      const cardBgColor = highlightMode
        ? {r: 56 / 255, g: 83 / 255, b: 255 / 255}
        : {r: 0xFE / 255, g: 0xFE / 255, b: 0xFE / 255};
      card.fills = [{type: "SOLID", color: cardBgColor}];
      card.cornerRadius = 8;

      const label = figma.createText();
      label.fontName = getFont("Regular");
      label.fontSize = 14;
      label.characters = `${String(index).padStart(2, "0")}. ${variant.name}`;
      const labelColor = highlightMode
        ? {r: 98 / 255, g: 248 / 255, b: 79 / 255}
        : {r: 0.4, g: 0.4, b: 0.4};
      label.fills = [{type: "SOLID", color: labelColor}];
      card.appendChild(label);

      const instance = variant.node.createInstance();
      substituteUnavailableFontsInNode(instance);
      card.appendChild(instance);

      row.appendChild(card);
    }

    gridContainer.appendChild(row);
  }

  section.appendChild(gridContainer);
  parent.appendChild(section);
  return true;
}