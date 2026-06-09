import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Project } from "@/hooks/useProjects";
import { useShots, useCreateShot, useUpdateShot, useDeleteShot, Shot } from "@/hooks/useShots";
import { PageHeader } from "@/components/PageHeader";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";


const SHOT_TYPES = ["Wide", "Medium", "Close-up", "Extreme Close-up", "Over the Shoulder", "POV", "Aerial", "Tracking", "Establishing"];
const MOVEMENTS = ["Static", "Pan", "Tilt", "Dolly", "Crane", "Handheld", "Steadicam", "Drone", "Slider"];
const SHOT_STATUSES = ["Todo", "In Progress", "Done"];

export default function ShotListPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { data: shots = [], isLoading } = useShots(project.id);
  const createShot = useCreateShot();
  const updateShot = useUpdateShot();
  const deleteShot = useDeleteShot();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShot, setEditingShot] = useState<Shot | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState({
    shotNumber: "", description: "", shotType: "Wide", angle: "", lens: "", movement: "Static", locationNotes: "",
  });

  const resetForm = () => setForm({ shotNumber: "", description: "", shotType: "Wide", angle: "", lens: "", movement: "Static", locationNotes: "" });

  const handleCreate = () => {
    if (!form.shotNumber.trim()) return;
    createShot.mutate({ ...form, projectId: project.id, sortOrder: shots.length }, {
      onSuccess: () => { setDialogOpen(false); resetForm(); },
    });
  };

  const handleEdit = (shot: Shot) => {
    setEditingShot(shot);
    setForm({ shotNumber: shot.shotNumber, description: shot.description || "", shotType: shot.shotType, angle: shot.angle || "", lens: shot.lens || "", movement: shot.movement || "Static", locationNotes: shot.locationNotes || "" });
    setDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingShot) return;
    updateShot.mutate({ id: editingShot.id, ...form }, {
      onSuccess: () => { setDialogOpen(false); setEditingShot(null); resetForm(); },
    });
  };

  const statusColor: Record<string, string> = {
    Todo: "bg-muted text-muted-foreground",
    "In Progress": "bg-yellow-500/20 text-yellow-400",
    Done: "bg-green-500/20 text-green-400",
  };

  return (
    <div>
      <PageHeader
        breadcrumb={["Projects", project.name, "Shot List"]}
        title="Shot List"
        action={
          <button onClick={() => { setEditingShot(null); resetForm(); setDialogOpen(true); }} className="tm-glow-btn text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Shot
          </button>
        }
      />
      <div className="p-8">
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="tm-card h-20 animate-pulse" />)}</div>
        ) : shots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <p className="text-sm">No shots yet</p>
            <button onClick={() => setDialogOpen(true)} className="mt-2 text-primary text-sm hover:underline">Add your first shot</button>
          </div>
        ) : (
          <div className="space-y-2">
            {shots.map((shot, i) => (
              <motion.div
                key={shot.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="tm-card p-4 flex items-center gap-4 group cursor-pointer hover:border-primary/20 transition-colors"
                onClick={() => handleEdit(shot)}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                <div className="w-16 text-sm font-mono font-medium text-primary">{shot.shotNumber}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{shot.description || "No description"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{shot.shotType}</span>
                    {shot.lens && <span className="text-xs text-muted-foreground">· {shot.lens}</span>}
                    {shot.movement && shot.movement !== "Static" && <span className="text-xs text-muted-foreground">· {shot.movement}</span>}
                  </div>
                </div>
                <Select value={shot.status} onValueChange={v => { updateShot.mutate({ id: shot.id, status: v }); }} >
                  <SelectTrigger className="w-32" onClick={e => e.stopPropagation()}>
                    <Badge className={`${statusColor[shot.status]} border-0 text-xs`}>{shot.status}</Badge>
                  </SelectTrigger>
                  <SelectContent>{SHOT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <button onClick={e => { e.stopPropagation(); setDeleteTarget(shot.id); }} className="opacity-0 group-hover:opacity-100 text-destructive p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) setEditingShot(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingShot ? "Edit Shot" : "Add Shot"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Shot # (e.g. 1A)" value={form.shotNumber} onChange={e => setForm(f => ({ ...f, shotNumber: e.target.value }))} />
            <Textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.shotType} onValueChange={v => setForm(f => ({ ...f, shotType: v }))}>
                <SelectTrigger><SelectValue placeholder="Shot type" /></SelectTrigger>
                <SelectContent>{SHOT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.movement} onValueChange={v => setForm(f => ({ ...f, movement: v }))}>
                <SelectTrigger><SelectValue placeholder="Movement" /></SelectTrigger>
                <SelectContent>{MOVEMENTS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Angle (e.g. Low)" value={form.angle} onChange={e => setForm(f => ({ ...f, angle: e.target.value }))} />
              <Input placeholder="Lens (e.g. 50mm)" value={form.lens} onChange={e => setForm(f => ({ ...f, lens: e.target.value }))} />
            </div>
            <Input placeholder="Location notes" value={form.locationNotes} onChange={e => setForm(f => ({ ...f, locationNotes: e.target.value }))} />
            <Button onClick={editingShot ? handleUpdate : handleCreate} disabled={!form.shotNumber.trim()} className="w-full">
              {editingShot ? "Update Shot" : "Add Shot"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) deleteShot.mutate(deleteTarget); setDeleteTarget(null); }} title="Delete shot" description="This shot will be permanently removed." />
    </div>
  );
}
