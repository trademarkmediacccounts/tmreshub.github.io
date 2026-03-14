import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  positive?: boolean;
}

export function StatCard({ label, value, change, icon: Icon, positive }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "tween", ease: [0.2, 0, 0, 1], duration: 0.3 }}
      className="tm-card p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-primary-muted flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        {change && (
          <span className={`text-xs font-medium tabular-nums ${positive ? "text-green-400" : "text-red-400"}`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold tracking-heading tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}
