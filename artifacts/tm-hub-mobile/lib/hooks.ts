import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  client: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  userId: string;
  name: string;
  type: string;
  client: string | null;
  status: string;
  size: string | null;
  duration: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Shot {
  id: string;
  projectId: string;
  shotNumber: string;
  description: string | null;
  shotType: string;
  angle: string | null;
  lens: string | null;
  movement: string | null;
  locationNotes: string | null;
  status: string;
  sortOrder: number;
  createdAt: string;
}

export interface CallSheet {
  id: string;
  projectId: string;
  title: string;
  shootDate: string | null;
  callTime: string | null;
  location: string | null;
  director: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ProjectAsset {
  id: string;
  projectId: string;
  name: string;
  type: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

export function useProjects() {
  return useQuery({ queryKey: ["projects"], queryFn: () => apiGet<Project[]>("/projects") });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ["projects", id],
    enabled: !!id,
    queryFn: () => apiGet<Project>(`/projects/${id}`),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Omit<Project, "id" | "userId" | "createdAt" | "updatedAt">>) =>
      apiPost<Project>("/projects", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/projects/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Project> & { id: string }) =>
      apiPatch<Project>(`/projects/${id}`, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["projects", id] });
    },
  });
}

export function useAssets() {
  return useQuery({ queryKey: ["assets"], queryFn: () => apiGet<Asset[]>("/assets") });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Asset>) => apiPost<Asset>("/assets", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Asset> & { id: string }) =>
      apiPatch<Asset>(`/assets/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/assets/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

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
    mutationFn: (data: Partial<Shot> & { projectId: string }) =>
      apiPost<Shot>(`/projects/${data.projectId}/shots`, data),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ["shots", vars.projectId] }),
  });
}

export function useUpdateShot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, projectId, ...data }: Partial<Shot> & { id: string; projectId: string }) =>
      apiPatch<Shot>(`/projects/${projectId}/shots/${id}`, data),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ["shots", vars.projectId] }),
  });
}

export function useCallSheets(projectId: string | undefined) {
  return useQuery({
    queryKey: ["call-sheets", projectId],
    enabled: !!projectId,
    queryFn: () => apiGet<CallSheet[]>(`/projects/${projectId}/call-sheets`),
  });
}

export function useProjectAssets(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project-assets", projectId],
    enabled: !!projectId,
    queryFn: () => apiGet<ProjectAsset[]>(`/projects/${projectId}/assets`),
  });
}
