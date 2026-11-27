import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto, CreateChatMessageDto } from './dto/create-chat.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createChat(companyId: string, userId: string, dto: CreateChatDto) {
    const uniqueParticipants = Array.from(
      new Set([userId, ...dto.participantIds]),
    );

    return this.prisma.chat.create({
      data: {
        companyId,
        name: dto.name,
        isGroup: dto.isGroup ?? uniqueParticipants.length > 2,
        participants: {
          create: uniqueParticipants.map((pid) => ({
            userId: pid,
            isAdmin: pid === userId,
          })),
        },
      },
      include: { participants: { include: { user: true } } },
    });
  }

  async findMyChats(companyId: string, userId: string) {
    return this.prisma.chat.findMany({
      where: {
        companyId,
        participants: { some: { userId, leftAt: null } },
      },
      include: {
        participants: { include: { user: true } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async sendMessage(
    companyId: string,
    chatId: string,
    userId: string,
    dto: CreateChatMessageDto,
  ) {
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, companyId },
      include: { participants: true },
    });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    const isMember = chat.participants.some((p) => p.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    return this.prisma.chatMessage.create({
      data: {
        chatId,
        senderId: userId,
        message: dto.message,
        messageType: dto.messageType ?? 'TEXT',
      },
      include: { sender: true },
    });
  }

  async getMessages(companyId: string, chatId: string, userId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, companyId },
      include: { participants: true },
    });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    const isMember = chat.participants.some((p) => p.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    return this.prisma.chatMessage.findMany({
      where: { chatId, deletedAt: null },
      include: { sender: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}
