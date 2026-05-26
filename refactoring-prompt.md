# Prompt de Refatoração — Auto Handoff Generator (Figma Plugin)

## Contexto

Este é um plugin para Figma chamado **Auto Handoff Generator**. Ele gera especificações visuais de componentes automaticamente (cores, tipografia, espaçamentos, efeitos, estados, propriedades). A estrutura atual do projeto é:

```
src/
├── main.ts
├── types/index.ts
├── core/
│   ├── traversal.ts
│   └── node-helpers.ts
├── features/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── effects.ts
│   ├── components.ts
│   ├── states.ts
│   ├── properties.ts
│   ├── requirements.ts
│   └── common.ts
├── ui/
│   ├── table-builder.ts
│   └── annotations.ts
├── config/
│   ├── theme.ts
│   └── icon-tokens.ts
├── utils/
│   ├── helpers.ts
│   └── fonts.ts
└── assets/
    └── marker-generator.ts
```

O build é feito com **esbuild** e gera um arquivo `code.js` que o Figma executa. A UI é um arquivo HTML (`ui.html`) que se comunica com o código do plugin via `postMessage`.

---

## Objetivo

Refatorar o código para eliminar duplicações, melhorar organização e aplicar melhores práticas — **sem quebrar nenhuma funcionalidade existente**. O plugin deve continuar funcionando exatamente igual após a refatoração.

---

## Regras Obrigatórias

1. **NÃO altere a lógica de negócio** — apenas reorganize, elimine duplicações e melhore a estrutura.
2. **NÃO altere `ui.html`** — a UI não faz parte desta refatoração.
3. **NÃO altere `types/index.ts`** — os tipos já estão bem organizados.
4. **Faça as alterações de forma incremental** — um arquivo de cada vez, testando o build (`npm run build`) após cada mudança significativa.
5. **Mantenha todas as exportações públicas iguais** — se uma função é exportada e usada em outro arquivo, ela deve continuar sendo exportada com o mesmo nome e assinatura.
6. **Mantenha a mesma estrutura de pastas** — não mova arquivos entre diretórios nem renomeie pastas.
7. **Antes de começar, rode `npm run build` para confirmar que o projeto compila sem erros.** Faça isso novamente após cada grupo de alterações.

---

## Problemas Identificados e O Que Fazer

### 1. DUPLICAÇÃO COMPLETA: `ui/annotations.ts` duplica funções que já existem em `features/spacing.ts` e são usadas em vários módulos

O arquivo `ui/annotations.ts` contém as funções canônicas de anotação visual:
- `findFreeYPosition`
- `findFreeXPosition`  
- `createAnnotationTracker`
- `createSimpleAnnotation`
- `annotateGapNew`
- `annotatePaddingNew`
- `annotateRadiusNew`
- `annotateBorderNew`
- `annotateDimensionNewSmart`

Porém, o arquivo `code.js` (build final) mostra que **essas mesmas funções existem duplicadas** — uma vez vindo de `ui/annotations.ts` e outra do bundle inlined. Isso acontece porque o esbuild compila tudo em um único arquivo.

**Ação:** Verificar se `ui/annotations.ts` é o único arquivo que define essas funções. Se `spacing.ts` ou outro módulo redefine localmente alguma dessas funções (como `findCornerRadius`, `findStrokeWeight`, `findHeightToken`, etc.), extraí-las para um local compartilhado. As funções de busca de tokens (`findCornerRadius`, `findCornerRadiusToken`, `findCornerRadiusRecursive`, `findCornerRadiusTokenRecursive`, `findAllHeightTokensWithNodes`, `findStrokeWeight`, `findHeightToken`, `findBoundVariableToken`) **estão definidas apenas em `spacing.ts`** mas são usadas tanto na visualização single-variant quanto no grid multi-variant. Elas devem ser movidas para `core/node-helpers.ts` ou para um novo arquivo `core/token-resolution.ts`, e `spacing.ts` deve importá-las de lá.

### 2. FUNÇÕES HELPER DUPLICADAS em `spacing.ts` que deveriam estar em `core/`

As seguintes funções em `spacing.ts` são utilitários genéricos de inspeção de nós, não específicas de espaçamento:

- `findCornerRadius(node)` — encontra border radius em um nó
- `findCornerRadiusRecursive(node)` — busca recursiva por border radius
- `findCornerRadiusToken(node)` — resolve token de border radius
- `findCornerRadiusTokenRecursive(node)` — busca recursiva por token de radius
- `findStrokeWeight(node)` — encontra stroke weight e posição
- `findHeightToken(node)` — encontra token de altura
- `findAllHeightTokensWithNodes(node)` — busca recursiva por tokens de altura
- `findBoundVariableToken(node, property, formatter)` — resolve token genérico de variável
- `hasElementsInArea(...)` — verifica colisão de elementos
- `getBestSideForHeightAnnotation(...)` — determina melhor lado para anotação
- `annotateStructuralComponentsDimensions(...)` — anota dimensões de componentes estruturais
- `formatDimensionToken(name)` — formata nome de token de dimensão
- `formatRadiusToken(name)` — formata nome de token de radius

**Ação:** Criar um novo arquivo `core/token-resolution.ts` e mover para lá:
- `findBoundVariableToken`
- `findHeightToken` + `formatDimensionToken`
- `findCornerRadius` + `findCornerRadiusToken` + `formatRadiusToken`
- `findCornerRadiusRecursive` + `findCornerRadiusTokenRecursive`
- `findAllHeightTokensWithNodes`
- `findStrokeWeight` (e sua interface `StrokeInfo` local)

Mover para `ui/annotations.ts` ou um novo `ui/layout-helpers.ts`:
- `hasElementsInArea`
- `getBestSideForHeightAnnotation`
- `annotateStructuralComponentsDimensions`

Atualizar os imports em `spacing.ts` para usar as novas localizações.

### 3. FORMATTERS DUPLICADOS entre `utils/helpers.ts` e `spacing.ts`

- `formatDimensionToken` em `spacing.ts` faz essencialmente o mesmo que o formatter inline usado em `traversal.ts` para tokens de dimensão.
- `formatRadiusToken` em `spacing.ts` replica lógica de formatação que existe inline em `traversal.ts`.

**Ação:** Mover `formatDimensionToken` e `formatRadiusToken` para `utils/helpers.ts` (junto com `formatToken`, `formatSpaceToken`, `formatEffectToken` que já estão lá). Atualizar todos os arquivos que usam formatters inline para importar dessas funções centralizadas. Especificamente, em `traversal.ts` existem funções anônimas `dimensionFormatter` e `radiusFormatter` definidas inline que devem ser substituídas por imports dos formatters centralizados.

### 4. LÓGICA `processSpacingNodeForViz` é muito longa

A função `processSpacingNodeForViz` em `spacing.ts` tem ~100 linhas e mistura responsabilidades (resolução de variáveis, criação de anotações de gap, criação de anotações de padding, recursão em filhos).

**Ação:** Não é necessário dividir em funções separadas se isso adicionar complexidade desnecessária. Porém, os blocos de resolução de `boundVariables` (para `itemSpacing` e para `paddingTop/Bottom/Left/Right`) seguem exatamente o mesmo padrão. Extrair uma helper como:

```typescript
async function resolveSpacingToken(
  node: SceneNode, 
  property: string
): Promise<string | null>
```

Que encapsule o padrão `if (property in boundVars) { binding = ...; variable = ...; return formatSpaceToken(...) }`.

### 5. PADRÃO REPETIDO: resolução de `strokeWeight` e `boundVariables`

Em `spacing.ts`, o seguinte padrão aparece 3 vezes (na visualização single-variant, no grid multi-variant, e no `annotateStructuralComponentsDimensions`):

```typescript
let varKey = stroke.side === "All" ? "strokeWeight" : `stroke${stroke.side}Weight`;
if (stroke.side === "All" && !(varKey in stroke.boundVars) && "strokeTopWeight" in stroke.boundVars) {
  varKey = "strokeTopWeight";
}
const binding = stroke.boundVars[varKey];
if (varKey in stroke.boundVars && binding?.id) {
  const variable = await figma.variables.getVariableByIdAsync(binding.id);
  if (variable) borderToken = formatSpaceToken(variable.name);
}
```

**Ação:** Extrair para uma função `resolveStrokeToken(stroke: StrokeInfo): Promise<string | null>` e usá-la nos 3 lugares.

### 6. `config/theme.ts` exporta constantes não relacionadas a tema

O arquivo `config/theme.ts` contém:
- Temas de cor (OK — pertence aqui)
- `IGNORED_PROPERTIES` — deveria estar em `utils/helpers.ts` ou `config/constants.ts`
- `SIZE_ORDER` — deveria estar em `config/constants.ts`
- `SEMANTIC_ROLES` — deveria estar em `config/constants.ts`
- `TEXT_COLORS` — OK para tema
- `VIZ_BG_COLOR` / `VIZ_BG_COLOR_HIGHLIGHT` — OK para tema
- `TEXT_STYLE_PRESETS`, `LAYOUT`, `FONT_FAMILY` — OK para tema
- `TextStylePreset` type — OK

**Ação:** Criar `config/constants.ts` e mover `IGNORED_PROPERTIES`, `SIZE_ORDER` e `SEMANTIC_ROLES` para lá. Atualizar imports em `traversal.ts`, `helpers.ts`, `common.ts`, `properties.ts`, `typography.ts`.

### 7. `annotateBorderNew` recebe `colorType` como string literal `"#993399"` em vez de tipo correto

Em `annotations.ts`, na função `annotateBorderNew`, o parâmetro `colorType` é passado como `"#993399"` — uma string hexadecimal literal — enquanto a tipagem espera `"red" | "blue" | "pink" | "green"`. Isso funciona em runtime porque o sistema de cores faz fallback, mas é um type-safety issue.

**Ação:** Adicionar `"purple"` ao mapa de cores em `marker-generator.ts` (e ao tipo `MarkerConfig.colorType` em `types/index.ts`) e usar `"purple"` em vez de `"#993399"` na chamada de `annotateBorderNew`. Alternativamente, deixar como está se o comportamento atual estiver correto, mas adicionar um comentário explicativo.

### 8. EXPORT BARREL MISSING

Não existe um `features/index.ts` que re-exporte todas as funções públicas dos features. O `main.ts` importa de `./features` o que sugere que existe (ou deveria existir) um barrel file.

**Ação:** Criar `features/index.ts` que re-exporte as funções públicas:

```typescript
export { createColorSectionCombined } from "./colors";
export { createTextSectionCombined } from "./typography";
export { createSpacingSectionCombined } from "./spacing";
export { createEffectsSectionCombined } from "./effects";
export { createUsedComponentsSectionAutoLayout } from "./components";
export { createEstadosSection } from "./states";
export { createPropertiesSection, extractVariantProperties } from "./properties";
export { createRequirementsSectionCombined } from "./requirements";
```

### 9. `requirements.ts` importa `collectVariantColors` de `traversal.ts` mas essa função não existe

Na linha de imports de `requirements.ts`:
```typescript
import {collectVariantColors} from "../core/traversal";
```

Mas `traversal.ts` não exporta nenhuma função chamada `collectVariantColors`. A função existe como `processComponent`. Esse import provavelmente é morto (não usado no corpo da função).

**Ação:** Remover o import não utilizado de `collectVariantColors` em `requirements.ts`.

### 10. `icon-tokens.ts` parece não ser usado em lugar nenhum

O arquivo `config/icon-tokens.ts` exporta `ICON_SIZE_TOKENS` e `getIconSizeToken`, mas nenhum outro arquivo no projeto importa esses exports.

**Ação:** Verificar se `icon-tokens.ts` é importado em algum lugar. Se não for usado, adicionar um comentário `// TODO: Integrate icon token resolution` ou removê-lo.

### 11. Consistência de naming e comentários

- Alguns comentários estão em português, outros em inglês. Os JSDoc estão em inglês.
- Nomes de seções no Figma estão em português (`"Seção Cores"`, `"Seção Medidas e Espaçamentos"`). Isso é intencional — **NÃO traduza**.
- Nomes de funções e variáveis estão em inglês. Isso é correto — **mantenha em inglês**.

**Ação:** Apenas garantir que novos comentários sigam o mesmo padrão do arquivo onde estão (JSDoc em inglês, comentários internos podem ser em português ou inglês conforme o arquivo).

---

## Ordem de Execução Sugerida

1. **`npm run build`** — confirmar que compila.
2. Criar `config/constants.ts` — mover `IGNORED_PROPERTIES`, `SIZE_ORDER`, `SEMANTIC_ROLES`. Atualizar imports. Build.
3. Criar `features/index.ts` — barrel file. Atualizar import em `main.ts`. Build.
4. Remover import morto `collectVariantColors` de `requirements.ts`. Build.
5. Mover formatters (`formatDimensionToken`, `formatRadiusToken`) para `utils/helpers.ts`. Atualizar imports em `spacing.ts` e substituir inline formatters em `traversal.ts`. Build.
6. Criar `core/token-resolution.ts` — extrair funções de resolução de token de `spacing.ts`. Atualizar imports. Build.
7. Extrair `resolveStrokeToken` como helper em `core/token-resolution.ts`. Substituir os 3 locais em `spacing.ts`. Build.
8. Extrair funções de layout/posicionamento (`hasElementsInArea`, `getBestSideForHeightAnnotation`, `annotateStructuralComponentsDimensions`) para `ui/annotations.ts` ou novo `ui/annotation-helpers.ts`. Build.
9. Verificar se `icon-tokens.ts` é usado. Se não, comentar ou documentar.
10. **Build final + teste completo.**

---

## Como Testar

Após cada grupo de alterações:

```bash
npm run build
```

Se o build falhar, o erro indicará qual import ou tipo está quebrado. Corrija antes de prosseguir.

Após a refatoração completa, o arquivo `code.js` gerado deve funcionar identicamente ao anterior. Teste no Figma:

1. Selecione um Component Set com variantes
2. Gere especificação com todas as seções ativas
3. Verifique se todas as seções aparecem (cores, tipografia, espaçamentos, efeitos, requisitos, dependências, estados, propriedades)
4. Teste o modo On-Highlight
5. Teste inserção de assets (medida, gap, padding, pointers, números, áreas)
6. Teste edição de marker existente (selecionar marker → editar propriedades → atualizar)
