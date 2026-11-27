import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PrismaService } from '../../../prisma/prisma.service';
import { generateCode } from '../../../common/utils/code-generator.util';
import {
  buildPaginatedResponse,
  buildPaginationQuery,
} from '../../../common/utils/pagination.util';
import { computeLineItems } from '../../../common/utils/pricing.util';
import { SalesLineItemDto } from '../../dto/create-quotation.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreateSalesOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  quotationId?: string;

  @ApiProperty({ example: '2026-11-26' })
  @IsDateString()
  @IsNotEmpty()
  orderDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [SalesLineItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SalesLineItemDto)
  items: SalesLineItemDto[];
}

@Injectable()
export class SalesOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateSalesOrderDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, companyId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found in this company');
    }

    const { lineItems, subtotal, taxAmount, discount, total } =
      computeLineItems(dto.items);

    return this.prisma.salesOrder.create({
      data: {
        companyId,
        customerId: dto.customerId,
        quotationId: dto.quotationId,
        orderNumber: generateCode('SO'),
        orderDate: new Date(dto.orderDate),
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
        shippingAddress: dto.shippingAddress,
        terms: dto.terms,
        notes: dto.notes,
        subtotal,
        taxAmount,
        discount,
        total,
        items: { create: lineItems },
      },
      include: { customer: true, items: true },
    });
  }

  async findAll(companyId: string, query: PaginationDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.SalesOrderWhereInput = {
      companyId,
      ...(query.search
        ? {
            OR: [
              { orderNumber: { contains: query.search, mode: 'insensitive' } },
              {
                customer: {
                  name: { contains: query.search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.salesOrder.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { customer: true, items: true },
      }),
      this.prisma.salesOrder.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const order = await this.prisma.salesOrder.findFirst({
      where: { id, companyId },
      include: { customer: true, items: true, quotation: true },
    });
    if (!order) {
      throw new NotFoundException('Sales order not found');
    }
    return order;
  }

  async updateStatus(companyId: string, id: string, status: OrderStatus) {
    await this.findOne(companyId, id);
    return this.prisma.salesOrder.update({
      where: { id },
      data: { status },
      include: { customer: true, items: true },
    });
  }
}
