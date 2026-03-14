import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { Search, Filter, Grid3X3, List, Play, MessageSquare, Clock, Eye } from "lucide-react";

type ViewMode = "grid" | "list";

const assets = [
  { id: 1, name: "Nike Campaign Hero Edit v3", type: "Video", duration: "02:34:12", size: "4.2GB", status: "Review", comments: 8, views: 24, client: "Nike UK", thumbnail: "bg-gradient-to-br from-primary/30 to-primary/5" },
  { id: 2, name: "BBC Live Stream Package", type: "Video", duration: "01:22:00", size: "8.1GB", status: "Approved", comments: 3, views: 42, client: "BBC", thumbnail: "bg-gradient-to-br from-blue-500/30 to-blue-500/5" },
  { id: 3, name: "Adidas Rebrand Motion Graphics", type: "Video", duration: "00:45:18", size: "1.8GB", status: "Draft", comments: 0, views: 5, client: "Adidas", thumbnail: "bg-gradient-to-br from-green-500/30 to-green-500/5" },
  { id: 4, name: "Download Festival Recap", type: "Video", duration: "04:12:33", size: "12.4GB", status: "Review", comments: 14, views: 67, client: "Download Fest", thumbnail: "bg-gradient-to-br from-red-500/30 to-red-500/5" },
  { id: 5, name: "Vertex Studios Brand Film", type: "Video", duration: "01:08:24", size: "3.6GB", status: "Approved", comments: 6, views: 31, client: "Vertex Studios", thumbnail: "bg-gradient-to-br from-purple-500/30 to-purple-500/5" },
  { id: 6, name: "Red Bull Media Social Cuts", type: "Video", duration: "00:15:42", size: "890MB", status: "Draft", comments: 2, views: 8, client: "Red Bull", thumbnail: "bg-gradient-to-br from-yellow-500/30 to-yellow-500/5" },
];

const statusPill = (status: string) => {
  switch (status) {
    case "Approved": return "tm-pill-complete";
    case "Review": return "tm-pill-active";
    default: return "tm-pill-draft";
  }
};

export default function Assets() {
  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");

  const filtered = assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen">
      <PageHeader
        breadcrumb={["Trademark Command", "TM/Assets"]}
        title="Media Assets"
        action={<button className="tm-glow-btn text-sm">Upload Asset</button>}
      />

      <div className="p-8">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
              style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05)" }}
            />
          </div>
          <button className="tm-card px-3 py-2.5 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <div className="flex items-center bg-card rounded-lg overflow-hidden" style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05)" }}>
            <button onClick={() => setView("grid")} className={`p-2.5 ${view === "grid" ? "text-primary" : "text-muted-foreground"}`}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setView("list")} className={`p-2.5 ${view === "list" ? "text-primary" : "text-muted-foreground"}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grid View */}
        {view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((asset, i) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: "tween", ease: [0.2, 0, 0, 1] }}
                className="tm-card overflow-hidden cursor-pointer group"
              >
                <div className={`h-40 ${asset.thumbnail} flex items-center justify-center relative`}>
                  <Play className="w-10 h-10 text-foreground/30 group-hover:text-primary transition-colors" />
                  <span className="absolute bottom-2 right-2 bg-background/80 backdrop-blur px-2 py-0.5 rounded text-xs tabular-nums">{asset.duration}</span>
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
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {asset.duration}</span>
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
                  <th className="px-4 py-3">Asset</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Comments</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((asset) => (
                  <tr key={asset.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-medium">{asset.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{asset.client}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{asset.duration}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{asset.size}</td>
                    <td className="px-4 py-3"><span className={statusPill(asset.status)}>{asset.status}</span></td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{asset.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
