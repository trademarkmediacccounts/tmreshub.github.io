import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Production {
  id: string;
  name: string;
  date: string;
  location: string;
  crew: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useProductions() {
  return useQuery({
    queryKey: ["productions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("productions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Production[];
    },
  });
}

export function useCreateProduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Partial<Production>) => {
      const { error } = await supabase.from("productions").insert(item);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["productions"] }); toast.success("Production added"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeleteProduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("productions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["productions"] }); toast.success("Production deleted"); },
    onError: (e) => toast.error(e.message),
  });
}
