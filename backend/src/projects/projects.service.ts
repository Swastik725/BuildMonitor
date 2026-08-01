import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: string) {
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: dto.organizationId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You are not allowed to create a project in this organization',
      );
    }

    return this.prisma.$transaction(async tx => {
      const project = await tx.project.create({
        data: dto,
        include: {
          environments: true,
          repository: true,
        },
      });

      await tx.environment.create({
        data: {
          projectId: project.id,
          name: 'production',
          environmentType: 'PRODUCTION',
        },
      });

      return tx.project.findUnique({
        where: { id: project.id },
        include: {
          environments: true,
          repository: true,
        },
      });
    });
  }

  findAll(userId: string, organizationId?: string) {
    return this.prisma.project.findMany({
      where: {
        organization: {
          members: {
            some: { userId },
          },
          ...(organizationId ? { id: organizationId } : {}),
        },
      },
      include: {
        environments: true,
        repository: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        organization: {
          members: {
            some: { userId },
          },
        },
      },
      include: {
        environments: true,
        repository: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }
  async update(id: string, dto: Partial<CreateProjectDto>, userId: string) {
  const project = await this.prisma.project.findFirst({
    where: {
      id,
      organization: {
        members: {
          some: { userId },
        },
      },
    },
  });

  if (!project) {
    throw new NotFoundException('Project not found');
  }

  return this.prisma.project.update({
    where: { id },
    data: dto,
  });
}
  async remove(id: string, userId: string) {
  const project = await this.prisma.project.findFirst({
    where: {
      id,
      organization: {
        members: {
          some: { userId },
        },
      },
    },
    include: {
      repository: true,
      environments: true,
    },
  });

  if (!project) {
    throw new NotFoundException('Project not found');
  }

  // Every project's rows (environments/deployments/health checks/
  // incidents/alerts/repository) are FK-RESTRICTed to the project, so a
  // plain project.delete() 500s on anything but a completely empty
  // project — and every project gets a 'production' environment the
  // moment it's created, so that was effectively always. Clear the
  // dependents out in a transaction first, then delete the project.
  await this.prisma.$transaction(tx => this.cascadeDeleteProject(tx, project));

  return {
    message: 'Project deleted successfully',
  };
}

  /**
   * Deletes everything hanging off a project that the DB won't cascade
   * for us, then the project itself. Shared with OrganizationsService so
   * "delete organization" can clear out its projects the same way.
   */
  async cascadeDeleteProject(
    tx: any,
    project: { id: string; repository?: { id: string } | null; environments?: { id: string }[] },
  ) {
    const environmentIds =
      project.environments?.map(e => e.id) ??
      (await tx.environment.findMany({ where: { projectId: project.id }, select: { id: true } })).map(
        (e: { id: string }) => e.id,
      );

    if (environmentIds.length > 0) {
      // DeploymentLog + Metric cascade automatically off Deployment.
      await tx.deployment.deleteMany({ where: { environmentId: { in: environmentIds } } });
      // HealthCheck cascades automatically off Environment.
      await tx.environment.deleteMany({ where: { id: { in: environmentIds } } });
    }

    if (project.repository) {
      await tx.repository.delete({ where: { projectId: project.id } });
    }

    await tx.incident.deleteMany({ where: { projectId: project.id } });
    await tx.alert.deleteMany({ where: { projectId: project.id } });

    await tx.project.delete({ where: { id: project.id } });
  }
}
