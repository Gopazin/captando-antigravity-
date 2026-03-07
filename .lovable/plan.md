

# Projeto Fácil - Plano de Implementação

## Identidade Visual
- Paleta: Azul Marinho (#1e3a5f), Branco, Verde Esmeralda (#10b981)
- Interface estilo dashboard administrativo com Shadcn UI + Tailwind
- Ícones Lucide React

## Estrutura de Navegação
- **Sidebar** com navegação: Dashboard, Cofre da Organização, Banco de Editais, Meus Projetos, Configurações
- Sidebar colapsável com ícones no modo mini

## Telas

### 1. Dashboard
- Cards resumo: projetos ativos, editais próximos do prazo, status geral
- Lista de prazos urgentes e projetos recentes

### 2. Cofre da Organização
- Formulário multi-abas (Tabs):
  - **Dados Básicos**: Nome, CNPJ, Localização, Missão, Visão
  - **Capacidade Técnica**: Projetos realizados, equipe, currículos
  - **Documentação**: Upload de arquivos (Estatuto, Ata, CNPJ) com metadados
- Dados salvos em localStorage inicialmente (preparado para Supabase)

### 3. Banco de Editais
- Tabela com filtros por Prazo, Valor e Área (Cultura, Esporte, Social)
- Botão "Novo Edital" com opção URL ou Upload PDF
- Sheet lateral com resumo: Elegibilidade, Teto de Valor, Data Limite

### 4. Assistente de Projetos (Stepper)
- **Fase 1 - Seleção**: Escolher perfil do Cofre + Edital alvo
- **Fase 2 - Ideação**: Campo de briefing + botão "Sugerir com IA" (3 conceitos)
- **Fase 3 - Estruturação**: IA gera Título, Justificativa, Objetivos, Metodologia
- **Fase 4 - Refinamento**: Layout duas colunas — editor rich text à esquerda, chat IA à direita
- Feedbacks visuais (loaders/skeletons) durante processamento IA

### 5. Meus Projetos
- Lista de projetos com status: Rascunho, Em Revisão, Finalizado
- Badges coloridos por status
- Acesso rápido para continuar edição

### 6. Configurações
- Perfil de usuário e placeholder para assinatura

## Backend (preparação)
- Estrutura de tipos TypeScript para: organizations, grants, projects
- Frontend preparado para Edge Functions + Lovable AI (Gemini)
- Dados mock para demonstração inicial

## Implementação em fases
1. Layout base (sidebar, rotas, tema de cores)
2. Cofre da Organização (formulário multi-abas)
3. Banco de Editais (tabela, filtros, sheet)
4. Assistente de Projetos (stepper completo)
5. Dashboard e Meus Projetos
6. Configurações

