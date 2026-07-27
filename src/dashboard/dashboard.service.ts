import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const [
      projects,
      deployments,
      runningDeployments,
      successfulDeployments,
      failedDeployments,
      recentDeployments,
    ] = await Promise.all([
      this.prisma.project.count({
        where: {
          organization: {
            members: {
              some: { userId },
            },
          },
        },
      }),

      this.prisma.deployment.count({
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
      }),

      this.prisma.deployment.count({
        where: {
          status: 'RUNNING',
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
      }),

      this.prisma.deployment.count({
        where: {
          status: 'SUCCESS',
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
      }),

      this.prisma.deployment.count({
        where: {
          status: 'FAILED',
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
      }),

      this.prisma.deployment.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
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
        include: {
          environment: {
            include: {
              project: true,
            },
          },
          triggeredBy: {
            select: {
              fullName: true,
              username: true,
            },
          },
        },
      }),
    ]);

    const successRate =
      deployments === 0
        ? 0
        : Math.round((successfulDeployments / deployments) * 100);

    return {
      overview: {
        projects,
        deployments,
        runningDeployments,
        successfulDeployments,
        failedDeployments,
        successRate,
      },

      recentDeployments,
    };
  }
}