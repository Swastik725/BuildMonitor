import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ListMetricsQueryDto } from './dto/list-metrics.query';

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

  constructor(private readonly prisma: PrismaService) {}

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
    const environments = await this.prisma.environment.findMany({
      include: {
        deployments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    const now = new Date();

    for (const environment of environments) {
      const deployment = environment.deployments[0];
      if (!deployment || deployment.status === 'CANCELLED') {
        continue;
      }

      const metrics = this.buildMetrics(deployment.id, now);
      if (!metrics.length) {
        continue;
      }

      await this.prisma.metric.createMany({
        data: metrics,
      });
    }

    this.logger.debug(`Recorded metrics for ${environments.length} environment(s)`);
  }

  private buildMetrics(
    deploymentId: string,
    timestamp: Date,
  ) {
    const spike = Math.random() < 0.08 ? 1.7 + Math.random() * 1.2 : 1;
    const noise = () => 0.85 + Math.random() * 0.3;

    const point = (metricType: MetricType, value: number) => ({
      deploymentId,
      metricType,
      value: Number(value.toFixed(2)),
      recordedAt: timestamp,
    });

    return [
      point('CPU', Math.min(99, 28 + Math.random() * 30 * noise() * spike)),
      point('MEMORY', Math.min(99, 34 + Math.random() * 26 * noise() * spike)),
      point('LATENCY', Math.min(1800, 90 + Math.random() * 240 * noise() * spike)),
      point('NETWORK', Math.min(1000, 180 + Math.random() * 220 * noise())),
      point('DISK', Math.min(100, 24 + Math.random() * 22 * noise())),
      point('REQUESTS', Math.min(5000, 120 + Math.random() * 900 * noise() * spike)),
      point('ERROR_RATE', Math.min(24, Math.random() * 1.8 * spike)),
    ];
  }
}
