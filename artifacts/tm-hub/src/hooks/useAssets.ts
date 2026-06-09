import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
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
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AssetInsert = Partial<Omit<Asset, "id" | "createdAt" | "updatedAt">>;

export function useAssets() {
  return useQuery({
    queryKey: ["assets"],
    queryFn: () => apiGet<Asset[]>("/assets"),
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (asset: AssetInsert) => apiPost<Asset>("/assets", asset),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assets"] }); toast.success("Asset created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: AssetInsert & { id: string }) => apiPatch<Asset>(`/assets/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assets"] }); toast.success("Asset updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/assets/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assets"] }); toast.success("Asset deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
