import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import * as os from 'os';
import * as fs from 'fs';
import { PrismaService } from '../prisma/prisma.service';
import { ListMetricsQueryDto } from './dto/list-metrics.query';
import { RequestTrackerService } from './request-tracker.service';

const METRIC_TYPES = [
  'CPU',
  'MEMORY',
  'LATENCY',
  'NETWORK',
  'DISK',
  'REQUESTS',
  'ERROR_RATE',
] as const;

type MetricType = (typeof METRIC_TYPES)[number];

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  // Baseline for computing this process's CPU usage delta between ticks.
  private lastCpuUsage = process.cpuUsage();
  private lastCpuSampleAt = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly requestTracker: RequestTrackerService,
  ) {}

  /**
   * Manual, on-demand metrics snapshot for one project - bypasses
   * monitoringEnabled since an explicit request should always run, even
   * for a project not yet marked ready for the background collector.
   */
  async collectNow(projectId: string, userId: string) {
    const environments = await this.prisma.environment.findMany({
      where: {
        project: {
          id: projectId,
          organization: { members: { some: { userId } } },
        },
      },
      include: {
        deployments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, status: true },
        },
        healthChecks: {
          orderBy: { checkedAt: 'desc' },
          take: 5,
          select: { responseTime: true },
        },
      },
    });

    if (environments.length === 0) {
      throw new NotFoundException('Project not found or has no environments');
    }

    const now = new Date();
    const system = this.captureSystemStats();
    const traffic = this.requestTracker.snapshotAndReset();
    const errorRate =
      traffic.requestCount > 0
        ? (traffic.errorCount / traffic.requestCount) * 100
        : 0;

    const recordedFor: string[] = [];

    for (const environment of environments) {
      const deployment = environment.deployments[0];
      if (!deployment) continue;

      const healthLatencies = environment.healthChecks
        .map(check => check.responseTime)
        .filter((value): value is number => typeof value === 'number');
      const latency =
        healthLatencies.length > 0
          ? healthLatencies.reduce((sum, value) => sum + value, 0) /
            healthLatencies.length
          : traffic.avgDurationMs;

      const point = (metricType: MetricType, value: number) => ({
        deploymentId: deployment.id,
        metricType,
        value: Number(value.toFixed(2)),
        recordedAt: now,
      });

      await this.prisma.metric.createMany({
        data: [
          point('CPU', system.cpuPercent),
          point('MEMORY', system.memoryPercent),
          point('DISK', system.diskPercent),
          point('NETWORK', traffic.requestCount),
          point('REQUESTS', traffic.requestCount),
          point('LATENCY', latency),
          point('ERROR_RATE', errorRate),
        ],
      });

      recordedFor.push(environment.id);
    }

    return { recordedFor, capturedAt: now };
  }

  async findByEnvironment(
    environmentId: string,
    userId: string,
    query: ListMetricsQueryDto,
  ) {
    const environment = await this.prisma.environment.findFirst({
      where: {
        id: environmentId,
        project: {
          organization: {
            members: {
              some: { userId },
            },
          },
        },
      },
      select: { id: true },
    });

    if (!environment) {
      return [];
    }

    const where: {
      deployment: { environmentId: string };
      metricType?: MetricType;
      recordedAt?: { gte?: Date; lte?: Date };
    } = {
      deployment: { environmentId: environment.id },
    };

    if (query.type && METRIC_TYPES.includes(query.type as MetricType)) {
      where.metricType = query.type as MetricType;
    }

    const from = query.from ? new Date(query.from) : null;
    const to = query.to ? new Date(query.to) : null;

    if (from || to) {
      where.recordedAt = {
        ...(from && !Number.isNaN(from.getTime()) ? { gte: from } : {}),
        ...(to && !Number.isNaN(to.getTime()) ? { lte: to } : {}),
      };
    }

    const limit = Number.parseInt(query.limit || '240', 10);

    return this.prisma.metric.findMany({
      where,
      orderBy: { recordedAt: 'asc' },
      take: Number.isFinite(limit) && limit > 0 ? limit : 240,
    });
  }

  @Interval(5000)
  async recordMetrics() {
    let environments;
    try {
      environments = await this.prisma.environment.findMany({
        where: { project: { monitoringEnabled: true } },
        include: {
          project: { select: { monitoringEnabled: true } },
          deployments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              status: true,
            },
          },
          healthChecks: {
            orderBy: { checkedAt: 'desc' },
            take: 5,
            select: { responseTime: true },
          },
        },
      });
    } catch (error) {
      this.logger.warn(
        `Skipping metric collection because the database is unavailable: ${(error as Error).message}`,
      );
      return;
    }

    const now = new Date();
    const system = this.captureSystemStats();
    const traffic = this.requestTracker.snapshotAndReset();
    const errorRate =
      traffic.requestCount > 0
        ? (traffic.errorCount / traffic.requestCount) * 100
        : 0;

    let recorded = 0;

    for (const environment of environments) {
      const deployment = environment.deployments[0];
      if (!deployment || deployment.status === 'CANCELLED') {
        continue;
      }

      // Prefer real health-check latency for this environment; fall back to
      // this instance's own request latency if no health check has run yet.
      const healthLatencies = environment.healthChecks
        .map(check => check.responseTime)
        .filter((value): value is number => typeof value === 'number');
      const latency =
        healthLatencies.length > 0
          ? healthLatencies.reduce((sum, value) => sum + value, 0) /
            healthLatencies.length
          : traffic.avgDurationMs;

      const point = (metricType: MetricType, value: number) => ({
        deploymentId: deployment.id,
        metricType,
        value: Number(value.toFixed(2)),
        recordedAt: now,
      });

      await this.prisma.metric.createMany({
        data: [
          point('CPU', system.cpuPercent),
          point('MEMORY', system.memoryPercent),
          point('DISK', system.diskPercent),
          point('NETWORK', traffic.requestCount),
          point('REQUESTS', traffic.requestCount),
          point('LATENCY', latency),
          point('ERROR_RATE', errorRate),
        ],
      });

      recorded += 1;
    }

    this.logger.debug(`Recorded metrics for ${recorded} environment(s)`);
  }

  /**
   * Real, non-simulated resource usage for the BuildMonitor process/host
   * itself: process CPU% since the last sample, process RSS as a share of
   * total system memory, and root filesystem usage. This is genuine data
   * about the running instance, not a stand-in per monitored environment.
   */
  private captureSystemStats() {
    const elapsedMs = Date.now() - this.lastCpuSampleAt;
    const usage = process.cpuUsage(this.lastCpuUsage);
    this.lastCpuUsage = process.cpuUsage();
    this.lastCpuSampleAt = Date.now();

    const cpuCount = os.cpus().length || 1;
    const usedMicros = usage.user + usage.system;
    const cpuPercent =
      elapsedMs > 0
        ? Math.min(100, (usedMicros / 1000 / (elapsedMs * cpuCount)) * 100)
        : 0;

    const memoryPercent = Math.min(
      100,
      (process.memoryUsage().rss / os.totalmem()) * 100,
    );

    let diskPercent = 0;
    try {
      // statfsSync is available on Node 18.15+/20+. Falls back to 0 if the
      // platform or Node version doesn't support it rather than fabricating
      // a number.
      const stats = (fs as any).statfsSync?.('/');
      if (stats && stats.blocks > 0) {
        diskPercent = ((stats.blocks - stats.bfree) / stats.blocks) * 100;
      }
    } catch {
      diskPercent = 0;
    }

    return { cpuPercent, memoryPercent, diskPercent };
  }
}
