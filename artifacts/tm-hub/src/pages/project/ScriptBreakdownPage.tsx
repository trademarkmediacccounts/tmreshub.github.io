import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Project } from "@/hooks/useProjects";
import { useScriptBreakdowns, useCreateScriptBreakdown, useDeleteScriptBreakdown, ELEMENT_TYPES } from "@/hooks/useScriptBreakdowns";
import { PageHeader } from "@/components/PageHeader";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const typeColors: Record<string, string> = {
  Cast: "bg-red-500/20 text-red-400",
  Props: "bg-blue-500/20 text-blue-400",
  Wardrobe: "bg-purple-500/20 text-purple-400",
  Vehicles: "bg-yellow-500/20 text-yellow-400",
  SFX: "bg-orange-500/20 text-orange-400",
  VFX: "bg-cyan-500/20 text-cyan-400",
  Stunts: "bg-red-600/20 text-red-500",
  Animals: "bg-green-500/20 text-green-400",
  Extras: "bg-muted text-muted-foreground",
  Music: "bg-pink-500/20 text-pink-400",
  Sound: "bg-indigo-500/20 text-indigo-400",
  "Set Dressing": "bg-amber-500/20 text-amber-400",
};

export default function ScriptBreakdownPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { data: breakdowns = [], isLoading } = useScriptBreakdowns(project.id);
  const createBreakdown = useCreateScriptBreakdown();
  const deleteBreakdown = useDeleteScriptBreakdown();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("All");
  const [form, setForm] = useState({ elementType: "Props", name: "", description: "", sceneReference: "" });

  const handleCreate = () => {
    if (!form.name.trim()) return;
    createBreakdown.mutate({ ...form, projectId: project.id }, {
      onSuccess: () => { setDialogOpen(false); setForm({ elementType: "Props", name: "", description: "", sceneReference: "" }); },
    });
  };

  const grouped = ELEMENT_TYPES.reduce((acc, type) => {
    const items = breakdowns.filter(b => b.elementType === type);
    if (items.length > 0) acc[type] = items;
    return acc;
  }, {} as Record<string, typeof breakdowns>);

  const filtered = filterType === "All" ? grouped : Object.fromEntries(Object.entries(grouped).filter(([k]) => k === filterType));

  return (
    <div>
      <PageHeader
        breadcrumb={["Projects", project.name, "Script Breakdown"]}
        title="Script Breakdown"
        action={
          <div className="flex items-center gap-3">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                {ELEMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <button onClick={() => setDialogOpen(true)} className="tm-glow-btn text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Element
            </button>
          </div>
        }
      />
      <div className="p-8 space-y-6">
        {isLoading ? (
          <div className="space-y-3">{[1, 2].map(i => <div key={i} className="tm-card h-32 animate-pulse" />)}</div>
        ) : Object.keys(filtered).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <p className="text-sm">No breakdown elements yet</p>
            <button onClick={() => setDialogOpen(true)} className="mt-2 text-primary text-sm hover:underline">Add elements</button>
          </div>
        ) : (
          Object.entries(filtered).map(([type, items]) => (
            <div key={type}>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={`${typeColors[type] || "bg-muted text-muted-foreground"} border-0`}>{type}</Badge>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="tm-card p-4 group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        {item.sceneReference && <p className="text-xs text-muted-foreground mt-0.5">Scene: {item.sceneReference}</p>}
                        {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                      </div>
                      <button onClick={() => setDeleteTarget(item.id)} className="opacity-0 group-hover:opacity-100 text-destructive p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Breakdown Element</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Select value={form.elementType} onValueChange={v => setForm(f => ({ ...f, elementType: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ELEMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Scene reference (e.g. Scene 3)" value={form.sceneReference} onChange={e => setForm(f => ({ ...f, sceneReference: e.target.value }))} />
            <Textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <Button onClick={handleCreate} disabled={!form.name.trim()} className="w-full">Add Element</Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) deleteBreakdown.mutate(deleteTarget); setDeleteTarget(null); }} title="Delete element" description="This breakdown element will be permanently removed." />
    </div>
  );
}
