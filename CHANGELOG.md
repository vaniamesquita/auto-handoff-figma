# Changelog

## [1.6] - 2026-05-11

### Bugs corrigidos

- Corrigida a tabela de medidas e espaçamentos: tokens de Height e Width não apareciam na tabela quando a propriedade `size` estava ausente do `variantPropertyOrder` (configuração usada para filtrar colunas na tabela de cores). O problema era que o mesmo filtro de propriedades era aplicado incorretamente à tabela de espaçamentos, fazendo variantes de tamanhos diferentes receberem o mesmo label (ex: `Default`) e seus tokens ficarem sem identificação. A tabela de medidas agora sempre exibe todas as propriedades da variante nos labels das linhas, independente da configuração de colunas da tabela de cores.

---

## [1.5] - 2026-04-13

### Bugs corrigidos

- Corrigida a visualização de tokens de texto: tokens de nós de texto dentro de subcomponentes aninhados (`.asset` dentro de `.asset`) agora são exibidos corretamente na visualização. O problema era duplo: a deduplicação usava `resolveNodeName`, que colapsava todos os textos de um mesmo subcomponente em um único nó descartando os demais; e o match comparava o nome completo do subcomponente (`"Asset / Label Caption / Small"`) contra `spec.element` (`"Label"`), que nunca coincidia. A correção aplica deduplicação por assinatura de fonte (família + peso + tamanho) e prioriza o match por fonte, que é o dado mais confiável para subcomponentes aninhados.
- Corrigido o Live Editing: ao alterar a cor de um pointer existente, a nova cor selecionada no color picker não era aplicada. O problema era que o código sempre substituía o valor do picker pela cor original salva no marker (`currentMarkerConfig.colorType`), ignorando a mudança do usuário.

---

## [1.4] - 2026-04-08

### Bugs corrigidos

- Corrigido formato do token de cor na tabela de cores: o prefixo `$color-` duplicado foi removido, passando de `$color-bbds-v2-color-...` para o formato correto `$bbds-v2-color-...`.

---

## [1.3] - 2026-03-10

### Bugs corrigidos

- Corrigida a tabela de cores: propriedades sem nenhum valor selecionado nos filtros de variantes não aparecem mais no label das linhas.
- Corrigida a seção de medidas e espaçamentos: bordas aplicadas em frames internos do componente agora são anotadas na visualização, não apenas no frame externo.
- Corrigida a tabela de medidas e espaçamentos: a ordem e seleção de propriedades de variante configurada pelo usuário agora é respeitada nos labels das linhas, assim como já ocorria na tabela de cores.

### Otimizações

- Removido arquivo `src/config/icon-tokens.ts` sem uso.
- Removida interface `StrokeInfo` duplicada de `src/types/index.ts` (definição canônica mantida em `src/core/token-resolution.ts`).
- Removida função `createText()` exportada de `src/ui/table-builder.ts` sem consumidores.
- Substituídos dois blocos de resolução manual de variável em `spacing.ts` pelo utilitário centralizado `findBoundVariableToken`.

---

## [1.2] - 2026-03-10

### Bugs corrigidos

- Corrigida a seção de dimensão e bordas, que não exibia o tamanho de ícones instanciados dentro do componente principal (padrão placeholder com Vector).

---

## [1.1] - 2026-03-06

### Bugs corrigidos

- Corrigido prefixo duplicado "$textstyle" na nomenclatura dos tokens de texto.
- Corrigida a seção de dimensão e bordas, que não exibia as informações dos componentes estruturantes (.asset).
- Corrigido erro no Live Editing em que a cor original do pointer não era preservada no modo On Highlight.
- Corrigido erro em que o frame de componentes utilizados não recebia o fundo correto no modo On Highlight.

### Melhorias

- Na seção de dimensão e bordas, quando os valores são iguais, agora é exibido apenas um marcador, evitando sobreposição.
