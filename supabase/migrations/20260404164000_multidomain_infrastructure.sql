-- Alter table projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS domain text DEFAULT 'tecnologia',
ADD COLUMN IF NOT EXISTS project_type text DEFAULT 'edital' CHECK (project_type IN ('edital', 'emenda')),
ADD COLUMN IF NOT EXISTS readiness_level jsonb DEFAULT '{}'::jsonb;

-- Alter table grants
ALTER TABLE public.grants
ADD COLUMN IF NOT EXISTS evaluation_framework jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS ods_prioritarios text[] DEFAULT '{}';

-- Create table project_evaluations
CREATE TABLE IF NOT EXISTS public.project_evaluations (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    layer text NOT NULL CHECK (layer IN ('conformidade', 'merito', 'alinhamento')),
    domain_context text,
    score numeric,
    feedback text,
    suggestions jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- RLS
ALTER TABLE public.project_evaluations ENABLE ROW LEVEL SECURITY;

-- Create policy for project_evaluations
CREATE POLICY "Users can view their own project evaluations"
    ON public.project_evaluations FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM public.projects WHERE organization_id IN (
                SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert project evaluations for their projects"
    ON public.project_evaluations FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects WHERE organization_id IN (
                SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update their own project evaluations"
    ON public.project_evaluations FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM public.projects WHERE organization_id IN (
                SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete their own project evaluations"
    ON public.project_evaluations FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM public.projects WHERE organization_id IN (
                SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid()
            )
        )
    );
