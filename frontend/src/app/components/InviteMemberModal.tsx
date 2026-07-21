import { useState } from "react";
import { X } from "lucide-react";
import { Field, Btn } from "./primitives";
import { organizationsApi } from "../lib/organizationsApi";

export function InviteMemberModal({ orgId, onClose, onInvited }: {
  orgId: string; onClose: () => void; onInvited: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await organizationsApi.addMember(orgId, email, role);
      onInvited();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Add member</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          They need an existing BuildMonitor account — invite emails aren't sent yet, so ask them to sign up first if needed.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field label="Email address" type="email" placeholder="teammate@company.com" value={email} onChange={setEmail} />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as "ADMIN" | "MEMBER")}
              className="w-full bg-input-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Btn variant="secondary" type="button" onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" type="submit" disabled={loading || !email}>
              {loading ? "Adding…" : "Add member"}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
