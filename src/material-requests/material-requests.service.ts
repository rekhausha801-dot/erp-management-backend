import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { generateCode } from '../common/utils/code-generator.util';
import {
  buildPaginatedResponse,
  buildPaginationQuery,
} from '../common/utils/pagination.util';
import { CreateMaterialRequestDto } from './dto/create-material-request.dto';
import { QueryMaterialRequestDto } from './dto/query-material-request.dto';
import { UpdateMaterialRequestDto } from './dto/update-material-request.dto';

@Injectable()
export class MaterialRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateMaterialRequestDto) {
    return this.prisma.materialRequest.create({
      data: {
        companyId,
        requestNumber: generateCode('MR'),
        requestDate: new Date(dto.requestDate),
        requestedById: dto.requestedById,
        priority: dto.priority,
        requiredDate: dto.requiredDate ? new Date(dto.requiredDate) : undefined,
        department: dto.department,
        purpose: dto.purpose,
        items: {
          create: dto.items.map((item) => ({
            itemId: item.itemId,
            description: item.description,
            requestedQty: item.requestedQty,
            unit: item.unit ?? 'PCS',
          })),
        },
      },
      include: { items: true, requester: true },
    });
  }

  async findAll(companyId: string, query: QueryMaterialRequestDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.MaterialRequestWhereInput = {
      companyId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { requestNumber: { contains: query.search, mode: 'insensitive' } },
              { purpose: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.materialRequest.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { items: true, requester: true },
      }),
      this.prisma.materialRequest.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const mr = await this.prisma.materialRequest.findFirst({
      where: { id, companyId },
      include: { items: true, requester: true },
    });
    if (!mr) {
      throw new NotFoundException('Material request not found');
    }
    return mr;
  }

  async update(companyId: string, id: string, dto: UpdateMaterialRequestDto) {
    await this.findOne(companyId, id);
    return this.prisma.materialRequest.update({
      where: { id },
      data: {
        status: dto.status,
        approvedAt:
          dto.status === OrderStatus.CONFIRMED ? new Date() : undefined,
      },
      include: { items: true },
    });
  }
}
