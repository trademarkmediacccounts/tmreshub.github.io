import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";

export interface GearItem {
  id: string;
  name: string;
  category: string;
  status: string;
  location: string | null;
  lastUsed: string | null;
  condition: string;
  reservedFor: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type GearItemInsert = Partial<Omit<GearItem, "id" | "createdAt" | "updatedAt">>;

export function useGearItems() {
  return useQuery({
    queryKey: ["gear_items"],
    queryFn: () => apiGet<GearItem[]>("/gear"),
  });
}

export function useCreateGearItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: GearItemInsert) => apiPost<GearItem>("/gear", item),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gear_items"] }); toast.success("Gear item added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateGearItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: GearItemInsert & { id: string }) => apiPatch<GearItem>(`/gear/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gear_items"] }); toast.success("Gear item updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteGearItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/gear/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gear_items"] }); toast.success("Gear item deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
