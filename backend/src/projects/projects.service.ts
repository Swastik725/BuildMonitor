import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateProjectDto) {
    return this.prisma.$transaction(async tx => {
      const project = await tx.project.create({ data: dto });

      // Every project gets a default production environment so deployments
      // have somewhere to attach to — no separate environment-management UI for the MVP.
      await tx.environment.create({
        data: {
          projectId: project.id,
          name: 'production',
          environmentType: 'PRODUCTION',
        },
      });

      return project;
    });
  }

  findAll(organizationId?: string) {
    return this.prisma.project.findMany({ where: { organizationId } });
  }

  findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: { environments: true },
    });
  }
}