import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";

export interface StagingEnvironment {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  environment: string;
  url: string | null;
  branch: string;
  status: string;
  notes: string | null;
  lastDeploy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type StagingEnvironmentInsert = Partial<Omit<StagingEnvironment, "id" | "projectId" | "userId" | "createdAt" | "updatedAt">>;

export function useStagingEnvironments(projectId?: string) {
  return useQuery({
    queryKey: ["staging_environments", projectId],
    enabled: !!projectId,
    queryFn: () => apiGet<StagingEnvironment[]>(`/projects/${projectId}/staging-environments`),
  });
}

export function useCreateStagingEnvironment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, ...item }: StagingEnvironmentInsert & { projectId: string }) =>
      apiPost<StagingEnvironment>(`/projects/${projectId}/staging-environments`, item),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["staging_environments", v.projectId] }); toast.success("Environment added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateStagingEnvironment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: StagingEnvironmentInsert & { id: string }) =>
      apiPatch<StagingEnvironment>(`/staging-environments/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["staging_environments"] }); toast.success("Environment updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteStagingEnvironment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/staging-environments/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["staging_environments"] }); toast.success("Environment deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
