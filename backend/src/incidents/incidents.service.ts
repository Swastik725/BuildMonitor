import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Injectable()
export class IncidentsService {
  constructor(private prisma: PrismaService) {}

  private async ensureProjectAccess(projectId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        organization: {
          members: {
            some: { userId },
          },
        },
      },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }

  async create(
    projectId: string,
    userId: string,
    dto: CreateIncidentDto,
  ) {
    await this.ensureProjectAccess(projectId, userId);

    return this.prisma.incident.create({
      data: {
        projectId,
        title: dto.title,
      },
    });
  }

  findAllOpen(userId: string) {
    return this.prisma.incident.findMany({
      where: {
        status: {
          in: ['OPEN', 'INVESTIGATING'],
        },
        project: {
          organization: {
            members: {
              some: { userId },
            },
          },
        },
      },
      orderBy: {
        openedAt: 'desc',
      },
      include: {
        project: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async findAllByProject(projectId: string, userId: string) {
    await this.ensureProjectAccess(projectId, userId);

    return this.prisma.incident.findMany({
      where: { projectId },
      orderBy: {
        openedAt: 'desc',
      },
    });
  }

  async resolve(id: string, userId: string) {
    const incident = await this.prisma.incident.findFirst({
      where: {
        id,
        project: {
          organization: {
            members: {
              some: { userId },
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    return this.prisma.incident.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
    });
  }
}