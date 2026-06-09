import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Asset } from "@/hooks/useAssets";

interface AssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Asset>) => void;
  asset?: Asset | null;
}

export function AssetDialog({ open, onOpenChange, onSubmit, asset }: AssetDialogProps) {
  const [form, setForm] = useState({ name: "", type: "Video", duration: "", size: "", status: "Draft", client: "" });

  useEffect(() => {
    if (asset) {
      setForm({ name: asset.name, type: asset.type, duration: asset.duration || "", size: asset.size || "", status: asset.status, client: asset.client || "" });
    } else {
      setForm({ name: "", type: "Video", duration: "", size: "", status: "Draft", client: "" });
    }
  }, [asset, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, ...(asset ? { id: asset.id } : {}) });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>{asset ? "Edit Asset" : "Upload Asset"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Name</Label><Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Video">Video</SelectItem><SelectItem value="Audio">Audio</SelectItem><SelectItem value="Image">Image</SelectItem><SelectItem value="Document">Document</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Review">Review</SelectItem><SelectItem value="Approved">Approved</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Duration</Label><Input placeholder="00:00:00" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} /></div>
            <div><Label>Size</Label><Input placeholder="e.g. 4.2GB" value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} /></div>
          </div>
          <div><Label>Client</Label><Input value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} /></div>
          <Button type="submit" className="w-full">{asset ? "Save Changes" : "Create Asset"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
