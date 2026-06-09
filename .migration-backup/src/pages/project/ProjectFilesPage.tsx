import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Project } from "@/hooks/useProjects";
import { useProjectAssets, useCreateProjectAsset, useDeleteProjectAsset } from "@/hooks/useProjectAssets";
import { PageHeader } from "@/components/PageHeader";
import { Plus, Trash2, FileVideo, FileAudio, FileImage, FileText, File } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { motion } from "framer-motion";

const FILE_TYPES = ["Video", "Audio", "Image", "Document", "Graphics", "Other"];
const CATEGORIES = ["General", "Footage", "B-Roll", "Music", "SFX", "Graphics", "Scripts", "Contracts", "Deliverables"];

const typeIcons: Record<string, typeof File> = {
  Video: FileVideo, Audio: FileAudio, Image: FileImage, Document: FileText, Graphics: FileImage, Other: File,
};

export default function ProjectFilesPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { data: assets = [], isLoading } = useProjectAssets(project.id);
  const createAsset = useCreateProjectAsset();
  const deleteAsset = useDeleteProjectAsset();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", file_type: "Video", category: "General", file_url: "", notes: "" });

  const handleCreate = () => {
    if (!form.name.trim()) return;
    createAsset.mutate({ ...form, project_id: project.id }, {
      onSuccess: () => { setDialogOpen(false); setForm({ name: "", file_type: "Video", category: "General", file_url: "", notes: "" }); },
    });
  };

  return (
    <div>
      <PageHeader
        breadcrumb={["Projects", project.name, "Files & Assets"]}
        title="Files & Assets"
        action={
          <button onClick={() => setDialogOpen(true)} className="tm-glow-btn text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add File
          </button>
        }
      />
      <div className="p-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{[1, 2, 3].map(i => <div key={i} className="tm-card h-28 animate-pulse" />)}</div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <p className="text-sm">No files yet</p>
            <button onClick={() => setDialogOpen(true)} className="mt-2 text-primary text-sm hover:underline">Add your first file</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {assets.map((asset, i) => {
              const Icon = typeIcons[asset.file_type] || File;
              return (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="tm-card p-4 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{asset.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{asset.file_type}</span>
                        <span className="text-xs text-muted-foreground">· {asset.category}</span>
                      </div>
                      {asset.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{asset.notes}</p>}
                    </div>
                    <button onClick={() => setDeleteTarget(asset.id)} className="opacity-0 group-hover:opacity-100 text-destructive p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add File</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="File name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.file_type} onValueChange={v => setForm(f => ({ ...f, file_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FILE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Input placeholder="File URL (optional)" value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} />
            <Textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            <Button onClick={handleCreate} disabled={!form.name.trim()} className="w-full">Add File</Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) deleteAsset.mutate(deleteTarget); setDeleteTarget(null); }} title="Delete file" description="This file reference will be permanently removed." />
    </div>
  );
}
