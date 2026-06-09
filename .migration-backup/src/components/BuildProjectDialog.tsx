import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BuildProject } from "@/hooks/useBuildProjects";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<BuildProject>) => void;
  project?: BuildProject | null;
}

export function BuildProjectDialog({ open, onOpenChange, onSubmit, project }: Props) {
  const [form, setForm] = useState({ name: "", url: "", status: "Draft", branch: "main", progress: 0 });

  useEffect(() => {
    if (project) {
      setForm({ name: project.name, url: project.url || "", status: project.status, branch: project.branch, progress: project.progress });
    } else {
      setForm({ name: "", url: "", status: "Draft", branch: "main", progress: 0 });
    }
  }, [project, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, ...(project ? { id: project.id } : {}) });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader><DialogTitle>{project ? "Edit Project" : "New Project"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Project Name</Label><Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><Label>URL</Label><Input placeholder="project.tm.dev" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Staging">Staging</SelectItem><SelectItem value="Live">Live</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Branch</Label><Input value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} /></div>
          </div>
          <div><Label>Progress (%)</Label><Input type="number" min={0} max={100} value={form.progress} onChange={e => setForm(f => ({ ...f, progress: parseInt(e.target.value) || 0 }))} /></div>
          <Button type="submit" className="w-full">{project ? "Save Changes" : "Create Project"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
