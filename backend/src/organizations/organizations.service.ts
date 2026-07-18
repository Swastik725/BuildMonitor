import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';


@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateOrganizationDto) {
    return this.prisma.organization.create({ data: dto });
  }

  findAll() {
    return this.prisma.organization.findMany();
  }

  findOne(id: string) {
    return this.prisma.organization.findUnique({ where: { id } });
  }

  findMembers(organizationId: string) {
  return this.prisma.organizationMember.findMany({
    where: { organizationId },
    include: { user: { select: { id: true, fullName: true, username: true, email: true, avatarUrl: true } } },
  });
}
}

