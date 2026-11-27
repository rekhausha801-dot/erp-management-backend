import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma, Priority, WorkOrderStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PrismaService } from '../../../prisma/prisma.service';
import { generateCode } from '../../../common/utils/code-generator.util';
import {
  buildPaginatedResponse,
  buildPaginationQuery,
} from '../../../common/utils/pagination.util';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreateWorkOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serviceRequestId?: string;

  @ApiProperty({ example: '2026-11-26' })
  @IsDateString()
  @IsNotEmpty()
  orderDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional({ enum: Priority, default: Priority.MEDIUM })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  laborCost?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  materialCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateWorkOrderDto) {
    const laborCost = dto.laborCost ?? 0;
    const materialCost = dto.materialCost ?? 0;
    const totalCost = laborCost + materialCost;

    return this.prisma.workOrder.create({
      data: {
        companyId,
        serviceRequestId: dto.serviceRequestId,
        orderNumber: generateCode('WO'),
        orderDate: new Date(dto.orderDate),
        scheduledDate: dto.scheduledDate
          ? new Date(dto.scheduledDate)
          : undefined,
        priority: dto.priority ?? Priority.MEDIUM,
        description: dto.description,
        estimatedHours: dto.estimatedHours,
        laborCost,
        materialCost,
        totalCost,
        notes: dto.notes,
      },
      include: { serviceRequest: true },
    });
  }

  async findAll(companyId: string, query: PaginationDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.WorkOrderWhereInput = {
      companyId,
      ...(query.search
        ? {
            OR: [
              { orderNumber: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { serviceRequest: true, workProgress: true },
      }),
      this.prisma.workOrder.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const order = await this.prisma.workOrder.findFirst({
      where: { id, companyId },
      include: { serviceRequest: true, workProgress: true },
    });
    if (!order) {
      throw new NotFoundException('Work order not found');
    }
    return order;
  }

  async updateStatus(companyId: string, id: string, status: WorkOrderStatus) {
    await this.findOne(companyId, id);
    return this.prisma.workOrder.update({
      where: { id },
      data: {
        status,
        completedDate:
          status === WorkOrderStatus.COMPLETED ? new Date() : undefined,
      },
    });
  }
}
