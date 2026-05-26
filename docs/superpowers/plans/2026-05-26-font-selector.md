# Font Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar um seletor de fonte na aba Layout do plugin, com verificação de disponibilidade no Figma do usuário antes de exibir as opções.

**Architecture:** O plugin sandbox verifica quais das 3 fontes candidatas estão instaladas no Figma e envia a lista à UI via mensagem `init`. A UI monta o `<select>` dinamicamente apenas com as fontes disponíveis. A fonte escolhida é enviada como parte das `GenerationOptions` e passada para `loadPluginFonts()`, que prioriza a família preferida e mantém o fallback existente.

**Tech Stack:** TypeScript, esbuild, Figma Plugin API, HTML/JS vanilla

---

## File Map

| Arquivo | Mudança |
|---|---|
| `src/types/index.ts` | Adicionar `fontFamily?: string` em `GenerationOptions` |
| `src/utils/fonts.ts` | `loadPluginFonts(preferredFamily?: string)` — reseta cache quando família é informada, tenta preferida primeiro |
| `src/main.ts` | Adicionar `checkAvailableFonts()`; incluir `availableFonts` nos dois `postMessage init`; passar `options.fontFamily` em `loadPluginFonts()` |
| `ui.html` | CSS para `select` em `.layout-setting-input`; `<select id="fontFamily">` na aba Layout; popular no handler `init`; incluir em `getSelectedOptions()` |

---

## Task 1: Adicionar `fontFamily` em `GenerationOptions`

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Adicionar o campo ao tipo**

Em `src/types/index.ts`, localizar a interface `GenerationOptions`. Após a linha `bgColor: string;`, adicionar:

```typescript
  // Font
  fontFamily?: string;
```

O bloco de configurações ficará assim:

```typescript
  // Settings
  frameWidth: number;
  paddingHorizontal: number;
  sectionSpacingValue: number;
  bgColor: string;
  // Font
  fontFamily?: string;
```

- [ ] **Step 2: Verificar tipo**

```bash
npm run build:check
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(types): add fontFamily to GenerationOptions"
```

---

## Task 2: Modificar `loadPluginFonts` para aceitar família preferida

**Files:**
- Modify: `src/utils/fonts.ts`

- [ ] **Step 1: Atualizar a função `loadPluginFonts`**

Substituir a função atual inteiramente pelo código abaixo. A única mudança lógica é: aceitar `preferredFamily` opcional → resetar o cache → montar candidatos com a preferida na frente:

```typescript
/**
 * Carrega as fontes do plugin com fallback.
 * Se preferredFamily for informada, tenta ela primeiro; caso contrário,
 * usa a ordem padrão: BancoDoBrasil Textos → Inter → Roboto.
 * Idempotente por sessão: se já carregou sem preferência explícita, retorna cached.
 */
export async function loadPluginFonts(preferredFamily?: string): Promise<string> {
  // Reset cache quando uma preferência explícita é fornecida
  if (preferredFamily) {
    resolvedFontFamily = null;
  }

  if (resolvedFontFamily) return resolvedFontFamily;

  // Candidatos: preferida na frente, sem duplicatas
  const candidates: string[] = preferredFamily
    ? [preferredFamily, ...["BancoDoBrasil Textos", "Inter", "Roboto"].filter(f => f !== preferredFamily)]
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
```

- [ ] **Step 2: Verificar tipo**

```bash
npm run build:check
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/utils/fonts.ts
git commit -m "feat(fonts): accept preferredFamily in loadPluginFonts"
```

---

## Task 3: Adicionar `checkAvailableFonts` e atualizar `main.ts`

**Files:**
- Modify: `src/main.ts`

- [ ] **Step 1: Adicionar a função `checkAvailableFonts`**

Após o bloco `// MAIN INITIALIZATION` (antes de `async function main()`), inserir:

```typescript
// ========================================
// FONT AVAILABILITY CHECK
// ========================================

/**
 * Verifica quais fontes candidatas estão disponíveis no Figma do usuário.
 * Tenta carregar apenas o estilo "Regular" de cada candidata.
 * @returns Lista de famílias disponíveis
 */
async function checkAvailableFonts(): Promise<string[]> {
  const candidates = ["BancoDoBrasil Textos", "Inter", "Roboto"];
  const available: string[] = [];
  for (const family of candidates) {
    try {
      await figma.loadFontAsync({family, style: "Regular"});
      available.push(family);
    } catch {
      // fonte não disponível neste Figma
    }
  }
  return available;
}
```

- [ ] **Step 2: Chamar `checkAvailableFonts` no início de `main` e incluir no postMessage do caso zero-seleção**

Localizar o início de `async function main()`. Após a linha `const selection = figma.currentPage.selection;`, adicionar:

```typescript
  const availableFonts = await checkAvailableFonts();
```

Em seguida, localizar o bloco `if (validNodes.length === 0)` e adicionar `availableFonts` ao postMessage:

```typescript
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
```

- [ ] **Step 3: Incluir `availableFonts` no postMessage principal do `init`**

Localizar o `figma.ui.postMessage` ao final de `main()` (que envia `type: "init"`, `componentName`, etc.) e adicionar o campo:

```typescript
  figma.ui.postMessage({
    type: "init",
    componentName: displayName,
    variantProperties: mergedVariantProperties,
    hasVariants: mergedVariantProperties.length > 0,
    selectionCount: validNodes.length,
    nodeType: nodeType,
    availableFonts,
  });
```

- [ ] **Step 4: Passar `options.fontFamily` para `loadPluginFonts` em `generateSpec`**

Localizar a linha `await loadPluginFonts();` dentro de `generateSpec` (linha ~294) e substituir por:

```typescript
  await loadPluginFonts(options.fontFamily);
```

- [ ] **Step 5: Verificar tipos e build**

```bash
npm run build:check
npm run build
```

Esperado: sem erros, `code.js` regenerado.

- [ ] **Step 6: Commit**

```bash
git add src/main.ts
git commit -m "feat(main): check available fonts and pass fontFamily to loadPluginFonts"
```

---

## Task 4: Adicionar seletor de fonte na UI

**Files:**
- Modify: `ui.html`

- [ ] **Step 1: Adicionar CSS para `select` dentro de `.layout-setting-input`**

Localizar o bloco CSS da classe `.layout-setting-input input:focus` (por volta da linha 695). Logo após esse bloco, inserir:

```css
    .layout-setting-input select {
      padding: 6px 8px;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 11px;
      color: var(--text-primary);
      background: var(--bg-secondary);
      transition: var(--transition);
      cursor: pointer;
      min-width: 120px;
    }

    .layout-setting-input select:focus {
      outline: none;
      box-shadow: 0 0 0 2px var(--accent-light);
    }
```

- [ ] **Step 2: Adicionar o controle HTML na aba Layout**

Localizar o bloco da aba Layout (`<!-- Layout Tab -->`). Após o último `<div class="layout-setting">` existente (o da "Cor de fundo"), inserir:

```html
      <div class="layout-setting">
        <span class="layout-setting-label">Fonte</span>
        <div class="layout-setting-input">
          <select id="fontFamily">
            <option value="Inter">Inter</option>
          </select>
        </div>
      </div>
```

O `<select>` começa apenas com Inter; as outras opções serão injetadas dinamicamente pelo JS quando o `init` chegar.

- [ ] **Step 3: Popular o `<select>` no handler `init`**

Localizar o bloco `} else if (msg.type === 'init') {` no `window.onmessage`. Ao final desse bloco (antes do `}`), adicionar:

```javascript
        // Popular seletor de fonte com as fontes disponíveis no Figma do usuário
        if (msg.availableFonts && Array.isArray(msg.availableFonts)) {
          const fontSelect = document.getElementById('fontFamily');
          fontSelect.innerHTML = '';
          const FONT_LABELS = {
            'Inter': 'Inter',
            'Roboto': 'Roboto',
            'BancoDoBrasil Textos': 'Banco do Brasil Textos',
          };
          msg.availableFonts.forEach(family => {
            const option = document.createElement('option');
            option.value = family;
            option.textContent = FONT_LABELS[family] || family;
            if (family === 'Inter') option.selected = true;
            fontSelect.appendChild(option);
          });
        }
```

- [ ] **Step 4: Incluir `fontFamily` em `getSelectedOptions()`**

Localizar a função `getSelectedOptions()` e, dentro do objeto retornado, após a linha `bgColor: document.getElementById('bgColor').value || 'FFFFFF',`, adicionar:

```javascript
        fontFamily: document.getElementById('fontFamily').value || 'Inter',
```

- [ ] **Step 5: Build e verificação manual no Figma Desktop**

```bash
npm run build
```

Esperado: sem erros.

Abrir no Figma Desktop (Plugins → Development → Import plugin → selecionar `manifest.json`):
1. Aba **Layout** deve exibir o campo "Fonte" com Inter selecionado por padrão
2. Se o Figma tiver Roboto: "Roboto" deve aparecer como opção
3. "Banco do Brasil Textos" só deve aparecer se instalada
4. Gerar uma spec — os textos do frame gerado devem usar a fonte selecionada

- [ ] **Step 6: Commit**

```bash
git add ui.html
git commit -m "feat(ui): add font selector to Layout tab"
```

---

## Task 5: Push

- [ ] **Step 1: Push para o repositório remoto**

```bash
git push origin main
```
