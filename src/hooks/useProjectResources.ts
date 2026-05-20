import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface ProjectResource {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  category: string;
  quantity: number;
  status: string;
  assigned_to: string | null;
  supplier: string | null;
  cost: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useProjectResources(projectId?: string) {
  return useQuery({
    queryKey: ["project_resources", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_resources")
        .select("*")
        .eq("project_id", projectId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProjectResource[];
    },
  });
}

export function useCreateProjectResource() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (item: Partial<ProjectResource> & { project_id: string }) => {
      const { error } = await supabase.from("project_resources").insert([{ ...item, user_id: user?.id } as any]);
      if (error) throw error;
    },
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["project_resources", v.project_id] }); toast.success("Resource added"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateProjectResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ProjectResource> & { id: string }) => {
      const { error } = await supabase.from("project_resources").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["project_resources"] }); toast.success("Resource updated"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteProjectResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_resources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["project_resources"] }); toast.success("Resource deleted"); },
    onError: (e: any) => toast.error(e.message),
  });
}
