import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { motion } from "framer-motion";
import { DollarSign, FileText, Clock, CheckCircle, AlertCircle, Download, Send } from "lucide-react";

const invoices = [
  { id: "INV-2026-042", client: "Nike UK", project: "Campaign Package", amount: "£45,000", status: "Paid", date: "Mar 10", dueDate: "Mar 10" },
  { id: "INV-2026-041", client: "Vertex Studios", project: "Website + Branding", amount: "£18,000", status: "Paid", date: "Mar 5", dueDate: "Mar 5" },
  { id: "INV-2026-040", client: "BBC Studios", project: "Live Stream Package", amount: "£32,000", status: "Overdue", date: "Feb 28", dueDate: "Mar 7" },
  { id: "INV-2026-039", client: "Adidas", project: "Full Campaign", amount: "£55,000", status: "Sent", date: "Mar 12", dueDate: "Mar 26" },
  { id: "INV-2026-038", client: "Download Festival", project: "Event Coverage", amount: "£25,000", status: "Draft", date: "Mar 14", dueDate: "—" },
  { id: "INV-2026-037", client: "Red Bull Media", project: "Content Package", amount: "£15,800", status: "Sent", date: "Mar 8", dueDate: "Mar 22" },
];

const contracts = [
  { name: "Nike UK — Master Service Agreement", status: "Active", expires: "Dec 2026" },
  { name: "BBC Studios — Production Framework", status: "Active", expires: "Jun 2026" },
  { name: "Adidas — Campaign Contract", status: "Pending Signature", expires: "—" },
  { name: "Red Bull — Content License", status: "Active", expires: "Sep 2026" },
];

const statusPill = (status: string) => {
  switch (status) {
    case "Paid": return "tm-pill-complete";
    case "Sent": return "tm-pill-active";
    case "Overdue": return "px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-500/10 text-red-400";
    default: return "tm-pill-draft";
  }
};

export default function VaultPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        breadcrumb={["Trademark Command", "TM/Vault"]}
        title="Billing & Contracts"
        action={<button className="tm-glow-btn text-sm flex items-center gap-2"><FileText className="w-4 h-4" /> New Invoice</button>}
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={DollarSign} label="Revenue (MTD)" value="£68.2k" change="+18%" positive />
          <StatCard icon={Send} label="Invoices Sent" value="4" />
          <StatCard icon={Clock} label="Outstanding" value="£42.8k" />
          <StatCard icon={AlertCircle} label="Overdue" value="£32.0k" change="1 invoice" />
        </div>

        {/* Invoices Table */}
        <div className="tm-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Invoices</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Due Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5 font-medium tabular-nums">{inv.id}</td>
                  <td className="px-5 py-3.5">{inv.client}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{inv.project}</td>
                  <td className="px-5 py-3.5 font-medium tabular-nums">{inv.amount}</td>
                  <td className="px-5 py-3.5 text-muted-foreground tabular-nums">{inv.dueDate}</td>
                  <td className="px-5 py-3.5"><span className={statusPill(inv.status)}>{inv.status}</span></td>
                  <td className="px-5 py-3.5">
                    <Download className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Contracts */}
        <div className="tm-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Contracts</h2>
          <div className="space-y-0">
            {contracts.map((contract, i) => (
              <motion.div
                key={contract.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between py-3 border-b border-border last:border-0 cursor-pointer hover:bg-surface-hover -mx-5 px-5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{contract.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground tabular-nums">Expires {contract.expires}</span>
                  <span className={contract.status === "Active" ? "tm-pill-complete" : "tm-pill-active"}>{contract.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
