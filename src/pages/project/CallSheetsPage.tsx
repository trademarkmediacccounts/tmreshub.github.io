import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Project } from "@/hooks/useProjects";
import { useCallSheets, useCreateCallSheet, useDeleteCallSheet, useCallSheetEntries, useCreateCallSheetEntry, useDeleteCallSheetEntry, CallSheet } from "@/hooks/useCallSheets";
import { PageHeader } from "@/components/PageHeader";
import { Plus, Trash2, MapPin, Clock, Cloud, ChevronDown, ChevronRight, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { motion, AnimatePresence } from "framer-motion";

export default function CallSheetsPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { data: callSheets = [], isLoading } = useCallSheets(project.id);
  const createCallSheet = useCreateCallSheet();
  const deleteCallSheet = useDeleteCallSheet();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [expandedSheet, setExpandedSheet] = useState<string | null>(null);
  const [form, setForm] = useState({ shoot_date: "", call_time: "06:00", location: "", weather_notes: "", general_notes: "" });

  const handleCreate = () => {
    if (!form.shoot_date) return;
    createCallSheet.mutate({ ...form, project_id: project.id }, {
      onSuccess: () => { setDialogOpen(false); setForm({ shoot_date: "", call_time: "06:00", location: "", weather_notes: "", general_notes: "" }); },
    });
  };

  return (
    <div>
      <PageHeader
        breadcrumb={["Projects", project.name, "Call Sheets"]}
        title="Call Sheets"
        action={
          <button onClick={() => setDialogOpen(true)} className="tm-glow-btn text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Call Sheet
          </button>
        }
      />
      <div className="p-8 space-y-3">
        {isLoading ? (
          <div className="space-y-3">{[1, 2].map(i => <div key={i} className="tm-card h-24 animate-pulse" />)}</div>
        ) : callSheets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <p className="text-sm">No call sheets yet</p>
            <button onClick={() => setDialogOpen(true)} className="mt-2 text-primary text-sm hover:underline">Create one</button>
          </div>
        ) : (
          callSheets.map((cs, i) => (
            <CallSheetCard key={cs.id} callSheet={cs} index={i} expanded={expandedSheet === cs.id} onToggle={() => setExpandedSheet(expandedSheet === cs.id ? null : cs.id)} onDelete={() => setDeleteTarget(cs.id)} />
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Call Sheet</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input type="date" value={form.shoot_date} onChange={e => setForm(f => ({ ...f, shoot_date: e.target.value }))} />
            <Input type="time" value={form.call_time} onChange={e => setForm(f => ({ ...f, call_time: e.target.value }))} />
            <Input placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            <Input placeholder="Weather notes" value={form.weather_notes} onChange={e => setForm(f => ({ ...f, weather_notes: e.target.value }))} />
            <Textarea placeholder="General notes" value={form.general_notes} onChange={e => setForm(f => ({ ...f, general_notes: e.target.value }))} />
            <Button onClick={handleCreate} disabled={!form.shoot_date} className="w-full">Create Call Sheet</Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) deleteCallSheet.mutate(deleteTarget); setDeleteTarget(null); }} title="Delete call sheet" description="This call sheet and all its entries will be permanently removed." />
    </div>
  );
}

function CallSheetCard({ callSheet, index, expanded, onToggle, onDelete }: { callSheet: CallSheet; index: number; expanded: boolean; onToggle: () => void; onDelete: () => void }) {
  const { data: entries = [] } = useCallSheetEntries(expanded ? callSheet.id : undefined);
  const createEntry = useCreateCallSheetEntry();
  const deleteEntry = useDeleteCallSheetEntry();
  const [addingEntry, setAddingEntry] = useState(false);
  const [entryForm, setEntryForm] = useState({ person_name: "", role: "", call_time: "06:00", notes: "" });

  const handleAddEntry = () => {
    if (!entryForm.person_name.trim() || !entryForm.role.trim()) return;
    createEntry.mutate({ ...entryForm, call_sheet_id: callSheet.id }, {
      onSuccess: () => { setAddingEntry(false); setEntryForm({ person_name: "", role: "", call_time: "06:00", notes: "" }); },
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="tm-card overflow-hidden">
      <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-muted/20 transition-colors" onClick={onToggle}>
        {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        <div className="flex-1">
          <p className="text-sm font-medium">{new Date(callSheet.shoot_date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {callSheet.call_time}</span>
            {callSheet.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {callSheet.location}</span>}
            {callSheet.weather_notes && <span className="flex items-center gap-1"><Cloud className="w-3 h-3" /> {callSheet.weather_notes}</span>}
          </div>
        </div>
        <button onClick={e => { e.stopPropagation(); onDelete(); }} className="text-destructive p-1 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t border-border">
            <div className="p-4 space-y-3">
              {callSheet.general_notes && <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">{callSheet.general_notes}</p>}

              {entries.length > 0 && (
                <div className="space-y-2">
                  {entries.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between text-sm bg-muted/20 px-3 py-2 rounded-lg">
                      <div>
                        <span className="font-medium">{entry.person_name}</span>
                        <span className="text-muted-foreground ml-2">— {entry.role}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{entry.call_time}</span>
                        <button onClick={() => deleteEntry.mutate(entry.id)} className="text-destructive"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {addingEntry ? (
                <div className="space-y-2 bg-muted/10 p-3 rounded-lg">
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Name" value={entryForm.person_name} onChange={e => setEntryForm(f => ({ ...f, person_name: e.target.value }))} />
                    <Input placeholder="Role" value={entryForm.role} onChange={e => setEntryForm(f => ({ ...f, role: e.target.value }))} />
                    <Input type="time" value={entryForm.call_time} onChange={e => setEntryForm(f => ({ ...f, call_time: e.target.value }))} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddEntry} disabled={!entryForm.person_name.trim()}>Add</Button>
                    <Button size="sm" variant="ghost" onClick={() => setAddingEntry(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingEntry(true)} className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <UserPlus className="w-4 h-4" /> Add crew/cast member
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
