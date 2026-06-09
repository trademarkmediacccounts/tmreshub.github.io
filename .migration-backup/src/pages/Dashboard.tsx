import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { motion } from "framer-motion";
import { Folder, Camera, ClipboardList, FileText, FolderOpen, Plus, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useProjects } from "@/hooks/useProjects";

export default function Dashboard() {
  const { data: projects = [], isLoading } = useProjects();

  const activeProjects = projects.filter(p => p.status !== "Archived" && p.status !== "Delivered");
  const inProduction = projects.filter(p => p.status === "Production");
  const inPost = projects.filter(p => p.status === "Post-Production");
  const delivered = projects.filter(p => p.status === "Delivered");

  const statusColor: Record<string, string> = {
    "Pre-Production": "bg-yellow-500/20 text-yellow-400",
    Production: "bg-primary/20 text-primary",
    "Post-Production": "bg-blue-500/20 text-blue-400",
    Delivered: "bg-green-500/20 text-green-400",
    Archived: "bg-muted text-muted-foreground",
  };

  return (
    <div className="min-h-screen">
      <PageHeader breadcrumb={["Trademark Command"]} title="Dashboard" />

      <div className="p-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Folder} label="Active Projects" value={String(activeProjects.length)} change={`${projects.length} total`} positive />
          <StatCard icon={Camera} label="In Production" value={String(inProduction.length)} positive={inProduction.length > 0} />
          <StatCard icon={Clock} label="Post-Production" value={String(inPost.length)} />
          <StatCard icon={FileText} label="Delivered" value={String(delivered.length)} positive />
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Projects</h2>
            <Link to="/projects" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="tm-card h-40 animate-pulse" />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="tm-card flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Folder className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No projects yet</p>
              <Link to="/projects" className="mt-3 text-primary text-sm hover:underline flex items-center gap-1">
                <Plus className="w-4 h-4" /> Create your first project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.slice(0, 6).map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link to={`/projects/${project.id}`} className="block tm-card p-5 group hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Folder className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium group-hover:text-primary transition-colors truncate">{project.name}</h3>
                        <p className="text-xs text-muted-foreground">{project.type}</p>
                      </div>
                    </div>
                    {project.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[project.status] || "bg-muted text-muted-foreground"}`}>
                        {project.status}
                      </span>
                      {project.client && (
                        <span className="text-xs text-muted-foreground">{project.client}</span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "New Project", desc: "Start a new production", icon: Plus, path: "/projects" },
              { label: "Shot Lists", desc: "Plan your shots", icon: Camera, path: "/projects" },
              { label: "Call Sheets", desc: "Schedule your crew", icon: ClipboardList, path: "/projects" },
              { label: "Files & Assets", desc: "Manage deliverables", icon: FolderOpen, path: "/projects" },
            ].map((action, i) => (
              <motion.div key={action.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                <Link to={action.path} className="tm-card p-5 flex items-center gap-4 group hover:border-primary/30 transition-colors block">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <action.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{action.label}</h3>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
