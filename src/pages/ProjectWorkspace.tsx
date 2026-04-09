import { NavLink as RouterNavLink, useParams, Outlet, Link } from "react-router-dom";
import { useProject } from "@/hooks/useProjects";
import { Camera, ClipboardList, FileText, FolderOpen, LayoutDashboard, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: LayoutDashboard, path: "", label: "Overview", end: true },
  { icon: Camera, path: "shots", label: "Shot List" },
  { icon: ClipboardList, path: "schedule", label: "Call Sheets" },
  { icon: FileText, path: "breakdown", label: "Script Breakdown" },
  { icon: FolderOpen, path: "files", label: "Files & Assets" },
];

export default function ProjectWorkspace() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useProject(projectId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-muted-foreground gap-3">
        <p>Project not found</p>
        <Link to="/projects" className="text-primary text-sm hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Project sidebar */}
      <aside className="w-56 border-r border-border bg-sidebar flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <Link to="/projects" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="w-3 h-3" /> All Projects
          </Link>
          <h2 className="text-sm font-medium truncate">{project.name}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{project.type}</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {sidebarItems.map(item => (
            <RouterNavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </RouterNavLink>
          ))}
        </nav>
      </aside>

      {/* Module content */}
      <div className="flex-1 min-h-screen">
        <Outlet context={{ project }} />
      </div>
    </div>
  );
}
