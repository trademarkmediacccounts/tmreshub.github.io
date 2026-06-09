import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { Plus, DollarSign, Calendar, User, MoreHorizontal, Trash2, Edit, Link as LinkIcon, FolderPlus } from "lucide-react";
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead, Lead } from "@/hooks/useLeads";
import { useProjects, useCreateProject } from "@/hooks/useProjects";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Link, useNavigate } from "react-router-dom";

const stages = ["Lead", "Proposal", "Negotiation", "Won", "Lost"];

const stageColors: Record<string, string> = {
  Lead: "border-t-muted-foreground",
  Proposal: "border-t-primary",
  Negotiation: "border-t-yellow-500",
  Won: "border-t-green-500",
  Lost: "border-t-destructive",
};

const emptyForm = { name: "", company: "", value: "", currency: "£", service: "", stage: "Lead", notes: "", projectId: "" };

export default function Flow() {
  const { data: leads = [], isLoading } = useLeads();
  const { data: projects = [] } = useProjects();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const createProject = useCreateProject();
  const navigate = useNavigate();

  const createProjectFromLead = (lead: Lead) => {
    createProject.mutate({
      name: lead.service || lead.company || lead.name,
      client: lead.company || null,
      description: lead.notes || null,
    } as any, {
      onSuccess: (project) => {
        updateLead.mutate({ id: lead.id, projectId: project.id });
        navigate(`/projects/${project.id}`);
      },
    });
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = (stage = "Lead") => {
    setEditingLead(null);
    setForm({ ...emptyForm, stage });
    setDialogOpen(true);
  };

  const openEdit = (lead: Lead) => {
    setEditingLead(lead);
    setForm({
      name: lead.name,
      company: lead.company,
      value: String(lead.value),
      currency: lead.currency,
      service: lead.service,
      stage: lead.stage,
      notes: lead.notes || "",
      projectId: lead.projectId || "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name,
      company: form.company,
      value: parseFloat(form.value) || 0,
      currency: form.currency,
      service: form.service,
      stage: form.stage,
      notes: form.notes || null,
      projectId: form.projectId || null,
    };
    if (editingLead) {
      updateLead.mutate({ id: editingLead.id, ...payload } as any, { onSuccess: () => setDialogOpen(false) });
    } else {
      createLead.mutate(payload as any, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const moveToStage = (lead: Lead, newStage: string) => {
    updateLead.mutate({ id: lead.id, stage: newStage });
  };

  const getStageLeads = (stage: string) => leads.filter(l => l.stage === stage);
  const getStageValue = (stage: string) => {
    const total = getStageLeads(stage).reduce((acc, l) => acc + Number(l.value), 0);
    if (total >= 1000) return `£${(total / 1000).toFixed(1)}k`;
    return `£${total}`;
  };

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return null;
    return projects.find(p => p.id === projectId)?.name || null;
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        breadcrumb={["Trademark Command", "TM/Flow"]}
        title="Pipeline"
        action={<button onClick={() => openCreate()} className="tm-glow-btn text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New Lead</button>}
      />

      <div className="p-8">
        {isLoading ? (
          <div className="grid grid-cols-5 gap-4">
            {stages.map(s => <div key={s} className="tm-card h-64 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-4 min-h-[calc(100vh-140px)]">
            {stages.map((stage) => (
              <div key={stage} className="flex flex-col">
                <div className={`tm-card p-3 mb-3 border-t-2 ${stageColors[stage]}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">{stage}</h3>
                      <p className="text-xs text-muted-foreground tabular-nums">{getStageLeads(stage).length} deals · {getStageValue(stage)}</p>
                    </div>
                    <Plus onClick={() => openCreate(stage)} className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  {getStageLeads(stage).map((lead, i) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, type: "tween", ease: [0.2, 0, 0, 1] }}
                      className="tm-card p-4 cursor-pointer group"
                      onClick={() => openEdit(lead)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium">{lead.company || lead.name}</h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={e => { e.stopPropagation(); openEdit(lead); }}>
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            {stages.filter(s => s !== stage).map(s => (
                              <DropdownMenuItem key={s} onClick={e => { e.stopPropagation(); moveToStage(lead, s); }}>
                                Move to {s}
                              </DropdownMenuItem>
                            ))}
                            {!lead.projectId && (
                              <DropdownMenuItem onClick={e => { e.stopPropagation(); createProjectFromLead(lead); }}>
                                <FolderPlus className="w-4 h-4 mr-2" /> Create Project
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive" onClick={e => { e.stopPropagation(); setDeleteTarget(lead.id); }}>
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{lead.service}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-primary font-medium tabular-nums">
                          <DollarSign className="w-3 h-3" />{lead.currency}{Number(lead.value).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-3 h-3" />{new Date(lead.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{lead.name}</span>
                      </div>
                      {getProjectName(lead.projectId) && (
                        <Link
                          to={`/projects/${lead.projectId}`}
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
                        >
                          <LinkIcon className="w-3 h-3" />
                          {getProjectName(lead.projectId)}
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingLead ? "Edit Lead" : "New Lead"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Contact name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Company" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
            <Input placeholder="Service / deliverable" value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Value" type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
              <Select value={form.stage} onValueChange={v => setForm(f => ({ ...f, stage: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{stages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Select value={form.projectId || "none"} onValueChange={v => setForm(f => ({ ...f, projectId: v === "none" ? "" : v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Assign to project (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No project</SelectItem>
                {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            <Button onClick={handleSave} disabled={!form.name.trim() || createLead.isPending || updateLead.isPending} className="w-full">
              {(createLead.isPending || updateLead.isPending) ? "Saving…" : editingLead ? "Save Changes" : "Create Lead"}
            </Button>
            {editingLead && !editingLead.projectId && (
              <Button variant="outline" onClick={() => { setDialogOpen(false); createProjectFromLead(editingLead); }} disabled={createProject.isPending} className="w-full flex items-center gap-2">
                <FolderPlus className="w-4 h-4" /> Create Project from Lead
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteLead.mutate(deleteTarget); setDeleteTarget(null); }}
        title="Delete lead"
        description="This will permanently delete this lead from your pipeline."
      />
    </div>
  );
}
