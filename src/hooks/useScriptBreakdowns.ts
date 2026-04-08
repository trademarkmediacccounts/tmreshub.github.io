import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface ScriptBreakdown {
  id: string;
  project_id: string;
  user_id: string;
  element_type: string;
  name: string;
  description: string | null;
  scene_reference: string | null;
  created_at: string;
  updated_at: string;
}

export const ELEMENT_TYPES = ["Cast", "Props", "Wardrobe", "Vehicles", "SFX", "VFX", "Stunts", "Animals", "Extras", "Music", "Sound", "Set Dressing"] as const;

export function useScriptBreakdowns(projectId: string | undefined) {
  return useQuery({
    queryKey: ["script_breakdowns", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase.from("script_breakdowns").select("*").eq("project_id", projectId!).order("element_type");
      if (error) throw error;
      return data as ScriptBreakdown[];
    },
  });
}

export function useCreateScriptBreakdown() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (item: Partial<ScriptBreakdown>) => {
      const { error } = await supabase.from("script_breakdowns").insert([{ ...item, user_id: user?.id } as any]);
      if (error) throw error;
    },
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ["script_breakdowns", vars.project_id] }); toast.success("Element added"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useUpdateScriptBreakdown() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ScriptBreakdown> & { id: string }) => {
      const { error } = await supabase.from("script_breakdowns").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["script_breakdowns"] }); toast.success("Element updated"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeleteScriptBreakdown() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("script_breakdowns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["script_breakdowns"] }); toast.success("Element deleted"); },
    onError: (e) => toast.error(e.message),
  });
}
