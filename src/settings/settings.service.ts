import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(companyId: string) {
    const existing = await this.prisma.companySettings.findUnique({
      where: { companyId },
    });
    if (existing) {
      return existing;
    }
    return this.prisma.companySettings.create({
      data: { companyId },
    });
  }

  async updateSettings(companyId: string, dto: UpdateSettingsDto) {
    return this.prisma.companySettings.upsert({
      where: { companyId },
      update: dto,
      create: { companyId, ...dto },
    });
  }
}
