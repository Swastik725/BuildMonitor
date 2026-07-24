import { useState, useEffect } from "react";
import type { NavState } from "./lib/types";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { deploymentsApi, organizationsApi, projectsApi, setTokens } from "./lib/api";
import { useResource } from "./lib/use-resource";
import { Sidebar } from "./components/Sidebar";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectPage } from "./pages/ProjectPage";
import { DeploymentPage } from "./pages/DeploymentPage";
import { OrgPage } from "./pages/OrgPage";
import { SettingsPage } from "./pages/SettingsPage";

// Google/GitHub callbacks redirect the browser back here with
// ?accessToken=...&refreshToken=... in the URL. Catch it once on load,
// store the tokens, then strip them from the address bar.
function useOAuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      window.history.replaceState({}, "", window.location.pathname);
      // Force a reload so AuthContext picks up the now-present token on init.
      window.location.reload();
    }
  }, []);
}

function AppShell() {
  const { isAuthed, logout } = useAuth();
  const [nav, setNav] = useState<NavState>({ page: "dashboard" });
  const organizations = useResource(() => organizationsApi.list(), [], 15000);
  const projects = useResource(() => projectsApi.list(), [], 15000);
  const recentDeployments = useResource(() => deploymentsApi.recent(), [], 5000);
  useOAuthCallback();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    document.documentElement.classList.toggle("dark", savedTheme !== "light");
  }, []);

  if (!isAuthed) {
    return (
      <div className="min-h-screen">
        <LoginPage />
      </div>
    );
  }

  const activeOrganization = organizations.data?.[0] ?? null;
  const selectedProjectId =
    nav.projectId ??
    recentDeployments.data?.[0]?.environment?.project?.id ??
    projects.data?.[0]?.id;
  const selectedDeploymentId = nav.deploymentId ?? recentDeployments.data?.[0]?.id;

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar
        current={nav.page}
        onNav={page => setNav(page === "project" ? { page: "dashboard" } : { page })}
        onLogout={logout}
        organizationName={activeOrganization?.name}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {nav.page === "dashboard" && <DashboardPage onNav={setNav} />}
        {nav.page === "project" && (
          selectedProjectId ? (
            <ProjectPage projectId={selectedProjectId} onNav={setNav} />
          ) : (
            <WorkspaceEmpty title="Project" message={projects.loading ? "Loading projects…" : "No projects are available in this workspace yet."} />
          )
        )}
        {nav.page === "deployment" && (
          selectedProjectId && selectedDeploymentId ? (
            <DeploymentPage projectId={selectedProjectId} deploymentId={selectedDeploymentId} onNav={setNav} />
          ) : (
            <WorkspaceEmpty title="Deployment" message={recentDeployments.loading ? "Loading deployments…" : "No deployments are available yet."} />
          )
        )}
        {nav.page === "org"       && <OrgPage         onNav={setNav} />}
        {nav.page === "settings"  && <SettingsPage />}
      </main>
    </div>
  );
}

function WorkspaceEmpty({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="glass-panel max-w-md w-full p-8 text-center">
        <p className="eyebrow">{title}</p>
        <h2 className="mt-3 text-xl font-semibold">Nothing to show yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
