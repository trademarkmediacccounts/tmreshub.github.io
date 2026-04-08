import { useOutletContext } from "react-router-dom";
import { Project, useUpdateProject } from "@/hooks/useProjects";
import { useShots } from "@/hooks/useShots";
import { useCallSheets } from "@/hooks/useCallSheets";
import { useScriptBreakdowns } from "@/hooks/useScriptBreakdowns";
import { useProjectAssets } from "@/hooks/useProjectAssets";
import { PageHeader } from "@/components/PageHeader";
import { Camera, ClipboardList, FileText, FolderOpen, Calendar, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUSES = ["Pre-Production", "Production", "Post-Production", "Delivered", "Archived"];

export default function ProjectOverview() {
  const { project } = useOutletContext<{ project: Project }>();
  const { data: shots = [] } = useShots(project.id);
  const { data: callSheets = [] } = useCallSheets(project.id);
  const { data: breakdowns = [] } = useScriptBreakdowns(project.id);
  const { data: assets = [] } = useProjectAssets(project.id);
  const updateProject = useUpdateProject();

  const stats = [
    { icon: Camera, label: "Shots", value: shots.length, color: "text-primary" },
    { icon: ClipboardList, label: "Call Sheets", value: callSheets.length, color: "text-blue-400" },
    { icon: FileText, label: "Breakdown Elements", value: breakdowns.length, color: "text-yellow-400" },
    { icon: FolderOpen, label: "Files", value: assets.length, color: "text-green-400" },
  ];

  return (
    <div>
      <PageHeader
        breadcrumb={["Projects", project.name]}
        title="Overview"
        action={
          <Select value={project.status} onValueChange={v => updateProject.mutate({ id: project.id, status: v })}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        }
      />
      <div className="p-8 space-y-8">
        {/* Info */}
        <div className="tm-card p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Type</p>
              <p className="text-sm font-medium">{project.type}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Client</p>
              <p className="text-sm font-medium">{project.client || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Start Date</p>
              <p className="text-sm font-medium">{project.start_date || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">End Date</p>
              <p className="text-sm font-medium">{project.end_date || "—"}</p>
            </div>
          </div>
          {project.description && <p className="text-sm text-muted-foreground mt-4 border-t border-border pt-4">{project.description}</p>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="tm-card p-5">
              <div className="flex items-center gap-3 mb-2">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
