# Design: Seletor de Fonte na Aba Layout

**Data:** 2026-05-26  
**Status:** Aprovado

---

## Contexto

O plugin usa `BancoDoBrasil Textos` como fonte principal, com fallback automático para Inter/Roboto quando ela não está instalada. Usuários externos ao Banco do Brasil não têm essa fonte e o comportamento de fallback é silencioso — não há controle explícito sobre qual fonte será usada na spec gerada.

---

## Objetivo

Adicionar um seletor de fonte na aba Layout do plugin. O usuário escolhe explicitamente a fonte que será usada em todos os textos da spec gerada no Figma. A fonte padrão é **Inter**. **Banco do Brasil Textos** só aparece como opção se estiver instalada no Figma do usuário.

---

## Arquitetura

### Verificação de disponibilidade (Sandbox → UI)

A verificação acontece no **plugin sandbox** (`main.ts`) durante o `init`, pois somente ele tem acesso ao `figma.*`. A lista de fontes disponíveis é enviada para a UI via `postMessage`.

```
Plugin abre
  → main.ts: checkAvailableFonts() tenta carregar Regular de cada candidata
  → postMessage({ type: "init", ..., availableFonts: ["Inter", "Roboto"] })
  → UI monta <select> apenas com as fontes confirmadas
```

Candidatas verificadas (em ordem):
1. `BancoDoBrasil Textos`
2. `Inter`
3. `Roboto`

Inter e Roboto são fontes embutidas no Figma — na prática sempre estarão disponíveis. A verificação formal garante consistência.

### Seleção e envio (UI → Sandbox)

```
Usuário escolhe fonte no <select id="fontFamily">
  → getSelectedOptions() inclui { fontFamily: "Inter" | "Roboto" | "BancoDoBrasil Textos" }
  → postMessage({ type: "generate", options })
  → main.ts: generateSpec(options)
  → loadPluginFonts(options.fontFamily)
```

### Carregamento de fonte com preferência explícita

`loadPluginFonts(preferredFamily?: string)` é modificada:

- Se `preferredFamily` é informada: reseta o cache (`resolvedFontFamily = null`) e tenta carregar essa família primeiro
- Se carregamento falhar (improvável, pois só aparece se verificada no init): cai no fallback existente (Inter → Roboto)
- Se `preferredFamily` não é informada: comportamento atual inalterado

---

## Interface — Aba Layout

Novo controle adicionado ao fim da lista de configurações de layout, seguindo o padrão `.layout-setting` existente:

```
┌─────────────────────────────────────────────┐
│ Largura do frame          [1140]  px         │
│ Padding horizontal        [100]   px         │
│ Espaçamento entre seções  [48]    px         │
│ Cor de fundo              [F4F5F7] ⬛        │
│ Fonte                     [Inter ▼]          │
└─────────────────────────────────────────────┘
```

O `<select>` é populado dinamicamente via JS com base em `availableFonts` recebido no `init`. Valor padrão: `"Inter"`.

---

## Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `src/main.ts` | Adicionar `checkAvailableFonts()`; incluir `availableFonts` no `postMessage init`; passar `options.fontFamily` em `loadPluginFonts()` |
| `src/utils/fonts.ts` | `loadPluginFonts(preferredFamily?: string)` — aceita família preferida, reseta cache quando informada |
| `src/types/index.ts` | Adicionar `fontFamily?: string` em `GenerationOptions` |
| `ui.html` | Adicionar `<select id="fontFamily">` na aba Layout; popular o select no handler `init`; incluir `fontFamily` em `getSelectedOptions()` |

---

## Fora do escopo

- Não há verificação em tempo real ao trocar a seleção (só no init)
- Não persiste a preferência entre sessões do plugin (sem `clientStorage`)
- Não lista todas as fontes do Figma — apenas as 3 candidatas fixas
