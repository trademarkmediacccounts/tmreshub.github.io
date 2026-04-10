import { useOutletContext } from "react-router-dom";
import { Project } from "@/hooks/useProjects";
import { PageHeader } from "@/components/PageHeader";
import { Globe } from "lucide-react";

export default function WebStagingPage() {
  const { project } = useOutletContext<{ project: Project }>();

  return (
    <div>
      <PageHeader breadcrumb={["Projects", project.name]} title="Web Staging" />
      <div className="p-8">
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Globe className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm">Web staging environment</p>
          <p className="text-xs mt-1">Manage staging deployments and preview links for this project</p>
        </div>
      </div>
    </div>
  );
}
