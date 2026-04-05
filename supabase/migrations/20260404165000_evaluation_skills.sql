-- Create the evaluation_skills table to store dynamic prompts
CREATE TABLE IF NOT EXISTS public.evaluation_skills (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    domain text NOT NULL, -- ex: 'cultura', 'tecnologia', 'saude', 'emenda'
    layer text NOT NULL CHECK (layer IN ('conformidade', 'merito', 'alinhamento')),
    instruction text NOT NULL, -- The actual prompt injected into the LLM
    version integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE (domain, layer)
);

-- RLS
ALTER TABLE public.evaluation_skills ENABLE ROW LEVEL SECURITY;

-- Only superadmins (or strictly managed orgs) can write, but for now we'll allow select to all authenticated users running evaluations
CREATE POLICY "Anyone can read evaluation skills"
    ON public.evaluation_skills FOR SELECT
    USING (true);

-- We assume super_admin writes will be done via direct dashboard/SQL for now, or a specific admin policy later
