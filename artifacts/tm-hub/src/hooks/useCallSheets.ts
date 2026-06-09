import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { toast } from "sonner";

export interface CallSheet {
  id: string;
  projectId: string;
  userId: string;
  shootDate: string;
  callTime: string;
  location: string | null;
  weatherNotes: string | null;
  generalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CallSheetEntry {
  id: string;
  callSheetId: string;
  userId: string;
  personName: string;
  role: string;
  callTime: string;
  notes: string | null;
  createdAt: string;
}

export type CallSheetInsert = Partial<Omit<CallSheet, "id" | "projectId" | "userId" | "createdAt" | "updatedAt">>;
export type CallSheetEntryInsert = Partial<Omit<CallSheetEntry, "id" | "callSheetId" | "userId" | "createdAt">>;

export function useCallSheets(projectId: string | undefined) {
  return useQuery({
    queryKey: ["call_sheets", projectId],
    enabled: !!projectId,
    queryFn: () => apiGet<CallSheet[]>(`/projects/${projectId}/call-sheets`),
  });
}

export function useCallSheetEntries(callSheetId: string | undefined) {
  return useQuery({
    queryKey: ["call_sheet_entries", callSheetId],
    enabled: !!callSheetId,
    queryFn: () => apiGet<CallSheetEntry[]>(`/call-sheets/${callSheetId}/entries`),
  });
}

export function useCreateCallSheet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, ...item }: CallSheetInsert & { projectId: string }) =>
      apiPost<CallSheet>(`/projects/${projectId}/call-sheets`, item),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["call_sheets", v.projectId] }); toast.success("Call sheet created"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCreateCallSheetEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ callSheetId, ...item }: CallSheetEntryInsert & { callSheetId: string }) =>
      apiPost<CallSheetEntry>(`/call-sheets/${callSheetId}/entries`, item),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: ["call_sheet_entries", v.callSheetId] }); toast.success("Entry added"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCallSheet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/call-sheets/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["call_sheets"] }); toast.success("Call sheet deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCallSheetEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/call-sheet-entries/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["call_sheet_entries"] }); toast.success("Entry removed"); },
    onError: (e: Error) => toast.error(e.message),
  });
}
