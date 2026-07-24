import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';


@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  private async ensureMember(organizationId: string, userId: string) {
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Organization not found');
    }

    return membership;
  }

  private async ensureOwner(organizationId: string, userId: string) {
    const membership = await this.ensureMember(organizationId, userId);

    if (membership.role !== 'OWNER') {
      throw new ForbiddenException(
        'Only an organization owner can perform this action',
      );
    }
  }


  create(dto: CreateOrganizationDto, userId: string) {
    return this.prisma.organization.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.organization.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    await this.ensureMember(id, userId);

    return this.prisma.organization.findUnique({
      where: { id },
    });
  }

  async findMembers(organizationId: string, userId: string) {
    await this.ensureMember(organizationId, userId);

    return this.prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            avatarUrl: true,
            lastLogin: true,
          },
        },
      },
    });
  }
  async updateMemberRole(
  organizationId: string,
  requestingUserId: string,
  memberUserId: string,
  role: 'OWNER' | 'ADMIN' | 'MEMBER',
) {
  await this.ensureOwner(organizationId, requestingUserId);

  const member = await this.prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: memberUserId,
        organizationId,
      },
    },
  });

  if (!member) {
    throw new NotFoundException('Member not found');
  }

  return this.prisma.organizationMember.update({
    where: {
      userId_organizationId: {
        userId: memberUserId,
        organizationId,
      },
    },
    data: {
      role,
    },
  });
}
async leaveOrganization(
  organizationId: string,
  userId: string,
) {
  const membership = await this.ensureMember(
    organizationId,
    userId,
  );

  if (membership.role === 'OWNER') {
    throw new BadRequestException(
      'Transfer ownership before leaving.',
    );
  }

  return this.prisma.organizationMember.delete({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
  });
}
async transferOwnership(
  organizationId: string,
  ownerId: string,
  newOwnerId: string,
) {
  await this.ensureOwner(organizationId, ownerId);

  const newOwner = await this.prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: newOwnerId,
        organizationId,
      },
    },
  });

  if (!newOwner) {
    throw new NotFoundException(
      'New owner must already be a member',
    );
  }

  await this.prisma.$transaction([
    this.prisma.organizationMember.update({
      where: {
        userId_organizationId: {
          userId: ownerId,
          organizationId,
        },
      },
      data: {
        role: 'ADMIN',
      },
    }),

    this.prisma.organizationMember.update({
      where: {
        userId_organizationId: {
          userId: newOwnerId,
          organizationId,
        },
      },
      data: {
        role: 'OWNER',
      },
    }),
  ]);

  return {
    message: 'Ownership transferred successfully',
  };
}

  async update(
    id: string,
    userId: string,
    data: { name?: string; slug?: string },
  ) {
    await this.ensureOwner(id, userId);

    return this.prisma.organization.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    await this.ensureOwner(id, userId);

    return this.prisma.organization.delete({
      where: { id },
    });
  }

  async addMember(
    organizationId: string,
    userId: string,
    email: string,
    role: 'ADMIN' | 'MEMBER' = 'MEMBER',
  ) {
    await this.ensureOwner(organizationId, userId);

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(
        'No account found with that email — they need to sign up first',
      );
    }

    const existing = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'This person is already a member',
      );
    }

    return this.prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            avatarUrl: true,
            lastLogin: true,
          },
        },
      },
    });
  }

  async removeMember(
    organizationId: string,
    requestingUserId: string,
    memberUserId: string,
  ) {
    await this.ensureOwner(organizationId, requestingUserId);

    if (requestingUserId === memberUserId) {
      throw new BadRequestException(
        'An owner cannot remove themselves from the organization',
      );
    }

    const member = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: memberUserId,
          organizationId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return this.prisma.organizationMember.delete({
      where: {
        userId_organizationId: {
          userId: memberUserId,
          organizationId,
        },
      },
    });
  }
}