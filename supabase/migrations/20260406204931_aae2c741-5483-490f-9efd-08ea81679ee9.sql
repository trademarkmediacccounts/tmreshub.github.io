
-- Add user_id to all tables
ALTER TABLE public.assets ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.gear_items ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.productions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.build_projects ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow all access to assets" ON public.assets;
DROP POLICY IF EXISTS "Allow all access to gear_items" ON public.gear_items;
DROP POLICY IF EXISTS "Allow all access to productions" ON public.productions;
DROP POLICY IF EXISTS "Allow all access to build_projects" ON public.build_projects;

-- Assets RLS
CREATE POLICY "Users can view own assets" ON public.assets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own assets" ON public.assets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assets" ON public.assets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own assets" ON public.assets FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Gear items RLS
CREATE POLICY "Users can view own gear_items" ON public.gear_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own gear_items" ON public.gear_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gear_items" ON public.gear_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own gear_items" ON public.gear_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Productions RLS
CREATE POLICY "Users can view own productions" ON public.productions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own productions" ON public.productions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own productions" ON public.productions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own productions" ON public.productions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Build projects RLS
CREATE POLICY "Users can view own build_projects" ON public.build_projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own build_projects" ON public.build_projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own build_projects" ON public.build_projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own build_projects" ON public.build_projects FOR DELETE TO authenticated USING (auth.uid() = user_id);
