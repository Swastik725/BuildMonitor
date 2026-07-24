import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';

import { PrismaService } from '../prisma/prisma.service';
import { measureLatency } from './utils/latency';
import { parseHealthError, parseHealthResponse } from './utils/response-parser';

@Injectable()
export class HealthChecksService {
  private readonly logger = new Logger(HealthChecksService.name);

  constructor(
    private prisma: PrismaService,
    private http: HttpService,
  ) {}

  async runChecks() {
    // Health config (healthUrl, timeout, expectedStatus, ...) lives on Project,
    // but HealthCheck rows are stored per Environment - so pull each environment
    // together with its parent project's config in one query.
    const environments = await this.prisma.environment.findMany({
      include: { project: true },
    });

    for (const env of environments) {
      const project = env.project;

      // Skip environments whose project has health checks turned off or
      // never configured a URL to hit - nothing to actually check yet.
      if (!project.healthEnabled || !project.healthUrl) {
        continue;
      }

      await this.checkOne(env.id, project);
    }
  }

  private async checkOne(
    environmentId: string,
    project: {
      healthUrl: string | null;
      timeout: number;
      expectedStatus: number;
      expectedBody: string | null;
    },
  ) {
    const timeoutMs = project.timeout ?? 5000;

    try {
      const { result: response, durationMs } = await measureLatency(() =>
        this.http.axiosRef.get(project.healthUrl as string, {
          timeout: timeoutMs,
          // Don't let axios throw on non-2xx - we want to inspect the
          // status code ourselves (e.g. expectedStatus might be 404 on purpose).
          validateStatus: () => true,
        }),
      );

      const verdict = parseHealthResponse({
        response,
        expectedStatus: project.expectedStatus,
        expectedBody: project.expectedBody,
        durationMs,
        timeoutMs,
      });

      await this.prisma.healthCheck.create({
        data: {
          environmentId,
          status: verdict.status,
          statusCode: verdict.statusCode,
          responseTime: durationMs,
          message: verdict.message,
          checkedAt: new Date(),
        },
      });
    } catch (error) {
      // axios throws here only for things like DNS failure / connection
      // refused / our own timeout firing - i.e. the request never completed.
      const verdict = parseHealthError(error as AxiosError);

      this.logger.warn(
        `Health check failed for environment ${environmentId}: ${verdict.message}`,
      );

      await this.prisma.healthCheck.create({
        data: {
          environmentId,
          status: verdict.status,
          statusCode: verdict.statusCode,
          responseTime: timeoutMs,
          message: verdict.message,
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

  // responseTime is nullable in the schema (Int?), so guard against it even
  // though our own runChecks() always sets it - other writers/tests might not.
  const avgResponseTime = Math.round(
    recent.reduce((sum, check) => sum + (check.responseTime ?? 0), 0) /
      recent.length,
  );

  return {
    uptimePercentage: Math.round((upCount / recent.length) * 1000) / 10,
    totalChecks: recent.length,
    avgResponseTime,
  };
}
}