import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { motion } from "framer-motion";
import { Camera, Battery, Wifi, MapPin, Calendar, User, Package, Search, ChevronRight, Pencil, Trash2, Plus } from "lucide-react";
import { useGearItems, useCreateGearItem, useUpdateGearItem, useDeleteGearItem } from "@/hooks/useGearItems";
import { useProductions, useCreateProduction, useDeleteProduction } from "@/hooks/useProductions";
import { GearItemDialog } from "@/components/GearItemDialog";
import { ProductionDialog } from "@/components/ProductionDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import type { GearItem } from "@/hooks/useGearItems";
import type { Production } from "@/hooks/useProductions";

const statusColor = (status: string) => {
  switch (status) {
    case "Available": return "tm-pill-complete";
    case "Reserved": case "In Use": return "tm-pill-active";
    default: return "tm-pill-draft";
  }
};

export default function Live() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [gearDialogOpen, setGearDialogOpen] = useState(false);
  const [editGear, setEditGear] = useState<GearItem | null>(null);
  const [prodDialogOpen, setProdDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<{ type: "gear" | "prod"; id: string } | null>(null);

  const { data: gearItems = [], isLoading: gearLoading } = useGearItems();
  const { data: productions = [], isLoading: prodLoading } = useProductions();
  const createGear = useCreateGearItem();
  const updateGear = useUpdateGearItem();
  const deleteGear = useDeleteGearItem();
  const createProd = useCreateProduction();
  const deleteProd = useDeleteProduction();

  const filtered = gearItems.filter(g =>
    (filter === "All" || g.status === filter) &&
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const categoryStats = [
    { name: "Camera Kits", icon: Camera, items: gearItems.filter(g => g.category === "Camera Kit") },
    { name: "Audio Rigs", icon: Wifi, items: gearItems.filter(g => g.category === "Audio") },
    { name: "Lighting Packs", icon: Battery, items: gearItems.filter(g => g.category === "Lighting") },
    { name: "Grip & Support", icon: Package, items: gearItems.filter(g => ["Grip", "Monitoring"].includes(g.category)) },
  ];

  const handleGearSubmit = (data: Partial<GearItem>) => {
    if (data.id) updateGear.mutate(data as GearItem & { id: string });
    else createGear.mutate(data);
  };

  const handleProdSubmit = (data: Partial<Production>) => {
    createProd.mutate(data);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    if (deleteId.type === "gear") deleteGear.mutate(deleteId.id);
    else deleteProd.mutate(deleteId.id);
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        breadcrumb={["Trademark Command", "TM/Live"]}
        title="Production Logistics"
        action={
          <div className="flex gap-2">
            <button className="tm-glow-btn text-sm" onClick={() => { setEditGear(null); setGearDialogOpen(true); }}>Add Gear</button>
            <button className="tm-glow-btn text-sm" onClick={() => setProdDialogOpen(true)}>New Production</button>
          </div>
        }
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryStats.map((cat) => {
            const avail = cat.items.filter(i => i.status === "Available").length;
            return <StatCard key={cat.name} icon={cat.icon} label={cat.name} value={`${avail}/${cat.items.length}`} change={`${avail} free`} positive={avail > cat.items.length / 2} />;
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 tm-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Gear Inventory</h2>
              <div className="flex items-center gap-2">
                {["All", "Available", "Reserved", "In Use"].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search gear..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-background rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" />
            </div>
            {gearLoading ? (
              <p className="text-muted-foreground text-sm py-4">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No gear items found.</p>
            ) : (
              <div className="space-y-0">
                {filtered.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-muted/50 -mx-5 px-5 transition-colors group">
                    <div className="flex items-center gap-3">
                      <Camera className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category} · {item.condition}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.reserved_for && <span className="text-xs text-muted-foreground">{item.reserved_for}</span>}
                      <span className={statusColor(item.status)}>{item.status}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditGear(item); setGearDialogOpen(true); }} className="p-1 rounded hover:bg-accent"><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => setDeleteId({ type: "gear", id: item.id })} className="p-1 rounded hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="tm-card p-5">
            <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Upcoming Productions</h2>
            {prodLoading ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : productions.length === 0 ? (
              <p className="text-muted-foreground text-sm">No productions yet.</p>
            ) : (
              <div className="space-y-4">
                {productions.map((show, i) => (
                  <motion.div key={show.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors group">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-medium">{show.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={show.status === "Confirmed" ? "tm-pill-complete" : "tm-pill-active"}>{show.status}</span>
                        <button onClick={() => setDeleteId({ type: "prod", id: show.id })} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{show.date}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{show.location}</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{show.crew} crew</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <GearItemDialog open={gearDialogOpen} onOpenChange={setGearDialogOpen} onSubmit={handleGearSubmit} item={editGear} />
      <ProductionDialog open={prodDialogOpen} onOpenChange={setProdDialogOpen} onSubmit={handleProdSubmit} />
      <DeleteConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={handleDelete} title={deleteId?.type === "gear" ? "this gear item" : "this production"} />
    </div>
  );
}
