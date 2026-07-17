import { useState } from "react";
import { User, Link2, Building2, Shield, Github, Globe } from "lucide-react";
import { PageFade, Btn, Field, Av, cn } from "../components/primitives";
import { TopBar } from "../components/TopBar";

export function SettingsPage() {
  const [section, setSection] = useState<"profile" | "accounts" | "org" | "security">("profile");
  const [name, setName] = useState("Alice Chen");
  const [email, setEmail] = useState("alice@acme.com");

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

  return (
    <PageFade>
      <TopBar title="Settings" />
      <div className="p-5 max-w-5xl">
        <div className="flex gap-6">
          <nav className="w-44 flex-shrink-0 space-y-px">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
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
            {section === "profile" && (
              <div className="bg-card border border-border rounded-lg p-5 space-y-5">
                <h2 className="text-sm font-medium text-foreground">Profile</h2>
                <div className="flex items-center gap-4">
                  <Av initials="AC" size="lg" />
                  <div>
                    <Btn variant="secondary" size="sm">Change photo</Btn>
                    <p className="text-xs text-muted-foreground mt-1.5">JPG, GIF or PNG. 1MB max.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Field label="Full name"      value={name}  onChange={setName}  />
                  <Field label="Email address"  type="email"  value={email} onChange={setEmail} />
                  <Field label="Job title"      value="Senior Engineer" onChange={() => {}} />
                </div>
                <div className="pt-4 border-t border-border flex justify-end">
                  <Btn variant="primary" size="sm">Save changes</Btn>
                </div>
              </div>
            )}

            {section === "accounts" && (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="text-sm font-medium text-foreground">Connected accounts</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Connect accounts to enable OAuth login and repo access.</p>
                </div>
                <div className="divide-y divide-border">
                  <div className="px-5 py-4 flex items-center gap-4">
                    <Github className="w-5 h-5 text-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">GitHub</p>
                      <p className="text-xs text-muted-foreground">Connected as @alice-chen</p>
                    </div>
                    <Btn variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">Disconnect</Btn>
                  </div>
                  <div className="px-5 py-4 flex items-center gap-4">
                    <GoogleSvg />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Google</p>
                      <p className="text-xs text-muted-foreground">Not connected</p>
                    </div>
                    <Btn variant="secondary" size="sm">Connect</Btn>
                  </div>
                </div>
              </div>
            )}

            {section === "org" && (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-lg p-5 space-y-4">
                  <h2 className="text-sm font-medium text-foreground">Organization settings</h2>
                  <Field label="Organization name" value="Acme Corp" onChange={() => {}} />
                  <Field label="Slug" value="acme-corp" onChange={() => {}} />
                  <div className="pt-4 border-t border-border flex justify-end">
                    <Btn variant="primary" size="sm">Save changes</Btn>
                  </div>
                </div>
                <div className="bg-card border border-destructive/25 rounded-lg p-5">
                  <h3 className="text-sm font-medium text-foreground mb-3">Danger zone</h3>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-foreground">Delete organization</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Permanently delete this org and all its data. This cannot be undone.</p>
                    </div>
                    <Btn variant="danger" size="sm">Delete org</Btn>
                  </div>
                </div>
              </div>
            )}

            {section === "security" && (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-lg p-5 space-y-5">
                  <h2 className="text-sm font-medium text-foreground">Two-factor authentication</h2>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-foreground">Authenticator app</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Use an app like 1Password or Authy to generate time-based codes.</p>
                    </div>
                    <Btn variant="secondary" size="sm">Enable</Btn>
                  </div>
                  <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-foreground">Passkeys</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Sign in with biometrics or a hardware security key.</p>
                    </div>
                    <Btn variant="secondary" size="sm">Add passkey</Btn>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h2 className="text-sm font-medium text-foreground">Active sessions</h2>
                  </div>
                  <div className="divide-y divide-border">
                    {[
                      { browser: "Chrome 121", os: "macOS 14.3", loc: "San Francisco, CA", current: true,  time: "now"   },
                      { browser: "Safari 17",  os: "iOS 17.3",   loc: "San Francisco, CA", current: false, time: "2d ago" },
                    ].map((s, i) => (
                      <div key={i} className="px-5 py-3.5 flex items-center gap-4">
                        <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{s.browser} · {s.os}</p>
                          <p className="text-xs text-muted-foreground">{s.loc} · {s.time}</p>
                        </div>
                        {s.current ? (
                          <span className="text-xs px-2 py-0.5 rounded" style={{ color: "#5fa86e", background: "rgba(95,168,110,0.13)" }}>Current</span>
                        ) : (
                          <Btn variant="ghost" size="sm" className="text-destructive">Revoke</Btn>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageFade>
  );
}
