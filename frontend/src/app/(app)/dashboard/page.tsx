"use client";

import Link from "next/link";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/use-fetch";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { deploymentTone, isLive } from "@/lib/status";
import type { DashboardSummary } from "@/lib/types";

export default function DashboardPage() {
  const { data, loading, error } = useFetch(
    () => api.get<DashboardSummary>("/dashboard"),
    [],
  );

  if (loading) return <p className="text-sm text-text-muted">Loading dashboard...</p>;
  if (error) return <p className="text-sm text-error">{error}</p>;
  if (!data) return null;

  const { overview, recentDeployments } = data;

  const stats = [
    { label: "Projects", value: overview.projects },
    { label: "Deployments", value: overview.deployments },
    { label: "Running now", value: overview.runningDeployments },
    { label: "Success rate", value: `${overview.successRate}%` },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-text-muted">A live snapshot across every project you belong to.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardBody>
              <div className="font-mono text-2xl font-semibold">{stat.value}</div>
              <div className="mt-1 text-xs text-text-muted">{stat.label}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Recent deployments</h2>
          <Link href="/deployments" className="text-xs text-accent hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardBody className="divide-y divide-border p-0">
          {recentDeployments.length === 0 && (
            <p className="px-5 py-6 text-sm text-text-muted">
              No deployments yet. Trigger one from a project&apos;s Deployments tab.
            </p>
          )}
          {recentDeployments.map((d) => (
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
                  {d.branch} · {d.commitSha.slice(0, 7)}
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
