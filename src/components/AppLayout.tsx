import { NavRail } from "./NavRail";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <NavRail />
      <main className="flex-1 ml-16 min-h-screen">
        {children}
      </main>
    </div>
  );
}
