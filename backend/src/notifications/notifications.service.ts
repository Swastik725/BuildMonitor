import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type NotificationType = 'DEPLOYMENT' | 'INCIDENT';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  countUnread(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  async markRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
      select: { id: true },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async createForUsers(
    userIds: string[],
    payload: {
      title: string;
      message: string;
      type: NotificationType;
    },
  ) {
    const uniqueUserIds = [...new Set(userIds.filter(Boolean))];

    if (!uniqueUserIds.length) {
      return [];
    }

    return this.prisma.notification.createMany({
      data: uniqueUserIds.map(userId => ({
        userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
      })),
    });
  }

  async createForOrganization(
    organizationId: string,
    payload: {
      title: string;
      message: string;
      type: NotificationType;
    },
  ) {
    const members = await this.prisma.organizationMember.findMany({
      where: { organizationId },
      select: { userId: true },
    });

    return this.createForUsers(
      members.map(member => member.userId),
      payload,
    );
  }
}
