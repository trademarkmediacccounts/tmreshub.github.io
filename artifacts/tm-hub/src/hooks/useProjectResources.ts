import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";

export interface ProjectResource {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  category: string;
  quantity: number;
  status: string;
  assignedTo: string | null;
  supplier: string | null;
  cost: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectResourceInsert = Partial<Omit<ProjectResource, "id" | "projectId" | "userId" | "createdAt" | "updatedAt">>;

export function useProjectResources(projectId?: string) {
  return useQuery({
    queryKey: ["project_resources", projectId],
    enabled: !!projectId,
    queryFn: () => apiGet<ProjectResource[]>(`/projects/${projectId}/resources`),
  });
}

export function useCreateProjectResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, ...item }: ProjectResourceInsert & { projectId: string }) =>
      apiPost<ProjectResource>(`/projects/${projectId}/resources`, item),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["project_resources", v.projectId] }); toast.success("Resource added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateProjectResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: ProjectResourceInsert & { id: string }) =>
      apiPatch<ProjectResource>(`/project-resources/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["project_resources"] }); toast.success("Resource updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteProjectResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/project-resources/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["project_resources"] }); toast.success("Resource deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
