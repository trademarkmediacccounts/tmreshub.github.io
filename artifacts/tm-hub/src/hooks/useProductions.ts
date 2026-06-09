import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { toast } from "sonner";

export interface Production {
  id: string;
  name: string;
  date: string;
  location: string;
  crew: number;
  status: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProductionInsert = Partial<Omit<Production, "id" | "createdAt" | "updatedAt">>;

export function useProductions() {
  return useQuery({
    queryKey: ["productions"],
    queryFn: () => apiGet<Production[]>("/productions"),
  });
}

export function useCreateProduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: ProductionInsert) => apiPost<Production>("/productions", item),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["productions"] }); toast.success("Production added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteProduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/productions/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["productions"] }); toast.success("Production deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
