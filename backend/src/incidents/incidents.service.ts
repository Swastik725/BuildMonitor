import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';

@Injectable()
export class IncidentsService {
  constructor(private prisma: PrismaService) {}

  create(projectId: string, dto: CreateIncidentDto) {
    return this.prisma.incident.create({
      data: { projectId, title: dto.title },
    });
  }

  // Used by the dashboard — recent open/investigating incidents across all projects
  findAllOpen() {
    return this.prisma.incident.findMany({
      where: { status: { in: ['OPEN', 'INVESTIGATING'] } },
      orderBy: { openedAt: 'desc' },
      include: { project: { select: { name: true, slug: true } } },
    });
  }

  findAllByProject(projectId: string) {
    return this.prisma.incident.findMany({
      where: { projectId },
      orderBy: { openedAt: 'desc' },
    });
  }

  async resolve(id: string) {
    const incident = await this.prisma.incident.findUnique({ where: { id } });
    if (!incident) throw new NotFoundException('Incident not found');

    return this.prisma.incident.update({
      where: { id },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    });
  }
}