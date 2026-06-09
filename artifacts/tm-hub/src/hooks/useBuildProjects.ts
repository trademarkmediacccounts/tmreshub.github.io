import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";

export interface BuildProject {
  id: string;
  name: string;
  url: string | null;
  status: string;
  lastDeploy: string | null;
  feedback: number;
  branch: string;
  progress: number;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BuildProjectInsert = Partial<Omit<BuildProject, "id" | "createdAt" | "updatedAt">>;

export function useBuildProjects() {
  return useQuery({
    queryKey: ["build_projects"],
    queryFn: () => apiGet<BuildProject[]>("/build-projects"),
  });
}

export function useCreateBuildProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: BuildProjectInsert) => apiPost<BuildProject>("/build-projects", item),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["build_projects"] }); toast.success("Project created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateBuildProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: BuildProjectInsert & { id: string }) => apiPatch<BuildProject>(`/build-projects/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["build_projects"] }); toast.success("Project updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteBuildProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/build-projects/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["build_projects"] }); toast.success("Project deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
