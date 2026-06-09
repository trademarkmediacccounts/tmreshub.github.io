import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";

export interface PatchItem {
  id: string;
  projectId: string;
  userId: string;
  fixtureName: string;
  manufacturer: string | null;
  dmxUniverse: number;
  dmxAddress: number;
  circuit: string | null;
  dimmerNumber: string | null;
  gelColor: string | null;
  purpose: string | null;
  position: string | null;
  notes: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type PatchItemInsert = Partial<Omit<PatchItem, "id" | "projectId" | "userId" | "createdAt" | "updatedAt">>;

export function usePatchItems(projectId: string | undefined) {
  return useQuery({
    queryKey: ["patch", projectId],
    enabled: !!projectId,
    queryFn: () => apiGet<PatchItem[]>(`/projects/${projectId}/patch`),
  });
}

export function useCreatePatchItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, ...item }: PatchItemInsert & { projectId: string }) =>
      apiPost<PatchItem>(`/projects/${projectId}/patch`, item),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["patch", v.projectId] }); toast.success("Channel added to patch"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdatePatchItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: PatchItemInsert & { id: string }) => apiPatch<PatchItem>(`/patch/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["patch"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletePatchItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/patch/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["patch"] }); toast.success("Channel removed"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
