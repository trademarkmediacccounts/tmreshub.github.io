import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";

export interface ShowFixture {
  id: string;
  userId: string;
  manufacturer: string;
  model: string;
  mode: string | null;
  dmxFootprint: number | null;
  beamAngle: string | null;
  colorTemp: string | null;
  power: string | null;
  weight: string | null;
  gdtfManufacturer: string | null;
  gdtfName: string | null;
  gdtfRuid: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ShowFixtureInsert = Partial<Omit<ShowFixture, "id" | "userId" | "createdAt" | "updatedAt">>;

export interface GdtfFixture {
  fixture_type_id?: string;
  name?: string;
  manufacturer?: string;
  revision_date?: string;
  create_date?: string;
  [key: string]: any;
}

export function useShowFixtures() {
  return useQuery({
    queryKey: ["fixtures"],
    queryFn: () => apiGet<ShowFixture[]>("/fixtures"),
  });
}

export function useCreateShowFixture() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: ShowFixtureInsert) => apiPost<ShowFixture>("/fixtures", item),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fixtures"] }); toast.success("Fixture added to library"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateShowFixture() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: ShowFixtureInsert & { id: string }) => apiPatch<ShowFixture>(`/fixtures/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fixtures"] }); toast.success("Fixture updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteShowFixture() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/fixtures/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fixtures"] }); toast.success("Fixture removed"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useGdtfSearch(search: string) {
  return useQuery({
    queryKey: ["gdtf", search],
    queryFn: () => apiGet<GdtfFixture[]>(`/gdtf/fixtures?search=${encodeURIComponent(search)}`),
    enabled: search.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}
