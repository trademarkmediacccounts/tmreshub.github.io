import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface StagingEnvironment {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  environment: string;
  url: string | null;
  branch: string;
  status: string;
  notes: string | null;
  last_deploy: string | null;
  created_at: string;
  updated_at: string;
}

export function useStagingEnvironments(projectId?: string) {
  return useQuery({
    queryKey: ["staging_environments", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staging_environments")
        .select("*")
        .eq("project_id", projectId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as StagingEnvironment[];
    },
  });
}

export function useCreateStagingEnvironment() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (item: Partial<StagingEnvironment> & { project_id: string }) => {
      const { error } = await supabase.from("staging_environments").insert([{ ...item, user_id: user?.id } as any]);
      if (error) throw error;
    },
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["staging_environments", v.project_id] }); toast.success("Environment added"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateStagingEnvironment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<StagingEnvironment> & { id: string }) => {
      const { error } = await supabase.from("staging_environments").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["staging_environments"] }); toast.success("Environment updated"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteStagingEnvironment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("staging_environments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["staging_environments"] }); toast.success("Environment deleted"); },
    onError: (e: any) => toast.error(e.message),
  });
}
