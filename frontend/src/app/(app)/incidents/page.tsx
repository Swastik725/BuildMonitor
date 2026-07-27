"use client";

import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import type { Incident } from "@/lib/types";

export default function IncidentsPage() {
  const { data: incidents, loading, error, reload } = useFetch(
    () => api.get<Incident[]>("/incidents"),
    [],
  );

  const resolve = async (id: string) => {
    await api.patch(`/incidents/${id}/resolve`);
    reload();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Incidents</h1>
        <p className="text-sm text-text-muted">Open incidents across all your projects.</p>
      </div>

      {loading && <p className="text-sm text-text-muted">Loading incidents...</p>}
      {error && <p className="text-sm text-error">{error}</p>}

      <Card>
        <CardBody className="divide-y divide-border p-0">
          {incidents?.length === 0 && (
            <p className="px-5 py-6 text-sm text-text-muted">No open incidents. All clear.</p>
          )}
          {incidents?.map((i) => (
            <div key={i.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <div className="text-sm font-medium">{i.title}</div>
                {i.description && <div className="text-xs text-text-muted">{i.description}</div>}
              </div>
              <div className="flex items-center gap-2">
                <StatusPill tone={i.status === "OPEN" ? "error" : "success"}>{i.status}</StatusPill>
                {i.status === "OPEN" && (
                  <Button variant="secondary" onClick={() => resolve(i.id)}>
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
