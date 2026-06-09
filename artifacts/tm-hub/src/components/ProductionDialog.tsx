import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Production } from "@/hooks/useProductions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Production>) => void;
  item?: Production | null;
}

export function ProductionDialog({ open, onOpenChange, onSubmit, item }: Props) {
  const [form, setForm] = useState({ name: "", date: "", location: "", crew: 0, status: "Prep" });

  useEffect(() => {
    if (item) {
      setForm({ name: item.name, date: item.date, location: item.location, crew: item.crew, status: item.status });
    } else {
      setForm({ name: "", date: "", location: "", crew: 0, status: "Prep" });
    }
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, ...(item ? { id: item.id } : {}) });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader><DialogTitle>{item ? "Edit Production" : "New Production"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Name</Label><Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Date</Label><Input required placeholder="e.g. Jun 12-14" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
            <div><Label>Location</Label><Input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Crew Size</Label><Input type="number" min={0} value={form.crew} onChange={e => setForm(f => ({ ...f, crew: parseInt(e.target.value) || 0 }))} /></div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Prep">Prep</SelectItem><SelectItem value="Confirmed">Confirmed</SelectItem><SelectItem value="Complete">Complete</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full">{item ? "Save Changes" : "Create Production"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
