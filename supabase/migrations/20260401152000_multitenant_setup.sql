-- 1. Create Organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    plan_type TEXT DEFAULT 'free',
    credits_balance INTEGER DEFAULT 0,
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create User Roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('super_admin', 'org_admin', 'org_member')) DEFAULT 'org_member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- 3. Update existing tables
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- 4. Set Restrictions (RLS)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their organization" 
ON public.organizations FOR SELECT 
TO authenticated 
USING (
  id IN (SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid()) 
  OR 
  'super_admin' IN (SELECT role FROM public.user_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Super admins can manage organizations" 
ON public.organizations FOR ALL 
TO authenticated 
USING (
  'super_admin' IN (SELECT role FROM public.user_roles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can see their own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR
  organization_id IN (SELECT organization_id FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'org_admin'))
);
