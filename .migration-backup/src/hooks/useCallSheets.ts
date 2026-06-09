import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface CallSheet {
  id: string;
  project_id: string;
  user_id: string;
  shoot_date: string;
  call_time: string;
  location: string | null;
  weather_notes: string | null;
  general_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CallSheetEntry {
  id: string;
  call_sheet_id: string;
  user_id: string;
  person_name: string;
  role: string;
  call_time: string;
  notes: string | null;
  created_at: string;
}

export function useCallSheets(projectId: string | undefined) {
  return useQuery({
    queryKey: ["call_sheets", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase.from("call_sheets").select("*").eq("project_id", projectId!).order("shoot_date");
      if (error) throw error;
      return data as CallSheet[];
    },
  });
}

export function useCallSheetEntries(callSheetId: string | undefined) {
  return useQuery({
    queryKey: ["call_sheet_entries", callSheetId],
    enabled: !!callSheetId,
    queryFn: async () => {
      const { data, error } = await supabase.from("call_sheet_entries").select("*").eq("call_sheet_id", callSheetId!).order("call_time");
      if (error) throw error;
      return data as CallSheetEntry[];
    },
  });
}

export function useCreateCallSheet() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (item: Partial<CallSheet>) => {
      const { data, error } = await supabase.from("call_sheets").insert([{ ...item, user_id: user?.id } as any]).select().single();
      if (error) throw error;
      return data as CallSheet;
    },
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ["call_sheets", vars.project_id] }); toast.success("Call sheet created"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useCreateCallSheetEntry() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (item: Partial<CallSheetEntry>) => {
      const { error } = await supabase.from("call_sheet_entries").insert([{ ...item, user_id: user?.id } as any]);
      if (error) throw error;
    },
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ["call_sheet_entries", vars.call_sheet_id] }); toast.success("Entry added"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeleteCallSheet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("call_sheets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["call_sheets"] }); toast.success("Call sheet deleted"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeleteCallSheetEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("call_sheet_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["call_sheet_entries"] }); toast.success("Entry removed"); },
    onError: (e) => toast.error(e.message),
  });
}
