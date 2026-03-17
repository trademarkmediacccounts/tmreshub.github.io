import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BuildProject {
  id: string;
  name: string;
  url: string | null;
  status: string;
  last_deploy: string | null;
  feedback: number;
  branch: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

export function useBuildProjects() {
  return useQuery({
    queryKey: ["build_projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("build_projects").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as BuildProject[];
    },
  });
}

export function useCreateBuildProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Partial<BuildProject>) => {
      const { error } = await supabase.from("build_projects").insert(item);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["build_projects"] }); toast.success("Project created"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useUpdateBuildProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<BuildProject> & { id: string }) => {
      const { error } = await supabase.from("build_projects").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["build_projects"] }); toast.success("Project updated"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeleteBuildProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("build_projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["build_projects"] }); toast.success("Project deleted"); },
    onError: (e) => toast.error(e.message),
  });
}
