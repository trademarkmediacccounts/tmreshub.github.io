import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { toast } from "sonner";

export interface ProjectAsset {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  fileType: string;
  fileUrl: string | null;
  category: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectAssetInsert = Partial<Omit<ProjectAsset, "id" | "projectId" | "userId" | "createdAt" | "updatedAt">>;

export function useProjectAssets(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project_assets", projectId],
    enabled: !!projectId,
    queryFn: () => apiGet<ProjectAsset[]>(`/projects/${projectId}/project-assets`),
  });
}

export function useCreateProjectAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, ...item }: ProjectAssetInsert & { projectId: string }) =>
      apiPost<ProjectAsset>(`/projects/${projectId}/project-assets`, item),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["project_assets", v.projectId] }); toast.success("Asset added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteProjectAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/project-assets/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["project_assets"] }); toast.success("Asset removed"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
