import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  list(userId: string, resolved = false) {
    return this.prisma.alert.findMany({
      where: {
        resolved,
        organization: { members: { some: { userId } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { project: { select: { name: true, slug: true } } },
    });
  }

  async resolve(id: string, userId: string) {
    const alert = await this.prisma.alert.findFirst({
      where: { id, organization: { members: { some: { userId } } } },
      include: { project: { select: { name: true, organizationId: true } } },
    });
    if (!alert) throw new NotFoundException('Alert not found');
    if (alert.resolved) return alert;

    const resolved = await this.prisma.alert.update({
      where: { id },
      data: { resolved: true },
      include: { project: { select: { name: true, slug: true } } },
    });
    await this.resolveIncident(alert.projectId, alert.title);
    await this.notifications.createForOrganization(alert.organizationId, {
      title: 'Alert resolved',
      message: `${alert.project.name}: ${alert.title}`,
      type: 'ALERT',
    });
    return resolved;
  }

  @Interval(5000)
  async evaluate() {
    const projects = await this.prisma.project.findMany({
      where: { deletedAt: null },
      include: {
        environments: {
          include: {
            deployments: { orderBy: { createdAt: 'desc' }, take: 1 },
            healthChecks: { orderBy: { checkedAt: 'desc' }, take: 1 },
          },
        },
      },
    });

    for (const project of projects) {
      for (const environment of project.environments) {
        const deployment = environment.deployments[0];
        if (deployment?.status === 'FAILED') {
          await this.raise(project.id, project.organizationId, 'HIGH', 'Deployment failed', `${project.name} has a failed deployment in ${environment.name}.`, false);
        } else {
          await this.resolveByTitle(project.id, 'Deployment failed');
        }

        const health = environment.healthChecks[0];
        if (health && health.status !== 'UP') {
          await this.raise(project.id, project.organizationId, 'CRITICAL', 'Health check failed', `${project.name} is unhealthy in ${environment.name}: ${health.message || 'the endpoint did not meet the expected conditions'}.`, false);
        } else if (health?.status === 'UP') {
          await this.resolveByTitle(project.id, 'Health check failed');
        }

        const latestMetrics = await this.prisma.metric.findMany({
          where: { deployment: { environmentId: environment.id } },
          orderBy: { recordedAt: 'desc' },
          distinct: ['metricType'],
        });
        const thresholds: Record<string, { value: number; severity: Severity }> = {
          CPU: { value: 85, severity: 'HIGH' },
          MEMORY: { value: 90, severity: 'HIGH' },
          LATENCY: { value: 800, severity: 'MEDIUM' },
          ERROR_RATE: { value: 5, severity: 'CRITICAL' },
        };
        for (const metric of latestMetrics) {
          const threshold = thresholds[metric.metricType];
          if (!threshold) continue;
          const title = `${metric.metricType} threshold breached`;
          if (metric.value >= threshold.value) {
            await this.raise(project.id, project.organizationId, threshold.severity, title, `${project.name} ${metric.metricType.toLowerCase()} is ${metric.value}, above the ${threshold.value} threshold in ${environment.name}.`, true);
          } else {
            await this.resolveByTitle(project.id, title);
          }
        }
      }
    }
  }

  private async raise(projectId: string, organizationId: string, severity: Severity, title: string, description: string, autoResolve: boolean) {
    const existing = await this.prisma.alert.findFirst({ where: { projectId, title, resolved: false } });
    if (existing) return existing;
    const alert = await this.prisma.alert.create({ data: { projectId, organizationId, severity, title, description } });
    await this.prisma.incident.create({ data: { projectId, title } });
    await this.notifications.createForOrganization(organizationId, { title: 'Alert triggered', message: description, type: 'ALERT' });
    this.logger.warn(`${title} for project ${projectId}`);
    return alert;
  }

  private async resolveByTitle(projectId: string, title: string) {
    const alert = await this.prisma.alert.findFirst({ where: { projectId, title, resolved: false }, include: { project: { select: { name: true, organizationId: true } } } });
    if (!alert) return;
    await this.prisma.alert.update({ where: { id: alert.id }, data: { resolved: true } });
    await this.resolveIncident(projectId, title);
    await this.notifications.createForOrganization(alert.organizationId, { title: 'Alert resolved', message: `${alert.project.name}: ${title}`, type: 'ALERT' });
  }

  private async resolveIncident(projectId: string, title: string) {
    await this.prisma.incident.updateMany({ where: { projectId, title, status: { in: ['OPEN', 'INVESTIGATING'] } }, data: { status: 'RESOLVED', resolvedAt: new Date() } });
  }
}
