// ========================================================================
// AUTO HANDOFF GENERATOR - FONT FALLBACK
// ========================================================================
// Padrão: Inter. Fallback: Roboto. BancoDoBrasil Textos só é usada quando
// explicitamente selecionada pelo usuário na aba Layout.

const FONT_CANDIDATES = ["Inter", "Roboto"] as const;
const FONT_STYLES = ["Regular", "Medium", "Bold"] as const;
export type PluginFontStyle = (typeof FONT_STYLES)[number];

let resolvedFontFamily: string | null = null;

// Conjunto completo de famílias de fonte disponíveis neste Figma.
// Populado por setAvailableFontFamilies (chamado em loadComponentFonts).
// Quando null, substituteUnavailableFontsInNode faz a varredura igualmente
// — nesse caso usa a lista negativa _unavailableFamilies como fallback.
let _availableFontFamilies: Set<string> | null = null;

// Mantido para compatibilidade com o fluxo de scan de componentes.
// Usado apenas quando _availableFontFamilies ainda não foi inicializado.
let _unavailableFamilies: Set<string> = new Set();

/**
 * Carrega as fontes do plugin com fallback.
 * Se preferredFamily for informada, tenta ela primeiro; caso contrário,
 * usa a ordem padrão: Inter → Roboto.
 * Idempotente por sessão: se já carregou sem preferência explícita, retorna cached.
 */
export async function loadPluginFonts(preferredFamily?: string): Promise<string> {
  // Reset cache quando uma preferência explícita é fornecida
  if (preferredFamily && preferredFamily !== resolvedFontFamily) {
    resolvedFontFamily = null;
  }

  if (resolvedFontFamily) return resolvedFontFamily;

  // Candidatos: preferida na frente, sem duplicatas
  const candidates: string[] = preferredFamily
    ? [preferredFamily, ...FONT_CANDIDATES.filter(f => f !== preferredFamily)]
    : [...FONT_CANDIDATES];

  for (const family of candidates) {
    try {
      for (const style of FONT_STYLES) {
        await figma.loadFontAsync({family, style});
      }
      resolvedFontFamily = family;
      return family;
    } catch {
      // Próximo candidato
    }
  }

  // Último recurso: Inter (fonte padrão do Figma)
  resolvedFontFamily = "Inter";
  try {
    for (const style of FONT_STYLES) {
      await figma.loadFontAsync({family: "Inter", style});
    }
  } catch {
    // Ignora; getFont usará "Inter" mesmo assim
  }
  return resolvedFontFamily;
}

/**
 * Retorna a família de fonte resolvida (após loadPluginFonts).
 * Fallback síncrono: "Inter" se ainda não carregou.
 */
export function getResolvedFontFamily(): string {
  return resolvedFontFamily ?? "Inter";
}

/**
 * Retorna { family, style } para uso em textNode.fontName.
 * Usar apenas após loadPluginFonts() ter sido await.
 */
export function getFont(
  style: "Regular" | "Medium" | "Bold",
): {family: string; style: string} {
  return {family: getResolvedFontFamily(), style};
}

// ========================================
// FONT SUBSTITUTION FOR VISUALIZATION
// ========================================

/**
 * Registra o conjunto completo de famílias disponíveis neste Figma
 * (output de figma.listAvailableFontsAsync). Usado por
 * substituteUnavailableFontsInNode para detectar fontes ausentes
 * sem depender de uma varredura prévia do componente.
 */
export function setAvailableFontFamilies(families: Set<string>): void {
  _availableFontFamilies = families;
}

/**
 * @deprecated Use setAvailableFontFamilies para abordagem mais robusta.
 * Mantido para compatibilidade com chamadas existentes em main.ts.
 */
export function setUnavailableFontFamilies(families: Set<string>): void {
  _unavailableFamilies = families;
}

/**
 * Mapeia um style name arbitrário para o estilo suportado pelo plugin mais próximo.
 */
function mapToPluginStyle(style: string): PluginFontStyle {
  const s = style.toLowerCase();
  if (s.includes("bold") || /[789]00/.test(s)) return "Bold";
  if (s.includes("medium") || s.includes("semi") || /[56]00/.test(s)) return "Medium";
  return "Regular";
}

/**
 * Verifica se uma família de fonte está disponível neste Figma.
 * Usa _availableFontFamilies quando disponível (positivo e completo),
 * caso contrário cai no _unavailableFamilies (negativo, pode ser incompleto).
 */
function isFamilyAvailable(family: string): boolean {
  if (_availableFontFamilies !== null) {
    return _availableFontFamilies.has(family);
  }
  // Fallback: a família é considerada disponível a menos que tenha falhado
  return !_unavailableFamilies.has(family);
}

/**
 * Percorre a árvore de um nó (tipicamente uma InstanceNode recém-criada) e
 * substitui o fontName de todo TextNode cuja família não está disponível neste
 * Figma pelo font resolvido do plugin. Deve ser chamado após createInstance()
 * e antes de appendChild() para evitar erros de "unloaded font".
 *
 * Não depende de varredura prévia do componente — usa o catálogo completo de
 * fontes disponíveis obtido por setAvailableFontFamilies().
 */
export function substituteUnavailableFontsInNode(root: SceneNode): void {
  function walk(node: BaseNode): void {
    if (node.type === "TEXT") {
      const textNode = node as TextNode;
      if (!textNode.characters.length) return;
      const fn = textNode.fontName;
      if (fn === figma.mixed) {
        // Fontes mistas: substitui o nó inteiro pelo plugin font Regular
        textNode.fontName = getFont("Regular") as FontName;
      } else if (!isFamilyAvailable(fn.family)) {
        textNode.fontName = getFont(mapToPluginStyle(fn.style)) as FontName;
      }
    }
    if ("children" in node) {
      for (const child of (node as ChildrenMixin).children) {
        walk(child);
      }
    }
  }

  walk(root);
}
