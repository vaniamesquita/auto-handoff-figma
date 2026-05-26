# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Auto Handoff Generator** is a Figma plugin that automatically generates design specification documents from selected components. Given a `COMPONENT`, `COMPONENT_SET`, or `INSTANCE`, it extracts colors, typography, spacing, borders, effects, and component structure, then renders them as formatted annotation tables and visual grids directly in the Figma canvas.

Key capabilities:
- Per-variant color/text/spacing/effect tables with token resolution
- Visual grids showing component states and variants
- Measurement annotations with live-editing support
- Multi-component batch generation

---

## Architecture: Two-Context Separation

Figma plugins run in **two isolated JavaScript environments**. Mixing their APIs is a runtime error.

### 1. Plugin Sandbox — `src/main.ts` → `code.js`
- Runs in a sandboxed JS environment with **no DOM access**
- Has full access to `figma.*` API (nodes, pages, variables, etc.)
- Compiled by esbuild to a single `code.js` IIFE
- Entry point: `figma.showUI(__html__, ...)` and `figma.ui.onmessage`

### 2. UI iframe — `ui.html`
- Runs in a browser iframe with **full DOM access**
- Has **no access** to `figma.*`
- Communicates with the sandbox via `parent.postMessage(msg, '*')` and `window.onmessage`

### Message Protocol
```
UI → Sandbox:    parent.postMessage({ pluginMessage: { type, ...payload } }, '*')
Sandbox → UI:    figma.ui.postMessage({ type, ...payload })
```

**Active message types:**

| Type | Direction | Purpose |
|------|-----------|---------|
| `init` | → UI | Send component name + variant properties on open |
| `generate` | UI → | Trigger spec generation with `GenerationOptions` |
| `marker-selected` | → UI | Notify UI a marker was clicked (send `MarkerConfig`) |
| `marker-deselected` | → UI | Reset marker editing panel |
| `insert-asset` | UI → | Insert a measurement marker at current selection |
| `update-marker` | UI → | Update an existing marker's config |
| `selection-info` | → UI | Update header with current selection name/type |
| `resize` | UI → | Resize the plugin panel |
| `refresh` | UI → | Re-run init |
| `close` / `cancel` | UI → | Close the plugin |

---

## Tech Stack

| Tool | Version | Role |
|------|---------|------|
| TypeScript | `^5.3.2` | Language |
| esbuild | `^0.27.2` | Bundler (sandbox → `code.js`) |
| @figma/plugin-typings | `^1.121.0` | Figma API types |
| @figma/eslint-plugin-figma-plugins | `*` | Figma-specific lint rules |
| ESLint + `@typescript-eslint` | `^8` / `^6` | Linting |
| Prettier | `3.8.0` | Formatting |

**tsconfig highlights:**
- `"target": "ES2017"`, `"lib": ["ES2017"]` — no modern globals
- `"strict": true` — full strict mode
- `"moduleResolution": "bundler"` — esbuild-compatible resolution
- `"noEmit": true` — tsc is type-check only; esbuild handles output

---

## Build & Dev Commands

```bash
npm run build          # Bundle src/main.ts → code.js (esbuild, IIFE, ES2017)
npm run build:check    # TypeScript type-check only (tsc --noEmit)
npm run watch          # Development watch mode (rebuilds on save)
npm run lint           # Run ESLint
npm run lint:fix       # Run ESLint with auto-fix
```

**To test the plugin:** Figma Desktop → Plugins → Development → Import plugin from manifest → select `manifest.json`.

---

## Module Structure

```
src/
├── main.ts              # Entry point: init, message handler, generateSpec()
├── types/index.ts       # All TypeScript interfaces (single source of truth)
├── core/
│   ├── traversal.ts     # Single-pass tree walk — extracts all spec data
│   └── node-helpers.ts  # Node utilities: visibility, icon barrier, var resolution
├── features/            # Section generators — each returns Promise<boolean>
│   ├── colors.ts        # Color table with inverse grouping
│   ├── typography.ts    # Text styles and visualization grids
│   ├── spacing.ts       # Gap/padding/border measurements
│   ├── effects.ts       # Shadow and blur tables
│   ├── components.ts    # Used components / anatomy section
│   ├── states.ts        # Variant state grids
│   ├── properties.ts    # Component properties table
│   ├── requirements.ts  # Requirements section
│   └── common.ts        # Shared grid/section utilities
├── ui/
│   ├── table-builder.ts # TableBuilder class — low-level Figma table layout
│   └── annotations.ts   # createSimpleAnnotation() — measurement pointers
├── config/
│   ├── theme.ts         # THEME_NORMAL / THEME_HIGHLIGHT + getTheme()
│   ├── constants.ts     # IGNORED_PROPERTIES, SIZE_ORDER, SEMANTIC_ROLES
│   └── icon-tokens.ts   # Icon size mappings
├── utils/
│   ├── helpers.ts       # Color conversion, token formatting, string utils
│   └── fonts.ts         # Font loading + getFont()
└── assets/
    └── marker-generator.ts  # insertAssetIntoFigma(), updateMarker()
```

---

## Code Style Rules

- **Section headers**: Use `// ========================================` dividers for logical sections within a file
- **JSDoc**: All exported functions have a JSDoc comment with `@param` and `@returns`
- **Async pattern**: All Figma node operations that can be async use `await` (e.g., `getMainComponentAsync()`)
- **Naming**: camelCase for variables/functions, PascalCase for interfaces/types
- **Unused params**: Prefix with `_` to satisfy `no-unused-vars` ESLint rule
- **Portuguese strings**: All UI-facing text (notification messages, element names in spec frames) is in Portuguese
- **Feature module signature**: Every section generator follows:
  ```typescript
  export async function createXxxSectionCombined(
    parent: FrameNode,
    variantColors: VariantColors[],
    nodeToProcess: ComponentNode | ComponentSetNode | InstanceNode,
    tableWidth: number,
    ...options
  ): Promise<boolean>  // Returns true if any content was created
  ```

---

## TypeScript Rules

- **No `any`** — use proper types or `unknown` with type guards
- **All interfaces live in `src/types/index.ts`** — do not define types inline in feature files
- **Strict null checks**: `!` non-null assertions are allowed only when the value is provably non-null from surrounding logic; add a comment explaining why
- **Figma API extensions**: Properties that exist at runtime but not in `@figma/plugin-typings` go in the `src/types/index.ts` extension section (e.g., `IndividualStrokeWeights`, `TextNodeWithMaxLines`)
- **Run after every change**:
  ```bash
  npm run build:check
  ```

---

## Figma API Rules

- **Always wrap `figma.*` calls in try/catch** when there's any chance of failure (e.g., `getMainComponentAsync`, variable resolution, font loading)
- **Font loading is required** before setting `characters` on a TextNode — call `loadPluginFonts()` first
- **`figma.closePlugin()`** must be called when generation is complete; the plugin panel stays open otherwise
- **`figma.notify()`** for user feedback — cancel loading notifications before showing success/error
- **PluginData**: Use `node.getPluginData("markerConfig")` / `node.setPluginData(...)` to persist marker state across sessions
- **`figma.currentPage.selection`** is synchronous; `getMainComponentAsync()` is async — always await it
- **`highlightMode`**: When updating existing markers, always pass `colorType` and `highlightMode` from the existing `MarkerConfig` — never hardcode `highlightMode: false`

---

## Traversal & Data Collection Rules

- **Single-pass**: `collectNodeData()` in `traversal.ts` extracts everything in one tree walk — do not add separate traversals in feature files
- **Structural nodes**: Nodes whose names start with `.`, `-`, or `_` are structural — their children are walked but the node itself is transparent to data collection
- **Icon barrier rule**: An icon instance (INSTANCE with a direct `Vector` child) is only collected if there is no non-structural INSTANCE between it and `componentRoot`. Enforced by `shouldCollectIcon()` in `node-helpers.ts`
- **Nested instances**: Non-structural nested instances are skipped entirely (they are separate components)
- **Inverse grouping**: Tables group rows by data signature (color value + token), not by variant. Items shared across all variants get "Todos" prefix

---

## Refactoring Rules

1. **Minimal changes** — do not refactor unrelated code while fixing something specific
2. **Run `npm run build:check` after every file change** — catch type errors immediately
3. **One file at a time** — complete and verify each file before moving to the next
4. **Do not move types** — `src/types/index.ts` is the canonical location; don't split or inline
5. **Preserve behavior** — no silent logic changes during refactoring

---

## Development Workflow

- Always run `npm run watch` during development
- Test in Figma Desktop only — browser preview does not support plugin sandbox
- After any change to `src/`: run `npm run build:check` before considering done
- Never test with `code.js` directly — always rebuild from source

---

## Error Handling Pattern

- Loading: `const notif = figma.notify("...", { timeout: Infinity })`
- Always cancel before success/error: `notif.cancel()`
- Success: `figma.notify("✅ ...")`
- Error: `figma.notify("❌ ...", { error: true })`

---

## Do NOT Touch

| File/Pattern | Reason |
|---|---|
| `code.js` | Auto-generated by esbuild — edit `src/main.ts` instead |
| `manifest.json` | Figma plugin manifest — structure must not change |
| `node_modules/` | Dependencies |
| Frame names in `SPEC_FRAME_NAMES_TO_RENAME` | Used for systematic renaming of generated spec sections |
