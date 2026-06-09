import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";

export interface Shot {
  id: string;
  projectId: string;
  userId: string;
  shotNumber: string;
  description: string | null;
  shotType: string;
  angle: string | null;
  lens: string | null;
  movement: string | null;
  locationNotes: string | null;
  storyboardUrl: string | null;
  sortOrder: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type ShotInsert = Partial<Omit<Shot, "id" | "projectId" | "userId" | "createdAt" | "updatedAt">>;

export function useShots(projectId: string | undefined) {
  return useQuery({
    queryKey: ["shots", projectId],
    enabled: !!projectId,
    queryFn: () => apiGet<Shot[]>(`/projects/${projectId}/shots`),
  });
}

export function useCreateShot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, ...item }: ShotInsert & { projectId: string }) =>
      apiPost<Shot>(`/projects/${projectId}/shots`, item),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["shots", v.projectId] }); toast.success("Shot added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateShot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: ShotInsert & { id: string }) => apiPatch<Shot>(`/shots/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shots"] }); toast.success("Shot updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteShot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/shots/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shots"] }); toast.success("Shot deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
