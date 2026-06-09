import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import Live from "./pages/Live";
import Build from "./pages/Build";
import Flow from "./pages/Flow";
import VaultPage from "./pages/VaultPage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import ProjectOverview from "./pages/project/ProjectOverview";
import ShotListPage from "./pages/project/ShotListPage";
import CallSheetsPage from "./pages/project/CallSheetsPage";
import ScriptBreakdownPage from "./pages/project/ScriptBreakdownPage";
import ProjectFilesPage from "./pages/project/ProjectFilesPage";
import WebStagingPage from "./pages/project/WebStagingPage";
import ResourcesPage from "./pages/project/ResourcesPage";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/live" element={<Live />} />
        <Route path="/build" element={<Build />} />
        <Route path="/flow" element={<Flow />} />
        <Route path="/vault" element={<VaultPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectWorkspace />}>
          <Route index element={<ProjectOverview />} />
          <Route path="shots" element={<ShotListPage />} />
          <Route path="schedule" element={<CallSheetsPage />} />
          <Route path="breakdown" element={<ScriptBreakdownPage />} />
          <Route path="files" element={<ProjectFilesPage />} />
          <Route path="staging" element={<WebStagingPage />} />
          <Route path="resources" element={<ResourcesPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
