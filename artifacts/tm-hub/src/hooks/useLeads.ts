import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";

export interface Lead {
  id: string;
  userId: string;
  name: string;
  company: string;
  value: string;
  currency: string;
  service: string;
  stage: string;
  notes: string | null;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type LeadInsert = Partial<Omit<Lead, "id" | "userId" | "createdAt" | "updatedAt">>;

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: () => apiGet<Lead[]>("/leads"),
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: LeadInsert) => apiPost<Lead>("/leads", item),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["leads"] }); toast.success("Lead created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: LeadInsert & { id: string }) => apiPatch<Lead>(`/leads/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["leads"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/leads/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["leads"] }); toast.success("Lead deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
