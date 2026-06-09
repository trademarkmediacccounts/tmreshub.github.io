import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Project } from "@/hooks/useProjects";
import {
  useStagingEnvironments,
  useCreateStagingEnvironment,
  useUpdateStagingEnvironment,
  useDeleteStagingEnvironment,
  StagingEnvironment,
} from "@/hooks/useStagingEnvironments";
import { PageHeader } from "@/components/PageHeader";
import { Plus, Trash2, ExternalLink, Edit, GitBranch, Rocket } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { motion } from "framer-motion";

const ENVIRONMENTS = ["development", "staging", "preview", "production"];
const STATUSES = ["Draft", "Building", "Live", "Failed", "Archived"];

const empty = { name: "", environment: "staging", url: "", branch: "main", status: "Draft", notes: "" };

const statusColor: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground",
  Building: "bg-amber-500/15 text-amber-600",
  Live: "bg-emerald-500/15 text-emerald-600",
  Failed: "bg-destructive/15 text-destructive",
  Archived: "bg-muted text-muted-foreground",
};

export default function WebStagingPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { data: envs = [], isLoading } = useStagingEnvironments(project.id);
  const createEnv = useCreateStagingEnvironment();
  const updateEnv = useUpdateStagingEnvironment();
  const deleteEnv = useDeleteStagingEnvironment();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const openCreate = () => { setEditingId(null); setForm(empty); setDialogOpen(true); };
  const openEdit = (e: StagingEnvironment) => {
    setEditingId(e.id);
    setForm({ name: e.name, environment: e.environment, url: e.url || "", branch: e.branch, status: e.status, notes: e.notes || "" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const payload = { ...form, url: form.url || null, notes: form.notes || null, projectId: project.id };
    if (editingId) {
      updateEnv.mutate({ id: editingId, ...payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createEnv.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const deployNow = (e: StagingEnvironment) => {
    updateEnv.mutate({ id: e.id, status: "Live", lastDeploy: new Date().toISOString() });
  };

  return (
    <div>
      <PageHeader
        breadcrumb={["Projects", project.name, "Web Staging"]}
        title="Web Staging"
        action={
          <button onClick={openCreate} className="tm-glow-btn text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Environment
          </button>
        }
      />
      <div className="p-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{[1, 2].map(i => <div key={i} className="tm-card h-32 animate-pulse" />)}</div>
        ) : envs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <p className="text-sm">No environments yet</p>
            <button onClick={openCreate} className="mt-2 text-primary text-sm hover:underline">Add your first staging environment</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {envs.map((env, i) => (
              <motion.div
                key={env.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="tm-card p-5 group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium truncate">{env.name}</h3>
                      <Badge variant="outline" className="text-xs">{env.environment}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <GitBranch className="w-3 h-3" /> {env.branch}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[env.status] || "bg-muted"}`}>{env.status}</span>
                </div>
                {env.url && (
                  <a href={env.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-primary hover:underline truncate mb-2">
                    <ExternalLink className="w-3 h-3 shrink-0" /> {env.url}
                  </a>
                )}
                {env.notes && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{env.notes}</p>}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {env.lastDeploy ? `Deployed ${new Date(env.lastDeploy).toLocaleDateString()}` : "Never deployed"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => deployNow(env)} title="Mark deployed" className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-primary">
                      <Rocket className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEdit(env)} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(env.id)} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? "Edit Environment" : "New Environment"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Environment name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.environment} onValueChange={v => setForm(f => ({ ...f, environment: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ENVIRONMENTS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Input placeholder="Deployment URL (optional)" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
            <Input placeholder="Branch" value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} />
            <Textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            <Button onClick={handleSave} disabled={!form.name.trim()} className="w-full">{editingId ? "Save Changes" : "Create Environment"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteEnv.mutate(deleteTarget); setDeleteTarget(null); }}
        title="Delete environment"
        description="This staging environment will be permanently removed."
      />
    </div>
  );
}
