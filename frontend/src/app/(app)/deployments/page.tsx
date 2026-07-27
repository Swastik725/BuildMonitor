"use client";

import Link from "next/link";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { Card, CardBody } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { deploymentTone, isLive } from "@/lib/status";
import type { Deployment } from "@/lib/types";

export default function DeploymentsPage() {
  const { data: deployments, loading, error } = useFetch(
    () => api.get<Deployment[]>("/deployments"),
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Deployments</h1>
        <p className="text-sm text-text-muted">Recent deployments across all your projects.</p>
      </div>

      {loading && <p className="text-sm text-text-muted">Loading...</p>}
      {error && <p className="text-sm text-error">{error}</p>}

      <Card>
        <CardBody className="divide-y divide-border p-0">
          {deployments?.length === 0 && (
            <p className="px-5 py-6 text-sm text-text-muted">No deployments yet.</p>
          )}
          {deployments?.map((d) => (
            <Link
              key={d.id}
              href={`/deployments/${d.id}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-surface-2"
            >
              <div>
                <div className="text-sm font-medium">
                  {d.environment?.project?.name ?? "Unknown project"}
                </div>
                <div className="font-mono text-xs text-text-muted">
                  {d.branch} · {d.commitSha.slice(0, 7)} ·{" "}
                  {new Date(d.createdAt).toLocaleString()}
                </div>
              </div>
              <StatusPill tone={deploymentTone(d.status)} pulse={isLive(d.status)}>
                {d.status}
              </StatusPill>
            </Link>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
