export type Organization = {
  id: string;
  name: string;
  slug: string;
};

export type Project = {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  defaultBranch: string;
  repositoryUrl?: string | null;
  productionUrl?: string | null;
  healthUrl?: string | null;
  healthEnabled?: boolean;
  monitoringEnabled: boolean;
  environments?: Environment[];
  repository?: Repository | null;
  createdAt: string;
};

export type Environment = {
  id: string;
  projectId: string;
  name: string;
  environmentType: "PRODUCTION" | "STAGING" | "DEVELOPMENT";
};

export type Repository = {
  id: string;
  projectId: string;
  githubOwner: string;
  repositoryName: string;
  htmlUrl: string;
  cloneUrl: string;
  defaultBranch: string;
  visibility: "PUBLIC" | "PRIVATE";
  isConnected: boolean;
  workflowFile?: string | null;
  lastSync?: string | null;
  latestCommitSha?: string | null;
  latestCommitMessage?: string | null;
  latestCommitAuthor?: string | null;
  latestCommitDate?: string | null;
};

export type GithubRepoOption = {
  id: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  defaultBranch: string;
  private: boolean;
  description: string | null;
};

export type DeploymentStatus = "QUEUED" | "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED";

export type Deployment = {
  id: string;
  environmentId: string;
  triggeredById: string;
  commitSha: string;
  commitMessage: string;
  branch: string;
  status: DeploymentStatus;
  githubRunId?: string | null;
  workflowFile?: string | null;
  dispatchedAt?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  duration?: number | null;
  createdAt: string;
  triggeredBy?: { id: string; fullName: string; username: string };
  environment?: Environment & { project?: Project };
};

export type DeploymentLog = {
  id: string;
  deploymentId: string;
  logLevel: "INFO" | "WARNING" | "ERROR" | "DEBUG";
  message: string;
  timestamp: string;
};

export type HealthStatus = "UP" | "DOWN" | "DEGRADED";

export type HealthCheck = {
  id: string;
  environmentId: string;
  status: HealthStatus;
  statusCode?: number | null;
  responseTime?: number | null;
  message?: string | null;
  checkedAt: string;
};

export type MetricType =
  | "CPU"
  | "MEMORY"
  | "LATENCY"
  | "NETWORK"
  | "DISK"
  | "REQUESTS"
  | "ERROR_RATE";

export type Metric = {
  id: string;
  deploymentId: string;
  metricType: MetricType;
  value: number;
  recordedAt: string;
};

export type Alert = {
  id: string;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  resolved: boolean;
  createdAt: string;
};

export type Incident = {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
  resolvedAt?: string | null;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

export type DashboardSummary = {
  overview: {
    projects: number;
    deployments: number;
    runningDeployments: number;
    successfulDeployments: number;
    failedDeployments: number;
    successRate: number;
  };
  recentDeployments: Deployment[];
};
