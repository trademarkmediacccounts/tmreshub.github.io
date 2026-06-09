import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";

export interface ScriptBreakdown {
  id: string;
  projectId: string;
  userId: string;
  elementType: string;
  name: string;
  description: string | null;
  sceneReference: string | null;
  createdAt: string;
  updatedAt: string;
}

export const ELEMENT_TYPES = ["Cast", "Props", "Wardrobe", "Vehicles", "SFX", "VFX", "Stunts", "Animals", "Extras", "Music", "Sound", "Set Dressing"] as const;

export type ScriptBreakdownInsert = Partial<Omit<ScriptBreakdown, "id" | "projectId" | "userId" | "createdAt" | "updatedAt">>;

export function useScriptBreakdowns(projectId: string | undefined) {
  return useQuery({
    queryKey: ["script_breakdowns", projectId],
    enabled: !!projectId,
    queryFn: () => apiGet<ScriptBreakdown[]>(`/projects/${projectId}/script-breakdowns`),
  });
}

export function useCreateScriptBreakdown() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, ...item }: ScriptBreakdownInsert & { projectId: string }) =>
      apiPost<ScriptBreakdown>(`/projects/${projectId}/script-breakdowns`, item),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["script_breakdowns", v.projectId] }); toast.success("Element added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateScriptBreakdown() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: ScriptBreakdownInsert & { id: string }) =>
      apiPatch<ScriptBreakdown>(`/script-breakdowns/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["script_breakdowns"] }); toast.success("Element updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteScriptBreakdown() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/script-breakdowns/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["script_breakdowns"] }); toast.success("Element deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
