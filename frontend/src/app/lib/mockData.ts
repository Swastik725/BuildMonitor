import type { Status } from "./types";

export const PROJECTS = [
  { id: "web-frontend",  name: "web-frontend",  repo: "acme-corp/web-frontend",  branch: "main",           framework: "Next.js 14",     status: "in-progress" as Status, lastDeploy: "just now", uptime: "99.97%", deploys: 48 },
  { id: "api-service",   name: "api-service",   repo: "acme-corp/api-service",   branch: "main",           framework: "Node.js 20",     status: "failed"      as Status, lastDeploy: "6h ago",   uptime: "99.41%", deploys: 31 },
  { id: "data-pipeline", name: "data-pipeline", repo: "acme-corp/data-pipeline", branch: "main",           framework: "Python 3.11",    status: "success"     as Status, lastDeploy: "1d ago",   uptime: "99.99%", deploys: 12 },
  { id: "mobile-app",    name: "mobile-app",    repo: "acme-corp/mobile-app",    branch: "release/2.4",    framework: "React Native",   status: "success"     as Status, lastDeploy: "3d ago",   uptime: "—",      deploys: 7  },
];

export const DEPLOYMENTS: Record<string, Array<{
  id: string; commit: string; message: string; branch: string;
  status: Status; duration: string | null; triggeredBy: string; timestamp: string;
}>> = {
  "web-frontend": [
    { id: "dep-a1b2c3", commit: "a1b2c3d", message: "feat: add dark mode toggle to user settings panel",           branch: "main", status: "in-progress", duration: null,     triggeredBy: "alice@acme.com",  timestamp: "just now" },
    { id: "dep-e4f5g6", commit: "e4f5g6h", message: "fix: resolve hydration mismatch in navigation component",    branch: "main", status: "success",     duration: "3m 12s", triggeredBy: "alice@acme.com",  timestamp: "2h ago"   },
    { id: "dep-i7j8k9", commit: "i7j8k9l", message: "chore: update dependencies, patch CVE-2024-1234",           branch: "main", status: "failed",      duration: "1m 45s", triggeredBy: "bob@acme.com",    timestamp: "6h ago"   },
    { id: "dep-m1n2o3", commit: "m1n2o3p", message: "feat: redesign project card and status badge components",    branch: "main", status: "success",     duration: "2m 58s", triggeredBy: "carol@acme.com",  timestamp: "1d ago"   },
    { id: "dep-q4r5s6", commit: "q4r5s6t", message: "refactor: migrate auth flow to React Server Components",     branch: "main", status: "success",     duration: "4m 03s", triggeredBy: "alice@acme.com",  timestamp: "2d ago"   },
    { id: "dep-u7v8w9", commit: "u7v8w9x", message: "perf: enable ISR for product listing pages",                branch: "main", status: "success",     duration: "3m 34s", triggeredBy: "david@acme.com",  timestamp: "3d ago"   },
  ],
  "api-service": [
    { id: "dep-b2c3d4", commit: "b2c3d4e", message: "fix: handle race condition in request queue under high load", branch: "main", status: "failed",  duration: "2m 11s", triggeredBy: "bob@acme.com",   timestamp: "6h ago"  },
    { id: "dep-f5g6h7", commit: "f5g6h7i", message: "feat: add rate limiting middleware with Redis backing",        branch: "main", status: "success", duration: "1m 47s", triggeredBy: "bob@acme.com",   timestamp: "2d ago"  },
    { id: "dep-j8k9l0", commit: "j8k9l0m", message: "chore: upgrade to Node.js 20 LTS",                          branch: "main", status: "success", duration: "2m 02s", triggeredBy: "alice@acme.com", timestamp: "4d ago"  },
  ],
};

export const ALL_RECENT = [
  ...DEPLOYMENTS["web-frontend"].slice(0, 3).map(d => ({ ...d, project: "web-frontend" })),
  ...DEPLOYMENTS["api-service"].slice(0, 2).map(d => ({ ...d, project: "api-service" })),
].sort((a, b) => {
  const order = ["just now", "2h ago", "6h ago", "1d ago", "2d ago"];
  return order.indexOf(a.timestamp) - order.indexOf(b.timestamp);
});

export const INCIDENTS = [
  { id: "1", title: "API service elevated latency — p99 > 800ms on /api/users", status: "open"     as Status, project: "api-service",  opened: "3h ago", severity: "high"   },
  { id: "2", title: "Database connection pool exhausted in production",           status: "open"     as Status, project: "api-service",  opened: "5h ago", severity: "critical" },
  { id: "3", title: "CDN origin 503 errors on /api/search endpoint",             status: "resolved" as Status, project: "web-frontend", opened: "1d ago", severity: "medium" },
];

export const MEMBERS = [
  { id: "1", name: "Alice Chen",   email: "alice@acme.com",  role: "Admin",  avatar: "AC", lastActive: "now"   },
  { id: "2", name: "Bob Martinez", email: "bob@acme.com",    role: "Member", avatar: "BM", lastActive: "3h ago" },
  { id: "3", name: "Carol Singh",  email: "carol@acme.com",  role: "Member", avatar: "CS", lastActive: "1d ago" },
  { id: "4", name: "David Kim",    email: "david@acme.com",  role: "Viewer", avatar: "DK", lastActive: "5d ago" },
];

export const LOG_LINES = [
  { t: "00:00.001", msg: "Cloning repository acme-corp/web-frontend",                              level: "info"    },
  { t: "00:01.234", msg: "Checked out commit a1b2c3d on branch main",                             level: "info"    },
  { t: "00:01.890", msg: "Cache hit: node_modules restored from previous build",                   level: "info"    },
  { t: "00:02.110", msg: "Running npm ci — verifying lockfile integrity",                          level: "info"    },
  { t: "00:14.512", msg: "Installed 847 packages in 12.4s",                                       level: "info"    },
  { t: "00:14.610", msg: "Running build: next build",                                             level: "info"    },
  { t: "00:16.001", msg: "  ✓ Compiled client and server components",                             level: "success" },
  { t: "00:22.113", msg: "  Route (app)                              Size     First Load JS",      level: "muted"   },
  { t: "00:22.114", msg: "  ┌ ○ /                                  5.23 kB        94.7 kB",       level: "muted"   },
  { t: "00:22.115", msg: "  ├ ○ /dashboard                         12.4 kB         102 kB",       level: "muted"   },
  { t: "00:22.116", msg: "  ├ ○ /projects/[id]                     8.91 kB        97.6 kB",       level: "muted"   },
  { t: "00:22.117", msg: "  └ ○ /settings                          3.81 kB        92.3 kB",       level: "muted"   },
  { t: "00:23.500", msg: "Uploading build artifacts — 14 files to CDN",                           level: "info"    },
  { t: "00:25.801", msg: "Assigning deployment to edge network (14 regions)",                     level: "info"    },
  { t: "00:25.990", msg: "Health check: GET / → 200 OK (142ms)",                                 level: "success" },
  { t: "00:26.100", msg: "Deployment complete ✓",                                                level: "success" },
];
