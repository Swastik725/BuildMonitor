import { useState } from "react";
import { Settings, LogOut } from "lucide-react";
import { Av } from "./primitives";
import { useClickOutside } from "../lib/useClickOutside";
import { useAuth } from "../lib/AuthContext";
import type { NavState } from "../lib/types";

function initials(fullName: string) {
  return fullName.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

export function ProfileMenu({ onNav }: { onNav: (s: NavState) => void }) {
  const { profile, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="cursor-pointer">
        <Av initials={profile ? initials(profile.fullName) : "…"} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-20">
          {profile && (
            <div className="px-3.5 py-3 border-b border-border">
              <p className="text-sm font-medium text-foreground truncate">{profile.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
            </div>
          )}
          <div className="py-1">
            <button
              onClick={() => { setOpen(false); onNav({ page: "settings" }); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-foreground hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
