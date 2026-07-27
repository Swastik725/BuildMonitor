import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Injectable()
export class IncidentsService {
  constructor(
    private prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

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
      select: {
        id: true,
        name: true,
        organizationId: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async create(
    projectId: string,
    userId: string,
    dto: CreateIncidentDto,
  ) {
    const project = await this.ensureProjectAccess(projectId, userId);

    const incident = await this.prisma.incident.create({
      data: {
        projectId,
        title: dto.title,
      },
    });

    await this.notificationsService.createForOrganization(
      project.organizationId,
      {
        title: 'Incident opened',
        message: `${project.name}: ${dto.title}`,
        type: 'INCIDENT',
      },
    );

    return incident;
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
        title: true,
        project: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
      },
    });

    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    const resolved = await this.prisma.incident.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
    });

    await this.notificationsService.createForOrganization(
      incident.project.organizationId,
      {
        title: 'Incident resolved',
        message: `${incident.project.name}: ${incident.title}`,
        type: 'INCIDENT',
      },
    );

    return resolved;
  }
}
