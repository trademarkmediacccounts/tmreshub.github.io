import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { motion } from "framer-motion";
import { Film, Radio, Globe, GitBranch, Vault, TrendingUp, Clock, Users, HardDrive, DollarSign, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAssets } from "@/hooks/useAssets";
import { useGearItems } from "@/hooks/useGearItems";
import { useBuildProjects } from "@/hooks/useBuildProjects";
import { useProductions } from "@/hooks/useProductions";

export default function Dashboard() {
  const { data: assets = [] } = useAssets();
  const { data: gearItems = [] } = useGearItems();
  const { data: buildProjects = [] } = useBuildProjects();
  const { data: productions = [] } = useProductions();

  const availableGear = gearItems.filter(g => g.status === "Available").length;

  const subApps = [
    { name: "TM/Assets", desc: "Media delivery & review", icon: Film, path: "/assets", count: `${assets.length} assets` },
    { name: "TM/Live", desc: "Production logistics", icon: Radio, path: "/live", count: `${productions.length} upcoming` },
    { name: "TM/Build", desc: "Web staging & feedback", icon: Globe, path: "/build", count: `${buildProjects.length} projects` },
    { name: "TM/Flow", desc: "CRM & pipeline", icon: GitBranch, path: "/flow", count: "Pipeline" },
    { name: "TM/Vault", desc: "Billing & contracts", icon: Vault, path: "/vault", count: "Finances" },
  ];

  const recentItems = [
    ...assets.slice(0, 2).map(a => ({ action: `Asset: ${a.status}`, project: a.name, time: new Date(a.created_at).toLocaleDateString(), user: a.client || "—" })),
    ...buildProjects.slice(0, 2).map(p => ({ action: `Build: ${p.status}`, project: p.name, time: p.last_deploy || "—", user: p.branch })),
    ...productions.slice(0, 2).map(p => ({ action: `Production: ${p.status}`, project: p.name, time: p.date, user: `${p.crew} crew` })),
  ];

  return (
    <div className="min-h-screen">
      <PageHeader breadcrumb={["Trademark Command"]} title="Dashboard" />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={Film} label="Total Assets" value={String(assets.length)} change={`${assets.filter(a => a.status === "Review").length} in review`} positive />
          <StatCard icon={Radio} label="Gear Available" value={`${availableGear}/${gearItems.length}`} positive={availableGear > gearItems.length / 2} />
          <StatCard icon={Globe} label="Build Projects" value={String(buildProjects.length)} change={`${buildProjects.filter(p => p.status === "Live").length} live`} positive />
          <StatCard icon={Users} label="Productions" value={String(productions.length)} change={`${productions.filter(p => p.status === "Confirmed").length} confirmed`} positive />
          <StatCard icon={HardDrive} label="Total Gear" value={String(gearItems.length)} />
        </div>

        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Command Centre</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {subApps.map((app, i) => (
              <motion.div key={app.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "tween", ease: [0.2, 0, 0, 1], duration: 0.3, delay: i * 0.05 }}>
                <Link to={app.path} className="tm-card p-5 flex flex-col h-full group cursor-pointer block">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><app.icon className="w-5 h-5 text-primary" /></div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-medium tracking-tight">{app.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{app.desc}</p>
                  <p className="text-xs text-primary mt-3 tabular-nums">{app.count}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 tm-card p-5">
            <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Recent Activity</h2>
            {recentItems.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No activity yet.</p>
            ) : (
              <div className="space-y-0">
                {recentItems.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      <div><p className="text-sm font-medium">{item.action}</p><p className="text-xs text-muted-foreground">{item.project}</p></div>
                    </div>
                    <div className="text-right"><p className="text-xs text-muted-foreground">{item.time}</p><p className="text-xs text-muted-foreground">{item.user}</p></div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="tm-card p-5">
            <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Assets in Review</span><span className="text-sm font-medium tabular-nums">{assets.filter(a => a.status === "Review").length}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Gear in Maintenance</span><span className="text-sm font-medium tabular-nums">{gearItems.filter(g => g.status === "Maintenance").length}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Builds in Staging</span><span className="text-sm font-medium tabular-nums">{buildProjects.filter(p => p.status === "Staging").length}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Productions Confirmed</span><span className="text-sm font-medium tabular-nums">{productions.filter(p => p.status === "Confirmed").length}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Reserved Gear</span><span className="text-sm font-medium tabular-nums">{gearItems.filter(g => g.status === "Reserved").length}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
