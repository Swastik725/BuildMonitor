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
    },
  });

  if (!project) {
    throw new NotFoundException('Project not found');
  }

  if (project.repository) {
    await this.prisma.repository.delete({
      where: { projectId: id },
    });
  }

  await this.prisma.project.delete({
    where: { id },
  });

  return {
    message: 'Project deleted successfully',
  };
}
}
