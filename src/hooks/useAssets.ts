import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Asset {
  id: string;
  name: string;
  type: string;
  duration: string | null;
  size: string | null;
  status: string;
  comments: number;
  views: number;
  client: string | null;
  created_at: string;
  updated_at: string;
}

export type AssetInsert = Omit<Asset, "id" | "created_at" | "updated_at">;

export function useAssets() {
  return useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("assets").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Asset[];
    },
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (asset: Partial<AssetInsert>) => {
      const { error } = await supabase.from("assets").insert(asset);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assets"] }); toast.success("Asset created"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Asset> & { id: string }) => {
      const { error } = await supabase.from("assets").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assets"] }); toast.success("Asset updated"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("assets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assets"] }); toast.success("Asset deleted"); },
    onError: (e) => toast.error(e.message),
  });
}
