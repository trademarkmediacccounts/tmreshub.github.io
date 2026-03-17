import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { Globe, ExternalLink, MessageSquare, GitBranch, Clock, CheckCircle, Pencil, Trash2 } from "lucide-react";
import { useBuildProjects, useCreateBuildProject, useUpdateBuildProject, useDeleteBuildProject } from "@/hooks/useBuildProjects";
import { BuildProjectDialog } from "@/components/BuildProjectDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import type { BuildProject } from "@/hooks/useBuildProjects";

const statusPill = (s: string) => {
  switch (s) {
    case "Live": return "tm-pill-complete";
    case "Staging": return "tm-pill-active";
    default: return "tm-pill-draft";
  }
};

export default function Build() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState<BuildProject | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: projects = [], isLoading } = useBuildProjects();
  const createProject = useCreateBuildProject();
  const updateProject = useUpdateBuildProject();
  const deleteProject = useDeleteBuildProject();

  const handleSubmit = (data: Partial<BuildProject>) => {
    if (data.id) updateProject.mutate(data as BuildProject & { id: string });
    else createProject.mutate(data);
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        breadcrumb={["Trademark Command", "TM/Build"]}
        title="Web Staging"
        action={<button className="tm-glow-btn text-sm" onClick={() => { setEditProject(null); setDialogOpen(true); }}>New Project</button>}
      />

      <div className="p-8 space-y-6">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading projects…</div>
        ) : projects.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No projects yet. Create your first one!</div>
        ) : (
          projects.map((project, i) => (
            <motion.div key={project.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, type: "tween", ease: [0.2, 0, 0, 1] }}
              className="tm-card p-5 group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium tracking-tight">{project.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{project.url}</span><ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={statusPill(project.status)}>{project.status}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditProject(project); setDialogOpen(true); }} className="p-1.5 rounded hover:bg-accent"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteId(project.id)} className="p-1.5 rounded hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Build Progress</span>
                  <span className="text-xs tabular-nums font-medium">{project.progress}%</span>
                </div>
                <div className="h-1.5 bg-background rounded-full overflow-hidden">
                  <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 0.8, ease: [0.2, 0, 0, 1], delay: i * 0.1 }} />
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />{project.branch}</span>
                {project.last_deploy && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{project.last_deploy}</span>}
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{project.feedback} feedback items</span>
                {project.status === "Live" && <span className="flex items-center gap-1 text-green-400"><CheckCircle className="w-3 h-3" />Deployed</span>}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <BuildProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleSubmit} project={editProject} />
      <DeleteConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={() => { if (deleteId) deleteProject.mutate(deleteId); setDeleteId(null); }} title="this project" />
    </div>
  );
}
