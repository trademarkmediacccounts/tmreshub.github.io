import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { motion } from "framer-motion";
import {
  Film,
  Radio,
  Globe,
  GitBranch,
  Vault,
  TrendingUp,
  Clock,
  Users,
  HardDrive,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const subApps = [
  { name: "TM/Assets", desc: "Media delivery & review", icon: Film, path: "/assets", count: "24 assets" },
  { name: "TM/Live", desc: "Production logistics", icon: Radio, path: "/live", count: "3 upcoming" },
  { name: "TM/Build", desc: "Web staging & feedback", icon: Globe, path: "/build", count: "7 projects" },
  { name: "TM/Flow", desc: "CRM & pipeline", icon: GitBranch, path: "/flow", count: "18 leads" },
  { name: "TM/Vault", desc: "Billing & contracts", icon: Vault, path: "/vault", count: "£42.8k due" },
];

const recentActivity = [
  { action: "Video uploaded", project: "Nike Campaign Q2", time: "12 min ago", user: "Jake M." },
  { action: "Comment at 00:42:18", project: "BBC Live Stream", time: "34 min ago", user: "Client" },
  { action: "Invoice sent", project: "Adidas Rebrand", time: "1 hr ago", user: "Sophie L." },
  { action: "Gear reserved", project: "Download Festival", time: "2 hrs ago", user: "Tom R." },
  { action: "Build deployed", project: "Vertex Studios", time: "3 hrs ago", user: "Dev Team" },
  { action: "Contract signed", project: "Red Bull Media", time: "4 hrs ago", user: "Client" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <PageHeader
        breadcrumb={["Trademark Command"]}
        title="Dashboard"
      />

      <div className="p-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={Film} label="Active Projects" value="14" change="+3" positive />
          <StatCard icon={Users} label="Active Clients" value="28" change="+5" positive />
          <StatCard icon={HardDrive} label="Storage Used" value="12.4TB" />
          <StatCard icon={Clock} label="Hours Tracked" value="342h" change="+12%" positive />
          <StatCard icon={DollarSign} label="Revenue (MTD)" value="£68.2k" change="+18%" positive />
        </div>

        {/* Sub-Apps Grid */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Command Centre</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {subApps.map((app, i) => (
              <motion.div
                key={app.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "tween", ease: [0.2, 0, 0, 1], duration: 0.3, delay: i * 0.05 }}
              >
                <Link
                  to={app.path}
                  className="tm-card p-5 flex flex-col h-full group cursor-pointer block"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-muted flex items-center justify-center">
                      <app.icon className="w-5 h-5 text-primary" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-medium tracking-heading">{app.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{app.desc}</p>
                  <p className="text-xs text-primary mt-3 tabular-nums">{app.count}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Activity Feed + Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 tm-card p-5">
            <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Recent Activity</h2>
            <div className="space-y-0">
              {recentActivity.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.project}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                    <p className="text-xs text-muted-foreground">{item.user}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="tm-card p-5">
            <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">This Week</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Deliverables Due</span>
                <span className="text-sm font-medium tabular-nums">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Shoots Scheduled</span>
                <span className="text-sm font-medium tabular-nums">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Client Meetings</span>
                <span className="text-sm font-medium tabular-nums">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Invoices Pending</span>
                <span className="text-sm font-medium tabular-nums">£12.4k</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Team Utilisation</span>
                <span className="text-sm font-medium tabular-nums text-primary">87%</span>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-primary text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">+23% vs last week</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
