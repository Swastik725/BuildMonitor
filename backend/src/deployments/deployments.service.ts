import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import axios from 'axios';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { TriggerDeploymentDto } from './dto/trigger-deployment.dto';

type GitHubRun = {
  id: number;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: string | null;
  run_started_at: string | null;
  updated_at: string;
  head_branch: string;
  event: string;
  html_url: string;
};

type GitHubJob = {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: string | null;
  started_at: string | null;
  completed_at: string | null;
  steps: Array<{
    name: string;
    status: 'queued' | 'in_progress' | 'completed';
    conclusion: string | null;
    started_at: string | null;
    completed_at: string | null;
  }>;
};

@Injectable()
export class DeploymentsService {
  private readonly logger = new Logger(DeploymentsService.name);

  constructor(
    private prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private githubHeaders() {
    const token = process.env.GITHUB_TOKEN;
    return {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'BuildMonitor',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async trigger(
    projectId: string,
    userId: string,
    dto: TriggerDeploymentDto,
  ) {
    const environment = await this.prisma.environment.findFirst({
      where: {
        projectId,
        environmentType: 'PRODUCTION',
        project: {
          organization: {
            members: {
              some: { userId },
            },
          },
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            organizationId: true,
            repository: true,
          },
        },
      },
    });

    if (!environment) {
      throw new NotFoundException(
        'Project or production environment not found',
      );
    }

    const repository = environment.project.repository;
    if (!repository || !repository.isConnected) {
      throw new BadRequestException(
        'Connect a GitHub repository before triggering a deployment',
      );
    }

    const branch = dto.branch || repository.defaultBranch || 'main';
    const workflowFile = repository.workflowFile || 'deploy.yml';
    const dispatchedAt = new Date();

    // Ask GitHub to actually run the workflow. This call doesn't return a
    // run id directly, so we locate the run in the polling loop below by
    // matching branch + event + created-after-dispatch.
    try {
      await axios.post(
        `https://api.github.com/repos/${repository.githubOwner}/${repository.repositoryName}/actions/workflows/${workflowFile}/dispatches`,
        { ref: branch },
        { headers: this.githubHeaders() },
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Failed to dispatch GitHub Actions workflow';
      throw new BadRequestException(message);
    }

    const deployment = await this.prisma.deployment.create({
      data: {
        environmentId: environment.id,
        triggeredById: userId,
        commitSha: repository.latestCommitSha || 'pending',
        commitMessage:
          dto.commitMessage || repository.latestCommitMessage || 'Manual deployment',
        branch,
        status: 'QUEUED',
        dispatchedAt,
        workflowFile,
      },
    });

    await this.addLog(
      deployment.id,
      'INFO',
      `Dispatched ${workflowFile} for ${branch} on ${repository.githubOwner}/${repository.repositoryName}`,
    );

    await this.notificationsService.createForOrganization(
      environment.project.organizationId,
      {
        title: 'Deployment queued',
        message: `${environment.project.name} is deploying ${branch}.`,
        type: 'DEPLOYMENT',
      },
    );

    return deployment;
  }

  findAllByProject(projectId: string, userId: string) {
    return this.prisma.deployment.findMany({
      where: {
        environment: {
          project: {
            id: projectId,
            organization: {
              members: {
                some: { userId },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        triggeredBy: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const deployment = await this.prisma.deployment.findFirst({
      where: {
        id,
        environment: {
          project: {
            organization: {
              members: {
                some: { userId },
              },
            },
          },
        },
      },
      include: {
        triggeredBy: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
        environment: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!deployment) {
      throw new NotFoundException('Deployment not found');
    }

    return deployment;
  }

  async retry(id: string, userId: string) {
    const deployment = await this.findOne(id, userId);
    const repository = await this.prisma.repository.findUnique({
      where: { projectId: deployment.environment.projectId },
    });

    if (!repository || !repository.isConnected) {
      throw new BadRequestException(
        'Connect a GitHub repository before retrying a deployment',
      );
    }

    const workflowFile = deployment.workflowFile || repository.workflowFile || 'deploy.yml';

    try {
      await axios.post(
        `https://api.github.com/repos/${repository.githubOwner}/${repository.repositoryName}/actions/workflows/${workflowFile}/dispatches`,
        { ref: deployment.branch },
        { headers: this.githubHeaders() },
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Failed to re-dispatch GitHub Actions workflow';
      throw new BadRequestException(message);
    }

    await this.addLog(id, 'INFO', `Re-dispatched ${workflowFile} for ${deployment.branch}`);

    return this.prisma.deployment.update({
      where: { id },
      data: {
        status: 'QUEUED',
        githubRunId: null,
        dispatchedAt: new Date(),
        startedAt: null,
        finishedAt: null,
        duration: null,
      },
    });
  }

  async cancel(id: string, userId: string) {
    const deployment = await this.findOne(id, userId);

    if (deployment.githubRunId) {
      const repository = await this.prisma.repository.findUnique({
        where: { projectId: deployment.environment.projectId },
      });
      if (repository) {
        try {
          await axios.post(
            `https://api.github.com/repos/${repository.githubOwner}/${repository.repositoryName}/actions/runs/${deployment.githubRunId}/cancel`,
            {},
            { headers: this.githubHeaders() },
          );
        } catch (error: any) {
          // Run may have already completed on GitHub's side; that's fine,
          // we still reflect cancellation locally below.
          this.logger.warn(
            `Could not cancel GitHub run ${deployment.githubRunId}: ${error?.response?.data?.message || error.message}`,
          );
        }
      }
    }

    return this.prisma.deployment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        finishedAt: new Date(),
      },
    });
  }

  async findLogs(deploymentId: string, userId: string) {
    const logs = await this.prisma.deploymentLog.findMany({
      where: {
        deploymentId,
        deployment: {
          environment: {
            project: {
              organization: {
                members: {
                  some: { userId },
                },
              },
            },
          },
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    return logs;
  }

  findAllRecent(userId: string, limit = 20) {
    return this.prisma.deployment.findMany({
      where: {
        environment: {
          project: {
            organization: {
              members: {
                some: { userId },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        environment: {
          include: {
            project: true,
          },
        },
        triggeredBy: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
      },
    });
  }

  private async addLog(
    deploymentId: string,
    logLevel: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG',
    message: string,
    timestamp = new Date(),
  ) {
    return this.prisma.deploymentLog.create({
      data: {
        deploymentId,
        logLevel,
        message,
        timestamp,
      },
    });
  }

  /**
   * Polls GitHub Actions for real run status instead of flipping a coin.
   * Two phases per tick:
   *  1. Deployments we've dispatched but haven't matched to a run id yet -
   *     look them up by branch + event + created-after-dispatch-time.
   *  2. Deployments with a known run id and not yet finished - fetch the
   *     real run status/conclusion and reflect it, pulling job/step names
   *     as log lines so the log view shows what GitHub actually did.
   */
  @Interval(10000)
  async pollDeployments() {
    await this.matchUnlinkedRuns();
    await this.refreshLinkedRuns();
  }

  private async matchUnlinkedRuns() {
    const pending = await this.prisma.deployment.findMany({
      where: { githubRunId: null, status: 'QUEUED' },
      include: {
        environment: {
          include: { project: { include: { repository: true } } },
        },
      },
    });

    for (const deployment of pending) {
      const repository = deployment.environment.project.repository;
      if (!repository) continue;

      try {
        const { data } = await axios.get(
          `https://api.github.com/repos/${repository.githubOwner}/${repository.repositoryName}/actions/runs`,
          {
            headers: this.githubHeaders(),
            params: {
              branch: deployment.branch,
              event: 'workflow_dispatch',
              per_page: 10,
            },
          },
        );

        const candidates: GitHubRun[] = data.workflow_runs || [];
        const dispatchedAt = deployment.dispatchedAt ?? deployment.createdAt;
        const match = candidates
          .filter(run => new Date(run.updated_at) >= new Date(dispatchedAt.getTime() - 5000))
          .sort((a, b) => b.id - a.id)[0];

        if (!match) continue;

        // Guard against linking a run that another deployment already claimed.
        const alreadyLinked = await this.prisma.deployment.findFirst({
          where: { githubRunId: String(match.id) },
          select: { id: true },
        });
        if (alreadyLinked) continue;

        await this.prisma.deployment.update({
          where: { id: deployment.id },
          data: { githubRunId: String(match.id) },
        });

        await this.addLog(deployment.id, 'INFO', `Matched GitHub Actions run: ${match.html_url}`);
      } catch (error: any) {
        this.logger.warn(
          `Could not look up GitHub Actions runs for deployment ${deployment.id}: ${error?.response?.data?.message || error.message}`,
        );
      }
    }
  }

  private async refreshLinkedRuns() {
    const inFlight = await this.prisma.deployment.findMany({
      where: {
        githubRunId: { not: null },
        status: { in: ['QUEUED', 'RUNNING'] },
      },
      include: {
        environment: {
          include: { project: { include: { repository: true } } },
        },
      },
    });

    for (const deployment of inFlight) {
      const repository = deployment.environment.project.repository;
      if (!repository) continue;

      try {
        const { data: run } = await axios.get<GitHubRun>(
          `https://api.github.com/repos/${repository.githubOwner}/${repository.repositoryName}/actions/runs/${deployment.githubRunId}`,
          { headers: this.githubHeaders() },
        );

        await this.syncJobLogs(deployment.id, repository, deployment.githubRunId!);

        if (run.status !== 'completed') {
          if (run.status === 'in_progress' && deployment.status !== 'RUNNING') {
            await this.prisma.deployment.update({
              where: { id: deployment.id },
              data: {
                status: 'RUNNING',
                startedAt: run.run_started_at ? new Date(run.run_started_at) : new Date(),
              },
            });

            await this.notificationsService.createForOrganization(
              deployment.environment.project.organizationId,
              {
                title: 'Deployment started',
                message: `${deployment.environment.project.name} is now running.`,
                type: 'DEPLOYMENT',
              },
            );
          }
          continue;
        }

        const succeeded = run.conclusion === 'success';
        const cancelled = run.conclusion === 'cancelled';
        const finishedAt = new Date(run.updated_at);
        const startedAt = deployment.startedAt ?? finishedAt;
        const duration = Math.max(
          0,
          Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000),
        );

        const finalStatus = cancelled ? 'CANCELLED' : succeeded ? 'SUCCESS' : 'FAILED';

        await this.prisma.deployment.update({
          where: { id: deployment.id },
          data: {
            status: finalStatus,
            finishedAt,
            duration,
          },
        });

        await this.addLog(
          deployment.id,
          succeeded ? 'INFO' : cancelled ? 'WARNING' : 'ERROR',
          `Run finished with conclusion: ${run.conclusion}`,
          finishedAt,
        );

        this.logger.log(`Deployment ${deployment.id} -> ${finalStatus} (GitHub run ${run.id})`);

        await this.notificationsService.createForOrganization(
          deployment.environment.project.organizationId,
          {
            title: succeeded ? 'Deployment succeeded' : 'Deployment failed',
            message: succeeded
              ? `${deployment.environment.project.name} finished successfully.`
              : `${deployment.environment.project.name} did not complete successfully.`,
            type: 'DEPLOYMENT',
          },
        );
      } catch (error: any) {
        this.logger.warn(
          `Could not refresh GitHub Actions run ${deployment.githubRunId} for deployment ${deployment.id}: ${error?.response?.data?.message || error.message}`,
        );
      }
    }
  }

  /** Mirrors real job/step names and their status from GitHub as log lines. */
  private async syncJobLogs(
    deploymentId: string,
    repository: { githubOwner: string; repositoryName: string },
    runId: string,
  ) {
    try {
      const { data } = await axios.get(
        `https://api.github.com/repos/${repository.githubOwner}/${repository.repositoryName}/actions/runs/${runId}/jobs`,
        { headers: this.githubHeaders() },
      );

      const jobs: GitHubJob[] = data.jobs || [];
      const existing = await this.prisma.deploymentLog.findMany({
        where: { deploymentId },
        select: { message: true },
      });
      const seen = new Set(existing.map(log => log.message));

      for (const job of jobs) {
        for (const step of job.steps || []) {
          if (step.status !== 'completed') continue;
          const message = `${job.name} / ${step.name}: ${step.conclusion}`;
          if (seen.has(message)) continue;

          await this.addLog(
            deploymentId,
            step.conclusion === 'success' ? 'INFO' : 'ERROR',
            message,
            step.completed_at ? new Date(step.completed_at) : new Date(),
          );
        }
      }
    } catch (error: any) {
      // Jobs may not exist yet immediately after dispatch - non-fatal.
      this.logger.debug(
        `No job data yet for run ${runId}: ${error?.response?.data?.message || error.message}`,
      );
    }
  }
}
