import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrganization(userId: string, name: string) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    return this.prisma.organization.create({
      data: {
        name,
        slug,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  async getMyOrganizations(userId: string) {
    return this.prisma.organizationMember.findMany({
      where: {
        userId,
      },
      include: {
        organization: true,
      },
    });
  }
}