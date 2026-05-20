import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Project } from "@/hooks/useProjects";
import {
  useProjectResources,
  useCreateProjectResource,
  useUpdateProjectResource,
  useDeleteProjectResource,
  ProjectResource,
} from "@/hooks/useProjectResources";
import { PageHeader } from "@/components/PageHeader";
import { Plus, Trash2, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { motion } from "framer-motion";

const CATEGORIES = ["Equipment", "Crew", "Transport", "Location", "Catering", "Permits", "Accommodation", "Other"];
const STATUSES = ["Needed", "Requested", "Confirmed", "On-site", "Returned", "Cancelled"];

const empty = { name: "", category: "Equipment", quantity: 1, status: "Needed", assigned_to: "", supplier: "", cost: 0, notes: "" };

const statusColor: Record<string, string> = {
  Needed: "bg-muted text-muted-foreground",
  Requested: "bg-amber-500/15 text-amber-600",
  Confirmed: "bg-blue-500/15 text-blue-600",
  "On-site": "bg-emerald-500/15 text-emerald-600",
  Returned: "bg-muted text-muted-foreground",
  Cancelled: "bg-destructive/15 text-destructive",
};

export default function ResourcesPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { data: resources = [], isLoading } = useProjectResources(project.id);
  const createRes = useCreateProjectResource();
  const updateRes = useUpdateProjectResource();
  const deleteRes = useDeleteProjectResource();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [filter, setFilter] = useState<string>("All");

  const openCreate = () => { setEditingId(null); setForm(empty); setDialogOpen(true); };
  const openEdit = (r: ProjectResource) => {
    setEditingId(r.id);
    setForm({
      name: r.name, category: r.category, quantity: r.quantity, status: r.status,
      assigned_to: r.assigned_to || "", supplier: r.supplier || "", cost: Number(r.cost) || 0, notes: r.notes || "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const payload = {
      ...form,
      assigned_to: form.assigned_to || null,
      supplier: form.supplier || null,
      notes: form.notes || null,
      project_id: project.id,
    };
    if (editingId) {
      updateRes.mutate({ id: editingId, ...payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createRes.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const filtered = filter === "All" ? resources : resources.filter(r => r.category === filter);
  const totalCost = resources.reduce((sum, r) => sum + Number(r.cost || 0) * (r.quantity || 1), 0);
  const confirmedCount = resources.filter(r => ["Confirmed", "On-site"].includes(r.status)).length;

  return (
    <div>
      <PageHeader
        breadcrumb={["Projects", project.name, "Resources"]}
        title="Resources"
        action={
          <button onClick={openCreate} className="tm-glow-btn text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Resource
          </button>
        }
      />
      <div className="p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="tm-card p-4">
            <p className="text-xs text-muted-foreground">Total items</p>
            <p className="text-2xl font-semibold tabular-nums">{resources.length}</p>
          </div>
          <div className="tm-card p-4">
            <p className="text-xs text-muted-foreground">Confirmed</p>
            <p className="text-2xl font-semibold tabular-nums text-emerald-600">{confirmedCount}</p>
          </div>
          <div className="tm-card p-4">
            <p className="text-xs text-muted-foreground">Estimated cost</p>
            <p className="text-2xl font-semibold tabular-nums">£{totalCost.toLocaleString()}</p>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {["All", ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${filter === cat ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="tm-card h-14 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <p className="text-sm">No resources {filter !== "All" ? `in ${filter}` : "yet"}</p>
            <button onClick={openCreate} className="mt-2 text-primary text-sm hover:underline">Add a resource</button>
          </div>
        ) : (
          <div className="tm-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Item</th>
                  <th className="text-left px-4 py-2 font-medium">Category</th>
                  <th className="text-left px-4 py-2 font-medium">Qty</th>
                  <th className="text-left px-4 py-2 font-medium">Assigned</th>
                  <th className="text-left px-4 py-2 font-medium">Supplier</th>
                  <th className="text-right px-4 py-2 font-medium">Cost</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-t border-border group hover:bg-muted/20"
                  >
                    <td className="px-4 py-2.5 font-medium">{r.name}</td>
                    <td className="px-4 py-2.5"><Badge variant="outline" className="text-xs">{r.category}</Badge></td>
                    <td className="px-4 py-2.5 tabular-nums">{r.quantity}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.assigned_to || "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.supplier || "—"}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">£{Number(r.cost).toLocaleString()}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[r.status] || "bg-muted"}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100">
                        <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteTarget(r.id)} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? "Edit Resource" : "Add Resource"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Resource name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Quantity</label>
                <Input type="number" min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Cost (£)</label>
                <Input type="number" min={0} step="0.01" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>
            <Input placeholder="Assigned to (optional)" value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} />
            <Input placeholder="Supplier (optional)" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} />
            <Textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            <Button onClick={handleSave} disabled={!form.name.trim()} className="w-full">{editingId ? "Save Changes" : "Add Resource"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteRes.mutate(deleteTarget); setDeleteTarget(null); }}
        title="Delete resource"
        description="This resource will be permanently removed."
      />
    </div>
  );
}
