import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface Shot {
  id: string;
  project_id: string;
  user_id: string;
  shot_number: string;
  description: string | null;
  shot_type: string;
  angle: string | null;
  lens: string | null;
  movement: string | null;
  location_notes: string | null;
  storyboard_url: string | null;
  sort_order: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useShots(projectId: string | undefined) {
  return useQuery({
    queryKey: ["shots", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase.from("shots").select("*").eq("project_id", projectId!).order("sort_order");
      if (error) throw error;
      return data as Shot[];
    },
  });
}

export function useCreateShot() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (item: Partial<Shot>) => {
      const { error } = await supabase.from("shots").insert([{ ...item, user_id: user?.id } as any]);
      if (error) throw error;
    },
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ["shots", vars.project_id] }); toast.success("Shot added"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useUpdateShot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Shot> & { id: string }) => {
      const { error } = await supabase.from("shots").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ["shots"] }); toast.success("Shot updated"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeleteShot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shots").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shots"] }); toast.success("Shot deleted"); },
    onError: (e) => toast.error(e.message),
  });
}
