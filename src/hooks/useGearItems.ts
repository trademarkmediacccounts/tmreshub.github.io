import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GearItem {
  id: string;
  name: string;
  category: string;
  status: string;
  location: string | null;
  last_used: string | null;
  condition: string;
  reserved_for: string | null;
  created_at: string;
  updated_at: string;
}

export function useGearItems() {
  return useQuery({
    queryKey: ["gear_items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gear_items").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as GearItem[];
    },
  });
}

export function useCreateGearItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Partial<GearItem>) => {
      const { error } = await supabase.from("gear_items").insert(item);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gear_items"] }); toast.success("Gear item added"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useUpdateGearItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<GearItem> & { id: string }) => {
      const { error } = await supabase.from("gear_items").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gear_items"] }); toast.success("Gear item updated"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeleteGearItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gear_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gear_items"] }); toast.success("Gear item deleted"); },
    onError: (e) => toast.error(e.message),
  });
}
