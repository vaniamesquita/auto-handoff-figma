# Lógica Completa do Plugin - Auto Handoff Generator

## Visão Geral

O **Auto Handoff Generator** é um plugin Figma que gera documentação visual de design (handoff) a partir de componentes selecionados. Ele extrai automaticamente especificações de cores, tipografia, espaçamentos, efeitos e propriedades de variantes, criando um frame de especificação completo no canvas do Figma.

### Funcionalidades Principais
- Extração automática de design tokens (cores, espaçamentos, tipografia)
- Geração de tabelas com especificações
- Visualizações com anotações visuais (pointers, badges, linhas)
- Suporte a múltiplas variantes de componentes
- Suporte a múltiplos componentes selecionados simultaneamente
- Live editing de markers/assets
- Dois modos visuais: Normal e Highlight (alto contraste)
- Interface redimensionável (resize handle no canto inferior direito)

---

## Estrutura de Seções

### Seção: CORES

**Comportamento:**
- Extrai cores SOLID de fills e strokes de todos os elementos do componente
- Agrupa cores por estado da variante (ex: Default, Hover, Pressed)
- Deduplica cores com mesmo token/hex dentro do mesmo grupo
- Remove sufixos de propriedades filtradas do nome do elemento
- Tabela global para todos os componentes selecionados

**Origem dos Dados:**
- Lê fills de nós com `"fills" in node && Array.isArray(node.fills)`
- Lê strokes de nós com `"strokes" in node && strokeWeight > 0`
- Propriedades lidas: `fills[].color`, `fills[].boundVariables.color`, `strokes[].color`
- Resolve tokens via `figma.variables.getVariableByIdAsync()`

**Regras de Processamento:**
- Cores de fills SOLID são capturadas com hex e variableId (se existir)
- Se o nó tem nome de variante (contém "=") e é COMPONENT, usa "Container" como elemento genérico para permitir deduplicação
- Aplica SEMANTIC_ROLES para mapear nomes de camadas (ex: "label" → "Label")
- Ícones: busca cor do primeiro nó "Vector" dentro da instância (recursivo, ignora wrappers)
- Ordena estados: Todos (-1), Default (0), Enabled (1), Active (2), Hover (3), Pressed (4), Focus (5), Disabled (6)
- **Inverse Grouping**: agrupa por assinatura (elemento + token/hex), depois mapeia quais variantes usam cada cor

**Output Gerado:**
- Tabela com colunas: "Elemento / Estado" | "Token" | "Referência" (círculo colorido)
- Altura da linha: 44px
- Gap entre linhas: 4px
- Gap entre grupos de estado: 16px
- Círculo colorido preserva binding de variável quando disponível

**Formatação de Tokens:**
- Cores: `$color-{nome-do-token}` (lowercase, "/" → "-")
- Exemplo: `Color/Primary/500` → `$color-primary-500`

---

### Seção: PADRÕES DE TEXTO (Typography)

**Comportamento:**
- Extrai propriedades de todos os nós TEXT do componente
- Detecta text style tokens via `textStyleId`
- Agrupa textos pela propriedade com mais variação (ex: "size") via `detectTextGroupingProperty()`
- Inclui visualização de comportamento de texto (truncamento/ellipsis)
- Seção per-component (com subtítulo entre componentes quando múltiplos)

**Origem dos Dados:**
- Nós do tipo `node.type === "TEXT"`
- Propriedades lidas:
  - `fontName` (family + style)
  - `fontSize`
  - `lineHeight` (value + unit)
  - `letterSpacing` (value + unit)
  - `textStyleId` → resolve para nome do estilo
  - `textAutoResize` + `maxLines` → detecta truncamento

**Regras de Processamento:**
- Se `fontName === figma.mixed`, usa "Mixed" como valor
- Line-height: formata como "24px" ou "120%" conforme unit
- Letter-spacing: formata com 2 casas decimais
- Detecta truncamento: `textAutoResize === "HEIGHT" && maxLines != null`
- Deduplica por `{sizeElement}-{token|fontFamily}`
- Auto-detecção de grouping: prioridade "size", depois propriedade com mais valores únicos

**Output Gerado:**

*Tabela:*
- Colunas: "ELEMENTO" | "COMPONENTE"
- Posição ELEMENTO: 0%
- Posição COMPONENTE: 45%
- Altura linha: 44px
- Agrupamento por propriedade detectada, com spacers entre grupos

*Visualização:*
- Frame com instância centralizada
- Pointers verdes apontando para cada texto
- Alternância top/bottom para evitar sobreposição
- Usa `AnnotationTracker` para posicionamento livre
- Ajuste horizontal com `findFreeXPosition()` para evitar overlaps
- Matching de labels por nome OU por propriedades de fonte (family/weight/size)

*Comportamento de Texto (Ellipsis):*
- Só aparece se existem textos com truncamento (`textAutoResize === "HEIGHT"` + `maxLines`)
- Grid apenas com variantes que têm truncamento
- Substitui conteúdo por Lorem Ipsum calculado para forçar overflow
- Mostra label "Ellipsis - limite de X linha(s)"
- Posicionamento inteligente: textos no topo → pointer para cima, textos embaixo → pointer para baixo
- Cor: Normal → vermelho (#E53333), Highlight → verde (#62F84F)

**Formatação de Tokens:**
- Texto: `$textstyle-{nome-do-token}` (lowercase, "/" → "-")
- Exemplo: `Heading/Large` → `$textstyle-heading-large`

---

### Seção: MEDIDAS E ESPAÇAMENTOS (Spacing)

**Comportamento:**
- Extrai gap, paddings, width/height, border radius e borders
- Cria visualização de padding/gap separada de dimensões/bordas
- Busca tokens de spacing aplicados via boundVariables
- Para ícones, usa mapeamento size→token configurado
- Seção per-component (com subtítulo entre componentes quando múltiplos)

**Origem dos Dados:**
- Gap: `node.itemSpacing` (quando `layoutMode !== "NONE"` e `children.length >= 2`)
- Paddings: `paddingTop/Bottom/Left/Right` (quando `layoutMode !== "NONE"`)
- Dimensões: `width`, `height` via boundVariables
- Border Radius: `cornerRadius` ou `topLeftRadius/etc`
- Borders: `strokeWeight` (uniform) ou `strokeTopWeight/etc` (individual)
- Posição do stroke: `strokeAlign` → Inside/Outside/Center

**Regras de Processamento:**

*Gap:*
- Só coleta se `itemSpacing > 0` e `children.length >= 2`
- Direção: "H" (HORIZONTAL) ou "V" (VERTICAL)
- Captura contexto dos filhos (ex: "Label + Input + Description")
- Formatação: "Gap (Horiz/Vert) (Parent) / Child Context"

*Paddings:*
- Só coleta se valor > 0
- Cada lado é registrado separadamente
- Formatação: "Padding Top/Bottom/Left/Right (Element)" se elemento específico

*Dimensões:*
- Height: coleta em qualquer nível SE tiver token aplicado
- Width: só coleta no nível principal (isTopLevel) para evitar poluição
- Formatter remove prefixo "shapes-" do Figma

*Border Radius:*
- Verifica 4 cantos individualmente
- Busca recursiva pelo primeiro radius > 0
- Formatter remove prefixos "border-radius-" e "shapes-"

*Borders:*
- Suporta stroke uniforme ("All") ou por lado (Top/Bottom/Left/Right)
- Inclui posição: Inside/Outside/Center
- Na tabela: se todos os lados iguais, mostra "Stroke Position" + "Border" separados
- Se lados diferentes, mostra cada lado individualmente

**Output Gerado:**

*Tabela:*
- Colunas: "Medida" | "Token / Valor" | "Referência"
- Agrupa por prefixo (Todos, Default, Small, Large, etc)
- Gap entre grupos: 20px

*Visualização Padding/Gap:*
- **Guard**: só cria se existem paddings ou gaps nos dados coletados
- Retângulos semi-transparentes (0.15 opacidade, stroke tracejado)
- Linhas vermelhas para gaps, linhas azuis para paddings
- Badges com token ou valor em px
- Margem: 120px
- Alternância de posição: gaps horizontais → top/bottom, gaps verticais → right/left
- Tracker para evitar sobreposição

*Visualização Dimensões e Bordas:*
- **Caminho single-variant E multi-variant**: ambos anotam height tokens (root + internos)
- Height tokens do root: anotados à direita com tracker
- Height tokens de elementos internos: anotados à esquerda sem tracker
- Border radius no canto superior esquerdo (busca recursiva)
- Bordas com indicadores de posição (Inside/Outside/Center)
- Componentes estruturais internos: `annotateStructuralComponentsDimensions()`
  - Componentes estruturais (nomes com `.`, `-`, `_`): usa token aplicado via `findHeightToken()`, só anota se token existe
  - Posicionamento inteligente: Left > Right > Bottom > Top (baseado em espaço disponível)
- **Ícones** (instâncias não-estruturais que contêm um nó "Vector"):
  - Detecta ícone pela presença de um nó `Vector` (name === "Vector" ou type === VECTOR)
  - Mede o **parent direto do Vector** (a camada uma acima), não o Vector em si nem o container wrapper
  - Usa mapeamento `ICON_SIZE_TOKENS` para converter altura em token (16→$size-icon-small, 24→$size-icon-regular, etc.)
  - Se o tamanho não tem mapeamento, mostra o **valor bruto em px** (ex: `28px`)
  - Sempre anota, mesmo sem token mapeado
  - Deduplicação: cada ícone é processado uma vez (por ID do parent do Vector)
  - Não recursiona dentro de instâncias-ícone para evitar duplicação

*Grid Multi-Variante (Dimensões):*
- Pré-filtra variantes: só inclui variantes com conteúdo de dimensão (tokens, radius, borders ou ícones)
- Usa `variantHasDimensionContent()` para verificar

**Formatação de Tokens:**
- Spacing: `$nome-do-token` (remove prefixo "spacing/", "space/", "size/", lowercase)
- Exemplo: `Spacing/Medium` → `$medium`

---

### Seção: EFEITOS (Effects)

**Comportamento:**
- Extrai sombras (Drop Shadow, Inner Shadow) e blurs (Layer, Background)
- Agrupa efeitos por camada + tipo + token/valor
- Usa análise inteligente para determinar label (quais variantes têm o efeito)
- Só processa efeitos visíveis (`effect.visible !== false`)
- Seção per-component (com subtítulo entre componentes quando múltiplos)

**Origem dos Dados:**
- Nós com `"effects" in node && node.effects.length > 0`
- Propriedades lidas:
  - `effect.type` (DROP_SHADOW, INNER_SHADOW, LAYER_BLUR, BACKGROUND_BLUR)
  - `effect.offset.x/y`, `effect.radius`, `effect.spread`, `effect.color`
  - `effectStyleId` → resolve para nome do estilo (tentativa primária)
  - `boundVariables.effects[i]` → resolve token individual (fallback)

**Regras de Processamento:**

*Nomenclatura de Camada:*
- Remove caminhos de arquivo do nome (ex: "DesignSystem/Buttons/Primary/Hover" → "Hover")
- Normaliza nomes genéricos para "Container" (Untitled, Frame*, nomes de variante, "Default")
- Verifica com `isVariantPropertiesName()` para detectar "Size=Small, Status=Default"

*Label Inteligente (`getSmartVariantLabel`):*
- Se todas as variantes têm o efeito → "Todos (Layer)"
- Se só uma variante → mostra propriedades dela (ex: "On Focus")
- Se algumas variantes → identifica propriedade comum constante
- Propriedades prioritárias: status > state > type > variant > mode
- Fallback: "X variantes"

**Output Gerado:**

*Tabela:*
- Colunas: "Elemento" | "Token / Valor" | "Tipo"
- Cor do token: warning (laranja)
- Ordenação: Container primeiro, depois alfabético por camada
- Spacers entre camadas diferentes

*Visualização:*
- Grid de variantes que têm efeitos
- Pointers laranjas apontando para nós com efeitos
- Alternância top/bottom
- Label: Token > Valor > Tipo

**Formatação de Tokens:**
- Efeito: `$effect-{nome-do-token}` (lowercase, "/" → "-")

**Formatação de Valores:**
- Drop/Inner Shadow: `Xpx Ypx BLURpx SPREADpx rgba(R, G, B, A)`
- Layer Blur: `blur(Xpx)`
- Background Blur: `backdrop-blur(Xpx)`

---

### Seção: COMPONENTES E ÍCONES UTILIZADOS

**Comportamento:**
- Lista todos os componentes/ícones instanciados dentro do componente principal
- Filtra componentes estruturais (começam com ".", "_", "-", ".asset/")
- Filtra componentes "spacer" (nomes começando com "space", case-insensitive)
- Limita a 100 componentes máximo
- Mostra anatomia do componente com pointers para cada subcomponente
- Tabela global para todos os componentes selecionados

**Origem dos Dados:**
- Rastreia durante traversal: `node.type === "INSTANCE"`
- Obtém main component: `node.getMainComponentAsync()`
- Nome: usa ComponentSet name se existir, senão Component name

**Regras de Processamento:**
- Ignora nomes que começam com "." ou "_" (componentes estruturais)
- Ignora nomes que começam com "space" (spacers)
- Deduplica por ID do main component
- Escala instâncias para máximo 180px (cards) ou 300px (anatomia), mantendo proporção
- Se falha ao criar instância, mostra placeholder cinza

**Output Gerado:**

*Grid de Componentes:*
- Layout: HORIZONTAL com WRAP
- Gap: 48px horizontal, 40px vertical
- Padding: 32px
- Background: #FEFEFE
- Cada card: instância + nome em verde (Medium 12px)
- Warning se mais de 100 componentes

*Anatomia do Componente:*
- Para cada componente usado, mostra na variante onde aparece (primeira encontrada)
- Posicionamento inteligente de pointers:
  - Metade superior: pointer acima do elemento
  - Metade inferior: pointer abaixo do elemento
- Deduplica: cada componente mostrado uma vez

---

### Seção: ESTADOS (Grid de Variantes)

**Comportamento:**
- Cria grid visual com todas as variantes do ComponentSet
- Respeita filtros de propriedade selecionados pelo usuário
- Numera cada estado sequencialmente (01, 02, 03...)
- Altura dos cards é calculada dinamicamente (maior card define altura)
- Seção per-component

**Origem dos Dados:**
- Lê variantes de `componentSet.children` (type === "COMPONENT")
- Mapeia propriedades via `propertyMap` do VariantColors
- Filtra via `filterVariantsForVisualization()`

**Regras de Processamento:**

*Nomenclatura:*
- Usa `statesVariantPropertyOrder` para ordenar propriedades no label
- Só inclui propriedades com valores selecionados no filtro
- Se propriedade está nos filtros mas vazia, NÃO inclui no nome
- Separa valores por " / "

*Layout:*
- Colunas: definido por `framesPerRow`
- Gap: 16px
- Padding do card: 24px
- Corner radius: 8px

*Cálculo de Altura:*
- Primeira passagem: cria cards temporários para medir altura
- Segunda passagem: aplica altura máxima a todos os cards

**Output Gerado:**
- Grid com cards contendo: label numerado + instância do componente
- Background: #FEFEFE (normal) ou #3853FF (highlight)
- Cor do label: cinza (normal) ou verde brilhante #62F84F (highlight)

---

### Seção: PROPRIEDADES (Component Properties)

**Comportamento:**
- Lista todas as propriedades definidas no ComponentSet
- Ordena: VARIANT → BOOLEAN/TEXT (agrupados) → INSTANCE_SWAP
- Agrupa BOOLEAN + TEXT relacionados (ex: "Label" boolean + "Text Label" text)
- Mostra default value e opções disponíveis
- Seção per-component
- Título: "❖ {component.name} Properties"

**Origem dos Dados:**
- Lê de `componentSet.componentPropertyDefinitions`
- Tipos: VARIANT, BOOLEAN, TEXT, INSTANCE_SWAP
- Para INSTANCE_SWAP, tenta importar componentes preferidos via `importComponentByKeyAsync()`, fallback para `getNodeByIdAsync()`

**Regras de Processamento:**

*Ordenação:*
- Primeiro: VARIANT
- Depois: BOOLEAN + TEXT (agrupados por relação)
- Por último: INSTANCE_SWAP
- Preserva ordem original de declaração dentro de cada grupo

*Agrupamento BOOLEAN/TEXT:*
- Se TEXT key contém BOOLEAN key → agrupa
- Ex: "Label" (boolean) + "Text Label" (text) ficam juntos

*VARIANT:*
- Ordena opções por SIZE_ORDER se aplicável
- Default value aparece como badge preenchido (azul #3135D9)
- Outras opções aparecem como badge outlined

**Output Gerado:**

*Tabela Principal:*
- Colunas: "PROPERTY" (25%) | "TYPE" (20%) | "DEFAULT / OPTIONS" (55%)
- Ícones por tipo: ◆ Variant | ⊙ Boolean | T Text

*VARIANT:*
- Badges com cada opção
- Default: fundo azul, texto branco
- Outros: borda azul, texto azul

*BOOLEAN:*
- Toggle visual (on/off) com posição do knob
- Label "True" ou "False"

*TEXT:*
- Exibe defaultValue como texto

*Nested Instances (INSTANCE_SWAP):*
- Seção separada "◇ Nested Instances"
- Tenta resolver nome dos componentes preferidos
- Primeiro valor: badge preenchido, outros: outlined

---

## Fluxo de Processamento Geral

```
1. INICIALIZAÇÃO (main.ts)
   └── figma.showUI() → exibe interface 380x720px (redimensionável: 300-1200px)
   └── Detecta seleção: COMPONENT | COMPONENT_SET | INSTANCE
   └── Extrai variantProperties e envia para UI (com selectionCount e nodeType)
   └── Registra listener selectionchange → handleSelectionChange()

2. GERAÇÃO (generateSpec)
   └── Valida seleção (pelo menos 1 nó válido)
   └── loadPluginFonts() → carrega fontes com fallback
   └── Para cada nó: processComponent()
       └── collectNodeData() → traversal recursivo single-pass
           ├── extractColors (fills/strokes)
           ├── extractTextStyles (TEXT nodes)
           ├── extractSpacings (gap/padding/radius/dimensions)
           ├── extractBorders (strokeWeight)
           ├── extractEffects (shadows/blur)
           └── trackUsedComponents (INSTANCE nodes)

3. CRIAÇÃO DO FRAME
   └── Cria specFrame com layout vertical
   └── Adiciona título principal (48px Bold)
   └── Para cada seção habilitada:
       └── Verifica se tem conteúdo
       └── Adiciona divider (1px gray) se necessário
       └── Chama createXxxSection()
       └── Para seções per-component: adiciona subtítulo entre componentes

4. FINALIZAÇÃO
   └── Adiciona frame ao canvas (100px à direita do componente selecionado)
   └── Scroll/zoom para o frame
   └── Fecha plugin com notificação de sucesso
```

---

## Fluxo de Traversal (collectNodeData)

```
ENTRADA: nó raiz do componente

PARA CADA NÓ:
1. Skip se não visível (node.visible === false)

2. Se INSTANCE:
   - Rastreia usedComponents (mainComponent.id → displayName)
   - Extrai cor de ícone (busca Vector recursivamente, ignora wrappers)
   - Skip se não for structural instance (não começa com "./._")

3. Resolve nome via resolveNodeName():
   - Busca em ancestrais INSTANCE/COMPONENT por nomes estruturais
   - Remove prefixos ".asset/", ".", "-", "_"
   - Aplica SEMANTIC_ROLES se nome não contém "="

4. EXTRAI DADOS:
   - CORES: fills SOLID + strokes SOLID (com tokens)
     - Variant components: fillElement = "Container" para deduplicação
     - Variant components (stroke): element = "Border"
   - TEXTO: se TEXT node, captura todas as propriedades
   - GAP: se layoutMode !== NONE e itemSpacing > 0 e children >= 2
     - Captura contexto dos filhos (ex: "Label + Input + Description")
   - PADDINGS: cada lado se > 0
   - DIMENSÕES: height (qualquer nível com token), width (só topLevel com token)
     - Formatter remove prefixo "shapes-"
   - RADIUS: cornerRadius ou individual corners
     - Formatter remove prefixos "border-radius-" e "shapes-"
   - BORDERS: strokeWeight uniform ou por lado + posição (Inside/Outside/Center)
   - EFFECTS: cada effect visível (tenta effectStyleId, depois boundVariables)

5. RECURSÃO: processa children
```

---

## Protocolo de Mensagens

### UI → Backend

| Tipo | Dados | Descrição |
|------|-------|-----------|
| `generate` | `options: GenerationOptions` | Gera especificação |
| `insert-asset` | `assetType, value, color, direction, badgePosition, highlightMode, size, textColorType` | Insere marker no canvas |
| `update-marker` | `markerConfig: MarkerConfig` | Atualiza marker selecionado |
| `resize` | `width, height` | Redimensiona janela do plugin |
| `close` / `cancel` | — | Fecha plugin |
| `refresh` | — | Re-executa main() |

### Backend → UI

| Tipo | Dados | Descrição |
|------|-------|-----------|
| `init` | `componentName, variantProperties, selectionCount, nodeType` | Inicializa UI |
| `marker-selected` | `markerConfig: MarkerConfig` | Marker selecionado no canvas |
| `marker-deselected` | — | Marker deselecionado |
| `selection-info` | `componentName, nodeType` | Atualiza header com seleção atual |

---

## Configurações e Defaults

### Opções de Geração (GenerationOptions)

| Configuração | Tipo | Default | Descrição |
|-------------|------|---------|-----------|
| `sectionColors` | boolean | true | Habilita seção de cores |
| `sectionText` | boolean | true | Habilita seção de tipografia |
| `sectionSpacing` | boolean | true | Habilita seção de espaçamentos |
| `sectionEffects` | boolean | true | Habilita seção de efeitos |
| `sectionComponents` | boolean | true | Habilita seção de componentes |
| `sectionEstados` | boolean | true | Habilita seção de estados |
| `sectionProperties` | boolean | true | Habilita seção de propriedades |
| `frameWidth` | number | 1140 | Largura do frame de spec |
| `paddingHorizontal` | number | 84 | Padding lateral do frame |
| `sectionSpacingValue` | number | 40 | Gap entre seções |
| `bgColor` | string | "F4F5F7" | Cor de fundo (hex sem #) |
| `highlightMode` | boolean | false | Modo de alto contraste |
| `gridDensity` | number | 4 | Colunas no grid de estados (1-6) |
| `textFramesPerRow` | number | 2 | Frames por linha em tipografia |
| `spacingFramesPerRow` | number | 2 | Frames por linha em espaçamentos |
| `effectsFramesPerRow` | number | 2 | Frames por linha em efeitos |
| `textShowTable` | boolean | true | Mostra tabela de texto |
| `textShowViz` | boolean | true | Mostra visualização de texto |
| `spacingShowTable` | boolean | true | Mostra tabela de espaçamentos |
| `spacingShowViz` | boolean | true | Mostra visualização de espaçamentos |
| `effectsShowTable` | boolean | true | Mostra tabela de efeitos |
| `effectsShowViz` | boolean | true | Mostra visualização de efeitos |

### Filtros de Propriedades

| Configuração | Tipo | Descrição |
|-------------|------|-----------|
| `variantPropertyOrder` | string[] | Ordem/filtro de propriedades para cores |
| `textVizProperties` | Record<string, string[]> | Filtros por propriedade para tipografia |
| `spacingVizProperties` | Record<string, string[]> | Filtros por propriedade para espaçamentos |
| `effectsVizProperties` | Record<string, string[]> | Filtros por propriedade para efeitos |
| `statesVizProperties` | Record<string, string[]> | Filtros por propriedade para estados |
| `statesVariantPropertyOrder` | string[] | Ordem de propriedades nos labels de estados |

---

## Constantes do Sistema

### SEMANTIC_ROLES (Mapeamento de Nomes)

```javascript
{
  label: "Label",
  hint: "Hint",
  placeholder: "Placeholder",
  icon: "Icon",
  border: "Border",
  background: "Background",
  input: "Input",
  container: "Container",
  text: "Text",
  error: "Error Message",
  helper: "Helper Text",
  description: "Description",
  initials: "Initials"
}
```

### SIZE_ORDER (Ordenação de Tamanhos)

```javascript
{
  "x-small": 1, "xsmall": 1,
  "small": 2,
  "semiregular": 3,
  "regular": 4,
  "medium": 5,
  "large": 6,
  "x-large": 7, "xlarge": 7
}
```

### ICON_SIZE_TOKENS (Mapeamento de Ícones)

```javascript
{
  16: "$size-icon-small",
  24: "$size-icon-regular",
  32: "$size-icon-large",
  36: "$size-icon-xlarge",
  40: "$size-icon-xxlarge",
  48: "$size-icon-xxxlarge",
  56: "$size-icon-display"
}
```

### IGNORED_PROPERTIES (Propriedades Ignoradas na Extração de Estado)

```javascript
["size", "icon"]
```

### Cores do Tema Normal

| Elemento | Cor RGB | Hex Aproximado |
|----------|---------|----------------|
| gap | (1, 0.2, 0.2) | #FF3333 |
| padding | (0, 0.5, 1) | #0080FF |
| radius | (1, 0.2, 0.2) | #FF3333 |
| border | (0.6, 0.2, 0.6) | #993399 |
| text | (0.2, 0.6, 0.2) | #339933 |
| width | (0.4, 0.4, 0.4) | #666666 |
| height | (0.85, 0.1, 0.1) | #D91A1A |
| effect | (0.8, 0.5, 0.2) | #CC8033 |

### Cores do Tema Highlight

| Elemento | Cor RGB | Hex |
|----------|---------|-----|
| gap | (1, 0.78, 0.8) | #FFC7CB |
| padding | (0.38, 0.97, 0.31) | #62F84F |
| radius | (1, 0.78, 0.8) | #FFC7CB |
| border | (0.38, 0.97, 0.31) | #62F84F |
| text | (0.38, 0.97, 0.31) | #62F84F |
| width | (0.38, 0.97, 0.31) | #62F84F |
| height | (0.38, 0.97, 0.31) | #62F84F |
| effect | (1, 0.72, 0.3) | #FFB74D |

---

## Sistema de Anotações

### Tipos de Markers/Assets

| Tipo | Descrição | Cor Padrão |
|------|-----------|------------|
| `measure` | Medida horizontal/vertical | Red |
| `gap` | Espaçamento entre elementos | Red |
| `padding` | Padding interno | Blue |
| `pointer-top/bottom/left/right` | Seta direcional | Variável |
| `number-top/bottom/left/right` | Número com seta | Variável |
| `area-dashed-circle/square` | Área tracejada | Variável |
| `area-solid-circle/square` | Área sólida | Variável |
| `area-outline-circle/square` | Área com contorno | Variável |
| `dimension` | Dimensão com conectores | Variável |

### Funções de Anotação

| Função | Uso | Cor | Posição |
|--------|-----|-----|---------|
| `annotateGapNew` | Gaps entre elementos | Red (gap theme) | Alternância top/bottom ou right/left |
| `annotatePaddingNew` | Paddings internos | Blue (padding theme) | Baseada no lado (top/bottom/left/right) |
| `annotateRadiusNew` | Border radius | Red (radius theme) | Canto superior esquerdo |
| `annotateBorderNew` | Bordas/strokes | Purple (border theme) | Lado correspondente |
| `annotateDimensionNew` | Width/height | Height/width theme | Right (height), bottom (width) |
| `annotateDimensionNewSmart` | Height com posição inteligente | Height theme | Smart: Left > Right > Bottom > Top |
| `createSimpleAnnotation` | Base para todas as anotações | Variável | Vertical ou horizontal auto-detectado |

### MarkerConfig (Configuração de Marker)

```typescript
{
  type: string;           // Tipo do marker
  direction?: "horizontal" | "vertical";
  value: string;          // Texto exibido (ex: "16px", "$spacing-md")
  colorType: string;      // "red" | "blue" | "pink" | "green" | "black" | hex
  textColorType?: string; // Cor do texto (pode ser "inherit" para usar cor do pointer)
  badgePosition?: string; // "top" | "bottom" | "left" | "right"
  highlightMode: boolean;
  size?: number;          // Tamanho para áreas
}
```

### Live Editing

O plugin suporta edição ao vivo de markers já inseridos:

1. Usuário seleciona um marker no canvas
2. Plugin detecta via `selectionchange` event
3. Lê `pluginData("markerConfig")` do nó selecionado (ou parent para cliques em filhos)
4. Envia config para UI via `postMessage`
5. UI atualiza para modo de edição
6. Usuário modifica propriedades
7. Plugin recebe `update-marker` e recria o marker
8. **Preservação de texto**: Live editing mantém texto editado pelo usuário

---

## Mapeamento: Especificação → Código

### Cores

```
Fill SOLID → ColorSpec {
  element: semanticRole | "Container" (se variant) | resolvedName,
  state: extractMainState(variantName),
  token: formatToken(variableName) | null,
  colorHex: rgbToHex(paint.color),
  colorVariableId: paint.boundVariables.color.id | null
}
```

### Texto

```
TEXT node → TextSpec {
  element: semanticRole | resolvedName (nunca genérico "Text"),
  fontFamily: node.fontName.family,
  fontWeight: node.fontName.style,
  fontSize: node.fontSize,
  lineHeight: formatLineHeight(node.lineHeight),
  letterSpacing: formatLetterSpacing(node.letterSpacing),
  token: textStyle.name | null
}
```

### Espaçamentos

```
itemSpacing > 0 → SpacingSpec { property: "Gap", direction: "H"|"V", properties: "childContext" }
paddingTop > 0 → SpacingSpec { property: "Padding Top", direction: "V" }
cornerRadius > 0 → SpacingSpec { property: "Border Radius" }
height + boundVariable → SpacingSpec { property: "Height" }
width + boundVariable (topLevel) → SpacingSpec { property: "Width" }
```

### Bordas

```
strokeWeight > 0 (uniform) → BorderSpec { side: "All", position: "Inside"|"Outside"|"Center" }
strokeTopWeight > 0 → BorderSpec { side: "Top", position: ... }
```

### Efeitos

```
DROP_SHADOW → EffectSpec { effectType: "DROP_SHADOW", value: "Xpx Ypx BLURpx SPREADpx rgba(...)" }
INNER_SHADOW → EffectSpec { effectType: "INNER_SHADOW", value: "..." }
LAYER_BLUR → EffectSpec { effectType: "LAYER_BLUR", value: "blur(Xpx)" }
BACKGROUND_BLUR → EffectSpec { effectType: "BACKGROUND_BLUR", value: "backdrop-blur(Xpx)" }
```

---

## Arquivos e Responsabilidades

| Arquivo | Responsabilidade |
|---------|-----------------|
| `main.ts` | Orquestração, UI, message handling, generateSpec |
| `core/traversal.ts` | Engine de extração de dados (single-pass) |
| `core/node-helpers.ts` | Helpers para nós Figma (resolveNodeName, isStructural, etc) |
| `features/colors.ts` | Seção de cores (inverse grouping) |
| `features/typography.ts` | Seção de tipografia (auto-grouping, ellipsis) |
| `features/spacing.ts` | Seção de espaçamentos (padding/gap viz, dimension viz, structural components) |
| `features/effects.ts` | Seção de efeitos (smart variant labeling) |
| `features/components.ts` | Seção de componentes usados (grid + anatomia) |
| `features/states.ts` | Seção de estados (grid numerado) |
| `features/properties.ts` | Seção de propriedades (VARIANT/BOOLEAN/TEXT/INSTANCE_SWAP) |
| `features/common.ts` | Helpers compartilhados (grids, filtros, deduplicação, sorting) |
| `ui/table-builder.ts` | Construtor de tabelas (TableBuilder class, auto-layout) |
| `ui/annotations.ts` | Sistema de anotações visuais (trackers, collision avoidance) |
| `assets/marker-generator.ts` | Geração e edição de markers (live editing) |
| `config/theme.ts` | Temas, constantes, cores, presets tipográficos |
| `config/icon-tokens.ts` | Mapeamento size→token para ícones |
| `utils/fonts.ts` | Carregamento de fontes com fallback |
| `utils/helpers.ts` | Utilitários gerais (formatação, conversão, extração de propriedades) |
| `types/index.ts` | Definições TypeScript |
| `ui.html` | Interface do plugin (tabs, filtros, drag-and-drop, resize handle) |

---

## Interface do Plugin (ui.html)

### Estrutura
- **Header**: Ícone + nome do componente + tipo + botão refresh
- **Tabs**: Seções | Layout | Assets
- **Seções**: Toggles para cada seção com opções expandíveis
- **Filtros de Variantes**: Accordions por propriedade com checkboxes
- **View Mode**: Seletores Table/Visualização por seção
- **Footer**: Botão Cancelar + Botão Gerar Especificações

### Funcionalidades
- **Redimensionamento**: Resize handle no canto inferior direito (pointer events com capture)
  - Limites: 300-1200px largura, 400-1200px altura
- **Drag-and-drop**: Reordenação de propriedades de variantes
- **Live Editing**: Painel de edição quando marker selecionado no canvas
- **Accordions**: Expansão/colapso de seções de filtro

---

## Tratamento de Erros e Fallbacks

### Fontes

```
Ordem de tentativa:
1. "BancoDoBrasil Textos" (preferida)
2. "Inter" (fallback Figma)
3. "Roboto" (fallback adicional)
Fallback final: "Inter"
```

### Componentes

- Se falha ao obter mainComponent → ignora instância
- Se falha ao criar instance de componente → mostra placeholder cinza
- Se componente não encontrado por ID → mostra placeholder

### Variáveis

- Se boundVariable não resolve → usa null como token
- Se effectStyleId não resolve → tenta boundVariables.effects[i]

### Estrutura

- Se nó oculto → skip
- Se nested instance não-estrutural → skip (não traversa)
- Se ComponentSet vazio → skip seção
- Se não há paddings/gaps → skip visualização de paddings/gaps
- Se variante não tem conteúdo de dimensão → skip no grid de dimensões

### Multi-Componentes

- Seções globais (Cores, Componentes): merge de todos os selecionados
- Seções per-component (Texto, Spacing, Efeitos, Estados, Propriedades): subtítulo entre componentes
