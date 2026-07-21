import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TriggerDeploymentDto } from './dto/trigger-deployment.dto';

@Injectable()
export class DeploymentsService {
  private readonly logger = new Logger(DeploymentsService.name);

  constructor(private prisma: PrismaService) {}

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
    });

    if (!environment) {
      throw new NotFoundException(
        'Project or production environment not found',
      );
    }

    const commitSha = crypto.randomBytes(20).toString('hex');

    const deployment = await this.prisma.deployment.create({
      data: {
        environmentId: environment.id,
        triggeredById: userId,
        commitSha,
        commitMessage: dto.commitMessage || 'Manual deployment',
        branch: dto.branch || 'main',
        status: 'QUEUED',
      },
    });

    await this.addLog(
      deployment.id,
      'INFO',
      `Deployment queued for ${deployment.branch}@${commitSha.slice(0, 7)}`,
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

  @Interval(3000)
  async advanceDeployments() {
    const now = new Date();

    const queued = await this.prisma.deployment.findMany({
      where: {
        status: 'QUEUED',
        createdAt: {
          lte: new Date(now.getTime() - 2000),
        },
      },
    });

    for (const deployment of queued) {
      await this.prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: 'RUNNING',
          startedAt: now,
        },
      });

      await this.addLog(
        deployment.id,
        'INFO',
        'Cloning repository...',
        new Date(now.getTime() + 100),
      );
      await this.addLog(
        deployment.id,
        'INFO',
        'Installing dependencies...',
        new Date(now.getTime() + 400),
      );
      await this.addLog(
        deployment.id,
        'INFO',
        'Running build...',
        new Date(now.getTime() + 800),
      );
    }

    const running = await this.prisma.deployment.findMany({
      where: {
        status: 'RUNNING',
        startedAt: {
          lte: new Date(now.getTime() - 8000),
        },
      },
    });

    for (const deployment of running) {
      const succeeded = Math.random() > 0.1;
      const finishedAt = now;
      const duration = deployment.startedAt
        ? Math.round(
            (finishedAt.getTime() - deployment.startedAt.getTime()) / 1000,
          )
        : null;

      await this.prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: succeeded ? 'SUCCESS' : 'FAILED',
          finishedAt,
          duration,
        },
      });

      if (succeeded) {
        await this.addLog(
          deployment.id,
          'INFO',
          'Build completed successfully',
          finishedAt,
        );
        await this.addLog(
          deployment.id,
          'INFO',
          'Deployment is now live',
          new Date(finishedAt.getTime() + 100),
        );
      } else {
        await this.addLog(
          deployment.id,
          'ERROR',
          'Build failed: process exited with code 1',
          finishedAt,
        );
        await this.addLog(
          deployment.id,
          'WARNING',
          'Rolling back to previous deployment',
          new Date(finishedAt.getTime() + 100),
        );
      }

      this.logger.log(
        `Deployment ${deployment.id} -> ${succeeded ? 'SUCCESS' : 'FAILED'}`,
      );
    }
  }
}