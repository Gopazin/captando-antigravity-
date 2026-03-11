

## Plan: Integrate Grant Sources Directory into Editais Page

### What the user provided
A standalone component with 30 curated grant sources (Agregadores, Governo Federal, FAPs, Cultura Estadual, Institutos Privados, Internacional) with filtering by category, type, resource type, and coverage area.

### Current state
The `Editais.tsx` page has:
- A "Banco de Editais" with DB-backed grants (from Supabase `grants` table)
- AI auto-search, URL/PDF parsing, manual entry
- Table view with filters and detail sheet

### Approach: Add a "Fontes de Editais" tab to the existing page

Rather than replacing the current page, we'll add a **Tabs** structure at the top level:
1. **Editais Capturados** — the current grants table (DB-backed)
2. **Fontes de Editais** — the new static directory of 30 sources with filters

This preserves all existing functionality while integrating the new data.

### Implementation Details

1. **Create `src/data/grantSources.ts`** — Extract the 30 FONTES entries + category colors as a typed data module.

2. **Create `src/components/GrantSourcesDirectory.tsx`** — A component adapted from the provided code, but using the project's existing UI components (shadcn Input, Select, Badge, Card) instead of raw HTML/Tailwind to maintain visual consistency. Includes:
   - Search bar
   - 4 filter selects (Categoria, Tipo, Recurso, Abrangência)
   - Card grid with source cards
   - Clear filters button

3. **Update `src/pages/Editais.tsx`** — Wrap existing content and new directory in a top-level `Tabs` component:
   - Tab "Editais" → existing grants table + actions
   - Tab "Fontes" → `<GrantSourcesDirectory />`
   - Header stays above tabs (title, action buttons)

### Files changed
- `src/data/grantSources.ts` (new)
- `src/components/GrantSourcesDirectory.tsx` (new)
- `src/pages/Editais.tsx` (modified — wrap in Tabs)

