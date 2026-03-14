import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { motion } from "framer-motion";
import { Camera, Battery, Wifi, MapPin, Calendar, User, Package, Search, ChevronRight } from "lucide-react";

const gearCategories = [
  { name: "Camera Kits", total: 12, available: 8, icon: Camera },
  { name: "Audio Rigs", total: 8, available: 5, icon: Wifi },
  { name: "Lighting Packs", total: 15, available: 11, icon: Battery },
  { name: "Grip & Support", total: 20, available: 16, icon: Package },
];

const gearItems = [
  { id: 1, name: "Sony FX6 Rig A", category: "Camera Kit", status: "Available", location: "Studio 1", lastUsed: "Mar 8", condition: "Excellent" },
  { id: 2, name: "Sony FX6 Rig B", category: "Camera Kit", status: "Reserved", location: "—", lastUsed: "Mar 12", condition: "Good", reservedFor: "Download Fest" },
  { id: 3, name: "Blackmagic URSA 12K", category: "Camera Kit", status: "In Use", location: "On Location", lastUsed: "Active", condition: "Excellent" },
  { id: 4, name: "Sennheiser MKH 416 Kit", category: "Audio", status: "Available", location: "Studio 2", lastUsed: "Mar 10", condition: "Good" },
  { id: 5, name: "Aputure 600D Pro Kit", category: "Lighting", status: "Available", location: "Warehouse", lastUsed: "Mar 5", condition: "Excellent" },
  { id: 6, name: "ARRI SkyPanel S60", category: "Lighting", status: "Reserved", location: "—", lastUsed: "Mar 11", condition: "Fair", reservedFor: "Nike Shoot" },
  { id: 7, name: "DJI Ronin 2 Gimbal", category: "Grip", status: "Maintenance", location: "Workshop", lastUsed: "Feb 28", condition: "Needs Repair" },
  { id: 8, name: "SmallHD Cine 13 Monitor", category: "Monitoring", status: "Available", location: "Studio 1", lastUsed: "Mar 9", condition: "Excellent" },
];

const upcomingShows = [
  { name: "Download Festival 2026", date: "Jun 12-14", location: "Donington Park", crew: 8, status: "Confirmed" },
  { name: "Nike Product Launch", date: "Mar 28", location: "London Studio", crew: 4, status: "Prep" },
  { name: "BBC Sports Coverage", date: "Apr 5-6", location: "Manchester", crew: 6, status: "Confirmed" },
];

const statusColor = (status: string) => {
  switch (status) {
    case "Available": return "tm-pill-complete";
    case "Reserved": return "tm-pill-active";
    case "In Use": return "tm-pill-active";
    case "Maintenance": return "tm-pill-draft";
    default: return "tm-pill-draft";
  }
};

export default function Live() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const filtered = gearItems.filter(g =>
    (filter === "All" || g.status === filter) &&
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <PageHeader
        breadcrumb={["Trademark Command", "TM/Live"]}
        title="Production Logistics"
        action={<button className="tm-glow-btn text-sm">New Call Sheet</button>}
      />

      <div className="p-8 space-y-8">
        {/* Category Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {gearCategories.map((cat, i) => (
            <StatCard key={cat.name} icon={cat.icon} label={cat.name} value={`${cat.available}/${cat.total}`} change={`${cat.available} free`} positive={cat.available > cat.total / 2} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Gear Inventory */}
          <div className="lg:col-span-2 tm-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Gear Inventory</h2>
              <div className="flex items-center gap-2">
                {["All", "Available", "Reserved", "In Use"].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === f ? "bg-primary-muted text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
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
            <div className="space-y-0">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0 cursor-pointer hover:bg-surface-hover -mx-5 px-5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Camera className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category} · {item.condition}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {item.reservedFor && <span className="text-xs text-muted-foreground">{item.reservedFor}</span>}
                    <span className={statusColor(item.status)}>{item.status}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Upcoming Productions */}
          <div className="tm-card p-5">
            <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Upcoming Productions</h2>
            <div className="space-y-4">
              {upcomingShows.map((show, i) => (
                <motion.div
                  key={show.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 rounded-lg bg-background cursor-pointer hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-medium">{show.name}</h3>
                    <span className={show.status === "Confirmed" ? "tm-pill-complete" : "tm-pill-active"}>{show.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{show.date}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{show.location}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{show.crew} crew</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
