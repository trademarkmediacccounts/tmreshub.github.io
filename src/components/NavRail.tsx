import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Film,
  Radio,
  Globe,
  GitBranch,
  Vault,
  Settings,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, path: "/", label: "Dashboard" },
  { icon: Film, path: "/assets", label: "TM/Assets" },
  { icon: Radio, path: "/live", label: "TM/Live" },
  { icon: Globe, path: "/build", label: "TM/Build" },
  { icon: GitBranch, path: "/flow", label: "TM/Flow" },
  { icon: Vault, path: "/vault", label: "TM/Vault" },
];

export function NavRail() {
  const location = useLocation();

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-16 bg-sidebar flex flex-col items-center py-5 z-50">
      {/* Logo */}
      <Link to="/" className="mb-8 flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
        <span className="text-primary-foreground font-bold text-sm tracking-heading">TM</span>
      </Link>

      {/* Nav Items */}
      <div className="flex-1 flex flex-col items-center gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-200 group"
              title={item.label}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
                  transition={{ type: "tween", ease: [0.2, 0, 0, 1], duration: 0.2 }}
                />
              )}
              <item.icon
                className={`w-5 h-5 transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
            </Link>
          );
        })}
      </div>

      {/* Settings */}
      <Link
        to="/settings"
        className="w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-200 group"
        title="Settings"
      >
        <Settings className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </Link>
    </nav>
  );
}
