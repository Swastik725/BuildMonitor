import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TriggerDeploymentDto } from './dto/trigger-deployment.dto';

@Injectable()
export class DeploymentsService {
  private readonly logger = new Logger(DeploymentsService.name);

  constructor(private prisma: PrismaService) {}

  async trigger(projectId: string, userId: string, dto: TriggerDeploymentDto) {
    const environment = await this.prisma.environment.findFirst({
      where: { projectId, environmentType: 'PRODUCTION' },
    });
    if (!environment) {
      throw new NotFoundException('No production environment found for this project');
    }

    const commitSha = crypto.randomBytes(20).toString('hex');

    return this.prisma.deployment.create({
      data: {
        environmentId: environment.id,
        triggeredById: userId,
        commitSha,
        commitMessage: dto.commitMessage || 'Manual deployment',
        branch: dto.branch || 'main',
        status: 'QUEUED',
      },
    });
  }

  findAllByProject(projectId: string) {
    return this.prisma.deployment.findMany({
      where: { environment: { projectId } },
      orderBy: { createdAt: 'desc' },
      include: { triggeredBy: { select: { id: true, fullName: true, username: true } } },
    });
  }

  async findOne(id: string) {
    const deployment = await this.prisma.deployment.findUnique({
      where: { id },
      include: {
        triggeredBy: { select: { id: true, fullName: true, username: true } },
        environment: { include: { project: true } },
      },
    });
    if (!deployment) throw new NotFoundException('Deployment not found');
    return deployment;
  }

  // Simulated deployment lifecycle — runs every 3s, advances any deployment
  // that's been sitting in QUEUED or RUNNING long enough to the next stage.
  @Interval(3000)
  async advanceDeployments() {
    const now = new Date();

    // QUEUED -> RUNNING after ~2s
    const queued = await this.prisma.deployment.findMany({
      where: {
        status: 'QUEUED',
        createdAt: { lte: new Date(now.getTime() - 2000) },
      },
    });
    for (const dep of queued) {
      await this.prisma.deployment.update({
        where: { id: dep.id },
        data: { status: 'RUNNING', startedAt: now },
      });
      this.logger.log(`Deployment ${dep.id} -> RUNNING`);
    }

    // RUNNING -> SUCCESS/FAILED after ~8-12s of running
    const running = await this.prisma.deployment.findMany({
      where: {
        status: 'RUNNING',
        startedAt: { lte: new Date(now.getTime() - 8000) },
      },
    });
    for (const dep of running) {
      const succeeded = Math.random() > 0.1; // 90% success rate
      const finishedAt = now;
      const duration = dep.startedAt
        ? Math.round((finishedAt.getTime() - dep.startedAt.getTime()) / 1000)
        : null;

      await this.prisma.deployment.update({
        where: { id: dep.id },
        data: {
          status: succeeded ? 'SUCCESS' : 'FAILED',
          finishedAt,
          duration,
        },
      });
      this.logger.log(`Deployment ${dep.id} -> ${succeeded ? 'SUCCESS' : 'FAILED'}`);
    }
  }
}