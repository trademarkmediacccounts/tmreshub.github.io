import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { Plus, DollarSign, Calendar, User, MoreHorizontal } from "lucide-react";

interface Lead {
  id: number;
  name: string;
  company: string;
  value: string;
  service: string;
  date: string;
  stage: string;
}

const initialLeads: Lead[] = [
  { id: 1, name: "James Wilson", company: "TechVenture Ltd", value: "£12,500", service: "Brand Film", date: "Mar 14", stage: "Lead" },
  { id: 2, name: "Sarah Chen", company: "Bloom Agency", value: "£8,200", service: "Website Redesign", date: "Mar 13", stage: "Lead" },
  { id: 3, name: "Marcus Reid", company: "Elevate Events", value: "£25,000", service: "Live Production", date: "Mar 10", stage: "Proposal" },
  { id: 4, name: "Emily Hart", company: "Driftwood Records", value: "£6,800", service: "Music Video", date: "Mar 8", stage: "Proposal" },
  { id: 5, name: "Tom Bradley", company: "Nike UK", value: "£45,000", service: "Campaign Package", date: "Mar 5", stage: "Negotiation" },
  { id: 6, name: "Lisa Monroe", company: "BBC Studios", value: "£32,000", service: "Live Stream", date: "Feb 28", stage: "Negotiation" },
  { id: 7, name: "Jake Simmons", company: "Vertex Studios", value: "£18,000", service: "Web + Brand", date: "Feb 20", stage: "Won" },
  { id: 8, name: "Rachel Fox", company: "Adidas", value: "£55,000", service: "Full Campaign", date: "Feb 15", stage: "Won" },
];

const stages = ["Lead", "Proposal", "Negotiation", "Won"];

const stageColors: Record<string, string> = {
  Lead: "border-t-muted-foreground",
  Proposal: "border-t-primary",
  Negotiation: "border-t-yellow-500",
  Won: "border-t-green-500",
};

export default function Flow() {
  const [leads] = useState<Lead[]>(initialLeads);

  const getStageLeads = (stage: string) => leads.filter(l => l.stage === stage);
  const getStageValue = (stage: string) => {
    const total = getStageLeads(stage).reduce((acc, l) => acc + parseFloat(l.value.replace(/[£,]/g, "")), 0);
    return `£${(total / 1000).toFixed(1)}k`;
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        breadcrumb={["Trademark Command", "TM/Flow"]}
        title="Pipeline"
        action={<button className="tm-glow-btn text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New Lead</button>}
      />

      <div className="p-8">
        <div className="grid grid-cols-4 gap-4 min-h-[calc(100vh-140px)]">
          {stages.map((stage) => (
            <div key={stage} className="flex flex-col">
              <div className={`tm-card p-3 mb-3 border-t-2 ${stageColors[stage]}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{stage}</h3>
                    <p className="text-xs text-muted-foreground tabular-nums">{getStageLeads(stage).length} deals · {getStageValue(stage)}</p>
                  </div>
                  <Plus className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                </div>
              </div>

              <div className="space-y-3 flex-1">
                {getStageLeads(stage).map((lead, i) => (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, type: "tween", ease: [0.2, 0, 0, 1] }}
                    className="tm-card p-4 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium">{lead.company}</h4>
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{lead.service}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-primary font-medium tabular-nums">
                        <DollarSign className="w-3 h-3" />{lead.value}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />{lead.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{lead.name}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
