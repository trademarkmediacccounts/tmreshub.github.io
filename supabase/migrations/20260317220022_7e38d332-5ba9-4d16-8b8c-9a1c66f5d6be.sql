
-- Assets table
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Video',
  duration TEXT,
  size TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  comments INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  client TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Gear items table
CREATE TABLE public.gear_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Available',
  location TEXT,
  last_used TEXT,
  condition TEXT NOT NULL DEFAULT 'Good',
  reserved_for TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Productions table
CREATE TABLE public.productions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  crew INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Prep',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Build projects table
CREATE TABLE public.build_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  last_deploy TEXT,
  feedback INTEGER NOT NULL DEFAULT 0,
  branch TEXT NOT NULL DEFAULT 'main',
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Allow public access (no auth required for internal tool)
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gear_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to assets" ON public.assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to gear_items" ON public.gear_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to productions" ON public.productions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to build_projects" ON public.build_projects FOR ALL USING (true) WITH CHECK (true);
