import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
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

export class CreateSalesReturnDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: '2026-11-26' })
  @IsDateString()
  @IsNotEmpty()
  returnDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

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
export class SalesReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateSalesReturnDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, companyId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found in this company');
    }

    const { lineItems, subtotal, taxAmount, total } = computeLineItems(
      dto.items,
    );

    return this.prisma.salesReturn.create({
      data: {
        companyId,
        customerId: dto.customerId,
        returnNumber: generateCode('SRET'),
        returnDate: new Date(dto.returnDate),
        reason: dto.reason,
        notes: dto.notes,
        subtotal,
        taxAmount,
        total,
        items: {
          create: lineItems.map(({ discount: _d, ...rest }) => rest),
        },
      },
      include: { customer: true, items: true },
    });
  }

  async findAll(companyId: string, query: PaginationDto) {
    const { skip, take, page, limit, orderBy } = buildPaginationQuery(query);
    const where: Prisma.SalesReturnWhereInput = {
      companyId,
      ...(query.search
        ? {
            OR: [
              { returnNumber: { contains: query.search, mode: 'insensitive' } },
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
      this.prisma.salesReturn.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { customer: true, items: true },
      }),
      this.prisma.salesReturn.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, page, limit);
  }
}
