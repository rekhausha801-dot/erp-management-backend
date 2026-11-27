import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildPaginatedResponse,
  buildPaginationQuery,
} from '../common/utils/pagination.util';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    companyId: string,
    senderId: string,
    dto: CreateNotificationDto,
  ) {
    return this.prisma.notification.create({
      data: {
        companyId,
        senderId,
        recipientId: dto.recipientId,
        title: dto.title,
        message: dto.message,
        type: dto.type ?? 'INFO',
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
      },
    });
  }

  async findMine(
    companyId: string,
    userId: string,
    query: QueryNotificationDto,
  ) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.NotificationWhereInput = {
      companyId,
      recipientId: userId,
      ...(query.isRead !== undefined ? { isRead: query.isRead } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({ where, skip, take, orderBy }),
      this.prisma.notification.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async markRead(companyId: string, userId: string, id: string) {
    const notif = await this.prisma.notification.findFirst({
      where: { id, companyId, recipientId: userId },
    });
    if (!notif) {
      throw new NotFoundException('Notification not found');
    }
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }
}
