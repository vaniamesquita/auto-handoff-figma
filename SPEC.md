# Auto Handoff Generator — Especificação do Plugin

## 1. O QUE É O PLUGIN

O Auto Handoff Generator é um plugin para o Figma Desktop que gera automaticamente documentos de especificação de design (design specs) a partir de componentes selecionados. Ele extrai todas as informações visuais e estruturais de um componente — cores, tipografia, espaçamentos, efeitos, estados, propriedades e dependências — e cria um frame organizado com tabelas e visualizações anotadas diretamente no canvas do Figma.

O objetivo é automatizar o processo de handoff entre design e desenvolvimento, eliminando a necessidade de documentar manualmente cada detalhe visual de um componente.

---

## 2. PARA QUEM É

- **Designers de produto e sistemas de design** que precisam entregar especificações detalhadas para desenvolvedores
- **Design system managers** que documentam tokens, variantes e comportamentos de componentes
- **Desenvolvedores front-end** que consomem essas especificações para implementar componentes fielmente

O plugin é usado no contexto de handoff de componentes — quando um componente ou conjunto de variantes precisa ser documentado com todos os seus valores visuais, tokens e opções configuráveis.

---

## 3. O QUE ELE FAZ

### Funcionalidades principais

1. **Extrai cores** de todos os elementos visíveis do componente, incluindo preenchimentos, bordas e cores de ícones, mostrando os tokens de design associados quando existem.

2. **Extrai padrões de texto** — família tipográfica, peso, tamanho, altura de linha, espaçamento entre letras e tokens de estilo de texto aplicados.

3. **Extrai medidas e espaçamentos** — gaps entre elementos, paddings internos, border radius, altura, largura e espessura de bordas, todos com seus respectivos tokens de design.

4. **Extrai efeitos visuais** — sombras (drop shadow, inner shadow) e desfoque (blur), com tokens quando aplicados.

5. **Mapeia dependências** — lista todos os sub-componentes e ícones usados dentro do componente, mostrando instâncias visuais de cada um e uma visualização anatômica indicando onde cada sub-componente está posicionado.

6. **Gera um grid de estados** — mostra todas as variantes do componente organizadas em uma grade numerada, permitindo ver visualmente cada combinação de propriedades.

7. **Documenta propriedades** — lista todas as propriedades configuráveis do componente (variantes, booleanos, textos, troca de instância) e as propriedades dos componentes aninhados expostos.

8. **Identifica requisitos** — mostra quais elementos do componente são opcionais (controlados por propriedades booleanas), indicando visualmente com setas e labels quais partes podem ser ligadas ou desligadas.

9. **Ferramenta de anotações manuais** — permite inserir marcadores individuais no canvas (medidas, gaps, paddings, ponteiros, badges numerados, indicadores de área) com edição ao vivo.

---

## 4. COMO FUNCIONA DO PONTO DE VISTA DO USUÁRIO

### Passo a passo

1. **Selecionar um componente** no Figma — pode ser um Component, um Component Set (com variantes) ou uma instância.

2. **Abrir o plugin** — o painel lateral mostra o nome do componente selecionado e as opções de geração.

3. **Configurar as seções** — o usuário escolhe quais seções incluir na especificação (cores, texto, espaçamentos, efeitos, componentes, estados, propriedades, requisitos). Cada seção pode ser ligada ou desligada individualmente.

4. **Ajustar filtros de variantes** — para seções com visualizações, o usuário pode filtrar quais variantes serão exibidas (ex: mostrar apenas "Size = Small" e "State = Default").

5. **Escolher o modo visual** — Normal (fundo claro, anotações sutis) ou Destaque (fundo azul escuro, anotações verde brilhante para alto contraste).

6. **Ajustar configurações de layout** — largura do frame, padding horizontal, espaçamento entre seções, cor de fundo.

7. **Clicar em "Gerar"** — o plugin processa o componente e cria um novo frame no canvas do Figma, posicionado à direita do componente original, contendo toda a documentação.

8. **Resultado** — um frame chamado "NomeDoComponente — Especificação" aparece no canvas com todas as seções habilitadas, pronto para ser consultado ou exportado.

---

## 5. SEÇÕES E PAINÉIS

### Aba "Seções" (configuração principal)

#### Cores
- Tabela com três colunas: Elemento/Estado, Token e Referência (amostra visual da cor)
- Cores usadas por todas as variantes aparecem com o prefixo "Todos"
- Cores específicas de certas variantes mostram o nome da variante como prefixo
- A amostra de cor exibe o valor hex da cor extraída. Quando existe uma variável de cor associada, o plugin tenta vincular a amostra à variável, mas essa vinculação pode não funcionar corretamente em todos os casos

#### Padrões de Texto
- Tabela mostrando cada elemento de texto com seu token de estilo ou especificação detalhada (família, peso, tamanho, altura de linha, espaçamento)
- Visualização anotada: instância do componente com setas apontando para cada texto, mostrando o token ou spec
- Comportamento de truncamento: quando um texto tem limite de linhas configurado, mostra uma visualização com texto longo e a indicação "Ellipsis - limite de N linha(s)"
- Opção de gerar apenas tabela, apenas visualização, ou ambos

#### Medidas e Espaçamentos
- Tabela com medidas de gaps, paddings, border radius, altura, bordas — com tokens e valores em pixels
- Visualização de paddings e gaps: instância anotada com brackets coloridos mostrando as distâncias
- Visualização de dimensões e bordas: instância anotada com indicadores de altura, border radius, espessura de borda e tamanho de ícones
- Opção de gerar apenas tabela, apenas visualização, ou ambos

#### Efeitos
- Tabela com efeitos de sombra e desfoque, mostrando token, valor e tipo
- Visualização anotada: instâncias com setas indicando onde cada efeito está aplicado
- Opção de gerar apenas tabela, apenas visualização, ou ambos

#### Requisitos das Propriedades
- Visualização anotada mostrando quais elementos são opcionais (controlados por booleanos)
- Setas com label "Opcional: NomeDaPropriedade" apontam para os elementos que podem ser ligados/desligados
- Se diferentes variantes têm conjuntos diferentes de elementos opcionais, cada conjunto único ganha sua própria visualização
- Se todas as variantes têm os mesmos opcionais, apenas uma visualização é mostrada

#### Dependências (Componentes e Ícones)
- Grade de cards mostrando cada sub-componente e ícone usado, com uma instância visual e o nome
- Visualização de anatomia: para cada sub-componente, uma instância anotada do componente principal com uma seta indicando onde ele está posicionado

#### Estados
- Grade numerada de cards (01., 02., 03., ...) mostrando cada variante do componente como uma instância visual
- Configurável a quantidade de colunas por linha
- A ordem das propriedades nas etiquetas pode ser personalizada

#### Propriedades do Componente
- Tabela principal mostrando todas as propriedades configuráveis:
  - Variantes: com badges coloridos para cada opção (default preenchido, outros com borda)
  - Booleanos: com visualização de toggle on/off
  - Textos: com o valor padrão
  - Troca de instância: com badge mostrando o nome do componente padrão
- Sub-tabelas para cada componente aninhado exposto (nested instances configuradas para aparecer no painel de propriedades do Figma), mostrando suas próprias propriedades

### Aba "Configurações"

- Largura do frame de especificação
- Padding horizontal
- Espaçamento entre seções
- Cor de fundo
- Ordem das propriedades de variantes (arrastar e soltar para definir a prioridade na exibição)

### Aba "Anotações / Assets"

Ferramenta para inserir marcadores manuais individualmente no canvas:

- **Medidas**: marcadores horizontais e verticais com badge de valor
- **Gaps**: indicadores tracejados de espaçamento entre elementos
- **Paddings**: indicadores tracejados de espaçamento interno
- **Ponteiros**: bolinha + linha + label em 4 direções (cima, baixo, esquerda, direita)
- **Badges numerados**: círculos com números em 4 direções
- **Indicadores de área**: círculos e quadrados tracejados, sólidos ou com contorno

Cada marcador pode ser configurado com: valor/label, cor (vermelho, azul, rosa, verde, preto), direção, modo destaque e tamanho. Quando um marcador existente é selecionado no canvas, o painel mostra seus valores atuais para edição ao vivo.

---

## 6. REGRAS DE NEGÓCIO

### Seleção e validação
- O plugin só funciona com elementos do tipo Component, Component Set ou Instance selecionados
- Se nenhum elemento válido estiver selecionado, o painel mostra "Nenhum componente selecionado"
- Múltiplos componentes podem ser selecionados e processados de uma vez

### Extração de dados
- Elementos invisíveis são ignorados na extração
- Sub-componentes reutilizáveis (como Button, Avatar, etc.) não têm seus internos analisados — apenas são listados como dependências. Apenas componentes "estruturais" (com nome começando em `.`, `-` ou `_`) têm seus internos percorridos
- Prefixos estruturais (`.Asset/`, `._`, etc.) são removidos dos nomes exibidos
- Componentes com nomes começando em "Space", "Spaced" ou "Spacer" são filtrados como utilitários de espaçamento e não aparecem na lista de dependências

### Agrupamento inteligente (tabelas)
- Quando um valor (cor, espaçamento, efeito) é igual em **todas** as variantes, ele aparece com o prefixo "Todos" na tabela, em vez de repetir para cada variante
- Quando é específico de certas variantes, o nome da variante aparece como prefixo
- Valores idênticos são deduplicados — mesma cor usada no mesmo elemento em variantes diferentes gera apenas uma linha

### Visualizações com grid
- Para componentes com múltiplas variantes, as visualizações anotadas são organizadas em uma grade
- O número de colunas é configurável pelo usuário (padrão: 2)
- Todas as células de uma linha têm a mesma altura (baseada na variante mais alta)
- Variantes sem conteúdo relevante para uma seção são excluídas da grade (ex: variante sem efeitos não aparece na grade de efeitos)

### Filtros de variantes
- O usuário pode filtrar quais valores de propriedade aparecem (ex: mostrar apenas "Size = Small" e "Size = Large")
- Filtros são aplicados tanto às tabelas quanto às visualizações
- Quando múltiplas variantes resultam na mesma combinação visível após filtro, a "melhor" representante é escolhida (priorizando valores como "Default", "Regular" ou "Enabled" para as propriedades ocultas)

### Nested instances (Propriedades)
- A seção de propriedades mostra nested instances apenas quando elas foram configuradas no Figma como "exposed instances" (instâncias expostas no painel de propriedades)
- A detecção percorre todos os variants do componente, recursivamente por frames, mas sem entrar dentro de outras instâncias
- Nomes de component sets com prefixos estruturais (`.Asset/`) são limpos automaticamente

### Requisitos
- Apenas elementos com visibilidade vinculada a uma propriedade booleana são considerados "opcionais"
- A análise percorre todos os variants — se diferentes variants têm conjuntos diferentes de opcionais, cada conjunto único ganha sua própria visualização
- Variants com o mesmo conjunto de opcionais são agrupados e representados por apenas um

### Tokens de design
- O plugin resolve tokens de variáveis do Figma para cores, espaçamentos, dimensões, border radius, bordas e efeitos
- Prefixos de categoria (como `border-radius-`, `shapes-`, `spacing-`) são removidos dos nomes dos tokens para exibição
- Tokens de tamanho de ícone são mapeados por uma tabela de correspondência (ex: 24px → `$icon-md`)
- Quando não há token aplicado, o valor em pixels é exibido diretamente

### Posicionamento e layout
- O frame de especificação é criado à direita do componente original, com 200px de distância
- O frame usa auto-layout vertical com as configurações de padding e espaçamento definidas pelo usuário
- Seções são separadas por linhas divisórias finas cinzas

### Modo de visualização
- **Normal**: fundo claro, anotações em cores temáticas sutis (vermelho para medidas, azul para paddings, verde para texto, roxo para bordas, laranja para efeitos)
- **Destaque**: fundo azul escuro vibrante, anotações em verde brilhante para máximo contraste

---

## 7. LIMITAÇÕES CONHECIDAS

1. **Apenas componentes locais**: O plugin funciona com componentes do arquivo atual. Componentes de bibliotecas externas podem não ter todas as informações resolvidas (especialmente tokens de troca de instância).

2. **Limite de sub-componentes**: A seção de dependências exibe no máximo 100 sub-componentes. Se houver mais, um aviso é exibido.

3. **Análise de nested instances**: Apenas componentes aninhados que foram configurados como "exposed instances" no Figma aparecem na seção de propriedades. Componentes internos não expostos são ignorados.

4. **Fonte preferencial**: O plugin tenta usar a família tipográfica "BancoDoBrasil Textos". Se não estiver disponível, usa Inter ou Roboto como fallback. Se nenhuma estiver carregada, a geração pode falhar para os textos.

5. **Variantes sem dados**: Se uma seção não encontra dados relevantes (ex: nenhuma cor, nenhum efeito), ela é silenciosamente omitida — sem aviso ao usuário.

6. **Complexidade do grid**: Para componentes com muitas variantes (ex: 50+), os grids de visualização podem ficar muito grandes. O filtro de variantes ajuda a controlar isso, mas não há paginação.

7. **Detecção de ícones**: Ícones são identificados pela presença de um nó "Vector" na árvore — componentes que usam SVG inline mas não têm um nó chamado "Vector" podem não ser detectados como ícones.

8. **Tokens de efeito**: Tokens de efeito são extraídos do estilo de efeito do Figma. Se o efeito é aplicado sem um estilo nomeado, o valor bruto é exibido em vez de um token.

9. **Marcadores manuais**: Os marcadores de anotação inseridos pela aba "Assets" são elementos estáticos — não atualizam automaticamente se o componente mudar.

10. **Processamento sequencial**: A geração é síncrona dentro do Figma — componentes muito complexos podem levar vários segundos para processar, durante os quais o Figma pode parecer congelado.
