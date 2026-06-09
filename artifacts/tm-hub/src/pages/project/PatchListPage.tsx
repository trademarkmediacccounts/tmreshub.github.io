import { useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { Project } from "@/hooks/useProjects";
import { usePatchItems, useCreatePatchItem, useUpdatePatchItem, useDeletePatchItem, PatchItem } from "@/hooks/usePatchItems";
import { useShowFixtures } from "@/hooks/useShowFixtures";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Printer, Trash2, Edit, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const emptyForm = {
  fixtureName: "", manufacturer: "", dmxUniverse: "1", dmxAddress: "",
  circuit: "", dimmerNumber: "", gelColor: "", purpose: "", position: "", notes: "",
};

type FormState = typeof emptyForm;

function PatchForm({
  value, onChange, fixtures,
}: {
  value: FormState;
  onChange: (f: FormState) => void;
  fixtures: ReturnType<typeof useShowFixtures>["data"];
}) {
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [k]: e.target.value });

  const applyFixture = (id: string) => {
    const f = (fixtures ?? []).find(fx => fx.id === id);
    if (f) onChange({ ...value, fixtureName: f.model, manufacturer: f.manufacturer });
  };

  return (
    <div className="space-y-3">
      {(fixtures ?? []).length > 0 && (
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Quick-fill from Library</label>
          <Select onValueChange={applyFixture}>
            <SelectTrigger><SelectValue placeholder="Choose a fixture..." /></SelectTrigger>
            <SelectContent>
              {(fixtures ?? []).map(f => (
                <SelectItem key={f.id} value={f.id}>{f.manufacturer} — {f.model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Fixture Name *</label>
          <Input value={value.fixtureName} onChange={set("fixtureName")} placeholder="e.g. ESPRITE" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Manufacturer</label>
          <Input value={value.manufacturer} onChange={set("manufacturer")} placeholder="e.g. Robe" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Universe</label>
          <Input type="number" min="1" value={value.dmxUniverse} onChange={set("dmxUniverse")} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">DMX Address *</label>
          <Input type="number" min="1" max="512" value={value.dmxAddress} onChange={set("dmxAddress")} placeholder="1–512" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Circuit</label>
          <Input value={value.circuit} onChange={set("circuit")} placeholder="e.g. C-01" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Dimmer</label>
          <Input value={value.dimmerNumber} onChange={set("dimmerNumber")} placeholder="e.g. D-12" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Gel / Color</label>
          <Input value={value.gelColor} onChange={set("gelColor")} placeholder="e.g. L201 Full CTB" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Purpose</label>
          <Input value={value.purpose} onChange={set("purpose")} placeholder="e.g. Stage wash" />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-muted-foreground mb-1 block">Position</label>
          <Input value={value.position} onChange={set("position")} placeholder="e.g. FOH Truss L" />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
          <Input value={value.notes} onChange={set("notes")} placeholder="Additional notes..." />
        </div>
      </div>
    </div>
  );
}

const UNIVERSE_COLORS: Record<number, string> = {
  1: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  2: "bg-green-500/20 text-green-400 border-green-500/30",
  3: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  4: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

export default function PatchListPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { data: items = [], isLoading } = usePatchItems(project.id);
  const { data: fixtures } = useShowFixtures();
  const createItem = useCreatePatchItem();
  const updateItem = useUpdatePatchItem();
  const deleteItem = useDeletePatchItem();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PatchItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const printRef = useRef<HTMLDivElement>(null);

  const universes = [...new Set(items.map(i => i.dmxUniverse))].sort((a, b) => a - b);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: PatchItem) => {
    setEditTarget(item);
    setForm({
      fixtureName: item.fixtureName,
      manufacturer: item.manufacturer ?? "",
      dmxUniverse: item.dmxUniverse.toString(),
      dmxAddress: item.dmxAddress.toString(),
      circuit: item.circuit ?? "",
      dimmerNumber: item.dimmerNumber ?? "",
      gelColor: item.gelColor ?? "",
      purpose: item.purpose ?? "",
      position: item.position ?? "",
      notes: item.notes ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.fixtureName.trim()) { toast.error("Fixture name is required"); return; }
    if (!form.dmxAddress) { toast.error("DMX address is required"); return; }
    const payload = {
      fixtureName: form.fixtureName,
      manufacturer: form.manufacturer || undefined,
      dmxUniverse: parseInt(form.dmxUniverse) || 1,
      dmxAddress: parseInt(form.dmxAddress),
      circuit: form.circuit || undefined,
      dimmerNumber: form.dimmerNumber || undefined,
      gelColor: form.gelColor || undefined,
      purpose: form.purpose || undefined,
      position: form.position || undefined,
      notes: form.notes || undefined,
    };
    if (editTarget) {
      updateItem.mutate({ id: editTarget.id, ...payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createItem.mutate({ projectId: project.id, ...payload }, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb={[project.name, "Patch List"]}
        title={`Patch List${items.length > 0 ? ` — ${items.length} channel${items.length !== 1 ? "s" : ""}` : ""}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print / Export
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Channel
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Loading patch list...</div>
      ) : items.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 rounded-xl border border-dashed border-border">
          <Layers className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No channels patched yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Add fixtures with their DMX addresses</p>
          <Button size="sm" className="mt-4" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" /> Add First Channel
          </Button>
        </motion.div>
      ) : (
        <div ref={printRef} className="space-y-6 print-area">
          {/* Print header — only visible when printing */}
          <div className="hidden print:block mb-6">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-gray-500 text-sm mt-1">Patch List — {items.length} channels · Generated {new Date().toLocaleDateString()}</p>
            {project.client && <p className="text-gray-500 text-sm">Client: {project.client}</p>}
            <hr className="mt-4" />
          </div>

          {universes.map(universe => {
            const uItems = items.filter(i => i.dmxUniverse === universe).sort((a, b) => a.dmxAddress - b.dmxAddress);
            const uColor = UNIVERSE_COLORS[universe] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30";
            return (
              <div key={universe}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${uColor}`}>
                    Universe {universe}
                  </span>
                  <span className="text-xs text-muted-foreground">{uItems.length} channel{uItems.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50">
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground w-16">Addr</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Fixture</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Position</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Circuit</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Dimmer</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Gel</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Purpose</th>
                        <th className="px-3 py-2.5 w-16 print:hidden"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {uItems.map((item, idx) => (
                        <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                          className="border-b border-border/50 last:border-0 hover:bg-secondary/30 group transition-colors">
                          <td className="px-3 py-2.5">
                            <span className="font-mono font-semibold text-primary">{item.dmxAddress}</span>
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="font-medium leading-tight">{item.fixtureName}</p>
                            {item.manufacturer && <p className="text-xs text-muted-foreground">{item.manufacturer}</p>}
                          </td>
                          <td className="px-3 py-2.5 text-muted-foreground hidden sm:table-cell">{item.position ?? "—"}</td>
                          <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs hidden md:table-cell">{item.circuit ?? "—"}</td>
                          <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs hidden md:table-cell">{item.dimmerNumber ?? "—"}</td>
                          <td className="px-3 py-2.5 text-muted-foreground text-xs hidden lg:table-cell">{item.gelColor ?? "—"}</td>
                          <td className="px-3 py-2.5 text-muted-foreground text-xs hidden lg:table-cell">{item.purpose ?? "—"}</td>
                          <td className="px-3 py-2.5 print:hidden">
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                              <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteItem.mutate(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Channel" : "Add Channel"}</DialogTitle>
          </DialogHeader>
          <PatchForm value={form} onChange={setForm} fixtures={fixtures} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createItem.isPending || updateItem.isPending}>
              {editTarget ? "Save Changes" : "Add to Patch"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: fixed; left: 0; top: 0; width: 100%; }
          nav, header, aside, [data-sidebar] { display: none !important; }
          .print\\:hidden { display: none !important; }
          .hidden.print\\:block { display: block !important; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 6px 10px; font-size: 11px; }
          thead tr { background: #f5f5f5 !important; }
        }
      `}</style>
    </div>
  );
}
