
-- Projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'Commercial',
  status TEXT NOT NULL DEFAULT 'Pre-Production',
  client TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Shots table
CREATE TABLE public.shots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  shot_number TEXT NOT NULL,
  description TEXT,
  shot_type TEXT NOT NULL DEFAULT 'Wide',
  angle TEXT,
  lens TEXT,
  movement TEXT,
  location_notes TEXT,
  storyboard_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Todo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own shots" ON public.shots FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own shots" ON public.shots FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own shots" ON public.shots FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own shots" ON public.shots FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Call sheets table
CREATE TABLE public.call_sheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  shoot_date DATE NOT NULL,
  call_time TEXT NOT NULL DEFAULT '06:00',
  location TEXT,
  weather_notes TEXT,
  general_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.call_sheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own call_sheets" ON public.call_sheets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own call_sheets" ON public.call_sheets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own call_sheets" ON public.call_sheets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own call_sheets" ON public.call_sheets FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Call sheet entries
CREATE TABLE public.call_sheet_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_sheet_id UUID NOT NULL REFERENCES public.call_sheets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  person_name TEXT NOT NULL,
  role TEXT NOT NULL,
  call_time TEXT NOT NULL DEFAULT '06:00',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.call_sheet_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own call_sheet_entries" ON public.call_sheet_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own call_sheet_entries" ON public.call_sheet_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own call_sheet_entries" ON public.call_sheet_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own call_sheet_entries" ON public.call_sheet_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Script breakdowns
CREATE TABLE public.script_breakdowns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  element_type TEXT NOT NULL DEFAULT 'Props',
  name TEXT NOT NULL,
  description TEXT,
  scene_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.script_breakdowns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own script_breakdowns" ON public.script_breakdowns FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own script_breakdowns" ON public.script_breakdowns FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own script_breakdowns" ON public.script_breakdowns FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own script_breakdowns" ON public.script_breakdowns FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Project assets
CREATE TABLE public.project_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'Other',
  file_url TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.project_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own project_assets" ON public.project_assets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own project_assets" ON public.project_assets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own project_assets" ON public.project_assets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own project_assets" ON public.project_assets FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shots_updated_at BEFORE UPDATE ON public.shots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_call_sheets_updated_at BEFORE UPDATE ON public.call_sheets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_script_breakdowns_updated_at BEFORE UPDATE ON public.script_breakdowns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_assets_updated_at BEFORE UPDATE ON public.project_assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
