

## Plan: Real Office Workflow — From Grant Selection to Project Management

### The Flow

```text
RADAR DE EDITAIS          ESCRITÓRIO DE PROJETOS              GESTÃO DE PROJETOS
─────────────────    ──────────────────────────────────    ─────────────────────
                     
[Mapeamento]  ──►    [Editais Selecionados]                
 marcar edital        ver editais marcados                 
 como interesse       criar projeto a partir do edital     
                                │                          
                                ▼                          
                     [Kanban de Projetos]                   
                      Elaboração ► Revisão Interna         
                      ► Submissão ► Aguardando Resultado   
                                │                          
                                ▼ (aprovado)               
                                                          [Projetos Aprovados]
                                                           Em Execução
                                                           Prestação de Contas
                                                           Concluído
```

### Changes Required

**1. Database: Add `is_selected` to grants table**
- Add `is_selected boolean default false` to the `grants` table so users can mark grants of interest from the Radar.

**2. Radar de Editais (`Editais.tsx`)**
- Add a "star/bookmark" button on each grant row to toggle `is_selected`.
- Visual indicator (filled star) for selected grants.

**3. Escritório de Projetos — Restructure with Tabs**
- Replace the current single Kanban view with a tabbed layout:
  - **Editais Selecionados**: Shows grants marked as `is_selected`. Each card has a "Criar Projeto" button that creates a project linked to that grant (`grant_id`).
  - **Kanban de Projetos**: The existing Kanban, but columns adjusted to the pre-approval workflow: `Elaboração → Revisão Interna → Submissão → Aguardando Resultado`.
- Remove `ideacao` status (projects are now created from selected grants, not from scratch).
- The "Novo Projeto" button moves into the "Editais Selecionados" tab (project always linked to a grant).

**4. Update Project Statuses**
- Rename/adjust statuses to match the real flow:
  - `elaboracao` — Elaboração (writing the project)
  - `revisao` — Revisão Interna (internal quality check)  
  - `submissao` — Submissão (sent to granting org)
  - `aguardando` — Aguardando Resultado (waiting for decision) *(new)*
  - `aprovado` — Aprovado (transitions to Gestão)
  - `em_execucao` — Em Execução (in Gestão)
  - `prestacao_contas` — Prestação de Contas *(new)*
  - `concluido` — Concluído
  - `reprovado` — Reprovado *(new)*
  - `arquivado` — Arquivado
- Migration to add new enum values and rename as needed.

**5. Gestão de Projetos — Only Approved Projects**
- Filter to show only projects with status `aprovado`, `em_execucao`, `prestacao_contas`, or `concluido`.
- This section manages execution, not elaboration.

**6. Sidebar Navigation** — No structural changes needed, current nav already separates Escritório and Gestão.

### Files Changed
- **Migration**: Add `is_selected` column to grants; add new enum values to `project_status`
- `src/hooks/useProjects.ts` — Update status types, labels, colors, Kanban columns
- `src/pages/Editais.tsx` — Add bookmark/select toggle on grant rows
- `src/pages/EscritorioKanban.tsx` — Add tabs (Editais Selecionados + Kanban), create project from grant
- `src/components/KanbanBoard.tsx` — Update columns to pre-approval only
- `src/pages/GestaoProjetosOverview.tsx` — Filter to post-approval statuses only

