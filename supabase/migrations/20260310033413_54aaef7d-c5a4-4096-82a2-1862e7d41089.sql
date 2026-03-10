
-- Create project status enum
CREATE TYPE public.project_status AS ENUM ('ideacao', 'elaboracao', 'revisao', 'submissao', 'aprovado', 'em_execucao', 'concluido', 'arquivado');

-- Create priority enum
CREATE TYPE public.task_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');

-- Create task status enum
CREATE TYPE public.task_status AS ENUM ('pendente', 'em_andamento', 'concluida', 'bloqueada');

-- Projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  grant_id UUID REFERENCES public.grants(id),
  status project_status NOT NULL DEFAULT 'ideacao',
  briefing TEXT DEFAULT '',
  generated_title TEXT DEFAULT '',
  justification TEXT DEFAULT '',
  objectives TEXT DEFAULT '',
  methodology TEXT DEFAULT '',
  budget NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  ai_notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project tasks table
CREATE TABLE public.project_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status task_status NOT NULL DEFAULT 'pendente',
  priority task_priority NOT NULL DEFAULT 'media',
  due_date DATE,
  assigned_to TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project notes/activity log
CREATE TABLE public.project_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'manual' CHECK (note_type IN ('manual', 'ai_suggestion', 'status_change', 'system')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;

-- Public read/write for MVP (no auth yet)
CREATE POLICY "Anyone can read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Anyone can insert projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update projects" ON public.projects FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete projects" ON public.projects FOR DELETE USING (true);

CREATE POLICY "Anyone can read tasks" ON public.project_tasks FOR SELECT USING (true);
CREATE POLICY "Anyone can insert tasks" ON public.project_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update tasks" ON public.project_tasks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete tasks" ON public.project_tasks FOR DELETE USING (true);

CREATE POLICY "Anyone can read notes" ON public.project_notes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert notes" ON public.project_notes FOR INSERT WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_tasks;
