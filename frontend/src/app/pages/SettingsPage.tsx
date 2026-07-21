import { useState, useEffect, useCallback } from "react";
import { User, Link2, Building2, Shield, Github, Globe } from "lucide-react";
import type { NavState } from "../lib/types";
import { PageFade, Btn, Field, Av, cn } from "../components/primitives";
import { TopBar } from "../components/TopBar";
import { usersApi, type UserProfile, type AuthProviderLink, type Session } from "../lib/usersApi";
import { organizationsApi, type Organization } from "../lib/organizationsApi";
import { authApi } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import { formatRelativeTime } from "../lib/statusMap";

function initials(fullName: string) {
  return fullName.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

export function SettingsPage({ onNav }: { onNav: (s: NavState) => void }) {
  const { refreshProfile } = useAuth();
  const [section, setSection] = useState<"profile" | "accounts" | "org" | "security">("profile");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [providers, setProviders] = useState<AuthProviderLink[]>([]);

  const [org, setOrg] = useState<Organization | null>(null);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [savingOrg, setSavingOrg] = useState(false);
  const [deletingOrg, setDeletingOrg] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadAll = useCallback(() => {
    usersApi.getProfile().then(p => { setProfile(p); setFullName(p.fullName); });
    usersApi.getAuthProviders().then(setProviders);
    usersApi.getSessions().then(setSessions);
    organizationsApi.list().then(orgs => {
      const first = orgs[0] ?? null;
      setOrg(first);
      if (first) { setOrgName(first.name); setOrgSlug(first.slug); }
    });
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const sections = [
    { id: "profile",  label: "Profile",            icon: User      },
    { id: "accounts", label: "Connected accounts",  icon: Link2     },
    { id: "org",      label: "Organization",        icon: Building2 },
    { id: "security", label: "Security",            icon: Shield    },
  ] as const;

  const GoogleSvg = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  async function handleSaveProfile() {
    setSavingProfile(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await usersApi.updateProfile({ fullName });
      setProfile(updated);
      refreshProfile();
      setNotice("Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleDisconnect(provider: string) {
    setError(null);
    try {
      await usersApi.disconnectProvider(provider);
      setProviders(prev => prev.filter(p => p.provider !== provider));
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to disconnect ${provider}`);
    }
  }

  async function handleSaveOrg() {
    if (!org) return;
    setSavingOrg(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await organizationsApi.update(org.id, { name: orgName, slug: orgSlug });
      setOrg(updated);
      setNotice("Organization updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update organization");
    } finally {
      setSavingOrg(false);
    }
  }

  async function handleDeleteOrg() {
    if (!org) return;
    if (!confirm(`Permanently delete "${org.name}"? This cannot be undone.`)) return;
    setDeletingOrg(true);
    setError(null);
    try {
      await organizationsApi.delete(org.id);
      setOrg(null);
      setNotice("Organization deleted.");
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} — an organization with existing projects usually can't be deleted until they're removed first.`
          : "Failed to delete organization"
      );
    } finally {
      setDeletingOrg(false);
    }
  }

  async function handleRevokeSession(id: string) {
    setError(null);
    try {
      await usersApi.revokeSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke session");
    }
  }

  const hasGithub = providers.some(p => p.provider === "github");
  const hasGoogle = providers.some(p => p.provider === "google");

  return (
    <PageFade>
      <TopBar title="Settings" onNav={onNav} />
      <div className="p-5 max-w-5xl">
        <div className="flex gap-6">
          <nav className="w-44 flex-shrink-0 space-y-px">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => { setSection(s.id); setError(null); setNotice(null); }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors cursor-pointer",
                  section === s.id
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                )}
              >
                <s.icon className="w-4 h-4" />
                {s.label}
              </button>
            ))}
          </nav>

          <div className="flex-1 space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            {notice && <p className="text-sm text-muted-foreground">{notice}</p>}

            {section === "profile" && profile && (
              <div className="bg-card border border-border rounded-lg p-5 space-y-5">
                <h2 className="text-sm font-medium text-foreground">Profile</h2>
                <div className="flex items-center gap-4">
                  <Av initials={initials(profile.fullName)} size="lg" />
                  <div>
                    <Btn variant="secondary" size="sm" disabled title="Avatar upload isn't built yet">Change photo</Btn>
                    <p className="text-xs text-muted-foreground mt-1.5">Not implemented yet.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Field label="Full name" value={fullName} onChange={setFullName} />
                  <Field label="Email address" type="email" value={profile.email} onChange={() => {}} />
                  <p className="text-xs text-muted-foreground -mt-2">Email changes aren't supported yet.</p>
                </div>
                <div className="pt-4 border-t border-border flex justify-end">
                  <Btn variant="primary" size="sm" onClick={handleSaveProfile} disabled={savingProfile}>
                    {savingProfile ? "Saving…" : "Save changes"}
                  </Btn>
                </div>
              </div>
            )}

            {section === "accounts" && (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="text-sm font-medium text-foreground">Connected accounts</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Connect accounts to enable OAuth login.</p>
                </div>
                <div className="divide-y divide-border">
                  <div className="px-5 py-4 flex items-center gap-4">
                    <Github className="w-5 h-5 text-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">GitHub</p>
                      <p className="text-xs text-muted-foreground">{hasGithub ? "Connected" : "Not connected"}</p>
                    </div>
                    {hasGithub ? (
                      <Btn variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDisconnect("github")}>
                        Disconnect
                      </Btn>
                    ) : (
                      <a href={authApi.githubLoginUrl()}>
                        <Btn variant="secondary" size="sm">Connect</Btn>
                      </a>
                    )}
                  </div>
                  <div className="px-5 py-4 flex items-center gap-4">
                    <GoogleSvg />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Google</p>
                      <p className="text-xs text-muted-foreground">{hasGoogle ? "Connected" : "Not connected"}</p>
                    </div>
                    {hasGoogle ? (
                      <Btn variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDisconnect("google")}>
                        Disconnect
                      </Btn>
                    ) : (
                      <a href={authApi.googleLoginUrl()}>
                        <Btn variant="secondary" size="sm">Connect</Btn>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {section === "org" && (
              <div className="space-y-4">
                {org ? (
                  <>
                    <div className="bg-card border border-border rounded-lg p-5 space-y-4">
                      <h2 className="text-sm font-medium text-foreground">Organization settings</h2>
                      <Field label="Organization name" value={orgName} onChange={setOrgName} />
                      <Field label="Slug" value={orgSlug} onChange={setOrgSlug} />
                      <div className="pt-4 border-t border-border flex justify-end">
                        <Btn variant="primary" size="sm" onClick={handleSaveOrg} disabled={savingOrg}>
                          {savingOrg ? "Saving…" : "Save changes"}
                        </Btn>
                      </div>
                    </div>
                    <div className="bg-card border border-destructive/25 rounded-lg p-5">
                      <h3 className="text-sm font-medium text-foreground mb-3">Danger zone</h3>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-foreground">Delete organization</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Permanently delete this org and all its data. This cannot be undone.</p>
                        </div>
                        <Btn variant="danger" size="sm" onClick={handleDeleteOrg} disabled={deletingOrg}>
                          {deletingOrg ? "Deleting…" : "Delete org"}
                        </Btn>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No organization to manage.</p>
                )}
              </div>
            )}

            {section === "security" && (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="text-sm font-medium text-foreground">Active sessions</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Each entry is a refresh token issued at login. Revoking one signs that session out.
                  </p>
                </div>
                {sessions.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-muted-foreground">No active sessions.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {sessions.map(s => (
                      <div key={s.id} className="px-5 py-3.5 flex items-center gap-4">
                        <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-foreground">Session {s.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">
                            Issued {formatRelativeTime(s.createdAt)} · expires {new Date(s.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Btn variant="ghost" size="sm" className="text-destructive" onClick={() => handleRevokeSession(s.id)}>
                          Revoke
                        </Btn>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageFade>
  );
}
