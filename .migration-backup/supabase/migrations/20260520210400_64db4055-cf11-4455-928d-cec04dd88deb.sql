
CREATE TABLE public.staging_environments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'staging',
  url TEXT,
  branch TEXT NOT NULL DEFAULT 'main',
  status TEXT NOT NULL DEFAULT 'Draft',
  notes TEXT,
  last_deploy TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.staging_environments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own staging_environments" ON public.staging_environments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own staging_environments" ON public.staging_environments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own staging_environments" ON public.staging_environments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own staging_environments" ON public.staging_environments FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_staging_environments_updated_at BEFORE UPDATE ON public.staging_environments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.project_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Equipment',
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'Needed',
  assigned_to TEXT,
  supplier TEXT,
  cost NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.project_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own project_resources" ON public.project_resources FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own project_resources" ON public.project_resources FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own project_resources" ON public.project_resources FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own project_resources" ON public.project_resources FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_project_resources_updated_at BEFORE UPDATE ON public.project_resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
