import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { Search, Filter, Grid3X3, List, Play, MessageSquare, Clock, Eye, Pencil, Trash2 } from "lucide-react";
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset } from "@/hooks/useAssets";
import { AssetDialog } from "@/components/AssetDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import type { Asset } from "@/hooks/useAssets";

type ViewMode = "grid" | "list";

const statusPill = (status: string) => {
  switch (status) {
    case "Approved": return "tm-pill-complete";
    case "Review": return "tm-pill-active";
    default: return "tm-pill-draft";
  }
};

const thumbnailGradient = (client: string | null) => {
  const map: Record<string, string> = {
    "Nike UK": "bg-gradient-to-br from-primary/30 to-primary/5",
    "BBC": "bg-gradient-to-br from-blue-500/30 to-blue-500/5",
    "Adidas": "bg-gradient-to-br from-green-500/30 to-green-500/5",
    "Download Fest": "bg-gradient-to-br from-red-500/30 to-red-500/5",
    "Vertex Studios": "bg-gradient-to-br from-purple-500/30 to-purple-500/5",
    "Red Bull": "bg-gradient-to-br from-yellow-500/30 to-yellow-500/5",
  };
  return map[client || ""] || "bg-gradient-to-br from-primary/20 to-primary/5";
};

export default function Assets() {
  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: assets = [], isLoading } = useAssets();
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();

  const filtered = assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = (data: Partial<Asset>) => {
    if (data.id) updateAsset.mutate(data as Asset & { id: string });
    else createAsset.mutate(data);
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        breadcrumb={["Trademark Command", "TM/Assets"]}
        title="Media Assets"
        action={<button className="tm-glow-btn text-sm" onClick={() => { setEditAsset(null); setDialogOpen(true); }}>Upload Asset</button>}
      />

      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
              style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05)" }} />
          </div>
          <div className="flex items-center bg-card rounded-lg overflow-hidden" style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05)" }}>
            <button onClick={() => setView("grid")} className={`p-2.5 ${view === "grid" ? "text-primary" : "text-muted-foreground"}`}><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setView("list")} className={`p-2.5 ${view === "list" ? "text-primary" : "text-muted-foreground"}`}><List className="w-4 h-4" /></button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading assets…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No assets found. Create your first one!</div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((asset, i) => (
              <motion.div key={asset.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, type: "tween", ease: [0.2, 0, 0, 1] }}
                className="tm-card overflow-hidden group">
                <div className={`h-40 ${thumbnailGradient(asset.client)} flex items-center justify-center relative`}>
                  <Play className="w-10 h-10 text-foreground/30 group-hover:text-primary transition-colors" />
                  {asset.duration && <span className="absolute bottom-2 right-2 bg-background/80 backdrop-blur px-2 py-0.5 rounded text-xs tabular-nums">{asset.duration}</span>}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditAsset(asset); setDialogOpen(true); }} className="w-7 h-7 rounded bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background"><Pencil className="w-3 h-3" /></button>
                    <button onClick={() => setDeleteId(asset.id)} className="w-7 h-7 rounded bg-background/80 backdrop-blur flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-medium leading-tight pr-2">{asset.name}</h3>
                    <span className={statusPill(asset.status)}>{asset.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{asset.client} · {asset.size}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {asset.comments}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {asset.views}</span>
                    {asset.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {asset.duration}</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="tm-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">Asset</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Duration</th><th className="px-4 py-3">Size</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((asset) => (
                  <tr key={asset.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{asset.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{asset.client}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{asset.duration}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{asset.size}</td>
                    <td className="px-4 py-3"><span className={statusPill(asset.status)}>{asset.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditAsset(asset); setDialogOpen(true); }} className="p-1.5 rounded hover:bg-accent"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(asset.id)} className="p-1.5 rounded hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AssetDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleSubmit} asset={editAsset} />
      <DeleteConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={() => { if (deleteId) deleteAsset.mutate(deleteId); setDeleteId(null); }} title="this asset" />
    </div>
  );
}
