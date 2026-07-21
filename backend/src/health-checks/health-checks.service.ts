import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthChecksService {
  private readonly logger = new Logger(HealthChecksService.name);

  constructor(private prisma: PrismaService) {}

  @Interval(15000)
  async runChecks() {
    const environments = await this.prisma.environment.findMany();

    for (const env of environments) {
      const roll = Math.random();
      let status: string;
      let responseTime: number;
      let statusCode: number;

      if (roll < 0.92) {
        status = 'UP';
        responseTime = Math.floor(Math.random() * 210) + 40; // 40-250ms
        statusCode = 200;
      } else if (roll < 0.97) {
        status = 'DEGRADED';
        responseTime = Math.floor(Math.random() * 1200) + 800; // 800-2000ms
        statusCode = 200;
      } else {
        status = 'DOWN';
        responseTime = 5000;
        statusCode = Math.random() > 0.5 ? 503 : 500;
      }

      await this.prisma.healthCheck.create({
        data: {
          environmentId: env.id,
          status,
          responseTime,
          statusCode,
          checkedAt: new Date(),
        },
      });
    }
  }

  findByProject(projectId: string, userId: string, limit = 50) {
  return this.prisma.healthCheck.findMany({
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
    orderBy: { checkedAt: 'desc' },
    take: limit,
  });
}

async getSummary(userId: string) {
  const recent = await this.prisma.healthCheck.findMany({
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
    orderBy: { checkedAt: 'desc' },
    take: 500,
  });

  if (recent.length === 0) {
    return {
      uptimePercentage: null,
      totalChecks: 0,
      avgResponseTime: null,
    };
  }

  const upCount = recent.filter(check => check.status === 'UP').length;

  const avgResponseTime = Math.round(
    recent.reduce((sum, check) => sum + check.responseTime, 0) /
      recent.length,
  );

  return {
    uptimePercentage: Math.round((upCount / recent.length) * 1000) / 10,
    totalChecks: recent.length,
    avgResponseTime,
  };
}
}