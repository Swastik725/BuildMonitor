import { useState, useEffect } from "react";
import type { NavState } from "./lib/types";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { setTokens } from "./lib/api";
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
  useOAuthCallback();

  if (!isAuthed) {
    return (
      <div className="dark min-h-screen">
        <LoginPage />
      </div>
    );
  }

  return (
    <div className="dark flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar current={nav.page} onNav={page => setNav({ page })} onLogout={logout} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {nav.page === "dashboard" && <DashboardPage onNav={setNav} />}
        {nav.page === "project"   && <ProjectPage    projectId={nav.projectId ?? "web-frontend"} onNav={setNav} />}
        {nav.page === "deployment"&& <DeploymentPage  projectId={nav.projectId ?? "web-frontend"} deploymentId={nav.deploymentId ?? "dep-e4f5g6"} onNav={setNav} />}
        {nav.page === "org"       && <OrgPage         onNav={setNav} />}
        {nav.page === "settings"  && <SettingsPage onNav={setNav} />}
      </main>
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
