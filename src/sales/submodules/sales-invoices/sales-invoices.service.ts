import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus, Prisma } from '@prisma/client';
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
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { SalesLineItemDto } from '../../dto/create-quotation.dto';

export class CreateSalesInvoiceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  salesOrderId?: string;

  @ApiProperty({ example: '2026-11-26' })
  @IsDateString()
  @IsNotEmpty()
  invoiceDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

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
export class SalesInvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateSalesInvoiceDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, companyId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found in this company');
    }

    const { lineItems, subtotal, taxAmount, discount, total } =
      computeLineItems(dto.items);

    return this.prisma.salesInvoice.create({
      data: {
        companyId,
        customerId: dto.customerId,
        salesOrderId: dto.salesOrderId,
        invoiceNumber: generateCode('SINV'),
        invoiceDate: new Date(dto.invoiceDate),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
        subtotal,
        taxAmount,
        discount,
        total,
        balanceDue: total,
        items: { create: lineItems },
      },
      include: { customer: true, items: true },
    });
  }

  async findAll(companyId: string, query: PaginationDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.SalesInvoiceWhereInput = {
      companyId,
      ...(query.search
        ? {
            OR: [
              { invoiceNumber: { contains: query.search, mode: 'insensitive' } },
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
      this.prisma.salesInvoice.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { customer: true, items: true },
      }),
      this.prisma.salesInvoice.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    const invoice = await this.prisma.salesInvoice.findFirst({
      where: { id, companyId },
      include: { customer: true, items: true, payments: true },
    });
    if (!invoice) {
      throw new NotFoundException('Sales invoice not found');
    }
    return invoice;
  }

  async updateStatus(companyId: string, id: string, status: InvoiceStatus) {
    await this.findOne(companyId, id);
    return this.prisma.salesInvoice.update({
      where: { id },
      data: { status },
      include: { customer: true, items: true },
    });
  }
}
