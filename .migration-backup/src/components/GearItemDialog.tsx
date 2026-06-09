import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { GearItem } from "@/hooks/useGearItems";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<GearItem>) => void;
  item?: GearItem | null;
}

export function GearItemDialog({ open, onOpenChange, onSubmit, item }: Props) {
  const [form, setForm] = useState({ name: "", category: "Camera Kit", status: "Available", location: "", condition: "Good", reserved_for: "" });

  useEffect(() => {
    if (item) {
      setForm({ name: item.name, category: item.category, status: item.status, location: item.location || "", condition: item.condition, reserved_for: item.reserved_for || "" });
    } else {
      setForm({ name: "", category: "Camera Kit", status: "Available", location: "", condition: "Good", reserved_for: "" });
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
        <DialogHeader><DialogTitle>{item ? "Edit Gear" : "Add Gear Item"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Name</Label><Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Camera Kit">Camera Kit</SelectItem><SelectItem value="Audio">Audio</SelectItem><SelectItem value="Lighting">Lighting</SelectItem><SelectItem value="Grip">Grip</SelectItem><SelectItem value="Monitoring">Monitoring</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Available">Available</SelectItem><SelectItem value="Reserved">Reserved</SelectItem><SelectItem value="In Use">In Use</SelectItem><SelectItem value="Maintenance">Maintenance</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
            <div><Label>Condition</Label>
              <Select value={form.condition} onValueChange={v => setForm(f => ({ ...f, condition: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Excellent">Excellent</SelectItem><SelectItem value="Good">Good</SelectItem><SelectItem value="Fair">Fair</SelectItem><SelectItem value="Needs Repair">Needs Repair</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Reserved For</Label><Input placeholder="Leave blank if not reserved" value={form.reserved_for} onChange={e => setForm(f => ({ ...f, reserved_for: e.target.value }))} /></div>
          <Button type="submit" className="w-full">{item ? "Save Changes" : "Add Gear"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
