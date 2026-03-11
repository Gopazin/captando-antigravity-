

## Plan: Expand Grant Sources Database

Based on web research, I found numerous additional sources relevant for public entities, private organizations, and third sector. Here are the new sources to add, organized by category:

### New Sources (20 additions)

**Terceiro Setor / Social:**
- Fundo Brasil de Direitos Humanos — grants for civil society organizations
- Capemisa Instituto de Ação Social — social assistance projects for OSCs
- ABCR (Assoc. Brasileira de Captadores de Recursos) — aggregator for third sector
- Observatório do 3º Setor — news and grants for NGOs
- Mapa das OSCs (IPEA) — government portal mapping OSC opportunities
- Plataforma Conjunta — aggregator for social impact funding
- Nossa Causa — aggregator for social project grants

**Government (additional):**
- Ministério dos Direitos Humanos — human rights project grants
- Portal do Incentivo — aggregator for all incentive laws (Rouanet, Esporte, etc.)
- Cultura Presente — culture incentive law projects aggregator

**Instituto Privado (additional):**
- Itaú Social — education and social development grants
- Instituto Ayrton Senna — education-focused grants
- Fundação Lemann — public education improvement
- Fundação Telefônica Vivo — digital education and innovation
- Fundação Roberto Marinho — education and culture

**Internacional (additional):**
- Ford Foundation — social justice grants globally
- Open Society Foundations — democracy and human rights
- Bill & Melinda Gates Foundation — health, education, poverty
- Inter-American Foundation (IAF) — Latin America community development
- GIZ (German cooperation) — sustainable development in Brazil

### Implementation
1. Add all 20 new entries to `src/data/grantSources.ts` with proper typing
2. Add new category "Terceiro Setor" to `CATEGORIA_COLORS` mapping
3. IDs continue from 36 onward

### Files changed
- `src/data/grantSources.ts` — add entries + new category color

