import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateServiceCategoryDto } from '../../dto/create-service.dto';
import { UpdateServiceCategoryDto } from '../../dto/update-service.dto';

@Injectable()
export class ServiceCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateServiceCategoryDto) {
    const existing = await this.prisma.serviceCategory.findUnique({
      where: { companyId_name: { companyId, name: dto.name } },
    });
    if (existing) {
      throw new ConflictException('Service category already exists');
    }
    return this.prisma.serviceCategory.create({
      data: { companyId, ...dto },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.serviceCategory.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const category = await this.prisma.serviceCategory.findFirst({
      where: { id, companyId },
    });
    if (!category) {
      throw new NotFoundException('Service category not found');
    }
    return category;
  }

  async update(companyId: string, id: string, dto: UpdateServiceCategoryDto) {
    await this.findOne(companyId, id);
    return this.prisma.serviceCategory.update({
      where: { id },
      data: dto,
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.serviceCategory.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
