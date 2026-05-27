import { VariantColors } from "../types";
import { getFont, substituteUnavailableFontsInNode } from "../utils/fonts";
import { createSectionTitle } from "../ui/table-builder";
import { createSectionContainer } from "./common";
import { createSimpleAnnotation } from "../ui/annotations";

export async function createUsedComponentsSectionAutoLayout(
  parent: FrameNode,
  variantColors: VariantColors[],
  tableWidth: number,
  mainComponents: (ComponentNode | ComponentSetNode | InstanceNode)[] = [],
  highlightMode: boolean = false,
): Promise<boolean> {
  const componentMap = new Map<string, string>();
  for (const variant of variantColors) {
    for (const [compId, compName] of variant.usedComponents) {
      const lowerName = compName.toLowerCase();

      // Filtra estruturais (. ou _) E utilitários de espaço (Space...)
      if (
        compName.startsWith(".") ||
        compName.startsWith("_") ||
        lowerName.startsWith("space") // Cobre "Space", "Spaced", "Spacer"
      ) {
        continue;
      }

      componentMap.set(compId, compName);
    }
  }
  if (componentMap.size === 0) return false;

  const section = createSectionContainer("Seção Componentes Utilizados");
  createSectionTitle("Componentes e ícones utilizados", section);

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
  const containerBgColor: RGB = highlightMode
    ? {r: 56 / 255, g: 83 / 255, b: 255 / 255}
    : {r: 0xFE / 255, g: 0xFE / 255, b: 0xFE / 255};
  componentsContainer.fills = [{type: "SOLID", color: containerBgColor}];
  componentsContainer.cornerRadius = 8;

  const MAX_COMPONENTS_TO_SHOW = 100;
  const componentEntries = Array.from(componentMap.entries()).slice(
    0,
    MAX_COMPONENTS_TO_SHOW,
  );

  if (componentMap.size > MAX_COMPONENTS_TO_SHOW) {
    const warningText = figma.createText();
    warningText.fontName = getFont("Regular");
    warningText.fontSize = 12;
    warningText.characters = `Mostrando ${MAX_COMPONENTS_TO_SHOW} de ${componentMap.size} componentes`;
    warningText.fills = [{type: "SOLID", color: highlightMode ? {r: 1, g: 1, b: 1} : {r: 0.5, g: 0.5, b: 0.5}}];
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

    let foundComponent: ComponentNode | null = null;
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
        substituteUnavailableFontsInNode(instance);
        const maxSize = 180;

        if (instance.width > maxSize || instance.height > maxSize) {
          const scale = Math.min(
            maxSize / instance.width,
            maxSize / instance.height,
          );
          instance.rescale(scale);
        }
        card.appendChild(instance);
      } catch (e) {
        console.warn(`[Components] Failed to create instance for: ${displayName}`, e);
        const placeholder = figma.createRectangle();
        placeholder.resize(80, 80);
        placeholder.fills = [{type: "SOLID", color: {r: 0.9, g: 0.9, b: 0.9}}];
        placeholder.cornerRadius = 8;
        card.appendChild(placeholder);
      }
    } else {
      const placeholder = figma.createRectangle();
      placeholder.resize(80, 80);
      placeholder.fills = [{type: "SOLID", color: {r: 0.9, g: 0.9, b: 0.9}}];
      placeholder.cornerRadius = 8;
      card.appendChild(placeholder);
    }

    const nameText = figma.createText();
    nameText.fontName = getFont("Medium");
    nameText.fontSize = 12;
    nameText.characters = displayName;
    nameText.textAlignHorizontal = "CENTER";
    nameText.fills = [{type: "SOLID", color: highlightMode ? {r: 1, g: 1, b: 1} : {r: 0.2, g: 0.6, b: 0.2}}];
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
      highlightMode,
    );
  }

  parent.appendChild(section);
  return true;
}

async function createComponentAnatomyVisualization(
  parent: FrameNode,
  mainComponent: ComponentNode | ComponentSetNode | InstanceNode,
  componentMap: Map<string, string>,
  tableWidth: number,
  highlightMode: boolean = false,
): Promise<void> {
  if (componentMap.size === 0) return;

  const bgColor: RGB = highlightMode
    ? {r: 56 / 255, g: 83 / 255, b: 255 / 255}
    : {r: 1, g: 1, b: 1};

  const pointerColor: RGB = highlightMode
    ? {r: 98 / 255, g: 248 / 255, b: 79 / 255}
    : {r: 0xE5 / 255, g: 0x33 / 255, b: 0x33 / 255};

  const textColor: RGB = highlightMode
    ? {r: 1, g: 1, b: 1}
    : {r: 0.2, g: 0.2, b: 0.2};

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
  anatomyContainer.fills = [{type: "SOLID", color: bgColor}];
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

  const variants: ComponentNode[] = [];
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

  const componentsShown = new Set<string>();

  async function variantContainsComponent(
    variant: ComponentNode,
    targetComponentId: string,
  ): Promise<{found: boolean; x: number; y: number; w: number; h: number; instanceLabel: string}> {
    const result = {found: false, x: 0, y: 0, w: 0, h: 0, instanceLabel: ""};

    async function searchInNode(
      node: SceneNode,
      offsetX: number,
      offsetY: number,
    ): Promise<boolean> {
      if (node.type === "INSTANCE") {
        const mainComp = await node.getMainComponentAsync();
        if (mainComp && mainComp.id === targetComponentId) {
          result.found = true;
          result.x = offsetX + node.x;
          result.y = offsetY + node.y;
          result.w = node.width;
          result.h = node.height;

          // Build label with component name + variant property values
          const baseName = mainComp.parent?.type === "COMPONENT_SET"
            ? mainComp.parent.name
            : mainComp.name;
          const variantProps = (node as InstanceNode).variantProperties;
          const allowedKeys = ["Size", "Type", "Status", "State", "Kind", "Style"];
          if (variantProps) {
            const values = allowedKeys
              .filter(key => variantProps[key] !== undefined)
              .map(key => variantProps[key]);
            result.instanceLabel = values.length > 0
              ? `${baseName} / ${values.join(" / ")}`
              : baseName;
          } else {
            result.instanceLabel = baseName;
          }
          return true;
        }
      }
      if ("children" in node) {
        for (const child of (node as FrameNode).children) {
          const newOffsetX =
            node.type === "INSTANCE" ? offsetX : offsetX + node.x;
          const newOffsetY =
            node.type === "INSTANCE" ? offsetY : offsetY + node.y;
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

    let foundVariant: ComponentNode | null = null;
    let componentPosition = {found: false, x: 0, y: 0, w: 0, h: 0, instanceLabel: ""};

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
    substituteUnavailableFontsInNode(instance);

    const maxSize = 300;
    let scale = 1;
    if (instance.width > maxSize || instance.height > maxSize) {
      scale = Math.min(maxSize / instance.width, maxSize / instance.height);
      instance.rescale(scale);
    }

    const marginBottom = 10;
    const LINE_LENGTH = 30;

    // Calcula as dimensões escalonadas do sub-componente encontrado
    const scaledW = componentPosition.w * scale;
    const scaledH = componentPosition.h * scale;

    // Mede a largura do label para calcular posicionamento
    const measureText = figma.createText();
    measureText.fontName = getFont("Medium");
    measureText.fontSize = 11;
    measureText.characters = componentPosition.instanceLabel;
    const labelWidth = measureText.width;
    measureText.remove();

    // Calcula a margem esquerda necessária para que o label centralizado no target caiba
    const subCompCenterX = componentPosition.x * scale + scaledW / 2;
    const labelHalf = labelWidth / 2;
    const minLeftMargin = Math.max(20, labelHalf - subCompCenterX + 10);

    // Decide se o pointer fica em cima ou embaixo baseado na posição Y do elemento no frame
    const isTopHalf = componentPosition.y < (instance.height / 2);

    // Calcula marginTop baseado na posição do pointer
    const marginTop = isTopHalf ? LINE_LENGTH + 20 : 20;

    // Posiciona a instância com margem suficiente para o label
    instance.x = minLeftMargin;
    instance.y = marginTop;
    vizFrame.appendChild(instance);

    // Calcula posições escalonadas após posicionar a instância
    const scaledX = minLeftMargin + componentPosition.x * scale;
    const scaledY = marginTop + componentPosition.y * scale;

    // Ponto Alvo (onde a bolinha toca o componente)
    const targetX = scaledX + scaledW / 2;

    let startX: number, startY: number, endX: number, endY: number;
    let pointerType: "pointer-top" | "pointer-bottom";

    if (isTopHalf) {
      // Se o elemento está na metade superior, pointer fica ACIMA do elemento
      // A bolinha (start) toca o topo do elemento, o texto (end) fica acima
      pointerType = "pointer-top";

      // Start = onde fica a bolinha (toca o topo do elemento)
      startX = targetX;
      startY = scaledY;

      // End = onde fica o texto (acima do elemento)
      endX = targetX;
      endY = scaledY - LINE_LENGTH;
    } else {
      // Se o elemento está na metade inferior, pointer fica ABAIXO do elemento
      // A bolinha (start) toca a base do elemento, o texto (end) fica abaixo
      pointerType = "pointer-bottom";

      // Start = onde fica a bolinha (toca a base do elemento)
      startX = targetX;
      startY = scaledY + scaledH;

      // End = onde fica o texto (abaixo do elemento)
      endX = targetX;
      endY = scaledY + scaledH + LINE_LENGTH;
    }

    // Chamada padronizada ao sistema de anotações
    await createSimpleAnnotation(
      vizFrame,        // Container pai
      startX,          // X onde fica o texto
      startY,          // Y onde fica o texto
      endX,            // X onde toca o componente
      endY,            // Y onde toca o componente
      componentPosition.instanceLabel,  // O texto do label com variantes
      pointerColor,    // A cor do tema
      pointerType,     // "pointer-top" ou "pointer-bottom"
      "red",           // colorType (para o asset config/live editing)
      highlightMode,   // modo de contraste
      textColor,       // cor do texto
      11,              // tamanho da fonte
      "Medium"         // peso da fonte
    );

    // Ajusta o tamanho do frame: precisa caber a instância + espaço para o label à direita do targetX
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