import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface ProjectAsset {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  file_type: string;
  file_url: string | null;
  category: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useProjectAssets(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project_assets", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase.from("project_assets").select("*").eq("project_id", projectId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProjectAsset[];
    },
  });
}

export function useCreateProjectAsset() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (item: Partial<ProjectAsset>) => {
      const { error } = await supabase.from("project_assets").insert([{ ...item, user_id: user?.id } as any]);
      if (error) throw error;
    },
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ["project_assets", vars.project_id] }); toast.success("Asset added"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeleteProjectAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_assets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["project_assets"] }); toast.success("Asset removed"); },
    onError: (e) => toast.error(e.message),
  });
}
