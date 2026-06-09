import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";

export interface RigPosition {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  positionType: string;
  xPos: number;
  yPos: number;
  widthPx: number;
  heightPx: number;
  color: string;
  notes: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type RigPositionInsert = Partial<Omit<RigPosition, "id" | "projectId" | "userId" | "createdAt" | "updatedAt">>;

export function useRigPositions(projectId: string | undefined) {
  return useQuery({
    queryKey: ["rig-positions", projectId],
    enabled: !!projectId,
    queryFn: () => apiGet<RigPosition[]>(`/projects/${projectId}/rig-positions`),
  });
}

export function useCreateRigPosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, ...item }: RigPositionInsert & { projectId: string }) =>
      apiPost<RigPosition>(`/projects/${projectId}/rig-positions`, item),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["rig-positions", v.projectId] }); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateRigPosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: RigPositionInsert & { id: string }) => apiPatch<RigPosition>(`/rig-positions/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rig-positions"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteRigPosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/rig-positions/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rig-positions"] }); toast.success("Element removed"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
