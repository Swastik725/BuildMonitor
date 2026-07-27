# DEPLOYMENT_ENGINE.md

Version: 3.0

---

# Scope

Deployment tracking is backed by real GitHub Actions dispatch and polling rather than a simulator.
BuildMonitor creates deployment rows, dispatches the connected repository workflow, then polls
GitHub for the actual run status and job logs.

---

# Goal

Track actual deployment lifecycles, log lines, and notifications for connected repositories.

---

# Deployment states

```text
QUEUED -> RUNNING -> SUCCESS / FAILED / CANCELLED
```

---

# Flow

```text
User clicks "Trigger deployment"
  -> Backend dispatches the repository's GitHub Actions workflow
  -> Deployment row created (QUEUED)
  -> Poller matches the GitHub run id
  -> GitHub run status transitions to RUNNING
  -> Job/step data are mirrored into deployment logs
  -> Run completes with SUCCESS / FAILED / CANCELLED
  -> Deployment row is updated and notifications are sent
```

---

# Deployment data

Commit SHA, commit message, branch, triggered-by, duration, status, environment, workflow file,
GitHub run id, dispatch time.

---

# Logs

Persistent in `deployment_logs`. The frontend polls `GET /deployments/{id}/logs` while a
deployment is active.

---

# Status

Implemented against real GitHub Actions dispatch and polling.
