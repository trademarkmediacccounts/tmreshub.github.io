import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { Globe, ExternalLink, MessageSquare, GitBranch, Clock, CheckCircle } from "lucide-react";

const projects = [
  { id: 1, name: "Vertex Studios", url: "vertex-studios.com", status: "Live", lastDeploy: "2 hrs ago", feedback: 3, branch: "main", progress: 100 },
  { id: 2, name: "Nike UK Microsite", url: "nike-uk-campaign.tm.dev", status: "Staging", lastDeploy: "45 min ago", feedback: 7, branch: "feature/hero", progress: 72 },
  { id: 3, name: "Download Festival Hub", url: "download-hub.tm.dev", status: "Staging", lastDeploy: "1 day ago", feedback: 12, branch: "develop", progress: 45 },
  { id: 4, name: "Red Bull Media Portal", url: "rb-portal.tm.dev", status: "Draft", lastDeploy: "3 days ago", feedback: 0, branch: "main", progress: 15 },
  { id: 5, name: "Adidas Team Store", url: "adidas-store.tm.dev", status: "Staging", lastDeploy: "5 hrs ago", feedback: 5, branch: "feature/checkout", progress: 88 },
];

const statusPill = (s: string) => {
  switch (s) {
    case "Live": return "tm-pill-complete";
    case "Staging": return "tm-pill-active";
    default: return "tm-pill-draft";
  }
};

export default function Build() {
  return (
    <div className="min-h-screen">
      <PageHeader
        breadcrumb={["Trademark Command", "TM/Build"]}
        title="Web Staging"
        action={<button className="tm-glow-btn text-sm">New Project</button>}
      />

      <div className="p-8 space-y-6">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: "tween", ease: [0.2, 0, 0, 1] }}
            className="tm-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-muted flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium tracking-heading">{project.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{project.url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={statusPill(project.status)}>{project.status}</span>
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg bg-background">
                  View Site
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Build Progress</span>
                <span className="text-xs tabular-nums font-medium">{project.progress}%</span>
              </div>
              <div className="h-1.5 bg-background rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 0.8, ease: [0.2, 0, 0, 1], delay: i * 0.1 }}
                />
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />{project.branch}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{project.lastDeploy}</span>
              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{project.feedback} feedback items</span>
              {project.status === "Live" && <span className="flex items-center gap-1 text-green-400"><CheckCircle className="w-3 h-3" />Deployed</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
