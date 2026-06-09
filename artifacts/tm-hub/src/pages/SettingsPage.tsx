import { PageHeader } from "@/components/PageHeader";
import { User, Bell, Shield, Palette, Users, Key } from "lucide-react";

const sections = [
  { icon: User, name: "Profile", desc: "Manage your account details and preferences" },
  { icon: Bell, name: "Notifications", desc: "Configure alerts for projects, assets, and invoices" },
  { icon: Shield, name: "Security", desc: "Two-factor authentication and session management" },
  { icon: Users, name: "Team", desc: "Manage team members, roles, and permissions" },
  { icon: Palette, name: "Branding", desc: "Client portal customisation and white-labelling" },
  { icon: Key, name: "API & Integrations", desc: "Connect to Premiere Pro, Slack, and more" },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        breadcrumb={["Trademark Command", "Settings"]}
        title="Settings"
      />

      <div className="p-8 max-w-3xl">
        <div className="space-y-2">
          {sections.map((section) => (
            <div
              key={section.name}
              className="tm-card p-5 flex items-center gap-4 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-muted flex items-center justify-center">
                <section.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">{section.name}</h3>
                <p className="text-xs text-muted-foreground">{section.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
