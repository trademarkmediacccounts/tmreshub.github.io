import { useOutletContext } from "react-router-dom";
import { Project } from "@/hooks/useProjects";
import { PageHeader } from "@/components/PageHeader";
import { Package } from "lucide-react";

export default function ResourcesPage() {
  const { project } = useOutletContext<{ project: Project }>();

  return (
    <div>
      <PageHeader breadcrumb={["Projects", project.name]} title="Resources" />
      <div className="p-8">
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Package className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm">Resource management</p>
          <p className="text-xs mt-1">Track equipment, logistics and crew resources for this production</p>
        </div>
      </div>
    </div>
  );
}
