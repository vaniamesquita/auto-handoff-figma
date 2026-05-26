// ========================================================================
// AUTO HANDOFF GENERATOR - FONT FALLBACK
// ========================================================================
// Padrão: Inter. Fallback: Roboto. BancoDoBrasil Textos só é usada quando
// explicitamente selecionada pelo usuário na aba Layout.

const FONT_CANDIDATES = ["Inter", "Roboto"] as const;
const FONT_STYLES = ["Regular", "Medium", "Bold"] as const;
export type PluginFontStyle = (typeof FONT_STYLES)[number];

let resolvedFontFamily: string | null = null;

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
