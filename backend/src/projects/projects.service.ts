import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({ data: dto });
  }

  findAll(organizationId: string) {
    return this.prisma.project.findMany({ where: { organizationId } });
  }

  findOne(id: string) {
    return this.prisma.project.findUnique({ where: { id } });
  }
}