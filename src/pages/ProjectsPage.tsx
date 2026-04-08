import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { useProjects, useCreateProject, useDeleteProject } from "@/hooks/useProjects";
import { motion } from "framer-motion";
import { Plus, Folder, Calendar, Users, MoreHorizontal, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";

const PROJECT_TYPES = ["Commercial", "Music Video", "Documentary", "Corporate", "Short Film", "Live Event", "Social Content"];
const PROJECT_STATUSES = ["Pre-Production", "Production", "Post-Production", "Delivered", "Archived"];

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", type: "Commercial", client: "" });

  const handleCreate = () => {
    if (!form.name.trim()) return;
    createProject.mutate(form, { onSuccess: () => { setDialogOpen(false); setForm({ name: "", description: "", type: "Commercial", client: "" }); } });
  };

  const statusColor: Record<string, string> = {
    "Pre-Production": "bg-yellow-500/20 text-yellow-400",
    "Production": "bg-primary/20 text-primary",
    "Post-Production": "bg-blue-500/20 text-blue-400",
    "Delivered": "bg-green-500/20 text-green-400",
    "Archived": "bg-muted text-muted-foreground",
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        breadcrumb={["Trademark Command", "Projects"]}
        title="Projects"
        action={
          <button onClick={() => setDialogOpen(true)} className="tm-glow-btn text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
          </button>
        }
      />

      <div className="p-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="tm-card h-48 animate-pulse" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Folder className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm">No projects yet</p>
            <button onClick={() => setDialogOpen(true)} className="mt-4 text-primary text-sm hover:underline">Create your first project</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link to={`/projects/${project.id}`} className="block tm-card p-5 group hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Folder className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium group-hover:text-primary transition-colors">{project.name}</h3>
                        <p className="text-xs text-muted-foreground">{project.type}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.preventDefault()}>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive" onClick={e => { e.preventDefault(); setDeleteTarget(project.id); }}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {project.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{project.description}</p>}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[project.status] || "bg-muted text-muted-foreground"}`}>
                      {project.status}
                    </span>
                    {project.client && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" /> {project.client}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Project</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Project name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PROJECT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Client (optional)" value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} />
            <Button onClick={handleCreate} disabled={!form.name.trim() || createProject.isPending} className="w-full">
              {createProject.isPending ? "Creating…" : "Create Project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteProject.mutate(deleteTarget); setDeleteTarget(null); }}
        title="Delete project"
        description="This will permanently delete this project and all its shots, call sheets, breakdowns, and assets."
      />
    </div>
  );
}
