import { NavLink as RouterNavLink, useParams, Outlet, Link } from "react-router-dom";
import { useProject } from "@/hooks/useProjects";
import { Camera, ClipboardList, FileText, FolderOpen, LayoutDashboard, ArrowLeft, Globe, Users, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  label: string;
  end?: boolean;
}

const overviewItem: SidebarItem = { icon: LayoutDashboard, path: "", label: "Overview", end: true };

// Video production types: StudioBinder-style tools
const videoModules: SidebarItem[] = [
  { icon: Camera, path: "shots", label: "Shot List" },
  { icon: ClipboardList, path: "schedule", label: "Call Sheets" },
  { icon: FileText, path: "breakdown", label: "Script Breakdown" },
  { icon: FolderOpen, path: "files", label: "Files & Assets" },
];

// Web project types: staging + file management
const webModules: SidebarItem[] = [
  { icon: Globe, path: "staging", label: "Web Staging" },
  { icon: FolderOpen, path: "files", label: "Files & Assets" },
];

// Production / Live Event types: crew, logistics, resources
const productionModules: SidebarItem[] = [
  { icon: Users, path: "schedule", label: "Call Sheets" },
  { icon: Package, path: "resources", label: "Resources" },
  { icon: FolderOpen, path: "files", label: "Files & Assets" },
];

const VIDEO_TYPES = ["Commercial", "Music Video", "Documentary", "Short Film", "Social Content"];
const WEB_TYPES = ["Corporate"];
const PRODUCTION_TYPES = ["Live Event"];

function getModulesForType(type: string): SidebarItem[] {
  if (VIDEO_TYPES.includes(type)) return videoModules;
  if (WEB_TYPES.includes(type)) return webModules;
  if (PRODUCTION_TYPES.includes(type)) return productionModules;
  // Default: show all available modules
  return videoModules;
}

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

  const sidebarItems = [overviewItem, ...getModulesForType(project.type)];

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
