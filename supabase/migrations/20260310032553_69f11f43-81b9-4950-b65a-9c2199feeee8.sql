
-- Create grants table
CREATE TABLE public.grants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  area TEXT NOT NULL DEFAULT 'social',
  max_value NUMERIC DEFAULT 0,
  deadline DATE,
  eligibility TEXT DEFAULT '',
  description TEXT DEFAULT '',
  source_url TEXT,
  source_file TEXT,
  source_type TEXT DEFAULT 'manual' CHECK (source_type IN ('manual', 'url', 'pdf', 'auto_search')),
  raw_content TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.grants ENABLE ROW LEVEL SECURITY;

-- Public read access (grants are public data)
CREATE POLICY "Anyone can read grants" ON public.grants FOR SELECT USING (true);

-- Only authenticated users can insert/update
CREATE POLICY "Authenticated users can insert grants" ON public.grants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update grants" ON public.grants FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.grants;
