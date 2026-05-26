import { VariantProperty } from "../types";
import { getFont } from "../utils/fonts";
import { SIZE_ORDER } from "../config/theme";
import { createSectionTitle } from "../ui/table-builder";
import { createSectionContainer } from "./common";

interface NestedInstanceInfo {
  instanceName: string;
  componentSetName: string;
  propDefs: ComponentPropertyDefinitions;
}

const BLUE_COLOR: RGB = {r: 49 / 255, g: 53 / 255, b: 217 / 255};
const GRAY_COLOR: RGB = {r: 0.4, g: 0.4, b: 0.4};
const WHITE_COLOR: RGB = {r: 1, g: 1, b: 1};

async function resolveInstanceSwapDefault(def: ComponentPropertyDefinitions[string]): Promise<string> {
  if (!def.defaultValue) return "";
  try {
    const node = await figma.getNodeByIdAsync(String(def.defaultValue));
    if (node && "name" in node) return node.name;
  } catch {}
  return "";
}

function cleanComponentSetName(name: string): string {
  // Strip structural prefixes like ".Asset / " or "._" etc.
  return name.replace(/^[._-]\s*(?:Asset\s*\/\s*)?/i, "");
}

function createTableHeader(parent: FrameNode, colWidths: number[], headers: string[]) {
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
    headerText.fills = [{type: "SOLID", color: GRAY_COLOR}];
    headerCell.appendChild(headerText);
    headerRow.appendChild(headerCell);
  }
  parent.appendChild(headerRow);
}

function createPropertyRow(
  tableContainer: FrameNode,
  colWidths: number[],
  propName: string,
  typeIcon: string,
  typeName: string,
  innerTableWidth: number,
): {row: FrameNode; valueCell: FrameNode} {
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
  row.strokes = [{type: "SOLID", color: {r: 0.9, g: 0.9, b: 0.9}}];
  row.strokeTopWeight = 1;
  row.strokeBottomWeight = 0;
  row.strokeLeftWeight = 0;
  row.strokeRightWeight = 0;
  row.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];

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
  propText.fills = [{type: "SOLID", color: {r: 0.2, g: 0.2, b: 0.2}}];
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
  iconText.fills = [{type: "SOLID", color: BLUE_COLOR}];
  typeCell.appendChild(iconText);

  const typeNameText = figma.createText();
  typeNameText.fontName = getFont("Regular");
  typeNameText.fontSize = 14;
  typeNameText.characters = typeName;
  typeNameText.fills = [{type: "SOLID", color: GRAY_COLOR}];
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
  return {row, valueCell};
}

function addVariantBadges(valueCell: FrameNode, options: string[], defaultValue: string | boolean | undefined) {
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
      badge.fills = [{type: "SOLID", color: BLUE_COLOR}];
    } else {
      badge.fills = [];
      badge.strokes = [{type: "SOLID", color: BLUE_COLOR}];
      badge.strokeWeight = 1;
    }

    const optionText = figma.createText();
    optionText.fontName = getFont("Medium");
    optionText.fontSize = 12;
    optionText.characters = option;
    optionText.fills = [
      {type: "SOLID", color: isDefault ? WHITE_COLOR : BLUE_COLOR},
    ];
    badge.appendChild(optionText);
    valueCell.appendChild(badge);
  }
}

function addBooleanToggle(valueCell: FrameNode, defaultValue: string | boolean | undefined) {
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
      color: isTrue ? BLUE_COLOR : {r: 0.8, g: 0.8, b: 0.8},
    },
  ];

  const knob = figma.createEllipse();
  knob.resize(16, 16);
  knob.x = isTrue ? 18 : 2;
  knob.y = 2;
  knob.fills = [{type: "SOLID", color: WHITE_COLOR}];
  toggle.appendChild(knob);
  toggleContainer.appendChild(toggle);

  const boolText = figma.createText();
  boolText.fontName = getFont("Regular");
  boolText.fontSize = 14;
  boolText.characters = isTrue ? "True" : "False";
  boolText.fills = [{type: "SOLID", color: GRAY_COLOR}];
  toggleContainer.appendChild(boolText);

  valueCell.appendChild(toggleContainer);
}

function addTextValue(valueCell: FrameNode, defaultValue: string | boolean | undefined) {
  const textValue = figma.createText();
  textValue.fontName = getFont("Regular");
  textValue.fontSize = 14;
  textValue.characters = String(defaultValue || "");
  textValue.fills = [{type: "SOLID", color: {r: 0.2, g: 0.2, b: 0.2}}];
  valueCell.appendChild(textValue);
}

function addInstanceSwapValue(valueCell: FrameNode, resolvedName: string) {
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
  badge.fills = [{type: "SOLID", color: BLUE_COLOR}];

  const optionText = figma.createText();
  optionText.fontName = getFont("Medium");
  optionText.fontSize = 12;
  optionText.characters = resolvedName;
  optionText.fills = [{type: "SOLID", color: WHITE_COLOR}];
  badge.appendChild(optionText);
  valueCell.appendChild(badge);
}

async function collectNestedInstances(component: ComponentSetNode): Promise<NestedInstanceInfo[]> {
  const results: NestedInstanceInfo[] = [];
  const seenCompSetIds = new Set<string>();

  for (const variant of component.children) {
    if (variant.type !== "COMPONENT") continue;

    // Recurse through frames but NOT into instances
    async function scanNode(node: SceneNode) {
      if (node.type === "INSTANCE") {
        const inst = node as InstanceNode;
        if (!(inst as any).isExposedInstance) return;

        const mainComp = await inst.getMainComponentAsync();
        if (!mainComp) return;

        let compSetName: string | null = null;
        let propDefs: ComponentPropertyDefinitions | null = null;
        let compSetId: string | null = null;

        if (mainComp.parent?.type === "COMPONENT_SET") {
          compSetName = mainComp.parent.name;
          propDefs = mainComp.parent.componentPropertyDefinitions;
          compSetId = mainComp.parent.id;
        }

        // Use compSetId + instanceName as unique key to allow duplicates from different component sets
        const uniqueKey = `${compSetId || mainComp.id}::${inst.name}`;
        if (seenCompSetIds.has(uniqueKey)) return;
        seenCompSetIds.add(uniqueKey);

        results.push({
          instanceName: inst.name,
          componentSetName: compSetName ? cleanComponentSetName(compSetName) : inst.name,
          propDefs: propDefs || {},
        });
        // Don't recurse into instances
        return;
      }

      if ("children" in node) {
        for (const child of (node as FrameNode).children) {
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

async function renderPropertyDef(
  tableContainer: FrameNode,
  colWidths: number[],
  innerTableWidth: number,
  key: string,
  def: ComponentPropertyDefinitions[string],
) {
  const propName = key.split("#")[0];

  let typeIcon = "◆";
  let typeName = "Variant";
  if (def.type === "BOOLEAN") {
    typeIcon = "⊙";
    typeName = "Boolean";
  } else if (def.type === "TEXT") {
    typeIcon = "T";
    typeName = "Text";
  } else if (def.type === "INSTANCE_SWAP") {
    typeIcon = "◇";
    typeName = "Instance Swap";
  }

  const {valueCell} = createPropertyRow(
    tableContainer, colWidths, propName, typeIcon, typeName, innerTableWidth,
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

export async function createPropertiesSection(
  parent: FrameNode,
  component: ComponentSetNode,
  tableWidth: number,
): Promise<boolean> {
  if (!component.componentPropertyDefinitions) {
    return false;
  }

  const propDefs = component.componentPropertyDefinitions;
  const propKeys = Object.keys(propDefs);
  if (propKeys.length === 0) return false;

  // Sort properties: Variants first, then others (Boolean/Text/InstanceSwap) keeping related pairs together
  const allPropsWithIndex = propKeys.map((key, index) => ({
    key,
    def: propDefs[key],
    originalIndex: index,
  }));

  const variants = allPropsWithIndex.filter((p) => p.def.type === "VARIANT");
  const others = allPropsWithIndex.filter((p) => p.def.type !== "VARIANT");

  others.sort((a, b) => {
    const aKeyLower = a.key.split("#")[0].toLowerCase();
    const bKeyLower = b.key.split("#")[0].toLowerCase();

    if (a.def.type === "BOOLEAN" && b.def.type === "TEXT") {
      if (
        bKeyLower.includes(aKeyLower) ||
        bKeyLower.startsWith("text " + aKeyLower)
      ) {
        return -1;
      }
    }
    if (b.def.type === "BOOLEAN" && a.def.type === "TEXT") {
      if (
        aKeyLower.includes(bKeyLower) ||
        aKeyLower.startsWith("text " + bKeyLower)
      ) {
        return 1;
      }
    }

    return a.originalIndex - b.originalIndex;
  });

  const allProps = [...variants, ...others];

  const section = createSectionContainer("Seção Propriedades", 32);
  section.paddingLeft = 32;
  section.paddingRight = 32;
  section.paddingTop = 32;
  section.paddingBottom = 32;
  section.fills = [{type: "SOLID", color: {r: 1, g: 1, b: 1}}];
  section.cornerRadius = 8;
  createSectionTitle(`❖ ${component.name} Properties`, section);

  const innerTableWidth = tableWidth - 64;
  const colWidths = [
    Math.floor(innerTableWidth * 0.25),
    Math.floor(innerTableWidth * 0.2),
    Math.floor(innerTableWidth * 0.55),
  ];
  const headers = ["PROPERTY", "TYPE", "DEFAULT / OPTIONS"];

  // === Main Properties Table ===
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

  // === Real Nested Instances ===
  const nestedInstances = await collectNestedInstances(component);

  if (nestedInstances.length > 0) {
    const nestedTitle = figma.createText();
    nestedTitle.fontName = getFont("Bold");
    nestedTitle.fontSize = 24;
    nestedTitle.characters = "◇ Nested Instances";
    section.appendChild(nestedTitle);

    for (const nested of nestedInstances) {
      const nestedPropKeys = Object.keys(nested.propDefs);
      if (nestedPropKeys.length === 0) continue;

      // Sub-title with instance name and component set name
      const instanceLabel = figma.createText();
      instanceLabel.fontName = getFont("Medium");
      instanceLabel.fontSize = 16;
      instanceLabel.characters = `◇ ${nested.instanceName}`;
      if (nested.componentSetName !== nested.instanceName) {
        instanceLabel.characters = `◇ ${nested.instanceName} (${nested.componentSetName})`;
      }
      instanceLabel.fills = [{type: "SOLID", color: {r: 0.2, g: 0.2, b: 0.2}}];
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

      // Sort nested props same way: variants first, then others
      const nestedPropsWithIndex = nestedPropKeys.map((key, index) => ({
        key,
        def: nested.propDefs[key],
        originalIndex: index,
      }));
      const nestedVariants = nestedPropsWithIndex.filter(p => p.def.type === "VARIANT");
      const nestedOthers = nestedPropsWithIndex.filter(p => p.def.type !== "VARIANT");
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

export function extractVariantProperties(
  componentSet: ComponentSetNode,
): VariantProperty[] {
  const properties: VariantProperty[] = [];
  const propDefs = componentSet.componentPropertyDefinitions;

  if (propDefs && Object.keys(propDefs).length > 0) {
    for (const [name, def] of Object.entries(propDefs)) {
      if (def.type === "VARIANT" && def.variantOptions) {
        const sizeOrder: Record<string, number> = SIZE_ORDER;
        const sortedValues = [...def.variantOptions].sort((a, b) => {
          const aLower = a.toLowerCase();
          const bLower = b.toLowerCase();
          const aOrder = sizeOrder[aLower] ?? 99;
          const bOrder = sizeOrder[bLower] ?? 99;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return a.localeCompare(b);
        });
        properties.push({name: name.toLowerCase(), values: sortedValues});
      }
    }
  }

  if (properties.length === 0) {
    const propertiesMap: Map<string, Set<string>> = new Map();

    for (const child of componentSet.children) {
      if (child.type !== "COMPONENT") continue;

      const parts = child.name.split(",").map((p) => p.trim());
      for (const part of parts) {
        const [key, value] = part.split("=").map((s) => s.trim());
        if (key && value) {
          const normalizedKey = key.toLowerCase();
          if (!propertiesMap.has(normalizedKey)) {
            propertiesMap.set(normalizedKey, new Set());
          }
          propertiesMap.get(normalizedKey)!.add(value);
        }
      }
    }

    for (const [name, values] of propertiesMap) {
      const sortedValues = Array.from(values).sort((a, b) => {
        const sizeOrder: Record<string, number> = SIZE_ORDER;
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const orderA = sizeOrder[aLower] ?? 99;
        const orderB = sizeOrder[bLower] ?? 99;
        if (orderA !== orderB) return orderA - orderB;
        return a.localeCompare(b);
      });
      properties.push({name, values: sortedValues});
    }
  }

  return properties;
}
