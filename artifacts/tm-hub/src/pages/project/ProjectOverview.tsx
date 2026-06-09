import { Link, useOutletContext } from "react-router-dom";
import { Project, useUpdateProject } from "@/hooks/useProjects";
import { useShots } from "@/hooks/useShots";
import { useCallSheets } from "@/hooks/useCallSheets";
import { useScriptBreakdowns } from "@/hooks/useScriptBreakdowns";
import { useProjectAssets } from "@/hooks/useProjectAssets";
import { PageHeader } from "@/components/PageHeader";
import { Camera, ClipboardList, FileText, FolderOpen, ArrowRight, Edit, Globe, Users, Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const STATUSES = ["Pre-Production", "Production", "Post-Production", "Delivered", "Archived"];
const PROJECT_TYPES = ["Commercial", "Music Video", "Documentary", "Corporate", "Short Film", "Live Event", "Social Content"];

const VIDEO_TYPES = ["Commercial", "Music Video", "Documentary", "Short Film", "Social Content"];
const WEB_TYPES = ["Corporate"];
const PRODUCTION_TYPES = ["Live Event"];

export default function ProjectOverview() {
  const { project } = useOutletContext<{ project: Project }>();
  const { data: shots = [] } = useShots(project.id);
  const { data: callSheets = [] } = useCallSheets(project.id);
  const { data: breakdowns = [] } = useScriptBreakdowns(project.id);
  const { data: assets = [] } = useProjectAssets(project.id);
  const updateProject = useUpdateProject();
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: project.name,
    description: project.description || "",
    type: project.type,
    client: project.client || "",
    startDate: project.startDate || "",
    endDate: project.endDate || "",
  });

  const handleSave = () => {
    updateProject.mutate({
      id: project.id,
      name: editForm.name,
      description: editForm.description || undefined,
      type: editForm.type,
      client: editForm.client || undefined,
      startDate: editForm.startDate || undefined,
      endDate: editForm.endDate || undefined,
    }, { onSuccess: () => setEditOpen(false) });
  };

  // Build modules based on project type
  const allModules = {
    shots: { icon: Camera, label: "Shot List", path: "shots", count: shots.length, desc: "Plan and organize shots" },
    schedule: { icon: ClipboardList, label: "Call Sheets", path: "schedule", count: callSheets.length, desc: "Schedule crew & locations" },
    breakdown: { icon: FileText, label: "Script Breakdown", path: "breakdown", count: breakdowns.length, desc: "Break down script elements" },
    files: { icon: FolderOpen, label: "Files & Assets", path: "files", count: assets.length, desc: "Manage project files" },
    staging: { icon: Globe, label: "Web Staging", path: "staging", count: 0, desc: "Manage staging environments" },
    resources: { icon: Package, label: "Resources", path: "resources", count: 0, desc: "Track equipment & resources" },
  };

  let moduleKeys: string[];
  if (VIDEO_TYPES.includes(project.type)) {
    moduleKeys = ["shots", "schedule", "breakdown", "files"];
  } else if (WEB_TYPES.includes(project.type)) {
    moduleKeys = ["staging", "files"];
  } else if (PRODUCTION_TYPES.includes(project.type)) {
    moduleKeys = ["schedule", "resources", "files"];
  } else {
    moduleKeys = ["shots", "schedule", "breakdown", "files"];
  }

  const modules = moduleKeys.map(k => allModules[k as keyof typeof allModules]);

  const shotsDone = shots.filter(s => s.status === "Done").length;
  const shotsProgress = shots.length > 0 ? Math.round((shotsDone / shots.length) * 100) : 0;

  return (
    <div>
      <PageHeader
        breadcrumb={["Projects", project.name]}
        title="Overview"
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => { setEditForm({ name: project.name, description: project.description || "", type: project.type, client: project.client || "", startDate: project.startDate || "", endDate: project.endDate || "" }); setEditOpen(true); }} className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50">
              <Edit className="w-4 h-4" />
            </button>
            <Select value={project.status} onValueChange={v => updateProject.mutate({ id: project.id, status: v })}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        }
      />
      <div className="p-8 space-y-8">
        {/* Project Info */}
        <div className="tm-card p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Type</p>
              <p className="text-sm font-medium">{project.type}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Client</p>
              <p className="text-sm font-medium">{project.client || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Start Date</p>
              <p className="text-sm font-medium">{project.startDate ? new Date(project.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">End Date</p>
              <p className="text-sm font-medium">{project.endDate ? new Date(project.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}</p>
            </div>
          </div>
          {project.description && <p className="text-sm text-muted-foreground mt-4 border-t border-border pt-4">{project.description}</p>}
        </div>

        {/* Shot Progress (video projects only) */}
        {VIDEO_TYPES.includes(project.type) && shots.length > 0 && (
          <div className="tm-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Shot Progress</h3>
              <span className="text-xs text-muted-foreground">{shotsDone}/{shots.length} complete</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${shotsProgress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Module Cards */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((mod, i) => (
              <motion.div
                key={mod.path}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={mod.path} className="tm-card p-5 flex items-center gap-4 group hover:border-primary/30 transition-colors block">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <mod.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium group-hover:text-primary transition-colors">{mod.label}</h3>
                    <p className="text-xs text-muted-foreground">{mod.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold tabular-nums text-primary">{mod.count}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Project</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Project name" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            <Textarea placeholder="Description" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
            <Select value={editForm.type} onValueChange={v => setEditForm(f => ({ ...f, type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PROJECT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Client" value={editForm.client} onChange={e => setEditForm(f => ({ ...f, client: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                <Input type="date" value={editForm.startDate} onChange={e => setEditForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                <Input type="date" value={editForm.endDate} onChange={e => setEditForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>
            <Button onClick={handleSave} disabled={!editForm.name.trim() || updateProject.isPending} className="w-full">
              {updateProject.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
