-- Add is_selected column to grants
ALTER TABLE public.grants ADD COLUMN is_selected boolean DEFAULT false;

-- Add new enum values to project_status
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'aguardando_resultado';
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'prestacao_contas';
ALTER TYPE public.project_status ADD VALUE IF NOT EXISTS 'reprovado';